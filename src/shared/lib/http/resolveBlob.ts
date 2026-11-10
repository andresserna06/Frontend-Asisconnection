export async function resolveBlobFromUri(uri: string): Promise<Blob | null> {
  try {
    const response = await fetch(uri);
    return await response.blob();
  } catch {
    return null;
  }
}
