import { Miniflare } from 'miniflare';

export interface TestEnv {
  [key: string]: unknown;
}

export interface MockKV {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: () => Promise<{ keys: Array<{ name: string }> }>;
}

export interface MockD1 {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      first: () => Promise<unknown>;
      all: () => Promise<{ results: unknown[] }>;
      run: () => Promise<{ success: boolean }>;
    };
  };
}

/**
 * Create a test environment with mocked Cloudflare bindings
 */
export function createTestEnv(env: TestEnv = {}): TestEnv {
  return {
    ...env,
  };
}

/**
 * Create a mock KV namespace
 */
export function mockKV(initialData: Record<string, string> = {}): MockKV {
  const store = new Map<string, { value: string; expiration?: number }>(
    Object.entries(initialData).map(([k, v]) => [k, { value: v }])
  );

  return {
    async get(key: string): Promise<string | null> {
      const entry = store.get(key);
      if (!entry) return null;
      
      if (entry.expiration && entry.expiration < Date.now()) {
        store.delete(key);
        return null;
      }
      
      return entry.value;
    },
    
    async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
      const expiration = options?.expirationTtl
        ? Date.now() + options.expirationTtl * 1000
        : undefined;
      store.set(key, { value, expiration });
    },
    
    async delete(key: string): Promise<void> {
      store.delete(key);
    },
    
    async list(): Promise<{ keys: Array<{ name: string }> }> {
      return {
        keys: Array.from(store.keys()).map((name) => ({ name })),
      };
    },
  };
}

/**
 * Create a mock D1 database
 */
export function mockD1(): MockD1 {
  return {
    prepare(query: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first(): Promise<unknown> {
              return null;
            },
            async all(): Promise<{ results: unknown[] }> {
              return { results: [] };
            },
            async run(): Promise<{ success: boolean }> {
              return { success: true };
            },
          };
        },
      };
    },
  };
}

/**
 * Create a test request
 */
export function createTestRequest(
  url: string,
  init: RequestInit = {}
): Request {
  return new Request(url, init as RequestInit);
}

/**
 * Create Miniflare instance for testing Workers
 */
export function createMiniflare(options: {
  script?: string;
  modules?: boolean;
  bindings?: Record<string, unknown>;
}): Miniflare {
  return new Miniflare({
    script: options.script || '',
    modules: options.modules ?? true,
    bindings: options.bindings || {},
  });
}

