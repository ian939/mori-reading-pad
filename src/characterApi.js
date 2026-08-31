const configuredBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const endpoint = (path) => `${configuredBase}${path}`;

const readJson = async (response) => {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // Static hosting can return HTML when the separate character API is absent.
  }
  if (!response.ok) {
    throw new Error(
      body?.error ||
        (response.status === 404
          ? "캐릭터 생성 서버에 연결되지 않았어요. 로컬 PC에서 API 서버를 함께 실행해 주세요."
          : "캐릭터를 만드는 중 서버에서 응답하지 않았어요."),
    );
  }
  return body;
};

const base64ToBlob = (base64, mimeType) => {
  const bytes = Uint8Array.from(atob(base64), (character) =>
    character.charCodeAt(0),
  );
  return new Blob([bytes], { type: mimeType });
};

export async function generateCharacterVariations(photo, { userId }) {
  const form = new FormData();
  form.append("photo", photo, "child-photo.jpg");
  const response = await fetch(endpoint("/api/characters/generate"), {
    method: "POST",
    headers: { "X-Mori-User-Id": userId },
    body: form,
  });
  const body = await readJson(response);
  return body.variants.map(({ base64, ...variant }) => ({
    ...variant,
    blob: base64ToBlob(base64, variant.mimeType),
  }));
}
