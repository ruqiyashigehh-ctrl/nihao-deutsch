export type { AuthAdapter, AuthResult } from './AuthAdapter';
export type { GeoAdapter, GeoLocation } from './GeoAdapter';
export type { PushAdapter, PushTemplateData } from './PushAdapter';
export type { ScanAdapter } from './ScanAdapter';

import type { AuthAdapter } from './AuthAdapter';
import type { GeoAdapter } from './GeoAdapter';
import type { PushAdapter } from './PushAdapter';
import type { ScanAdapter } from './ScanAdapter';

export interface AdapterBundle {
  auth: AuthAdapter;
  geo: GeoAdapter;
  push: PushAdapter;
  scan: ScanAdapter;
}