import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BasicPromptDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsArray()
  @IsOptional()
  files: Express.Multer.File[];
}
