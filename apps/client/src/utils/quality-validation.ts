/**
 * Image quality validation utilities using client-side processing.
 */

export type QualityRecommendation =
  | 'auto-accept'
  | 'suggest-retake'
  | 'explicit-confirm'
  | 'block';

export interface QualityMetric {
  score: number; // 0-100 (normalized)
  status: 'good' | 'bad' | 'too-dark' | 'too-bright' | 'warning';
  rawValue?: number;
}

export interface QualityResult {
  finalScore: number;
  recommendation: QualityRecommendation;
  issues: string[];
  metrics: {
    blur: QualityMetric;
    brightness: QualityMetric;
    resolution: QualityMetric;
  };
}

const LAPLACIAN_KERNEL = [0, 1, 0, 1, -4, 1, 0, 1, 0];

export async function detectBlur(file: File): Promise<QualityMetric> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      // Resize for performance if needed, but keeping full res for accuracy
      const width = Math.min(img.width, 1000);
      const height = (img.height / img.width) * width;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ score: 0, status: 'bad' });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Convert to grayscale
      const grayData = new Uint8Array(width * height);
      for (let i = 0; i < data.length; i += 4) {
        // Luminance formula
        grayData[i / 4] =
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      let variance = 0;
      let count = 0;

      // Calculate Laplacian variance
      // Skip borders
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixelVal = grayData[(y + ky) * width + (x + kx)];
              const kernelVal = LAPLACIAN_KERNEL[(ky + 1) * 3 + (kx + 1)];
              sum += pixelVal * kernelVal;
            }
          }
          variance += sum * sum;
          count++;
        }
      }

      // Final variance calculation
      // Normalize variance. Typical sharp image > 500, blurry < 100
      const finalVariance = variance / count;
      const normalizedScore = Math.min(
        Math.max((finalVariance / 500) * 100, 0),
        100,
      );

      resolve({
        score: normalizedScore,
        status: finalVariance > 100 ? 'good' : 'bad',
        rawValue: finalVariance,
      });
    };

    img.onerror = () => {
      resolve({ score: 0, status: 'bad' });
    };

    img.src = url;
  });
}

export async function analyzeBrightness(file: File): Promise<QualityMetric> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const width = Math.min(img.width, 500); // Smaller is fine for brightness
      const height = (img.height / img.width) * width;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ score: 0, status: 'bad' });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        // Simple average for brightness
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        totalBrightness += brightness;
      }

      const avgBrightness = totalBrightness / (data.length / 4);

      let status: QualityMetric['status'] = 'good';
      let score = 100;

      if (avgBrightness < 40) {
        status = 'too-dark';
        score = (avgBrightness / 40) * 60;
      } else if (avgBrightness > 215) {
        status = 'too-bright';
        score = ((255 - avgBrightness) / 40) * 60;
      }

      resolve({
        score: Math.round(score),
        status,
        rawValue: avgBrightness,
      });
    };

    img.src = url;
  });
}

interface ValidationInput {
  blur: QualityMetric;
  brightness: QualityMetric;
  resolution: { width: number; height: number; status: 'good' | 'bad' };
}

export function calculateQualityScore(metrics: ValidationInput): QualityResult {
  let score = 0;
  const issues: string[] = [];

  // Weighted score calculation
  // Blur: 50%, Brightness: 30%, Resolution: 20%
  score += metrics.blur.score * 0.5;
  score += metrics.brightness.score * 0.3;

  // Resolution score logic
  let resScore = 100;
  const minDimension = Math.min(
    metrics.resolution.width,
    metrics.resolution.height,
  );
  if (minDimension < 900) {
    resScore = (minDimension / 900) * 100;
    issues.push('Baja resolución');
  }
  score += resScore * 0.2;

  // Identify issues
  if (metrics.blur.status === 'bad') issues.push('Imagen borrosa');
  if (metrics.brightness.status === 'too-dark') issues.push('Muy oscura');
  if (metrics.brightness.status === 'too-bright') issues.push('Muy brillante');

  const finalScore = Math.round(score);
  let recommendation: QualityRecommendation = 'auto-accept';

  if (finalScore >= 85) recommendation = 'auto-accept';
  else if (finalScore >= 70) recommendation = 'suggest-retake';
  else if (finalScore >= 50) recommendation = 'explicit-confirm';
  else recommendation = 'block';

  return {
    finalScore,
    recommendation,
    issues,
    metrics: {
      blur: metrics.blur,
      brightness: metrics.brightness,
      resolution: {
        score: resScore,
        status: metrics.resolution.status,
        rawValue: minDimension,
      },
    },
  };
}
