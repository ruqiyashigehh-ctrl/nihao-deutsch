import type { PushAdapter, PushTemplateData } from '@nihao-deutsch/shared';
import { apiPost } from '../../api/client';

export class InAppPushAdapter implements PushAdapter {
  async send(userId: string, template: string, data: PushTemplateData): Promise<void> {
    await apiPost('/messages/in-app', { userId, template, data });
  }
}