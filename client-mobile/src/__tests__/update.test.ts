import { getSkippedCode, isUpdateAvailable, skipVersion, type RemoteVersion } from '../update';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

const ma = AsyncStorage as unknown as { getItem: jest.Mock; setItem: jest.Mock };

const v2: RemoteVersion = {
  versionCode: 2,
  versionName: '1.0',
  apkUrl: 'https://example.com/app.apk',
};

describe('isUpdateAvailable', () => {
  it('detects a newer remote build', () => {
    expect(isUpdateAvailable(v2, 1)).toBe(true);
  });
  it('is silent on same or older builds', () => {
    expect(isUpdateAvailable(v2, 2)).toBe(false);
    expect(isUpdateAvailable(v2, 3)).toBe(false);
  });
  it('is silent on bad payloads', () => {
    expect(isUpdateAvailable(null)).toBe(false);
    expect(isUpdateAvailable(undefined)).toBe(false);
    expect(isUpdateAvailable({} as RemoteVersion, 1)).toBe(false);
    expect(
      isUpdateAvailable({ versionCode: 5 } as RemoteVersion, 1),
    ).toBe(false);
  });
});

describe('skipVersion', () => {
  it('persists and reads the skipped code', async () => {
    ma.setItem.mockResolvedValue(undefined);
    await skipVersion(3);
    expect(ma.setItem).toHaveBeenCalledWith('mbpb_skip_update_code', '3');
    ma.getItem.mockResolvedValue('3');
    expect(await getSkippedCode()).toBe(3);
  });
  it('returns 0 when nothing stored', async () => {
    ma.getItem.mockResolvedValue(null);
    expect(await getSkippedCode()).toBe(0);
  });
});
