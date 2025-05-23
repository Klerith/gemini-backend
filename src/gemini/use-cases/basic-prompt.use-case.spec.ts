import { GoogleGenAI } from '@google/genai';
import { basicPromptUseCase } from './basic-prompt.use-case';
import { BasicPromptDto } from '../dtos/basic-prompt.dto';

// Mock GoogleGenAI
const mockGoogleGenAI = {
  models: {
    generateContent: jest.fn(),
  },
};

describe('basicPromptUseCase', () => {
  let ai: GoogleGenAI;
  let basicPromptDto: BasicPromptDto;

  beforeEach(() => {
    // Cast the mock to GoogleGenAI type
    ai = mockGoogleGenAI as any as GoogleGenAI;
    // Reset the mock before each test
    mockGoogleGenAI.models.generateContent.mockReset();
  });

  it('should call generateContent with default options and return text', async () => {
    const promptText = 'Hello, world!';
    const expectedResponseText = 'AI says hello!';
    basicPromptDto = { prompt: promptText, files: [] };

    // Configure the mock to return a specific response
    mockGoogleGenAI.models.generateContent.mockResolvedValue({
      text: expectedResponseText,
    });

    const result = await basicPromptUseCase(ai, basicPromptDto);

    // Verify that generateContent was called with the correct parameters
    expect(mockGoogleGenAI.models.generateContent).toHaveBeenCalledWith({
      model: 'gemini-2.0-flash', // Default model
      contents: promptText,
      config: {
        systemInstruction: `
      Responde únicamente en español 
      En formato markdown 
      Usa negritas de esta forma __
      Usa el sistema métrico decimal
  `, // Default system instruction
      },
    });

    // Verify that the result is the expected text
    expect(result).toBe(expectedResponseText);
  });

  it('should call generateContent with custom options and return text', async () => {
    const promptText = 'Custom hello!';
    const expectedResponseText = 'AI says custom hello!';
    const customModel = 'gemini-pro';
    const customSystemInstruction = 'Respond in English, be concise.';
    
    basicPromptDto = { prompt: promptText, files: [] };
    const options = { model: customModel, systemInstruction: customSystemInstruction };

    // Configure the mock to return a specific response
    mockGoogleGenAI.models.generateContent.mockResolvedValue({
      text: expectedResponseText,
    });

    const result = await basicPromptUseCase(ai, basicPromptDto, options);

    // Verify that generateContent was called with the correct parameters
    expect(mockGoogleGenAI.models.generateContent).toHaveBeenCalledWith({
      model: customModel,
      contents: promptText,
      config: {
        systemInstruction: customSystemInstruction,
      },
    });

    // Verify that the result is the expected text
    expect(result).toBe(expectedResponseText);
  });
});
