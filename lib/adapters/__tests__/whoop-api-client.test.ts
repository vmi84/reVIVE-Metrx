import { WhoopApiClient, sportName } from '../whoop/api-client';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('sportName', () => {
  it('returns Running for sport_id 0', () => {
    expect(sportName(0)).toBe('Running');
  });

  it('returns Cycling for sport_id 1', () => {
    expect(sportName(1)).toBe('Cycling');
  });

  it('returns Activity for unmapped sport_id', () => {
    expect(sportName(9999)).toBe('Activity');
  });

  it('returns Weightlifting for sport_id 44', () => {
    expect(sportName(44)).toBe('Weightlifting');
  });

  it('returns CrossFit for sport_id 33', () => {
    expect(sportName(33)).toBe('CrossFit');
  });
});

describe('WhoopApiClient', () => {
  let client: WhoopApiClient;

  beforeEach(() => {
    client = new WhoopApiClient({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      redirectUri: 'revive-metrx://auth/whoop/callback',
    });
    mockFetch.mockReset();
  });

  describe('getAuthUrl', () => {
    it('returns a URL with correct parameters', () => {
      const url = client.getAuthUrl();
      expect(url).toContain('client_id=test-id');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=');
    });

    it('includes required OAuth scopes', () => {
      const url = client.getAuthUrl();
      expect(url).toContain('read%3Arecovery');
      expect(url).toContain('read%3Asleep');
    });
  });

  describe('exchangeCode', () => {
    it('sends POST with correct body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'access-123',
          refresh_token: 'refresh-456',
          expires_in: 3600,
        }),
      });

      const result = await client.exchangeCode('auth-code-789');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('token');
      expect(opts.method).toBe('POST');
      // body is a URLSearchParams object — convert to string to check contents
      expect(opts.body.toString()).toContain('auth-code-789');
      expect(result.accessToken).toBe('access-123');
      expect(result.refreshToken).toBe('refresh-456');
    });

    it('throws on error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(client.exchangeCode('bad-code')).rejects.toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('sends refresh grant type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
        }),
      });

      const result = await client.refreshAccessToken('old-refresh');
      expect(result.accessToken).toBe('new-access');
      const body = mockFetch.mock.calls[0][1].body;
      // body is a URLSearchParams object — convert to string to check contents
      expect(body.toString()).toContain('refresh_token');
      expect(body.toString()).toContain('old-refresh');
    });
  });

  describe('getRecovery', () => {
    it('fetches recovery data with auth header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ records: [], next_token: null }),
      });

      const result = await client.getRecovery('token-abc', '2024-01-01');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('recovery');
      expect(opts.headers.Authorization).toBe('Bearer token-abc');
      expect(result).toEqual([]);
    });
  });
});
