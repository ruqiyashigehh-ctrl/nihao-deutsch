import type { PushAdapter, PushTemplateData } from '@nihao-deutsch/shared';

export class WeLinkPushAdapter implements PushAdapter {
  async send(_userId: string, _template: string, _data: PushTemplateData): Promise<void> {
    throw new Error('WeLink 推送适配待实现');
  }
}