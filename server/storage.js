import { createHash, randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";
import sharp from "sharp";

const safeBookDirectory = (uploadsDirectory, bookId) => {
  const root = resolve(uploadsDirectory);
  const target = resolve(root, bookId);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    throw new Error("잘못된 업로드 저장 경로입니다.");
  }
  return target;
};

export async function storeBookImages({ bookId = randomUUID(), files, uploadsDirectory }) {
  const bookDirectory = safeBookDirectory(uploadsDirectory, bookId);
  await mkdir(bookDirectory, { recursive: true });
  const storedPages = [];

  try {
    for (const [uploadIndex, file] of files.entries()) {
      const storedFilename = `page-${String(uploadIndex + 1).padStart(3, "0")}.jpg`;
      const absolutePath = join(bookDirectory, storedFilename);

      try {
        await sharp(file.path)
          .rotate()
          .resize({
            width: 2200,
            height: 2200,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 90, mozjpeg: true })
          .toFile(absolutePath);
      } finally {
        await rm(file.path, { force: true });
      }

      const bytes = await readFile(absolutePath);
      storedPages.push({
        uploadIndex,
        originalFilename: basename(file.originalname),
        storedFilename: relative(uploadsDirectory, absolutePath).split(sep).join("/"),
        absolutePath,
        mimeType: "image/jpeg",
        byteSize: bytes.byteLength,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      });
    }
    return { bookId, pages: storedPages };
  } catch (error) {
    await rm(bookDirectory, { recursive: true, force: true });
    throw error;
  }
}

export async function cleanIncomingFiles(files = []) {
  await Promise.all(files.map((file) => rm(file.path, { force: true })));
}

export async function removeBookImages({ bookId, uploadsDirectory }) {
  await rm(safeBookDirectory(uploadsDirectory, bookId), {
    recursive: true,
    force: true,
  });
}

// Deletes every stored page image for a book except the ones named in
// keepFilenames. Used after analysis to keep only the cover, so a full
// reproduction of the book never lingers on disk.
export async function pruneBookImages({ bookId, uploadsDirectory, keepFilenames = [] }) {
  const bookDirectory = safeBookDirectory(uploadsDirectory, bookId);
  const keep = new Set(keepFilenames.filter(Boolean).map((name) => basename(name)));

  let entries;
  try {
    entries = await readdir(bookDirectory);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  await Promise.all(
    entries
      .filter((entry) => !keep.has(entry))
      .map((entry) => rm(join(bookDirectory, entry), { force: true })),
  );
}
