import AsyncStorage from '@react-native-async-storage/async-storage';

// Non-sensitive data that lives only on this device. The session token never goes here.
export async function readDeviceValue<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export async function writeDeviceValue(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
