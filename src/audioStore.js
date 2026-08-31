const DATABASE_NAME = "mori-reading-audio";
const STORE_NAME = "recordings";
const DATABASE_VERSION = 1;

const openDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runTransaction = async (mode, action) => {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
};

export const loadRecordings = async () => {
  const records = await runTransaction("readonly", (store) => store.getAll());
  return Object.fromEntries(records.map((record) => [record.id, record]));
};

export const saveRecording = async (id, blob) => {
  const record = { id, blob, updatedAt: new Date().toISOString() };
  await runTransaction("readwrite", (store) => store.put(record));
  return record;
};

export const removeRecording = async (id) => {
  await runTransaction("readwrite", (store) => store.delete(id));
};
