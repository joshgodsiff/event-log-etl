export type UserEvent = {
  timestamp: Date;
  userId: number;
  eventType: string;
  originalLine: string;
}

export type QueryParams = {
  userId?: number ;
  eventType?: string;
  fromDate?: Date;
  toDate?: Date;
}