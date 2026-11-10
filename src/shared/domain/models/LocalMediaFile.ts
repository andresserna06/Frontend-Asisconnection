// A photo picked on the device, ready to be uploaded.
// On native the file is read from `uri`; on web the browser hands over the file itself
// (`webFile`), because a `blob:` URI cannot be sent inside a multipart form.
export type LocalMediaFile = {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
  webFile: Blob | null;
};
