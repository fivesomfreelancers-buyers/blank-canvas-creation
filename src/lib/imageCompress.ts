/**
 * Client-side image compression.
 *
 * Uploaded photos are often 5-20MB straight from a phone or design tool, which
 * makes gig pages crawl on Somali mobile connections. We downscale to a sane
 * display size and re-encode as WebP (JPEG fallback) before uploading, so the
 * files that end up in storage are a few hundred KB instead of megabytes.
 */

export interface CompressOptions {
  /** Longest edge in px. */
  maxDimension?: number;
  /** 0-1 encoder quality. */
  quality?: number;
  /** Files below this size are left untouched. */
  skipBelowBytes?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 1600,
  quality: 0.82,
  skipBelowBytes: 250 * 1024,
};

const canCompress = (file: File) =>
  typeof document !== 'undefined' &&
  file.type.startsWith('image/') &&
  !/gif|svg/i.test(file.type);

const loadBitmap = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

const renamed = (name: string, ext: string) => `${name.replace(/\.[^.]+$/, '')}.${ext}`;

/**
 * Returns a compressed copy of the image, or the original file when it is
 * already small, not an image, or compression fails for any reason.
 */
export const compressImage = async (file: File, opts: CompressOptions = {}): Promise<File> => {
  const { maxDimension, quality, skipBelowBytes } = { ...DEFAULTS, ...opts };
  if (!canCompress(file) || file.size <= skipBelowBytes) return file;

  try {
    const img = await loadBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    let blob = await toBlob(canvas, 'image/webp', quality);
    let ext = 'webp';
    if (!blob || blob.type !== 'image/webp') {
      blob = await toBlob(canvas, 'image/jpeg', quality);
      ext = 'jpg';
    }
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], renamed(file.name, ext), { type: blob.type, lastModified: Date.now() });
  } catch (err) {
    console.warn('Image compression skipped:', err);
    return file;
  }
};

/** Compress a list of images, keeping order. */
export const compressImages = (files: File[], opts?: CompressOptions) =>
  Promise.all(files.map((f) => compressImage(f, opts)));
