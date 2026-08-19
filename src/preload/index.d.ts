import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      storeGet: (key: string) => Promise<unknown>
      storeSet: (key: string, val: unknown) => Promise<void>
    }
  }
}
