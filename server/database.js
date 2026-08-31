import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const now = () => new Date().toISOString();

const BOOK_COLUMNS = `
  id, title, subtitle, authors, illustrators, translators, publisher, isbn,
  publication_date, language, description, status, analysis_provider,
  analysis_model, error_message, page_count, text_length, created_at,
  updated_at, processed_at
`;

const toBook = (row) =>
  row
    ? {
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        authors: row.authors,
        illustrators: row.illustrators,
        translators: row.translators,
        publisher: row.publisher,
        isbn: row.isbn,
        publicationDate: row.publication_date,
        language: row.language,
        description: row.description,
        status: row.status,
        analysisProvider: row.analysis_provider,
        analysisModel: row.analysis_model,
        errorMessage: row.error_message,
        pageCount: row.page_count,
        textLength: row.text_length,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        processedAt: row.processed_at,
      }
    : null;

const toPage = (row) => ({
  id: row.id,
  bookId: row.book_id,
  uploadIndex: row.upload_index,
  printedPage: row.printed_page,
  pageKind: row.page_kind,
  originalFilename: row.original_filename,
  storedFilename: row.stored_filename,
  mimeType: row.mime_type,
  byteSize: row.byte_size,
  sha256: row.sha256,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function createDatabase(databasePath) {
  mkdirSync(dirname(databasePath), { recursive: true });
  const sqlite = new DatabaseSync(databasePath);

  sqlite.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT,
      subtitle TEXT,
      authors TEXT,
      illustrators TEXT,
      translators TEXT,
      publisher TEXT,
      isbn TEXT,
      publication_date TEXT,
      language TEXT NOT NULL DEFAULT 'ko',
      description TEXT,
      status TEXT NOT NULL CHECK (
        status IN ('queued', 'processing', 'complete', 'needs_configuration', 'failed')
      ),
      analysis_provider TEXT,
      analysis_model TEXT,
      error_message TEXT,
      page_count INTEGER NOT NULL DEFAULT 0,
      text_length INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      processed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS book_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      upload_index INTEGER NOT NULL,
      printed_page TEXT,
      page_kind TEXT NOT NULL DEFAULT 'unknown',
      original_filename TEXT NOT NULL,
      stored_filename TEXT,
      mime_type TEXT NOT NULL,
      byte_size INTEGER NOT NULL,
      sha256 TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(book_id, upload_index)
    );

    CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
    CREATE INDEX IF NOT EXISTS idx_book_pages_book ON book_pages(book_id, upload_index);
  `);

  const insertBook = sqlite.prepare(`
    INSERT INTO books (
      id, status, analysis_provider, analysis_model, page_count, created_at, updated_at
    ) VALUES (?, 'queued', ?, ?, ?, ?, ?)
  `);
  const insertPage = sqlite.prepare(`
    INSERT INTO book_pages (
      book_id, upload_index, original_filename, stored_filename,
      mime_type, byte_size, sha256, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const selectBook = sqlite.prepare(`SELECT ${BOOK_COLUMNS} FROM books WHERE id = ?`);
  const selectBooks = sqlite.prepare(`
    SELECT ${BOOK_COLUMNS} FROM books ORDER BY created_at DESC LIMIT ? OFFSET ?
  `);
  const countBooks = sqlite.prepare("SELECT COUNT(*) AS count FROM books");
  const selectPages = sqlite.prepare(`
    SELECT * FROM book_pages WHERE book_id = ? ORDER BY upload_index ASC
  `);
  const selectPending = sqlite.prepare(`
    SELECT id FROM books WHERE status IN ('queued', 'processing') ORDER BY created_at ASC
  `);
  const updateStatus = sqlite.prepare(`
    UPDATE books SET status = ?, error_message = ?, updated_at = ? WHERE id = ?
  `);
  const updatePage = sqlite.prepare(`
    UPDATE book_pages
    SET printed_page = ?, page_kind = ?, updated_at = ?
    WHERE book_id = ? AND upload_index = ?
  `);
  const clearPageImage = sqlite.prepare(`
    UPDATE book_pages
    SET stored_filename = NULL, updated_at = ?
    WHERE book_id = ? AND upload_index = ?
  `);
  const finishBook = sqlite.prepare(`
    UPDATE books
    SET title = ?, subtitle = ?, authors = ?, illustrators = ?, translators = ?,
        publisher = ?, isbn = ?, publication_date = ?, language = ?, description = ?,
        status = 'complete', text_length = ?, error_message = NULL,
        updated_at = ?, processed_at = ?
    WHERE id = ?
  `);

  const withPages = (book) =>
    book ? { ...book, pages: selectPages.all(book.id).map(toPage) } : null;

  return {
    createBook({ id, provider, model, pages }) {
      const timestamp = now();
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        insertBook.run(id, provider, model, pages.length, timestamp, timestamp);
        for (const page of pages) {
          insertPage.run(
            id,
            page.uploadIndex,
            page.originalFilename,
            page.storedFilename,
            page.mimeType,
            page.byteSize,
            page.sha256,
            timestamp,
            timestamp,
          );
        }
        sqlite.exec("COMMIT");
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
      return withPages(toBook(selectBook.get(id)));
    },

    getBook(id, { includePages = true } = {}) {
      const book = toBook(selectBook.get(id));
      return includePages ? withPages(book) : book;
    },

    listBooks({ limit = 50, offset = 0 } = {}) {
      return {
        books: selectBooks.all(limit, offset).map(toBook),
        total: Number(countBooks.get().count),
      };
    },

    pendingBookIds() {
      return selectPending.all().map((row) => row.id);
    },

    setStatus(id, status, errorMessage = null) {
      updateStatus.run(status, errorMessage, now(), id);
      return this.getBook(id);
    },

    completeBook(id, analysis, { retainedUploadIndexes = [] } = {}) {
      const retained = new Set(retainedUploadIndexes);
      const timestamp = now();
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        for (const page of analysis.pages) {
          // Persist only structural, non-expressive page facts (kind, printed
          // page number). The transcribed text itself is never written to disk.
          updatePage.run(
            page.printedPage,
            page.pageKind,
            timestamp,
            id,
            page.uploadIndex,
          );
          // Drop the DB reference to any page image we are about to delete, so
          // only the retained cover keeps a stored_filename.
          if (!retained.has(page.uploadIndex)) {
            clearPageImage.run(timestamp, id, page.uploadIndex);
          }
        }
        finishBook.run(
          analysis.title,
          analysis.subtitle,
          analysis.authors,
          analysis.illustrators,
          analysis.translators,
          analysis.publisher,
          analysis.isbn,
          analysis.publicationDate,
          analysis.language || "ko",
          analysis.description,
          analysis.fullText ? analysis.fullText.length : 0,
          timestamp,
          timestamp,
          id,
        );
        sqlite.exec("COMMIT");
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
      return this.getBook(id);
    },

    close() {
      sqlite.close();
    },
  };
}
