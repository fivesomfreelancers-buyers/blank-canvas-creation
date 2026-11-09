/** Matches the per-object limit of requirements and delivery Storage buckets. */
export const ORDER_FILE_MAX_BYTES = 1024 * 1024 * 1024;

export function exceedsOrderFileLimit(files: readonly { size: number }[]): boolean {
  return files.some(file => file.size > ORDER_FILE_MAX_BYTES);
}