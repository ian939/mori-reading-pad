export const CHARACTER_VARIANT_OPTIONS = [
  { id: "sun-hat", label: "햇살 독서가", description: "밀짚모자와 노란 가디건" },
  { id: "blue-beanie", label: "구름 독서가", description: "하늘색 비니와 청 멜빵" },
  { id: "explorer", label: "숲속 탐험가", description: "초록 탐험 모자와 주황 재킷" },
  { id: "stripe", label: "줄무늬 친구", description: "모자 없이 빨간 줄무늬 옷" },
  { id: "beret", label: "민트 이야기꾼", description: "남색 베레모와 민트 스웨터" },
  { id: "bucket-hat", label: "소풍 독서가", description: "빨간 버킷햇과 청 재킷" },
  { id: "knit-cap", label: "포근한 독서가", description: "보라색 니트 모자와 크림 조끼" },
  { id: "flower-band", label: "꽃밭 이야기꾼", description: "해바라기 머리띠와 청록 후드" },
];

const decodeImage = async (file) => {
  if ("createImageBitmap" in globalThis) {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      dispose: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  await image.decode();
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    dispose: () => URL.revokeObjectURL(url),
  };
};

const canvasBlob = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("캐릭터 이미지를 나누지 못했어요."))),
      "image/webp",
      0.86,
    );
  });

const colorDistanceSquared = (data, offset, background) => {
  const red = data[offset] - background[0];
  const green = data[offset + 1] - background[1];
  const blue = data[offset + 2] - background[2];
  return red * red + green * green + blue * blue;
};

// Codex MVP sheets use a plain light backdrop. Remove only backdrop-colored
// pixels connected to the outside edge, so similar light colors enclosed by
// the child's book or clothing remain intact.
const removeConnectedBackground = (context, width, height) => {
  const image = context.getImageData(0, 0, width, height);
  const { data } = image;
  const cornerIndexes = [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    (height * width - 1) * 4,
  ];
  if (cornerIndexes.some((offset) => data[offset + 3] < 245)) return;
  const background = [0, 1, 2].map((channel) =>
    Math.round(
      cornerIndexes.reduce((sum, offset) => sum + data[offset + channel], 0) /
        cornerIndexes.length,
    ),
  );
  const thresholdSquared = 18 * 18;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let queueStart = 0;
  let queueEnd = 0;

  const enqueue = (pixelIndex) => {
    if (visited[pixelIndex]) return;
    const offset = pixelIndex * 4;
    if (colorDistanceSquared(data, offset, background) > thresholdSquared) return;
    visited[pixelIndex] = 1;
    queue[queueEnd] = pixelIndex;
    queueEnd += 1;
  };
  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (queueStart < queueEnd) {
    const pixelIndex = queue[queueStart];
    queueStart += 1;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    if (x > 0) enqueue(pixelIndex - 1);
    if (x + 1 < width) enqueue(pixelIndex + 1);
    if (y > 0) enqueue(pixelIndex - width);
    if (y + 1 < height) enqueue(pixelIndex + width);
  }

  for (let pixelIndex = 0; pixelIndex < visited.length; pixelIndex += 1) {
    if (visited[pixelIndex]) data[pixelIndex * 4 + 3] = 0;
  }
  context.putImageData(image, 0, 0);
};

const withMetadata = (blob, index) => ({
  ...CHARACTER_VARIANT_OPTIONS[index],
  mimeType: blob.type || "image/png",
  blob,
});

export async function importCharacterImages(fileList) {
  const files = [...fileList].filter((file) => file.type.startsWith("image/"));
  if (files.length === 8) {
    return files.map((file, index) => withMetadata(file, index));
  }
  if (files.length !== 1) {
    throw new Error("2×4 캐릭터 시트 한 장 또는 캐릭터 이미지 8장을 골라 주세요.");
  }

  const decoded = await decodeImage(files[0]);
  try {
    if (decoded.width < 400 || decoded.height < 300) {
      throw new Error("캐릭터 시트의 해상도가 너무 작아요. 원본 이미지를 골라 주세요.");
    }
    const cellWidth = decoded.width / 4;
    const cellHeight = decoded.height / 2;
    return await Promise.all(
      CHARACTER_VARIANT_OPTIONS.map(async (_option, index) => {
        const canvas = document.createElement("canvas");
        canvas.width = 384;
        canvas.height = 512;
        const context = canvas.getContext("2d", { alpha: true });
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(
          decoded.source,
          (index % 4) * cellWidth,
          Math.floor(index / 4) * cellHeight,
          cellWidth,
          cellHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        removeConnectedBackground(context, canvas.width, canvas.height);
        return withMetadata(await canvasBlob(canvas), index);
      }),
    );
  } finally {
    decoded.dispose();
  }
}
