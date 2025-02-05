// получаем доступ к основному холсту
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// получаем доступ к холсту с игровой статистикой
const canvasScore = document.getElementById('score');
const contextScore = canvasScore.getContext('2d');

// размер квадратика
const grid = 32;
// массив с последовательностями фигур, на старте — пустой
var tetrominoSequence = [];

// двумерный массив игрового поля
var playfield = [];

// получаем доступ к контекстному меню и кнопке перезапуска
const gameOverMenu = document.getElementById('gameOverMenu');
const restartButton = document.getElementById('restartButton');

for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

const tetrominos = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  'J': [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'L': [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'O': [
    [1, 1],
    [1, 1],
  ],
  'S': [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  'Z': [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  'T': [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ]
};

const colors = {
  'I': 'crimson',
  'O': 'darkred',
  'T': 'mediumvioletred',
  'S': 'firebrick',
  'Z': 'indianred',
  'J': 'mediumorchid',
  'L': 'orchid'
};

// счётчик
let count = 0;
// текущая фигура в игре
let tetromino = getNextTetromino();
// кадры анимации
let rAF = null;
// флаг конца игры
let gameOver = false;

// очки и уровень на старте
let score = 0;
let level = 1;

// имя игорока при запуске
let name = prompt("Ваше имя", "Безымянный");

// случайное число в заданном диапазоне
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// генерация последовательности фигур
function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  while (sequence.length) {
    // случайным образом находим любую из них
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }
}

// получаем следующую фигуру
function getNextTetromino() {
  // если следующей нет,генерируем
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }
  // берём первую фигуру из массива
  const name = tetrominoSequence.pop();
  // матрица фигуры
  const matrix = tetrominos[name];

  // I и O стартуют с середины, остальные — чуть левее
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

  // I начинает с 21 строки (смещение -1), а все остальные — со строки 22 (смещение -2)
  const row = name === 'I' ? -1 : -2;

  return {
    name: name,      
    matrix: matrix,  
    row: row,
    col: col 
  };
}

// поворачиваем матрицу на 90 градусов
function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i])
  );
  return result;
}

// проверка: влазит ли фигура
function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
        cellCol + col < 0 ||
        cellCol + col >= playfield[0].length ||
        cellRow + row >= playfield.length ||
        playfield[cellRow + row][cellCol + col])
      ) {
        return false;
      }
    }
  }
  return true;
}

// фигура заняла свое место
function placeTetromino() {
  // обрабатываем все строки и столбцы в игровом поле
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {

        // если край фигуры после установки вылезает за границы поля, то игра закончилась
        if (tetromino.row + row < 0) {
          return showGameOver();
        }
        // все ок - записываем фигуру в поле
        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  // очистка ряда
  for (let row = playfield.length - 1; row >= 0;) {
    // если ряд заполнен
    if (playfield[row].every(cell => !!cell)) {

      score += 10;
      level = Math.floor(score / 100) + 1;

      // очищаем его и опускаем всё вниз на одну клетку
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1][c];
        }
      }
    }
    else {
      row--;
    }
  }
  // получаем следующую фигуру
  tetromino = getNextTetromino();
}

let records = [];

function updateRecords() {
  // Добавляем счет и имя игрока в массив рекордов
  records.push({ name: name, score: score });

  // Сортируем по убыванию
  records.sort((a, b) => b.score - a.score);

  // Ограничиваем до 5
  if (records.length > 5) {
    records = records.slice(0, 5);
  }
  // Сохраняем рекорды в localStorage
  localStorage.setItem('records', JSON.stringify(records));
}

function showGameOver() {
  // Прекращаем всю анимацию игры
  cancelAnimationFrame(rAF);
  // Ставим флаг окончания
  gameOver = true;

  updateRecords();
  // Отображаем контекстное меню
  gameOverMenu.style.display = 'block';

  const recordsTable = document.getElementById('recordsTable');
  // Очищаем текущее содержимое таблицы
  recordsTable.innerHTML = `
    <tr>
      <th>Имя</th>
      <th>Счет</th>
    </tr>
  `;

  // Добавляем рекорды в таблицу
  records.forEach(record => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.name}</td>
      <td>${record.score}</td>
    `;
    recordsTable.appendChild(row);
  });
}

// перезапуск игры
function restartGame() {
  // Скрываем контекстное меню
  gameOverMenu.style.display = 'none';

  count = 0;
  gameOver = false;
  score = 0;
  level = 1;
  tetrominoSequence = [];
  playfield = [];

  for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }

  tetromino = getNextTetromino();

  // начинаем анимацию
  rAF = requestAnimationFrame(loop);
}

// обработчик события для кнопки перезапуска
restartButton.addEventListener('click', restartGame);

function showScore() {
  contextScore.clearRect(0, 0, canvasScore.width, canvasScore.height);
  contextScore.globalAlpha = 1;
  contextScore.fillStyle = 'black';
  contextScore.font = '18px Courier New';
  contextScore.fillText('Уровень: ' + level, 15, 20);
  contextScore.fillText('Очков:   ' + score, 15, 50);
  contextScore.fillText('Имя:   ' + name, 15, 80);
}

// рисуем сетку на холсте
function drawGrid() {
  context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  context.lineWidth = 0.5;

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      context.strokeRect(col * grid, row * grid, grid, grid);
    }
  }
}

// получаем доступ к холсту для отображения следующей фигуры
const canvasNext = document.getElementById('next');
const contextNext = canvasNext.getContext('2d');

// размер квадратика для отображения следующей фигуры
const gridNext = 32;

// отрисовка следующей фигуры
function drawNextTetromino() {
  // очищаем холст
  contextNext.clearRect(0, 0, canvasNext.width, canvasNext.height);

  // рисуем следующую фигуру
  if (tetrominoSequence.length > 0) {
    const nextTetromino = tetrominos[tetrominoSequence[tetrominoSequence.length - 1]];
    const color = colors[tetrominoSequence[tetrominoSequence.length - 1]];

    contextNext.fillStyle = color;

    for (let row = 0; row < nextTetromino.length; row++) {
      for (let col = 0; col < nextTetromino[row].length; col++) {
        if (nextTetromino[row][col]) {
          contextNext.fillRect(col * gridNext, row * gridNext, gridNext - 1, gridNext - 1);
        }
      }
    }
  }
}

// мгновенное падения фигуры
function dropTetromino() {
  while (isValidMove(tetromino.matrix, tetromino.row + 1, tetromino.col)) {
    tetromino.row++;
  }
  placeTetromino();
}

// клавиши
document.addEventListener('keydown', function (e) {
  // конец игры - выходим
  if (gameOver) return;

  // стрелки влево и вправо
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const col = e.key === 'ArrowLeft'
      // влево - уменьш индекс, нет - увеличиваем
      ? tetromino.col - 1
      : tetromino.col + 1;

    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
    }
  }

  // стрелка вверх — поворот
  if (e.key === 'ArrowUp') {
    const matrix = rotate(tetromino.matrix);
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = matrix;
    }
  }

  // стрелка вниз — ускорить падение
  if (e.key === 'ArrowDown') {
    const row = tetromino.row + 1;
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
      tetromino.row = row - 1;
      placeTetromino();
      return;
    }
    tetromino.row = row;
  }

  // пробел — мгновенное падение фигуры
  if (e.key === ' ') {
    dropTetromino();
  }
});

// главный цикл игры
function loop() {
  // начинаем анимацию
  rAF = requestAnimationFrame(loop);
  // очищаем холст
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  // поле с фигурами
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];
        // рисуем всё на один пиксель меньше, чтобы получился эффект «в клетку»
        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }

  showScore();

  if (tetromino) {
    if (++count > (36 - level)) {
      tetromino.row++;
      count = 0;
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
      }
    }
    context.fillStyle = colors[tetromino.name];
    // отрисовка
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
        }
      }
    }
  }
  drawNextTetromino();
}

// Инициализация рекордов при загрузке страницы
if (localStorage.getItem('records')) {
  records = JSON.parse(localStorage.getItem('records'));
}

// старт игры
rAF = requestAnimationFrame(loop);