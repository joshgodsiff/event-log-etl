export type UserEvent = {
  timestamp: Date;
  userId: number;
  eventType: string;
  originalLine: string;
}