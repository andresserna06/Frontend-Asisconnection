import type { HttpClient } from './http';

export type UploadMediaResult = {
  url: string;
  format: string;
  bytes: number;
};

export async function uploadMedia(client: HttpClient, localUri: string): Promise<string> {
  const formData = new FormData();
  const filename = localUri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

  formData.append('file', {
    uri: localUri,
    name: filename,
    type,
  } as unknown as Blob);

  if (!client.uploadFile) {
    throw new Error('El cliente HTTP no tiene habilitada la subida de archivos');
  }

  const result = await client.uploadFile<UploadMediaResult>('/media/upload', formData);
  return result.url;
}
