export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function isInGeofence(lat: number, lon: number, cpLat: number, cpLon: number, radius: number): boolean {
  return haversineDistance(lat, lon, cpLat, cpLon) <= radius;
}

export function isInTimeWindow(now: Date, startTime: string, endTime: string, weekdays: number[]): boolean {
  const day = now.getDay();
  if (!weekdays.includes(day)) return false;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return nowMin >= sh * 60 + sm && nowMin <= eh * 60 + em;
}