import { toBlob } from 'html-to-image';
export async function exportCV(element: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const failed = Array.from(element.querySelectorAll('img')).filter(img => !img.complete || !img.naturalWidth);
  if (failed.length) await Promise.all(failed.map(img => new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('A CV image could not load. Please try again.')); if (img.complete && !img.naturalWidth) reject(new Error('A CV image could not load.')); })));
  const blob = await toBlob(element, { pixelRatio: 2, cacheBust: true, width: 1000, style: { width: '1000px', gridTemplateColumns: '210px minmax(0,1fr)', padding: '28px' } });
  if (!blob) throw new Error('CV export failed. Please try again.');
  return blob;
}
export function downloadCV(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${name.replace(/[^a-zA-Z0-9-]/g, '-')}-Fivesom-CV.png`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}