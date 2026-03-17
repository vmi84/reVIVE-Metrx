// Global mocks for native modules used across tests

// expo-file-system — in-memory Map (covers both legacy and class-based APIs)
jest.mock('expo-file-system', () => {
  const store = new Map<string, string>();

  // Class-based API (expo-file-system v55+) used by file-storage.ts
  class MockFile {
    uri: string;
    constructor(parent: { uri: string } | string, name?: string) {
      const base = typeof parent === 'string' ? parent : parent.uri;
      this.uri = name ? `${base}/${name}` : base;
    }
    get exists() { return store.has(this.uri); }
    async text() { return store.get(this.uri) ?? ''; }
    write(content: string) { store.set(this.uri, content); }
    delete() { store.delete(this.uri); }
  }

  class MockDirectory {
    uri: string;
    constructor(parent: { uri: string } | string, name?: string) {
      const base = typeof parent === 'string' ? parent : parent.uri;
      this.uri = name ? `${base}/${name}` : base;
    }
    get exists() { return true; }
    create() {}
  }

  return {
    // Legacy API
    documentDirectory: '/mock/documents/',
    readAsStringAsync: jest.fn(async (uri: string) => {
      const val = store.get(uri);
      if (val === undefined) throw new Error(`File not found: ${uri}`);
      return val;
    }),
    writeAsStringAsync: jest.fn(async (uri: string, content: string) => {
      store.set(uri, content);
    }),
    deleteAsync: jest.fn(async (uri: string) => {
      store.delete(uri);
    }),
    getInfoAsync: jest.fn(async (uri: string) => ({
      exists: store.has(uri),
      isDirectory: false,
      size: store.get(uri)?.length ?? 0,
      modificationTime: Date.now(),
      uri,
    })),
    makeDirectoryAsync: jest.fn(async () => {}),
    EncodingType: { UTF8: 'utf8', Base64: 'base64' },
    // Class-based API
    File: MockFile,
    Directory: MockDirectory,
    Paths: { document: { uri: '/mock/documents' } },
    __store: store, // exposed for test cleanup
  };
});

// expo-secure-store — in-memory Map
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    __store: store,
  };
});

// expo-constants — stub expoConfig.extra
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
        whoopClientId: 'test-whoop-client-id',
        whoopClientSecret: 'test-whoop-client-secret',
        whoopRedirectUri: 'revive-metrx://auth/whoop/callback',
      },
    },
  },
}));

// @supabase/supabase-js — no-op client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(async () => ({ data: { session: null }, error: null })),
      getUser: jest.fn(async () => ({ data: { user: null }, error: null })),
      signInWithPassword: jest.fn(async () => ({ data: {}, error: null })),
      signOut: jest.fn(async () => ({ error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(async () => ({ data: null, error: null })),
      maybeSingle: jest.fn(async () => ({ data: null, error: null })),
    })),
  })),
}));

// date-fns — let it use real implementation (pure JS, no native deps)
