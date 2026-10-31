import React, { createContext, useContext, useMemo } from 'react';
import type { AdapterBundle } from '@nihao-deutsch/shared';
import { PLATFORM } from './env';
import { AccountAuthAdapter } from '../adapters/h5/AccountAuthAdapter';
import { H5GeoAdapter } from '../adapters/h5/H5GeoAdapter';
import { InAppPushAdapter } from '../adapters/h5/InAppPushAdapter';
import { H5ScanAdapter } from '../adapters/h5/H5ScanAdapter';
import { WeLinkAuthAdapter } from '../adapters/welink/WeLinkAuthAdapter';
import { WeLinkGeoAdapter } from '../adapters/welink/WeLinkGeoAdapter';
import { WeLinkPushAdapter } from '../adapters/welink/WeLinkPushAdapter';
import { WeLinkScanAdapter } from '../adapters/welink/WeLinkScanAdapter';

const AdapterContext = createContext<AdapterBundle | null>(null);

function createH5Adapters(): AdapterBundle {
  return {
    auth: new AccountAuthAdapter(),
    geo: new H5GeoAdapter(),
    push: new InAppPushAdapter(),
    scan: new H5ScanAdapter(),
  };
}

function createWeLinkAdapters(): AdapterBundle {
  return {
    auth: new WeLinkAuthAdapter(),
    geo: new WeLinkGeoAdapter(),
    push: new WeLinkPushAdapter(),
    scan: new WeLinkScanAdapter(),
  };
}

export function AdapterProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const adapters = useMemo<AdapterBundle>(() => {
    return PLATFORM === 'welink' ? createWeLinkAdapters() : createH5Adapters();
  }, []);

  return React.createElement(AdapterContext.Provider, { value: adapters }, children);
}

export function useAdapter(): AdapterBundle {
  const ctx = useContext(AdapterContext);
  if (!ctx) {
    throw new Error('useAdapter 必须在 AdapterProvider 内使用');
  }
  return ctx;
}