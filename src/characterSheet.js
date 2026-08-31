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
        return withMetadata(await canvasBlob(canvas), index);
      }),
    );
  } finally {
    decoded.dispose();
  }
}
