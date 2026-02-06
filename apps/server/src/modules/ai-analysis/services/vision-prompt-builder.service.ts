import { Injectable } from '@nestjs/common';
import { VisionImageType } from '../interfaces/vision.interfaces';
import {
  POSTUROGRAM_ANALYSIS_PROMPT,
  FOOTPRINT_ANALYSIS_PROMPT,
} from '../constants/vision-prompts';

@Injectable()
export class VisionPromptBuilderService {
  buildVisionPrompt(imageType: VisionImageType): string {
    switch (imageType) {
      case 'POSTUROGRAM':
        return POSTUROGRAM_ANALYSIS_PROMPT;
      case 'FOOTPRINT':
        return FOOTPRINT_ANALYSIS_PROMPT;
      default:
        throw new Error(`Unknown image type: ${imageType as any}`);
    }
  }
}
