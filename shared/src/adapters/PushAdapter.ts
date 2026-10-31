export interface PushTemplateData {
  [key: string]: string | number;
}

export interface PushAdapter {
  send(userId: string, template: string, data: PushTemplateData): Promise<void>;
}