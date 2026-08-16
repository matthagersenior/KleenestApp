/**
 * Kleenest Media Core
 * Canonical media contract for all modular app cores.
 *
 * Consumers must use this core instead of calling Supabase Storage directly.
 */

const DEFAULT_LIMITS = Object.freeze({
  image: Object.freeze({ maxBytes: 10 * 1024 * 1024, types: Object.freeze(['image/jpeg', 'image/png', 'image/webp', 'image/gif']) }),
  video: Object.freeze({ maxBytes: 100 * 1024 * 1024, types: Object.freeze(['video/mp4', 'video/webm', 'video/quicktime']) })
});

export function createMediaCore({ supabase, bucket = 'kleenest-media', limits = DEFAULT_LIMITS } = {}) {
  if (!supabase) throw new Error('Media Core requires an authenticated Supabase client.');

  const normalize = (file) => {
    if (!file || typeof file !== 'object') throw new Error('A media file is required.');
    const type = String(file.type || '').toLowerCase();
    const kind = type.startsWith('video/') ? 'video' : type.startsWith('image/') ? 'image' : null;
    if (!kind) throw new Error('Unsupported media type.');
    const rule = limits[kind];
    if (!rule || !rule.types.includes(type)) throw new Error(`Unsupported ${kind} format.`);
    const size = Number(file.size || 0);
    if (!Number.isFinite(size) || size < 0 || size > rule.maxBytes) throw new Error(`The ${kind} exceeds the allowed size.`);
    return { type, kind, size };
  };

  const safeName = (name = 'media') => String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);

  async function upload(file, { userId, namespace = 'social', pathPrefix = '', metadata = {} } = {}) {
    if (!userId) throw new Error('Authenticated user is required.');
    const info = normalize(file);
    const original = safeName(file.name || 'media');
    const extension = original.includes('.') ? original.split('.').pop() : info.type.split('/')[1];
    const path = `${namespace}/${userId}/${pathPrefix ? `${pathPrefix}/` : ''}${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: info.type,
      upsert: false,
      cacheControl: '3600'
    });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return Object.freeze({
      storage_path: path,
      url: data?.publicUrl || null,
      media_type: info.type,
      media_kind: info.kind,
      media_size_bytes: info.size,
      ...metadata
    });
  }

  async function remove(storagePath, { userId, namespace = 'social' } = {}) {
    if (!userId || !storagePath) throw new Error('Authenticated user and storage path are required.');
    const prefix = `${namespace}/${userId}/`;
    if (!storagePath.startsWith(prefix)) throw new Error('Media ownership check failed.');
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error) throw error;
  }

  return Object.freeze({ normalize, upload, remove });
}

export const mediaCoreContract = Object.freeze({
  version: 1,
  bucket: 'kleenest-media',
  consumers: Object.freeze(['social', 'profile', 'business', 'qr-studio'])
});
