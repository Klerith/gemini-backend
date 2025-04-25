import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  ContentListUnion,
  createPartFromUri,
  GoogleGenAI,
  Modality,
} from '@google/genai';
import { v4 as uuidV4 } from 'uuid';

import { geminiUploadFiles } from '../helpers/gemini-upload-file';
import { ImageGenerationDto } from '../dtos/image-generation.dto';

const AI_IMAGES_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'public/ai-images',
);

interface Options {
  model?: string;
  systemInstruction?: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  text: string;
}

export const imageGenerationUseCase = async (
  ai: GoogleGenAI,
  imageGenerationDto: ImageGenerationDto,
  options?: Options,
): Promise<ImageGenerationResponse> => {
  const { prompt, files = [] } = imageGenerationDto;
  const contents: ContentListUnion = [{ text: prompt }];

  const uploadedFiles = await geminiUploadFiles(ai, files, {
    transformToPng: true,
  });

  uploadedFiles.forEach((file) => {
    contents.push(createPartFromUri(file.uri ?? '', file.mimeType ?? ''));
  });

  const { model = 'gemini-2.0-flash-exp-image-generation' } = options ?? {};

  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  let imageUrl = '';
  let text = '';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const imageId = uuidV4();

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.text) {
      text = part.text;
      continue;
    }
    if (!part.inlineData) {
      continue;
    }

    const imageData = part.inlineData.data!;
    const buffer = Buffer.from(imageData, 'base64');
    const imagePath = path.join(AI_IMAGES_PATH, `${imageId}.png`);

    fs.writeFileSync(imagePath, buffer);
    imageUrl = `${process.env.API_URL}/ai-images/${imageId}.png`;
  }

  return {
    imageUrl: imageUrl,
    text: text,
  };
};
