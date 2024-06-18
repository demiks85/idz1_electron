const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Функция для создания основного окна приложения
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Добавляем preload скрипт, если необходимо
      nodeIntegration: true, // Включаем интеграцию с Node.js
      contextIsolation: false, // Выключаем изоляцию контекста для использования Node.js в процессе рендеринга
    },
  });

  win.loadFile('index.html'); // Загружаем HTML файл в окно
}

// Запускаем создание окна, когда Electron готов
app.whenReady().then(() => {
  createWindow();

  // Создаем новое окно, если окна нет и приложение активировано
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Выходим из приложения, когда все окна закрыты (кроме macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Обработчик для диалога открытия файлов
ipcMain.handle('open-file-dialog', async (event) => {
  // Открываем диалоговое окно для выбора файла
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CSV Files', extensions: ['csv'] }], // Фильтруем файлы для выбора только CSV
  });

  if (result.canceled) {
    return null; // Если диалог был отменен, возвращаем null
  } else {
    const filePath = result.filePaths[0];
    const fileContent = fs.readFileSync(filePath, 'utf-8'); // Читаем содержимое файла
    return { filePath, fileContent }; // Возвращаем путь и содержимое файла
  }
});

// Обработчик для диалога сохранения файла
ipcMain.handle('save-file-dialog', async (event, content) => {
  // Открываем диалоговое окно для выбора пути сохранения файла
  const result = await dialog.showSaveDialog({
    filters: [{ name: 'CSV Files', extensions: ['csv'] }], // Фильтруем файлы для сохранения только CSV
  });

  if (result.canceled) {
    return null; // Если диалог был отменен, возвращаем null
  } else {
    const filePath = result.filePath;
    fs.writeFileSync(filePath, content, 'utf-8'); // Записываем содержимое в файл
    return filePath; // Возвращаем путь к сохраненному файлу
  }
});

// Обработчик для сохранения файла по указанному пути
ipcMain.handle('save-file', async (event, { filePath, content }) => {
  fs.writeFileSync(filePath, content, 'utf-8'); // Записываем содержимое в файл
  return filePath; // Возвращаем путь к сохраненному файлу
});
