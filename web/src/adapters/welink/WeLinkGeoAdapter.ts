import type { GeoAdapter, GeoLocation } from '@nihao-deutsch/shared';

export class WeLinkGeoAdapter implements GeoAdapter {
  async getLocation(): Promise<GeoLocation> {
    throw new Error('WeLink 定位适配待实现');
  }
}