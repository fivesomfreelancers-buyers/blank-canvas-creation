import { toBlob } from 'html-to-image';
export async function exportCV(element: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const failed = Array.from(element.querySelectorAll('img')).filter(img => !img.complete || !img.naturalWidth);
  if (failed.length) await Promise.all(failed.map(img => new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('A CV image could not load. Please try again.')); if (img.complete && !img.naturalWidth) reject(new Error('A CV image could not load.')); })));
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = '1000px'; clone.style.gridTemplateColumns = '210px minmax(0,1fr)'; clone.style.padding = '28px';
  clone.style.position = 'absolute'; clone.style.left = '-12000px';
  const footer = clone.querySelector('footer'); if (footer) (footer as HTMLElement).style.gridColumn = '1 / -1';
  document.body.appendChild(clone);
  let blob: Blob | null;
  try { blob = await toBlob(clone, { pixelRatio: 2, cacheBust: true, width: 1000, height: clone.scrollHeight, style: { position: 'static', left: 'auto' } }); }
  finally { clone.remove(); }
  if (!blob) throw new Error('CV export failed. Please try again.');
  return blob;
}
export function downloadCV(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${name.replace(/[^a-zA-Z0-9-]/g, '-')}-Fivesom-CV.png`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}