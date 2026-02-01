import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
// @ts-ignore
import * as fs from 'fs';
// @ts-ignore
import * as path from 'path';

declare global {
  var clients: {
    claim: () => Promise<void>;
  };
  var skipWaiting: () => Promise<void>;
}

interface ServiceWorkerListeners {
  [key: string]: (event: any) => void;
}

describe('Service Worker', () => {
  let listeners: ServiceWorkerListeners = {};
  let cachedFiles: Record<string, Response> = {};
  let networkMock: Record<string, Response> = {};

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
    open: vi.fn().mockImplementation((cacheName: string) => {
      return Promise.resolve({
        put: vi
          .fn()
          .mockImplementation((req: Request | string, res: Response) => {
            const url = typeof req === 'string' ? req : req.url;
            cachedFiles[`${cacheName}:${url}`] = res;
            return Promise.resolve();
          }),
        match: vi.fn().mockImplementation((req: Request | string) => {
          const url = typeof req === 'string' ? req : req.url;
          return Promise.resolve(cachedFiles[`${cacheName}:${url}`]);
        }),
        delete: vi.fn().mockImplementation((req: Request | string) => {
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

    const g = globalThis as unknown as Record<string, unknown>;

    g.self = globalThis;

    g.addEventListener = vi.fn((event: string, handler: (e: any) => void) => {
      listeners[event] = handler;
    });

    g.skipWaiting = vi.fn().mockResolvedValue(undefined);
    g.clients = mockClients;
    g.caches = mockCacheStorage;

    g.fetch = vi.fn().mockImplementation((req: Request | string) => {
      const url = typeof req === 'string' ? req : req.url;
      if (networkMock[url]) {
        return Promise.resolve(networkMock[url]);
      }
      return Promise.resolve(createResponse('network content'));
    });

    g.Request = class {
      url: string;
      method: string;
      mode: string = '';
      headers: any = { get: () => '' };
      constructor(
        input: string | { url: string; method?: string },
        init?: { method?: string },
      ) {
        if (typeof input === 'string') {
          this.url = input;
        } else {
          this.url = input.url;
        }
        this.method = init?.method || 'GET';
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const loadServiceWorker = () => {
    // @ts-ignore
    const swPath = path.resolve(process.cwd(), 'apps/client/public/sw.js');

    // @ts-ignore
    if (!fs.existsSync(swPath)) {
      throw new Error(`Service worker file not found at ${swPath}`);
    }
    // @ts-ignore
    const swContent = fs.readFileSync(swPath, 'utf-8');

    // eslint-disable-next-line no-eval
    eval(swContent);
  };

  it('should register critical lifecycle listeners', () => {
    loadServiceWorker();
    expect(globalThis.addEventListener).toHaveBeenCalledWith(
      'install',
      expect.any(Function),
    );
    expect(globalThis.addEventListener).toHaveBeenCalledWith(
      'activate',
      expect.any(Function),
    );
    expect(globalThis.addEventListener).toHaveBeenCalledWith(
      'fetch',
      expect.any(Function),
    );
  });

  it('should delete old caches on activation', async () => {
    loadServiceWorker();

    const CURRENT_CACHE = 'mamirri-static-v1';
    const OLD_CACHE = 'mamirri-static-old';

    const g = globalThis as unknown as any;
    (g.caches.keys as Mock).mockResolvedValue([CURRENT_CACHE, OLD_CACHE]);

    const activateEvent = {
      waitUntil: vi.fn((p) => p),
    };

    const activateHandler = listeners['activate'];
    if (activateHandler) {
      await activateHandler(activateEvent);
    }

    expect(g.caches.delete).toHaveBeenCalledWith(OLD_CACHE);
    expect(g.caches.delete).not.toHaveBeenCalledWith(CURRENT_CACHE);
  });

  it('should use stale-while-revalidate for static assets (JS/CSS)', async () => {
    loadServiceWorker();

    const jsRequest = new Request('https://example.com/app.js');
    const cachedResponse = createResponse('cached content');
    const networkResponse = createResponse('network content');

    const cacheName = 'mamirri-static-v1';

    const g = globalThis as unknown as any;
    const cache = await g.caches.open(cacheName);
    await cache.put(jsRequest, cachedResponse);

    networkMock[jsRequest.url] = networkResponse;

    const fetchEvent = {
      request: jsRequest,
      respondWith: vi.fn(),
      waitUntil: vi.fn(),
    };

    const fetchHandler = listeners['fetch'];
    await fetchHandler(fetchEvent);

    expect(fetchEvent.respondWith).toHaveBeenCalled();
    const responsePromise = fetchEvent.respondWith.mock.calls[0][0];
    const response = await responsePromise;
    expect(await response.text()).toBe('cached content');

    expect(g.fetch).toHaveBeenCalledWith(jsRequest);
  });

  it('should use network-first for HTML', async () => {
    loadServiceWorker();

    const htmlRequest = new Request('https://example.com/index.html', {
      method: 'GET',
    });
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

    const g = globalThis as unknown as any;
    (g.caches.match as Mock).mockImplementation((req: Request | string) => {
      const url = typeof req === 'string' ? req : req.url;
      if (url.includes('/offline.html')) {
        return Promise.resolve(createResponse('<html>offline</html>'));
      }
      return Promise.resolve(undefined);
    });

    (g.fetch as Mock).mockRejectedValue(new Error('Network error'));

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
