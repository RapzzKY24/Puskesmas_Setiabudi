import { RoleType } from '../../common/types/prisma.types';

export class UserResponseDto {
  id: string;
  nik: string | null;
  nama: string | null;
  noHp: string | null;
  email: string | null;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;
}
