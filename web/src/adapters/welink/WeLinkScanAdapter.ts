import type { ScanAdapter } from '@nihao-deutsch/shared';

export class WeLinkScanAdapter implements ScanAdapter {
  async scan(): Promise<string> {
    throw new Error('WeLink 扫码适配待实现');
  }
}