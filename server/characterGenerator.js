import { readFile } from "node:fs/promises";
import OpenAI, { toFile } from "openai";
import sharp from "sharp";

const CHARACTER_VARIANTS = [
  { id: "sun-hat", label: "햇살 독서가", description: "밀짚모자와 노란 가디건" },
  { id: "blue-beanie", label: "구름 독서가", description: "하늘색 비니와 청 멜빵" },
  { id: "explorer", label: "숲속 탐험가", description: "초록 탐험 모자와 주황 재킷" },
  { id: "stripe", label: "줄무늬 친구", description: "모자 없이 빨간 줄무늬 옷" },
  { id: "beret", label: "민트 이야기꾼", description: "남색 베레모와 민트 스웨터" },
  { id: "bucket-hat", label: "소풍 독서가", description: "빨간 버킷햇과 청 재킷" },
  { id: "knit-cap", label: "포근한 독서가", description: "보라색 니트 모자와 크림 조끼" },
  { id: "flower-band", label: "꽃밭 이야기꾼", description: "해바라기 머리띠와 청록 후드" },
];

export class CharacterGeneratorConfigurationError extends Error {}

export function createCharacterGenerator({
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
} = {}) {
  const configured = Boolean(apiKey);
  const client = configured ? new OpenAI({ apiKey }) : null;

  return {
    configured,
    provider: "openai",
    model,
    async generate(photo, { userId = "local-user" } = {}) {
      if (!client) {
        throw new CharacterGeneratorConfigurationError(
          "OPENAI_API_KEY가 없어 캐릭터를 만들 수 없습니다.",
        );
      }

      // Normalize orientation, remove EXIF metadata, and reduce the amount of
      // child-photo data sent to the image provider.
      const sourceBytes = await readFile(photo.path);
      const normalizedPhoto = await sharp(sourceBytes)
        .rotate()
        .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#fffaf0" })
        .jpeg({ quality: 90 })
        .toBuffer();
      const inputImage = await toFile(normalizedPhoto, "child-reference.jpg", {
        type: "image/jpeg",
      });

      const prompt = `
Use case: illustration-story
Asset type: eight selectable child reading character variations for a tablet app
Primary request: Transform the child in the reference photo into one consistent, friendly picture-book character who is happily reading an open picture book.
Identity: Preserve the child's recognizable hairstyle, face shape, and friendly expression across all eight cells. Stylize rather than reproduce a photograph. Do not change age.
Layout: One 2-row by 4-column character sheet, exactly eight equal cells, read left-to-right and top-to-bottom. One full-body seated reading character centered in each cell. No borders, no gutters, no overlap between cells.
Wardrobe by cell: 1) straw sun hat and yellow cardigan, 2) sky-blue beanie and denim overalls, 3) green explorer cap and orange jacket, 4) no hat and red striped top, 5) navy beret and mint sweater, 6) red bucket hat and denim jacket, 7) lavender knit cap and cream vest, 8) sunflower headband and teal hoodie.
Style/medium: warm children's picture-book illustration drawn with crayons and colored pencils; slightly rough hand-drawn lines; layered wax-pencil texture; subtle paper grain; cheerful yellow, sky blue, green, and orange palette; simple round face, small eyes, rosy crayon cheeks; never anime, vector, or 3D.
Pose: In every cell the child is visibly reading an open book, with small natural pose differences. Keep body proportions, skin tone, hairstyle, facial features, line weight, and coloring style consistent.
Background: transparent, with only a tiny grounding shadow beneath each character.
Constraints: no text, no letters, no numbers, no logos, no watermark, no extra people, no panel border, no speech bubble, no caption.
      `.trim();

      let response;
      try {
        response = await client.images.edit({
          model,
          image: inputImage,
          prompt,
          size: "1536x1024",
          quality: "low",
          background: "transparent",
          output_format: "png",
          user: userId,
        });
      } catch (error) {
        if (error?.code === "moderation_blocked") {
          throw new Error(
            "이 사진은 이미지 안전 확인을 통과하지 못했어요. 다른 사진으로 다시 시도해 주세요.",
          );
        }
        throw error;
      }

      const encodedSheet = response.data?.[0]?.b64_json;
      if (!encodedSheet) throw new Error("캐릭터 이미지 결과가 비어 있습니다.");
      const sheet = await sharp(Buffer.from(encodedSheet, "base64"))
        .resize(1536, 1024, { fit: "fill" })
        .png()
        .toBuffer();

      return Promise.all(
        CHARACTER_VARIANTS.map(async (variant, index) => {
          const column = index % 4;
          const row = Math.floor(index / 4);
          const bytes = await sharp(sheet)
            .extract({ left: column * 384, top: row * 512, width: 384, height: 512 })
            .webp({ quality: 84, alphaQuality: 90 })
            .toBuffer();
          return {
            ...variant,
            mimeType: "image/webp",
            base64: bytes.toString("base64"),
          };
        }),
      );
    },
  };
}
