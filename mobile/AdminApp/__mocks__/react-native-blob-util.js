module.exports = {
  default: {
    config: jest.fn(() => ({ fetch: jest.fn(() => Promise.resolve()) })),
    fs: { dirs: { DownloadDir: '/tmp' } },
  },
};
