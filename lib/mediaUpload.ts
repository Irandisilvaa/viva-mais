import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { DEMO_MODE, supabase } from '@/lib/supabase';

function extFrom(asset: ImagePicker.ImagePickerAsset) {
  const byName = asset.fileName?.split('.').pop()?.toLowerCase();
  if (byName && /^[a-z0-9]{2,5}$/.test(byName)) return byName;
  if (asset.mimeType === 'image/png') return 'png';
  if (asset.mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

export async function pickAndUploadPublicImage(folder: 'services' | 'contents'): Promise<string | null> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error('Autorize o acesso às fotos para importar uma imagem.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  if (DEMO_MODE) return asset.uri;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Sessão expirada. Entre novamente.');

  const ext = extFrom(asset);
  const mime = asset.mimeType || (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg');
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const path = `${userData.user.id}/${folder}/${safeName}`;

  let payload: any;
  const webFile = (asset as any).file;
  if (Platform.OS === 'web' && webFile) {
    payload = webFile;
  } else {
    const response = await fetch(asset.uri);
    payload = await response.arrayBuffer();
  }

  const { error } = await supabase.storage.from('viva-mais-media').upload(path, payload, {
    contentType: mime,
    upsert: false,
    cacheControl: '3600',
  });
  if (error) throw error;

  const { data } = supabase.storage.from('viva-mais-media').getPublicUrl(path);
  return data.publicUrl;
}
