export class NotificationResponseDto {
  id: string;
  userId: string;
  type: string;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  accentBorder: boolean;
  readAt: Date | null;
  createdAt: Date;
}
