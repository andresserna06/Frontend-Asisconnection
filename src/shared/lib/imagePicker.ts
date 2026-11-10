import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import type { LocalMediaFile } from '@/shared/domain/models/LocalMediaFile';

export type PickImageResult =
  { status: 'picked'; file: LocalMediaFile } | { status: 'cancelled' } | { status: 'denied' };

type PickImageOptions = {
  // Square crop, used for profile photos.
  isSquare?: boolean;
};

const IMAGE_QUALITY = 0.8;

// Browsers only offer a file chooser (desktop) or ignore the request, so the camera
// option is shown only in the native app.
export const IS_CAMERA_AVAILABLE = Platform.OS !== 'web';

function toLocalMediaFile(asset: ImagePicker.ImagePickerAsset): LocalMediaFile {
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? null,
    mimeType: asset.mimeType ?? null,
    webFile: asset.file ?? null,
  };
}

function toResult(result: ImagePicker.ImagePickerResult): PickImageResult {
  const asset = result.canceled ? undefined : result.assets[0];
  return asset ? { status: 'picked', file: toLocalMediaFile(asset) } : { status: 'cancelled' };
}

export async function pickImageFromLibrary(
  options: PickImageOptions = {},
): Promise<PickImageResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { status: 'denied' };
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    ...(options.isSquare ? { aspect: [1, 1] as [number, number] } : {}),
    quality: IMAGE_QUALITY,
  });
  return toResult(result);
}

export async function takePhoto(options: PickImageOptions = {}): Promise<PickImageResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { status: 'denied' };
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    ...(options.isSquare ? { aspect: [1, 1] as [number, number] } : {}),
    quality: IMAGE_QUALITY,
  });
  return toResult(result);
}
