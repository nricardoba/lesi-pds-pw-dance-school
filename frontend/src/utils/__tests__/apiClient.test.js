import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../services/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('performs a GET request and parses the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify([{ id: 1 }]),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiClient('/studios');

    expect(result).toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3333/studios',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('adds bearer token when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await apiClient('/users', { token: 'token-123' });

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer token-123');
  });

  it('dispatches unauthorized event on 401', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: { message: 'Unauthorized' } }),
    }));

    await expect(apiClient('/auth/me')).rejects.toThrow('Unauthorized');
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it('uses api error message when request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      text: async () => JSON.stringify({ error: { message: 'Conflict' } }),
    }));

    await expect(apiClient('/classes')).rejects.toThrow('Conflict');
  });
});
