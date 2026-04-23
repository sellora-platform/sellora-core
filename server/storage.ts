/**
 * Sellora Storage Service
 *
 * Stub implementation for file uploads.
 * Will be replaced with Cloudinary integration in a later phase.
 * For now, images can be referenced by URL (external links).
 */

export async function storagePut(
  _relKey: string,
  _data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  // TODO: Phase 1+ — Integrate with Cloudinary
  throw new Error("File upload not yet configured. Use external image URLs for now.");
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  return { key: relKey, url: `/uploads/${relKey}` };
}
