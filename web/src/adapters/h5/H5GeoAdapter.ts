import type { GeoAdapter, GeoLocation } from '@nihao-deutsch/shared';

const GEO_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;

export class GeoTimeoutError extends Error {
  constructor() {
    super('定位超时');
    this.name = 'GeoTimeoutError';
  }
}

export class GeoPermissionDeniedError extends Error {
  constructor() {
    super('定位权限被拒绝');
    this.name = 'GeoPermissionDeniedError';
  }
}

export class H5GeoAdapter implements GeoAdapter {
  async getLocation(): Promise<GeoLocation> {
    return new Promise<GeoLocation>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy,
          });
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            reject(new GeoPermissionDeniedError());
          } else if (err.code === err.TIMEOUT) {
            reject(new GeoTimeoutError());
          } else {
            reject(new Error(`定位失败: ${err.message}`));
          }
        },
        { enableHighAccuracy: true, timeout: GEO_TIMEOUT_MS, maximumAge: 0 },
      );
    });
  }

  async getLocationWithRetry(): Promise<GeoLocation> {
    let lastError: unknown;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        return await this.getLocation();
      } catch (err) {
        lastError = err;
        if (err instanceof GeoPermissionDeniedError) throw err;
      }
    }
    throw lastError;
  }
}

export { MAX_RETRIES as GEO_MAX_RETRIES };