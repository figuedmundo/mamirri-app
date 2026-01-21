import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from 'vitest';
import { validateImageFile, stripExifAndCompress } from './image-processing';

describe('Image Processing Utilities', () => {
  describe('validateImageFile', () => {
    it('should pass for valid JPEG image', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should pass for valid PNG image', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should pass for valid WebP image', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should fail for unsupported type', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Formato no soportado. Usa JPEG, PNG o WebP.');
    });

    it('should fail for large files (>10MB)', () => {
      const file = {
        name: 'large.jpg',
        type: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11MB
      } as File;

      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10MB');
    });
  });

  describe('stripExifAndCompress', () => {
    let mockContext: { drawImage: Mock; save: Mock; restore: Mock };
    let mockCanvas: {
      width: number;
      height: number;
      getContext: Mock;
      toBlob: Mock;
    };

    beforeEach(() => {
      mockContext = {
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
      };

      mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue(mockContext),
        toBlob: vi.fn((callback) => {
          callback(new Blob(['compressed'], { type: 'image/jpeg' }));
        }),
      };

      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas')
          return mockCanvas as unknown as HTMLCanvasElement;
        return document.createElement(tagName);
      });

      // Mock Image API
      // Use defineProperty to avoid "duplicate member" error
      class MockImage {
        width = 0;
        height = 0;
        onload: () => void = () => {};
        _src = '';

        get src() {
          return this._src;
        }
        set src(value: string) {
          this._src = value;
          // Simulate async loading
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

    it('should resize large landscape image to 1920px width', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

      // Override Image for this test to set dimensions
      class LandscapeImage {
        width = 3840;
        height = 2160;
        onload: () => void = () => {};
        _src = '';
        set src(v: string) {
          this._src = v;
          setTimeout(() => this.onload(), 0);
        }
      }
      vi.stubGlobal('Image', LandscapeImage);

      await stripExifAndCompress(file);

      expect(mockCanvas.width).toBe(1920);
      expect(mockCanvas.height).toBe(1080);
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should resize large portrait image to 1920px height', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

      class PortraitImage {
        width = 2160;
        height = 3840;
        onload: () => void = () => {};
        _src = '';
        set src(v: string) {
          this._src = v;
          setTimeout(() => this.onload(), 0);
        }
      }
      vi.stubGlobal('Image', PortraitImage);

      await stripExifAndCompress(file);

      expect(mockCanvas.height).toBe(1920);
      expect(mockCanvas.width).toBe(1080);
    });

    it('should maintain original dimensions if smaller than max', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

      class SmallImage {
        width = 800;
        height = 600;
        onload: () => void = () => {};
        _src = '';
        set src(v: string) {
          this._src = v;
          setTimeout(() => this.onload(), 0);
        }
      }
      vi.stubGlobal('Image', SmallImage);

      await stripExifAndCompress(file);

      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(600);
    });
  });
});
