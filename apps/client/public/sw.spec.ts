import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock generic Service Worker globals
// We need to define these on the global object so sw.js can access them
declare global {
  var clients: any;
  var skipWaiting: any;
}

describe('Service Worker', () => {
  let listeners: Record<string, Function> = {};
  let cachedFiles: Record<string, Response> = {};
  let networkMock: Record<string, Response> = {};

  // Helper to create a Mock Response
  const createResponse = (body: string, init?: ResponseInit) => {
    return {
      clone: () => createResponse(body, init),
      ok: true,
      status: 200,
      text: () => Promise.resolve(body),
      ...init,
    } as unknown as Response;
  };

  const mockCacheStorage = {
    open: vi.fn().mockImplementation((cacheName) => {
      return Promise.resolve({
        put: vi.fn().mockImplementation((req, res) => {
          const url = typeof req === 'string' ? req : req.url;
          cachedFiles[`${cacheName}:${url}`] = res;
          return Promise.resolve();
        }),
        match: vi.fn().mockImplementation((req) => {
          const url = typeof req === 'string' ? req : req.url;
          return Promise.resolve(cachedFiles[`${cacheName}:${url}`]);
        }),
        delete: vi.fn().mockImplementation((req) => {
          const url = typeof req === 'string' ? req : req.url;
          delete cachedFiles[`${cacheName}:${url}`];
          return Promise.resolve(true);
        }),
      });
    }),
    match: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(true),
  };

  const mockClients = {
    claim: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    listeners = {};
    cachedFiles = {};
    networkMock = {};
    vi.clearAllMocks();

    // Setup global scope mocks
    global.self = global as any; // self is global in SW

    global.addEventListener = vi.fn((event, handler) => {
      listeners[event] = handler;
    }) as any;

    global.skipWaiting = vi.fn().mockResolvedValue(undefined);
    global.clients = mockClients;
    global.caches = mockCacheStorage as any;

    global.fetch = vi.fn().mockImplementation((req) => {
      const url = typeof req === 'string' ? req : req.url;
      if (networkMock[url]) {
        return Promise.resolve(networkMock[url]);
      }
      return Promise.resolve(createResponse('network content'));
    }) as any;

    global.Request = class {
      url: string;
      method: string;
      constructor(
        input: string | { url: string; method?: string },
        init?: any,
      ) {
        if (typeof input === 'string') {
          this.url = input;
        } else {
          this.url = input.url;
        }
        this.method = init?.method || 'GET';
      }
    } as any;
  });

  const loadServiceWorker = () => {
    // Try to locate sw.js relative to current working directory
    let swPath = path.resolve(process.cwd(), 'apps/client/public/sw.js');
    if (!fs.existsSync(swPath)) {
      swPath = path.resolve(process.cwd(), 'public/sw.js');
    }

    if (!fs.existsSync(swPath)) {
      // Create a dummy file if it doesn't exist yet to prevent test from crashing before implementation
      // But since we are TDDing, we can allow it to fail or create empty.
      // Actually, for the test to run `eval`, the file must exist.
      // I'll throw if it doesn't exist, which is correct behavior.
      throw new Error(
        `Service worker file not found at ${swPath} (CWD: ${process.cwd()})`,
      );
    }
    const swContent = fs.readFileSync(swPath, 'utf-8');
    // Basic sandboxing to run the SW code
    // eslint-disable-next-line no-eval
    eval(swContent);
  };

  it('should register critical lifecycle listeners', () => {
    // We need the file to exist for this test to pass.
    // Assuming we will create the file in the next step.
    // This test verifies that the SW registers the listeners.
    loadServiceWorker();
    expect(global.addEventListener).toHaveBeenCalledWith(
      'install',
      expect.any(Function),
    );
    expect(global.addEventListener).toHaveBeenCalledWith(
      'activate',
      expect.any(Function),
    );
    expect(global.addEventListener).toHaveBeenCalledWith(
      'fetch',
      expect.any(Function),
    );
  });

  it('should delete old caches on activation', async () => {
    loadServiceWorker();

    const CURRENT_CACHE = 'mamirri-static-v1';
    const OLD_CACHE = 'mamirri-static-old';

    // Mock existing caches
    (global.caches.keys as Mock).mockResolvedValue([CURRENT_CACHE, OLD_CACHE]);

    const activateEvent = {
      waitUntil: vi.fn((p) => p),
    };

    // Trigger activate
    const activateHandler = listeners['activate'];
    if (activateHandler) {
      await activateHandler(activateEvent);
    }

    expect(global.caches.delete).toHaveBeenCalledWith(OLD_CACHE);
    expect(global.caches.delete).not.toHaveBeenCalledWith(CURRENT_CACHE);
  });

  it('should use stale-while-revalidate for static assets (JS/CSS)', async () => {
    loadServiceWorker();

    const jsRequest = new Request('https://example.com/app.js');
    const cachedResponse = createResponse('cached content');
    const networkResponse = createResponse('network content');

    const cacheName = 'mamirri-static-v1';

    // Seed cache
    const cache = await global.caches.open(cacheName);
    await cache.put(jsRequest, cachedResponse);

    // Mock network
    networkMock[jsRequest.url] = networkResponse;

    const fetchEvent = {
      request: jsRequest,
      respondWith: vi.fn(),
      waitUntil: vi.fn(),
    };

    const fetchHandler = listeners['fetch'];
    await fetchHandler(fetchEvent);

    // In Stale-While-Revalidate:
    // 1. It should respond with the cached version
    expect(fetchEvent.respondWith).toHaveBeenCalled();
    const responsePromise = fetchEvent.respondWith.mock.calls[0][0];
    const response = await responsePromise;
    expect(await response.text()).toBe('cached content');

    // 2. It should ALSO fetch from network to update cache (background)
    // We might need to check if fetch was called.
    expect(global.fetch).toHaveBeenCalledWith(jsRequest);
  });

  it('should use network-first for HTML', async () => {
    loadServiceWorker();

    const htmlRequest = new Request('https://example.com/index.html', {
      method: 'GET',
    });
    // Mock headers to indicate HTML if SW logic relies on it, or just URL
    // Usually we check request.mode === 'navigate' or accept header or file extension
    // Let's assume URL check for now or 'navigate' mode
    Object.defineProperty(htmlRequest, 'mode', { value: 'navigate' });
    Object.defineProperty(htmlRequest, 'headers', {
      value: { get: (h: string) => (h === 'Accept' ? 'text/html' : '') },
    });

    const networkResponse = createResponse('<html>network</html>');
    networkMock[htmlRequest.url] = networkResponse;

    const fetchEvent = {
      request: htmlRequest,
      respondWith: vi.fn(),
      waitUntil: vi.fn(),
    };

    const fetchHandler = listeners['fetch'];
    await fetchHandler(fetchEvent);

    expect(fetchEvent.respondWith).toHaveBeenCalled();
    const responsePromise = fetchEvent.respondWith.mock.calls[0][0];
    const response = await responsePromise;
    expect(await response.text()).toBe('<html>network</html>');
  });

  it('should fallback to offline.html for navigation when network fails', async () => {
    loadServiceWorker();

    const htmlRequest = new Request('https://example.com/some-page', {
      method: 'GET',
    });
    Object.defineProperty(htmlRequest, 'mode', { value: 'navigate' });

    // Mock caches.match to return offline.html when requested
    (global.caches.match as Mock).mockImplementation((req) => {
      const url = typeof req === 'string' ? req : req.url;
      if (url.includes('/offline.html')) {
        return Promise.resolve(createResponse('<html>offline</html>'));
      }
      return Promise.resolve(undefined);
    });

    // Mock fetch to fail
    (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

    const fetchEvent = {
      request: htmlRequest,
      respondWith: vi.fn(),
      waitUntil: vi.fn(),
    };

    const fetchHandler = listeners['fetch'];
    await fetchHandler(fetchEvent);

    expect(fetchEvent.respondWith).toHaveBeenCalled();
    const responsePromise = fetchEvent.respondWith.mock.calls[0][0];
    const response = await responsePromise;
    expect(await response.text()).toBe('<html>offline</html>');
  });
});
