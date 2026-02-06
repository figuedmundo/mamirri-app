import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { withRetry } from '../../transcription/utils/retry';
import {
  VisionImageType,
  VisionAnalysisResult,
  StructuredAnalysis,
} from '../interfaces/vision.interfaces';
import { VisionPromptBuilderService } from './vision-prompt-builder.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);
  private readonly genAI: GoogleGenAI;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly visionPromptBuilder: VisionPromptBuilderService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_API_KEY not set. Vision analysis will use mock responses.',
      );
    }
    this.genAI = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });
    this.model =
      this.configService.get<string>('AI_VISION_MODEL') || 'gemini-3-flash';
  }

  async analyzeImage(
    imageBuffer: Buffer,
    imageType: VisionImageType,
    mimeType: string,
  ): Promise<VisionAnalysisResult> {
    const startTime = Date.now();
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

    if (!apiKey) {
      return this.getMockResponse(imageType, startTime);
    }

    const prompt = this.visionPromptBuilder.buildVisionPrompt(imageType);
    const base64Image = imageBuffer.toString('base64');

    const rawResponse = await this.callGeminiVision(
      base64Image,
      mimeType,
      prompt,
    );
    const parsed = this.parseResponse(rawResponse);

    return {
      rawAnalysis: rawResponse,
      structuredAnalysis: parsed.structuredAnalysis,
      qualityWarning: parsed.qualityWarning,
      metadata: {
        processingTimeMs: Date.now() - startTime,
        modelUsed: this.model,
        imageType,
      },
    };
  }

  private async callGeminiVision(
    base64Image: string,
    mimeType: string,
    prompt: string,
  ): Promise<string> {
    return await withRetry(
      async () => {
        const response = await this.genAI.models.generateContent({
          model: this.model,
          config: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: base64Image,
                    mimeType,
                  },
                },
                { text: prompt },
              ],
            },
          ],
        });

        return response.text || '';
      },
      { maxRetries: 3 },
      this.logger,
    );
  }

  private parseResponse(rawResponse: string): {
    structuredAnalysis: StructuredAnalysis;
    qualityWarning: string | null;
  } {
    try {
      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch =
        rawResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
        rawResponse.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        structuredAnalysis: {
          findings: parsed.findings || [],
          concerns: parsed.concerns || [],
          recommendations: parsed.recommendations || [],
          confidence: parsed.confidence || 'MEDIUM',
        },
        qualityWarning: parsed.qualityWarning || null,
      };
    } catch (error) {
      this.logger.error(`Failed to parse vision response: ${error.message}`);
      return {
        structuredAnalysis: {
          findings: [],
          concerns: [],
          recommendations: [
            'No se pudo procesar el análisis. Intente de nuevo.',
          ],
          confidence: 'LOW',
        },
        qualityWarning: 'Error al procesar la respuesta del modelo.',
      };
    }
  }

  async analyzeImageById(
    imageId: string,
    imageType: VisionImageType,
    therapistId: string,
  ): Promise<VisionAnalysisResult> {
    const imageRecord = await this.getImageRecord(imageId, imageType);

    if (!imageRecord) {
      throw new NotFoundException(`Image not found: ${imageId}`);
    }

    await this.verifyAccess(imageRecord, therapistId, imageType);

    const storagePath = this.getStoragePath(imageRecord, imageType);
    const imageBuffer = await this.storageService.getFile(storagePath);
    const mimeType = this.inferMimeType(storagePath);

    return this.analyzeImage(imageBuffer, imageType, mimeType);
  }

  private async getImageRecord(imageId: string, imageType: VisionImageType) {
    if (imageType === 'POSTUROGRAM') {
      this.logger.warn(
        'POSTUROGRAM type not yet supported - posturogram data is stored as JSON, not as images. Use FOOTPRINT type for image analysis.',
      );
      return null;
    }
    return this.prisma.footprint.findUnique({
      where: { id: imageId },
      include: {
        evaluation: {
          include: { clinicalCase: { include: { patient: true } } },
        },
      },
    });
  }

  private async verifyAccess(
    imageRecord: any,
    therapistId: string,
    imageType: VisionImageType,
  ): Promise<void> {
    const patient = imageRecord.evaluation?.clinicalCase?.patient;
    if (!patient || patient.therapistId !== therapistId) {
      throw new ForbiddenException('You do not have access to this image');
    }
  }

  private getStoragePath(imageRecord: any, imageType: VisionImageType): string {
    if (imageType === 'POSTUROGRAM') {
      return imageRecord.storagePath;
    }
    return imageRecord.url;
  }

  private inferMimeType(storagePath: string): string {
    const ext = storagePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'jpg':
      case 'jpeg':
      default:
        return 'image/jpeg';
    }
  }

  private getMockResponse(
    imageType: VisionImageType,
    startTime: number,
  ): VisionAnalysisResult {
    this.logger.warn('Using mock response - GOOGLE_API_KEY not configured');

    const mockAnalysis: StructuredAnalysis =
      imageType === 'POSTUROGRAM'
        ? {
            findings: [
              {
                area: 'Columna cervical',
                observation: 'Leve anteriorización de la cabeza',
                severity: 'mild',
              },
              {
                area: 'Hombros',
                observation: 'Asimetría leve, hombro derecho más elevado',
                severity: 'mild',
              },
            ],
            concerns: [
              {
                description: 'Posible tensión muscular cervical',
                clinicalImplication: 'Puede contribuir a cefaleas tensionales',
              },
            ],
            recommendations: [
              'Ejercicios de fortalecimiento de musculatura profunda cervical',
              'Estiramientos de trapecio superior bilateral',
              'Evaluación de ergonomía en puesto de trabajo',
            ],
            confidence: 'HIGH',
          }
        : {
            findings: [
              {
                area: 'Arco plantar derecho',
                observation: 'Arco ligeramente disminuido',
                severity: 'mild',
              },
              {
                area: 'Distribución de presión',
                observation: 'Mayor carga en antepié bilateral',
                severity: 'normal',
              },
            ],
            concerns: [
              {
                description: 'Posible pie plano flexible grado I',
                clinicalImplication:
                  'Puede generar fatiga en actividades prolongadas',
              },
            ],
            recommendations: [
              'Considerar plantillas de soporte de arco',
              'Ejercicios de fortalecimiento de musculatura intrínseca del pie',
              'Evaluación de calzado habitual',
            ],
            confidence: 'HIGH',
          };

    return {
      rawAnalysis: JSON.stringify(mockAnalysis, null, 2),
      structuredAnalysis: mockAnalysis,
      qualityWarning: null,
      metadata: {
        processingTimeMs: Date.now() - startTime,
        modelUsed: 'mock-model',
        imageType,
      },
    };
  }
}
