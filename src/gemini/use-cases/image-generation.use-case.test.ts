import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { geminiUploadFiles } from '../helpers/gemini-upload-file';
import { imageGenerationUseCase } from './image-generation.use-case';

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

jest.mock('../helpers/gemini-upload-file', () => ({
  geminiUploadFiles: jest.fn(),
}));

describe('imageGenerationUseCase', () => {
  let ai: any;
  const mockGenerateContent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    ai = new GoogleGenAI('test-api-key');
    // Ensure getGenerativeModel is a mock function
    ai.getGenerativeModel = jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    });
    process.env.API_URL = 'http://localhost:3000';
  });

  describe('successful image generation with prompt only', () => {
    it('should generate an image and return the URL and text', async () => {
      // Arrange
      const imageGenerationDto = {
        prompt: 'A beautiful sunset over the mountains',
        files: [],
      };
      const mockUuid = 'test-uuid-123';
      (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

      (geminiUploadFiles as jest.Mock).mockResolvedValue([]);

      const mockApiResponse = {
        response: {
          candidates: [
            {
              content: {
                parts: [
                  { text: 'Generated text description' },
                  { inlineData: { mimeType: 'image/png', data: 'base64imagedata' } },
                ],
              },
            },
          ],
        }
      };
      mockGenerateContent.mockResolvedValue(mockApiResponse);

      // Act
      const result = await imageGenerationUseCase(ai, imageGenerationDto);

      // Assert
      expect(geminiUploadFiles).toHaveBeenCalledWith(ai, imageGenerationDto.files);
      expect(ai.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-pro-vision' });
      expect(mockGenerateContent).toHaveBeenCalledWith([
        imageGenerationDto.prompt,
      ]);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `./uploads/ai-images/${mockUuid}.png`,
        Buffer.from('base64imagedata', 'base64')
      );
      expect(result.imageUrl).toBe(`http://localhost:3000/ai-images/${mockUuid}.png`);
      expect(result.text).toBe('Generated text description');
    });
  });

  describe('successful image generation with prompt and image files', () => {
    it('should generate an image and return the URL and text', async () => {
      // Arrange
      const imageGenerationDto = {
        prompt: 'A cat playing with a ball of yarn',
        files: [{ originalname: 'test.jpg', buffer: Buffer.from('test'), mimetype: 'image/jpeg' }] as any[], // Cast to any to satisfy Multer.File type if necessary
      };
      const mockUuid = 'test-uuid-456';
      (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

      const uploadedFileData = [
        { uri: 'gs://uploaded-file-uri/test.png', mimeType: 'image/png' }
      ];
      (geminiUploadFiles as jest.Mock).mockResolvedValue(uploadedFileData);

      const mockApiResponse = {
        response: {
          candidates: [
            {
              content: {
                parts: [
                  { text: 'Description with image' },
                  { inlineData: { mimeType: 'image/png', data: 'anotherbase64imagedata' } },
                ],
              },
            },
          ],
        }
      };
      mockGenerateContent.mockResolvedValue(mockApiResponse);
      process.env.API_URL = 'http://localhost:3000'; // Ensure API_URL is set

      // Act
      const result = await imageGenerationUseCase(ai, imageGenerationDto);

      // Assert
      expect(geminiUploadFiles).toHaveBeenCalledWith(ai, imageGenerationDto.files);
      expect(ai.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-pro-vision' });
      expect(mockGenerateContent).toHaveBeenCalledWith([
        imageGenerationDto.prompt,
        {
          inlineData: {
            data: expect.any(String), // The base64 string of the uploaded file part
            mimeType: uploadedFileData[0].mimeType,
          },
        },
      ]);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `./uploads/ai-images/${mockUuid}.png`,
        Buffer.from('anotherbase64imagedata', 'base64')
      );
      expect(result.imageUrl).toBe(`http://localhost:3000/ai-images/${mockUuid}.png`);
      expect(result.text).toBe('Description with image');
    });
  });

  describe('AI service returns no image data', () => {
    it('should return an empty image URL and the text from the AI', async () => {
      // Arrange
      const imageGenerationDto = {
        prompt: 'A prompt that results in no image',
        files: [],
      };
      // uuidv4 will be called, but its result is not used for image URL if no image data
      (uuidv4 as jest.Mock).mockReturnValue('test-uuid-no-image'); 
      (geminiUploadFiles as jest.Mock).mockResolvedValue([]);

      const mockApiResponseNoImage = {
        response: {
          candidates: [
            {
              content: {
                parts: [
                  { text: 'Only text, no image today' }
                ],
              },
            },
          ],
        }
      };
      mockGenerateContent.mockResolvedValue(mockApiResponseNoImage);
      process.env.API_URL = 'http://localhost:3000'; // Ensure API_URL is set

      // Act
      const result = await imageGenerationUseCase(ai, imageGenerationDto);

      // Assert
      expect(ai.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-pro-vision' });
      expect(mockGenerateContent).toHaveBeenCalledWith([imageGenerationDto.prompt]);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(result.imageUrl).toBe('');
      expect(result.text).toBe('Only text, no image today');
    });
  });

  describe('AI service returns no text data', () => {
    it('should return an image URL and empty text', async () => {
      // Arrange
      const imageGenerationDto = {
        prompt: 'A prompt that results in no text',
        files: [],
      };
      const mockUuid = 'test-uuid-789';
      (uuidv4 as jest.Mock).mockReturnValue(mockUuid);
      (geminiUploadFiles as jest.Mock).mockResolvedValue([]);

      const mockApiResponseNoText = {
        response: {
          candidates: [
            {
              content: {
                parts: [
                  { inlineData: { mimeType: 'image/png', data: 'onlyimagedata' } }
                ],
              },
            },
          ],
        }
      };
      mockGenerateContent.mockResolvedValue(mockApiResponseNoText);
      process.env.API_URL = 'http://localhost:3000';

      // Act
      const result = await imageGenerationUseCase(ai, imageGenerationDto);

      // Assert
      expect(ai.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-pro-vision' });
      expect(mockGenerateContent).toHaveBeenCalledWith([imageGenerationDto.prompt]);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `./uploads/ai-images/${mockUuid}.png`,
        Buffer.from('onlyimagedata', 'base64')
      );
      expect(result.imageUrl).toBe(`http://localhost:3000/ai-images/${mockUuid}.png`);
      expect(result.text).toBe('');
    });
  });

  describe('geminiUploadFiles throws an error', () => {
    it('should throw an error and not call generateContent or writeFileSync', async () => {
      // Arrange
      const imageGenerationDto = {
        prompt: 'A prompt for a test where upload fails',
        files: [{ originalname: 'fail.jpg', buffer: Buffer.from('fail-data'), mimetype: 'image/jpeg' }] as any[],
      };
      const uploadError = new Error('Upload failed');
      (geminiUploadFiles as jest.Mock).mockRejectedValue(uploadError);

      // Act & Assert
      await expect(imageGenerationUseCase(ai, imageGenerationDto)).rejects.toThrow('Upload failed');
      expect(ai.getGenerativeModel).not.toHaveBeenCalled();
      expect(mockGenerateContent).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('ai.models.generateContent throws an error', () => {
    it('should throw an error and not call writeFileSync', async () => {
      // Arrange
      const imageGenerationDto = {
        prompt: 'A prompt for a test where AI generation fails',
        files: [],
      };
      (geminiUploadFiles as jest.Mock).mockResolvedValue([]);
      const generationError = new Error('AI content generation failed');
      mockGenerateContent.mockRejectedValue(generationError);

      // Act & Assert
      await expect(imageGenerationUseCase(ai, imageGenerationDto)).rejects.toThrow('AI content generation failed');
      expect(geminiUploadFiles).toHaveBeenCalledWith(ai, imageGenerationDto.files); // This should still be called
      expect(ai.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-pro-vision' }); // This should also be called
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });
});
