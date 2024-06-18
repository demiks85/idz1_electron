const { ipcRenderer } = require('electron');

document.getElementById('load-csv').addEventListener('click', async () => {
  //диалоговое окно выбора файла
  const result = await ipcRenderer.invoke('open-file-dialog');
  
  if (result) {
    const { fileContent, filePath } = result;
    // Проверяем консистентность данных
    if (!checkConsistency(fileContent)) {
      const proceed = confirm('Внимание: Файл содержит неконсистентные данные. Продолжить открытие файла?');
      if (!proceed) {
        return; // выход если не хочет продолжать
      }
    }
    displayCSV(fileContent);
    currentFilePath = filePath; // сохранение пути к файлу
  }
});


document.getElementById('new-csv').addEventListener('click', () => {
  const modal = document.getElementById('newCsvModal');
  modal.style.display = 'block'; //окно для ввода размеров
});


document.getElementById('create-table').addEventListener('click', async () => {
  const rows = parseInt(document.getElementById('modal-rows').value);
  const cols = parseInt(document.getElementById('modal-cols').value);

  const savePath = await ipcRenderer.invoke('save-file-dialog');//диалог сохр файла

  if (savePath) {
    createEmptyTable(rows, cols);
    currentFilePath = savePath; // Store the new file path for saving
    const modal = document.getElementById('newCsvModal');
    modal.style.display = 'none';
  }
});

document.querySelector('.close').addEventListener('click', () => {
  const modal = document.getElementById('newCsvModal');
  modal.style.display = 'none';
});

window.onclick = function(event) {
  const modal = document.getElementById('newCsvModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}

document.getElementById('save-csv').addEventListener('click', async () => {
  const content = getCSVContent();// Получаем содержимое таблицы в формате CSV
  if (currentFilePath) {
    const result = await ipcRenderer.invoke('save-file', { filePath: currentFilePath, content });
    if (result) {
      alert(`Файл сохранен: ${result}`);
    }
  } else {
    const result = await ipcRenderer.invoke('save-file-dialog', content);
    if (result) {
      alert(`Файл сохранен: ${result}`);
    }
  }
});

let currentFilePath = null;

function displayCSV(content) {
  const rows = content.split('\n').map(row => row.split(';'));

  const table = document.getElementById('csv-table');
  table.innerHTML = '';//очистка

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((cell) => {
      const cellElement = document.createElement('td');
      cellElement.textContent = cell;
      cellElement.contentEditable = true;//редактирование ячееек
      tr.appendChild(cellElement);
    });
    table.appendChild(tr);
  });
}

function createEmptyTable(rows, cols) {
  const table = document.getElementById('csv-table');
  table.innerHTML = '';

  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
      const td = document.createElement('td');
      td.contentEditable = true;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function getCSVContent() {
  const table = document.getElementById('csv-table');
  const rows = Array.from(table.getElementsByTagName('tr'));
  return rows.map(row => {
    const cells = Array.from(row.children);
    return cells.map(cell => cell.textContent).join(';');
  }).join('\n');
}

function checkConsistency(content) {
  const rows = content.split('\n').map(row => row.split(';'));
  const columnCount = rows[0].length;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length !== columnCount) {
      return false;// Если количество столбцов в строке не совпадает
      // с первой строкой, данные неконсистентны
    }
  }
  return true;
}
