export interface ScanAdapter {
  scan(): Promise<string>;
}