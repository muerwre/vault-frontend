import { mkdir, rename, unlink, writeFile } from 'fs/promises';
import { dirname } from 'path';

/**
 * Writes beside the target and renames over it, so a concurrent reader sees
 * either the old file, nothing, or the whole new one — never a partial write.
 */
export const writeAtomically = async (
  absolute: string,
  contents: Buffer,
): Promise<void> => {
  const temporary = `${absolute}.${process.pid}.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2)}.tmp`;

  await mkdir(dirname(absolute), { recursive: true });

  try {
    await writeFile(temporary, contents);
    await rename(temporary, absolute);
  } catch (error) {
    await unlink(temporary).catch((): void => undefined);
    throw error;
  }
};
