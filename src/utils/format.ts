export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function isUrlExpired(url: string): boolean {
  try {
    const u = new URL(url);
    const date    = u.searchParams.get('X-Amz-Date');    // e.g. 20260527T145507Z
    const expires = u.searchParams.get('X-Amz-Expires'); // seconds, e.g. 86400
    if (!date || !expires) return false;
    const signedAt  = new Date(
      Date.UTC(+date.slice(0,4), +date.slice(4,6)-1, +date.slice(6,8),
               +date.slice(9,11), +date.slice(11,13), +date.slice(13,15))
    );
    const expiresAt = new Date(signedAt.getTime() + +expires * 1000);
    return Date.now() >= expiresAt.getTime() - 5 * 60 * 1000; // 5-min buffer
  } catch { return false; }
}

export function getFileCategory(contentType: string): 'image' | 'video' | 'audio' | 'pdf' | 'csv' | 'doc' | 'text' | 'other' {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('audio/')) return 'audio';
  if (contentType === 'application/pdf') return 'pdf';
  if (contentType === 'text/csv' || contentType === 'application/csv') return 'csv';
  if (
    contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    contentType === 'application/msword' ||
    contentType === 'application/vnd.oasis.opendocument.text'
  ) return 'doc';
  if (contentType.startsWith('text/')) return 'text';
  return 'other';
}
