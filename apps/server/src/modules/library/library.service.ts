import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { CreateProtocolDto } from './dto/create-protocol.dto';
import { UpdateProtocolDto } from './dto/update-protocol.dto';

@Injectable()
export class LibraryService {
  constructor(
    private prisma: PrismaService,
    private knowledgeBaseService: KnowledgeBaseService,
  ) {}

  async findAllCategories() {
    return this.prisma.clinicalCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findAllProtocols(categoryId?: string, includeDeleted = false) {
    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(includeDeleted ? {} : { deletedAt: null }),
    };

    return this.prisma.protocol.findMany({
      where,
      include: {
        category: true,
        references: { include: { reference: true } },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOneProtocol(id: string, includeDeleted = false) {
    const protocol = await this.prisma.protocol.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        category: true,
        references: { include: { reference: true } },
      },
    });

    if (!protocol) {
      throw new NotFoundException(`Protocol with ID ${id} not found`);
    }

    return protocol;
  }

  async findAllReferences() {
    return this.prisma.bibliographicReference.findMany({
      orderBy: { author: 'asc' },
    });
  }

  async search(query: string, categoryId?: string, includeDeleted = false) {
    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(includeDeleted ? {} : { deletedAt: null }),
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { definition: { contains: query, mode: 'insensitive' as const } },
        { tags: { has: query } },
      ],
    };

    const [protocols, ragResults] = await Promise.all([
      this.prisma.protocol.findMany({
        where,
        include: {
          category: true,
          references: { include: { reference: true } },
        },
      }),
      this.knowledgeBaseService.findSimilar(query, 5).catch(() => []),
    ]);

    return { protocols, ragResults };
  }

  async getBookMarkdown(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        author: true,
        filePath: true,
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const serverRoot = process.cwd();
    const booksRoot = path.resolve(serverRoot, 'data/library/markdowns');
    const absolutePath = path.resolve(serverRoot, document.filePath);

    if (
      !absolutePath.startsWith(`${booksRoot}${path.sep}`) &&
      absolutePath !== booksRoot
    ) {
      throw new BadRequestException('Document path is outside books directory');
    }

    let content: string;
    try {
      content = await fs.readFile(absolutePath, 'utf-8');
    } catch {
      throw new NotFoundException(
        `Source markdown not found for document ${documentId}`,
      );
    }

    return {
      documentId: document.id,
      title: document.title,
      author: document.author,
      filePath: document.filePath,
      content,
    };
  }

  async createProtocol(dto: CreateProtocolDto) {
    const normalized = this.normalizeProtocolInput(dto);
    if (
      !normalized.title ||
      !normalized.categoryId ||
      !normalized.definition ||
      !normalized.rationale ||
      !normalized.procedure
    ) {
      throw new BadRequestException('Missing required protocol fields');
    }

    await this.ensureCategoryExists(normalized.categoryId);
    await this.ensureProtocolTitleAvailable(
      normalized.title,
      normalized.categoryId,
    );

    const referenceIds = await this.validateReferenceIds(
      normalized.referenceIds,
    );

    return this.prisma.protocol.create({
      data: {
        title: normalized.title,
        categoryId: normalized.categoryId,
        definition: normalized.definition,
        rationale: normalized.rationale,
        procedure: normalized.procedure,
        tags: normalized.tags,
        references:
          referenceIds.length > 0
            ? {
                create: referenceIds.map((referenceId) => ({ referenceId })),
              }
            : undefined,
      },
      include: {
        category: true,
        references: { include: { reference: true } },
      },
    });
  }

  async updateProtocol(id: string, dto: UpdateProtocolDto) {
    await this.ensureProtocolExists(id, true);

    const normalized = this.normalizeProtocolInput(dto);

    if (normalized.categoryId) {
      await this.ensureCategoryExists(normalized.categoryId);
    }

    const current = await this.prisma.protocol.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Protocol with ID ${id} not found`);
    }

    const nextTitle = normalized.title ?? current.title;
    const nextCategoryId = normalized.categoryId ?? current.categoryId;
    await this.ensureProtocolTitleAvailable(
      nextTitle.trim(),
      nextCategoryId.trim(),
      id,
    );

    let referencePatch:
      | {
          deleteMany: Record<string, never>;
          create: Array<{ referenceId: string }>;
        }
      | undefined;

    if (normalized.referenceIds) {
      const referenceIds = await this.validateReferenceIds(
        normalized.referenceIds,
      );
      referencePatch = {
        deleteMany: {},
        create: referenceIds.map((referenceId) => ({ referenceId })),
      };
    }

    return this.prisma.protocol.update({
      where: { id },
      data: {
        ...(normalized.title ? { title: normalized.title } : {}),
        ...(normalized.categoryId ? { categoryId: normalized.categoryId } : {}),
        ...(normalized.definition ? { definition: normalized.definition } : {}),
        ...(normalized.rationale ? { rationale: normalized.rationale } : {}),
        ...(normalized.procedure ? { procedure: normalized.procedure } : {}),
        ...(normalized.tags ? { tags: normalized.tags } : {}),
        ...(referencePatch ? { references: referencePatch } : {}),
      },
      include: {
        category: true,
        references: { include: { reference: true } },
      },
    });
  }

  async archiveProtocol(id: string) {
    await this.ensureProtocolExists(id, false);

    await this.prisma.protocol.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreProtocol(id: string) {
    const protocol = await this.ensureProtocolExists(id, true);

    if (!protocol.deletedAt) {
      return this.findOneProtocol(id, true);
    }

    await this.ensureProtocolTitleAvailable(
      protocol.title,
      protocol.categoryId,
      id,
    );

    return this.prisma.protocol.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        category: true,
        references: { include: { reference: true } },
      },
    });
  }

  async addProtocolToPlan(
    treatmentPlanId: string,
    protocolId: string,
    therapistId: string,
    notes?: string,
  ) {
    await this.findTreatmentPlanWithAccess(treatmentPlanId, therapistId);

    const protocol = await this.prisma.protocol.findFirst({
      where: { id: protocolId, deletedAt: null },
    });
    if (!protocol) {
      throw new NotFoundException(`Protocol with ID ${protocolId} not found`);
    }

    const existing = await this.prisma.treatmentPlanProtocol.findUnique({
      where: {
        treatmentPlanId_protocolId: { treatmentPlanId, protocolId },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Protocol ${protocolId} is already added to treatment plan ${treatmentPlanId}`,
      );
    }

    return this.prisma.treatmentPlanProtocol.create({
      data: { treatmentPlanId, protocolId, notes },
      include: { protocol: true },
    });
  }

  private async findTreatmentPlanWithAccess(id: string, therapistId: string) {
    const treatmentPlan = await this.prisma.treatmentPlan.findFirst({
      where: {
        id,
        clinicalCase: {
          patient: {
            therapistId,
            deletedAt: null,
          },
        },
      },
    });

    if (!treatmentPlan) {
      throw new NotFoundException(`Treatment plan with ID ${id} not found`);
    }

    return treatmentPlan;
  }

  private normalizeProtocolInput(input: Partial<CreateProtocolDto>) {
    const normalizeString = (value?: string) => value?.trim();
    const normalizeStringArray = (values?: string[]) =>
      values
        ?.map((value) => value.trim())
        .filter((value) => value.length > 0) ?? undefined;

    const normalizeTags = (tags?: string[]) => {
      if (!tags) {
        return undefined;
      }

      const normalized = tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);

      return [...new Set(normalized)];
    };

    return {
      title: normalizeString(input.title),
      categoryId: normalizeString(input.categoryId),
      definition: normalizeString(input.definition),
      rationale: normalizeString(input.rationale),
      procedure: normalizeStringArray(input.procedure),
      tags: normalizeTags(input.tags) ?? [],
      referenceIds: normalizeStringArray(input.referenceIds),
    };
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.clinicalCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Clinical category with ID ${categoryId} not found`,
      );
    }
  }

  private async validateReferenceIds(referenceIds?: string[]) {
    if (!referenceIds || referenceIds.length === 0) {
      return [];
    }

    const uniqueReferenceIds = [...new Set(referenceIds)];
    const references = await this.prisma.bibliographicReference.findMany({
      where: { id: { in: uniqueReferenceIds } },
      select: { id: true },
    });

    if (references.length !== uniqueReferenceIds.length) {
      throw new NotFoundException(
        'One or more bibliographic references were not found',
      );
    }

    return uniqueReferenceIds;
  }

  private async ensureProtocolTitleAvailable(
    title: string,
    categoryId: string,
    excludeId?: string,
  ) {
    const conflicting = await this.prisma.protocol.findFirst({
      where: {
        title: { equals: title, mode: 'insensitive' },
        categoryId,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (conflicting) {
      throw new ConflictException(
        `A protocol with title "${title}" already exists in this category`,
      );
    }
  }

  private async ensureProtocolExists(id: string, includeDeleted: boolean) {
    const protocol = await this.prisma.protocol.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });

    if (!protocol) {
      throw new NotFoundException(`Protocol with ID ${id} not found`);
    }

    return protocol;
  }
}
