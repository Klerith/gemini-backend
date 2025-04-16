import { GoogleGenAI } from '@google/genai';

const fileMimeTypesByExtension = {
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export const geminiUploadFiles = async (
  ai: GoogleGenAI,
  files: Express.Multer.File[],
) => {
  const uploadedFiles = await Promise.all(
    files.map((file) => {
      const fileExtension = file.originalname.split('.').pop() ?? '';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fileMimeType: string =
        fileMimeTypesByExtension[fileExtension] ?? '';

      // Esto es para cuando el archivo no tiene un mime type reconocido
      const type = file.mimetype.includes('application/octet-stream')
        ? fileMimeType
        : file.mimetype;

      return ai.files.upload({
        file: new Blob([file.buffer], {
          type,
        }),
      });
    }),
  );

  return uploadedFiles;
};
