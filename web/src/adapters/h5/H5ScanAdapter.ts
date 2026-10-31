import type { ScanAdapter } from '@nihao-deutsch/shared';
import jsQR from 'jsqr';

export class ScanUnavailableError extends Error {
  constructor() {
    super('扫码功能不可用');
    this.name = 'ScanUnavailableError';
  }
}

export class H5ScanAdapter implements ScanAdapter {
  async scan(): Promise<string> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new ScanUnavailableError();
    }

    const video = document.createElement('video');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('muted', 'true');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    } catch {
      throw new ScanUnavailableError();
    }

    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      stream.getTracks().forEach((t) => t.stop());
      throw new ScanUnavailableError();
    }

    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('扫码超时'));
      }, 30_000);

      const cleanup = () => {
        clearTimeout(timeout);
        stream.getTracks().forEach((t) => t.stop());
      };

      const tick = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            cleanup();
            resolve(code.data);
            return;
          }
        }
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }
}