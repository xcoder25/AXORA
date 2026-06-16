const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let splashWindow = null;

// Paths and local configuration setup
const configDir = app.getPath('userData');
const configPath = path.join(configDir, 'axora-config.json');

const defaultConfig = {
  targetUrl: 'http://localhost:9002',
  description: 'Axora Institutional OS Configuration'
};

function loadConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
      return defaultConfig;
    }
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading config, using defaults:', err);
    return defaultConfig;
  }
}

const config = loadConfig();

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 450,
    height: 550,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    frame: false, // Frameless window for custom glassmorphism titlebar
    show: false,  // Hide until ready
    backgroundColor: '#040714',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Load target Next.js application
  const startUrl = process.env.AXORA_URL || config.targetUrl;
  console.log(`Loading Axora from: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  // Monitor loading status
  mainWindow.once('ready-to-show', () => {
    // Graceful fade transition from splash to main window
    setTimeout(() => {
      if (splashWindow) {
        splashWindow.close();
      }
      mainWindow.show();
      mainWindow.focus();
    }, 3000); // Keep splash screen visible for at least 3 seconds for brand effect
  });

  // Handle load failures (e.g. if the Next.js server isn't running yet)
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log(`Failed to load: ${validatedURL}. Code: ${errorCode}. Description: ${errorDescription}`);
    // If we're loading the local dev server, retry in a moment
    if (validatedURL.includes('localhost') || validatedURL.includes('127.0.0.1')) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          console.log(`Retrying connection to local dev server...`);
          mainWindow.loadURL(startUrl);
        }
      }, 2000);
    }
  });

  // Open external links in default OS browser instead of inside electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Window Controls handlers
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('get-env-config', async () => {
  return config;
});

// App lifecycle hooks
app.whenReady().then(() => {
  createSplashWindow();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
