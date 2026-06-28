import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  token: string;
  user: UserResponseDto;
}
