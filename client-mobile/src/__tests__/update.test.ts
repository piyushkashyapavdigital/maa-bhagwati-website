import { isUpdateAvailable, type RemoteVersion } from '../update';

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
