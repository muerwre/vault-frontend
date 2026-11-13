import { VkApiService } from './vk.api';

describe('VkApiService.uploadPhoto', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      NOTIFICATIONS_VK_API_KEY: 'key',
      NOTIFICATIONS_VK_GROUP_ID: '1',
      NOTIFICATIONS_VK_ALBUM_ID: '2',
    };
  });

  afterAll(() => {
    process.env = env;
  });

  /**
   * A read stream over a missing file emits an unhandled 'error' event, which
   * crashes the process; the upload must fail quietly before opening one.
   */
  it('returns null for a missing file without reaching VK', async () => {
    const service = new VkApiService();
    const vk = jest.spyOn(service as unknown as { vk: () => unknown }, 'vk');

    await expect(
      service.uploadPhoto('/nonexistent/vault-spec/photo.jpg'),
    ).resolves.toBeNull();
    expect(vk).not.toHaveBeenCalled();
  });
});
