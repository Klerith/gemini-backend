import { IsNotEmpty, IsString } from 'class-validator';

export class PokemonHelperDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
