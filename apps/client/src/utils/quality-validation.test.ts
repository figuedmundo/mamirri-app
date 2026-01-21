import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import {
  detectBlur,
  analyzeBrightness,
  calculateQualityScore,
} from './quality-validation';

describe('Quality Validation Utilities', () => {
  let mockContext: { drawImage: Mock; getImageData: Mock };
  let mockCanvas: { width: number; height: number; getContext: Mock };

  beforeEach(() => {
    mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(),
    };

    mockCanvas = {
      width: 100,
      height: 100,
      getContext: vi.fn().mockReturnValue(mockContext),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas')
        return mockCanvas as unknown as HTMLCanvasElement;
      return document.createElement(tagName);
    });

    // Mock Image
    class MockImage {
      width = 100;
      height = 100;
      onload: () => void = () => {};
      _src = '';

      get src() {
        return this._src;
      }
      set src(value: string) {
        this._src = value;
        setTimeout(() => this.onload(), 0);
      }
    }
    vi.stubGlobal('Image', MockImage);
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('detectBlur', () => {
    it('should identify uniform image as blurry (low variance)', async () => {
      // Mock uniform gray image data (variance = 0)
      const data = new Uint8ClampedArray(100 * 100 * 4);
      data.fill(128); // All gray
      mockContext.getImageData.mockReturnValue({
        data,
        width: 100,
        height: 100,
      });

      const file = new File([''], 'test.jpg');
      const result = await detectBlur(file);

      expect(result.score).toBeLessThan(10); // Very low score
      expect(result.status).toBe('bad');
    });

    it('should identify high contrast image as sharp (high variance)', async () => {
      // Mock checkerboard pattern
      const data = new Uint8ClampedArray(100 * 100 * 4);
      for (let i = 0; i < data.length; i += 4) {
        // Alternating black and white
        const val = (i / 4) % 2 === 0 ? 0 : 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
      }
      mockContext.getImageData.mockReturnValue({
        data,
        width: 100,
        height: 100,
      });

      const file = new File([''], 'test.jpg');
      const result = await detectBlur(file);

      expect(result.score).toBeGreaterThan(90); // High score (normalized max 100)
      expect(result.status).toBe('good');
    });
  });

  describe('analyzeBrightness', () => {
    it('should identify dark image', async () => {
      const data = new Uint8ClampedArray(100 * 100 * 4);
      data.fill(10); // Very dark
      // Reset alpha to 255
      for (let i = 3; i < data.length; i += 4) data[i] = 255;

      mockContext.getImageData.mockReturnValue({
        data,
        width: 100,
        height: 100,
      });

      const file = new File([''], 'test.jpg');
      const result = await analyzeBrightness(file);

      expect(result.status).toBe('too-dark');
    });

    it('should identify bright image', async () => {
      const data = new Uint8ClampedArray(100 * 100 * 4);
      data.fill(240); // Very bright
      for (let i = 3; i < data.length; i += 4) data[i] = 255;

      mockContext.getImageData.mockReturnValue({
        data,
        width: 100,
        height: 100,
      });

      const file = new File([''], 'test.jpg');
      const result = await analyzeBrightness(file);

      expect(result.status).toBe('too-bright');
    });

    it('should identify good brightness', async () => {
      const data = new Uint8ClampedArray(100 * 100 * 4);
      data.fill(128); // Mid gray
      for (let i = 3; i < data.length; i += 4) data[i] = 255;

      mockContext.getImageData.mockReturnValue({
        data,
        width: 100,
        height: 100,
      });

      const file = new File([''], 'test.jpg');
      const result = await analyzeBrightness(file);

      expect(result.status).toBe('good');
    });
  });

  describe('calculateQualityScore', () => {
    it('should return auto-accept for perfect metrics', () => {
      const result = calculateQualityScore({
        blur: { score: 600, status: 'good' },
        brightness: { score: 128, status: 'good' },
        resolution: { width: 1920, height: 1080, status: 'good' },
      });

      expect(result.finalScore).toBeGreaterThanOrEqual(85);
      expect(result.recommendation).toBe('auto-accept');
    });

    it('should suggest retake for blurry image', () => {
      const result = calculateQualityScore({
        blur: { score: 50, status: 'bad' }, // Blurry
        brightness: { score: 128, status: 'good' },
        resolution: { width: 1920, height: 1080, status: 'good' },
      });

      expect(result.recommendation).toBe('suggest-retake');
      expect(result.issues).toContain('Imagen borrosa');
    });

    it('should block very poor quality', () => {
      const result = calculateQualityScore({
        blur: { score: 10, status: 'bad' },
        brightness: { score: 10, status: 'too-dark' }, // Dark AND blurry
        resolution: { width: 600, height: 400, status: 'bad' }, // Low res
      });

      expect(result.finalScore).toBeLessThan(50);
      expect(result.recommendation).toBe('block');
    });
  });
});
