const configuredBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const endpoint = (path) => `${configuredBase}${path}`;

const readJson = async (response) => {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // A static host can return HTML for an unavailable API. Keep the message useful.
  }
  if (!response.ok) {
    throw new Error(
      body?.error ||
        (response.status === 404
          ? "책 등록 서버에 연결되지 않았어요. 배포된 API 주소를 확인해 주세요."
          : "책 등록 서버에서 응답하지 않았어요."),
    );
  }
  return body;
};

export async function registerBook(files) {
  const form = new FormData();
  files.forEach((file) => form.append("pages", file, file.name));
  const response = await fetch(endpoint("/api/books"), {
    method: "POST",
    body: form,
  });
  return (await readJson(response)).book;
}

export async function getRegisteredBook(bookId) {
  const response = await fetch(endpoint(`/api/books/${encodeURIComponent(bookId)}`), {
    headers: { Accept: "application/json" },
  });
  return (await readJson(response)).book;
}
