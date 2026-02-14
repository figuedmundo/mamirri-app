import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';

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

  async findAllProtocols(categoryId?: string) {
    return this.prisma.protocol.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: true,
        references: { include: { reference: true } },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOneProtocol(id: string) {
    const protocol = await this.prisma.protocol.findUnique({
      where: { id },
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

  async search(query: string) {
    const [protocols, ragResults] = await Promise.all([
      this.prisma.protocol.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { definition: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
          ],
        },
        include: {
          category: true,
          references: { include: { reference: true } },
        },
      }),
      this.knowledgeBaseService.findSimilar(query, 5).catch(() => []),
    ]);

    return { protocols, ragResults };
  }

  async addProtocolToPlan(
    treatmentPlanId: string,
    protocolId: string,
    therapistId: string,
    notes?: string,
  ) {
    await this.findTreatmentPlanWithAccess(treatmentPlanId, therapistId);

    const protocol = await this.prisma.protocol.findUnique({
      where: { id: protocolId },
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
}
