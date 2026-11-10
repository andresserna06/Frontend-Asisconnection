import type { LocalMediaFile } from '@/shared/domain/models/LocalMediaFile';

import type { HttpClient } from './http';

export type UploadMediaResult = {
  url: string;
  format: string;
  bytes: number;
};

const DEFAULT_MIME_TYPE = 'image/jpeg';
const EXTENSION_MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
};

function guessMimeType(fileName: string): string {
  const extension = /\.(\w+)$/.exec(fileName)?.[1]?.toLowerCase();
  return (extension && EXTENSION_MIME_TYPES[extension]) || DEFAULT_MIME_TYPE;
}

function extensionFor(mimeType: string): string {
  const subtype = mimeType.split('/')[1] ?? 'jpg';
  return subtype === 'jpeg' ? 'jpg' : subtype;
}

// Builds the multipart body expected by POST /media/upload (field `file`).
export function buildMediaFormData(media: LocalMediaFile): FormData {
  const uriName =
    media.uri.startsWith('data:') || media.uri.startsWith('blob:')
      ? null
      : (media.uri.split('/').pop() ?? null);
  const mimeType =
    media.mimeType || media.webFile?.type || guessMimeType(media.fileName ?? uriName ?? '');
  const fileName = media.fileName ?? uriName ?? `upload.${extensionFor(mimeType)}`;
  const formData = new FormData();

  if (media.webFile !== null) {
    formData.append('file', media.webFile, fileName);
  } else {
    // React Native's FormData reads the file from this descriptor.
    formData.append('file', { uri: media.uri, name: fileName, type: mimeType } as unknown as Blob);
  }
  return formData;
}

export async function uploadMedia(client: HttpClient, media: LocalMediaFile): Promise<string> {
  if (!client.uploadFile) {
    throw new Error('El cliente HTTP no tiene habilitada la subida de archivos');
  }
  const result = await client.uploadFile<UploadMediaResult>(
    '/media/upload',
    buildMediaFormData(media),
  );
  return result.url;
}
