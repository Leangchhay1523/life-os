import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      storeGet: (key: string) => Promise<unknown>
      storeSet: (key: string, val: unknown) => Promise<void>
      compileLatex: (
        code: string
      ) => Promise<{ success: boolean; base64?: string; error?: string; stdout?: string }>
      readTemplate: () => Promise<string>
    }
  }
}
