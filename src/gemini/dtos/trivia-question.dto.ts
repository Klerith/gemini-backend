import { IsNotEmpty, IsString } from 'class-validator';

export class TriviaQuestionDto {
  @IsString()
  @IsNotEmpty()
  topic: string;
}
