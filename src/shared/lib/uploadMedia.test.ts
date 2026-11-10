import { buildMediaFormData } from './uploadMedia';

describe('buildMediaFormData', () => {
  it('sends the browser file itself on web', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const webFile = new Blob(['x'], { type: 'image/png' });

    buildMediaFormData({
      uri: 'blob:http://localhost/123',
      fileName: 'foto.png',
      mimeType: 'image/png',
      webFile,
    });

    expect(appendSpy).toHaveBeenCalledWith('file', webFile, 'foto.png');
    appendSpy.mockRestore();
  });

  it('sends a file descriptor with a real mime type on native', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    buildMediaFormData({
      uri: 'file:///cache/IMG_1.jpg',
      fileName: null,
      mimeType: null,
      webFile: null,
    });

    expect(appendSpy).toHaveBeenCalledWith('file', {
      uri: 'file:///cache/IMG_1.jpg',
      name: 'IMG_1.jpg',
      type: 'image/jpeg',
    });
    appendSpy.mockRestore();
  });
});
