import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ImageGenerationDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsArray()
  @IsOptional()
  files: Express.Multer.File[];
}
