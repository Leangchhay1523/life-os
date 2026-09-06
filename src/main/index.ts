import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import StoreModule from 'electron-store'

const Store = (StoreModule as unknown as { default: typeof StoreModule }).default || StoreModule
const store = new Store({
  name: app.isPackaged ? 'config' : 'config-dev'
})

let mainWindow: BrowserWindow | null = null
let popupWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createPopupWindow(cycleMinutes: number): void {
  if (popupWindow) {
    popupWindow.focus()
    return
  }

  popupWindow = new BrowserWindow({
    width: 450,
    height: 480,
    show: false,
    frame: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Pass popup indicator via URL
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    popupWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?popup=water&time=${cycleMinutes}`)
  } else {
    popupWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { popup: 'water', time: cycleMinutes.toString() }
    })
  }

  popupWindow.on('ready-to-show', () => {
    popupWindow?.show()
    // Trick to ensure window stays on top
    popupWindow?.setAlwaysOnTop(true, 'screen-saver')
  })

  popupWindow.on('closed', () => {
    popupWindow = null
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('bring-to-front', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.setAlwaysOnTop(true)
      mainWindow.show()
      mainWindow.focus()
      mainWindow.setAlwaysOnTop(false)
    }
  })

  ipcMain.on('show-water-popup', (_, cycleMinutes: number) => {
    createPopupWindow(cycleMinutes)
  })

  ipcMain.on('water-action', (_, actionType: string) => {
    if (popupWindow) popupWindow.close()
    if (mainWindow) {
      mainWindow.webContents.send('water-action-reply', actionType)
    }
  })

  // Electron-store handlers
  ipcMain.handle('store-get', (_, key: string) => {
    return store.get(key)
  })

  ipcMain.handle('store-set', (_, key: string, val: unknown) => {
    store.set(key, val)
  })

  ipcMain.handle('compile-latex', async (_, latexCode: string) => {
    return new Promise((resolve) => {
      const tempDir = fs.mkdtempSync(join(os.tmpdir(), 'resume-latex-'))
      const texFile = join(tempDir, 'resume.tex')
      fs.writeFileSync(texFile, latexCode)
      exec(
        `pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFile}"`,
        (error, stdout) => {
          const pdfFile = join(tempDir, 'resume.pdf')
          if (fs.existsSync(pdfFile)) {
            const pdfBuffer = fs.readFileSync(pdfFile)
            const base64 = pdfBuffer.toString('base64')
            resolve({ success: true, base64 })
          } else {
            resolve({ success: false, error: error?.message || 'Failed to compile', stdout })
          }
        }
      )
    })
  })

  ipcMain.handle('read-template', () => {
    try {
      const templatePath = join(__dirname, '../../resume.tex')
      return fs.readFileSync(templatePath, 'utf-8')
    } catch {
      return ''
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
