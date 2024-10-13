// Константы
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const blockSize = 30;
const width = 10;
const height = 20;
const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan'];
const figures = [
    [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // T
    [[1, 1, 1], [1, 0, 0], [0, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1], [0, 0, 0]], // J
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]], // S
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]] // Z
];

let gameGrid = Array.from({ length: height }, () => Array(width).fill(0));
let currentFigure = null;
let nextFigure = null;
let score = 0;
let level = 1;
let username = '';

// Функции
function startGame() {
    username = document.getElementById('username').value;
    if (!username) return alert('Введите имя пользователя');

    document.getElementById('username-form').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('player-name').textContent = `Игрок: ${username}`;

    currentFigure = getRandomFigure();
    nextFigure = getRandomFigure();
    drawNextFigure();
    gameLoop();
}

function getRandomFigure() {
    const type = Math.floor(Math.random() * figures.length);
    const color = colors[type];
    return { type, color, x: Math.floor(width / 2) - 1, y: 0, rotation: 0 };
}

function drawNextFigure() {
    const nextFigureDiv = document.getElementById('next-figure');
    nextFigureDiv.innerHTML = '';
    const figure = rotateFigure(figures[nextFigure.type], nextFigure.rotation);
    const size = figure.length;
    const offsetX = (100 - size * blockSize) / 2; // Центрирование фигуры по горизонтали
    const offsetY = (100 - size * blockSize) / 2; // Центрирование фигуры по вертикали
    figure.forEach((row, y) => {
        row.forEach((block, x) => {
            if (block) {
                const blockDiv = document.createElement('div');
                blockDiv.style.width = `${blockSize}px`;
                blockDiv.style.height = `${blockSize}px`;
                blockDiv.style.backgroundColor = nextFigure.color;
                blockDiv.style.position = 'absolute';
                blockDiv.style.left = `${offsetX + x * blockSize}px`;
                blockDiv.style.top = `${offsetY + y * blockSize}px`;
                nextFigureDiv.appendChild(blockDiv);
            }
        });
    });
}

function gameLoop() {
    clearCanvas();
    drawGrid();
    drawFigure(currentFigure);
    if (!moveFigureDown()) {
        placeFigure();
        checkLines();
        if (isGameOver()) {
            gameOver();
            return;
        }
        currentFigure = nextFigure;
        nextFigure = getRandomFigure();
        drawNextFigure();
    }
    setTimeout(gameLoop, 200 / level);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (gameGrid[y][x]) {
                ctx.fillStyle = gameGrid[y][x];
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
}

function drawFigure(figure) {
    const shape = rotateFigure(figures[figure.type], figure.rotation);
    shape.forEach((row, y) => {
        row.forEach((block, x) => {
            if (block) {
                ctx.fillStyle = figure.color;
                ctx.fillRect((figure.x + x) * blockSize, (figure.y + y) * blockSize, blockSize, blockSize);
            }
        });
    });
}

function moveFigureDown() {
    const newY = currentFigure.y + 1;
    if (canMove(currentFigure.x, newY, currentFigure.rotation)) {
        currentFigure.y = newY;
        return true;
    }
    return false;
}

function canMove(x, y, rotation) {
    const shape = rotateFigure(figures[currentFigure.type], rotation);
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= width || newY >= height || gameGrid[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placeFigure() {
    const shape = rotateFigure(figures[currentFigure.type], currentFigure.rotation);
    shape.forEach((row, y) => {
        row.forEach((block, x) => {
            if (block) {
                gameGrid[currentFigure.y + y][currentFigure.x + x] = currentFigure.color;
            }
        });
    });
}

function checkLines() {
    for (let y = 0; y < height; y++) {
        if (gameGrid[y].every(block => block)) {
            gameGrid.splice(y, 1);
            gameGrid.unshift(Array(width).fill(0));
            score += 100;
            updateScore();
            if (score % 1000 === 0) {
                level++;
                updateLevel();
            }
        }
    }
}

function isGameOver() {
    return gameGrid[0].some(block => block);
}

function gameOver() {
    alert(`Игра окончена! Ваш счет: ${score}`);
    saveScore();
    showHighScores();
    resetGame();
}

function saveScore() {
    const scores = JSON.parse(localStorage.getItem('tetrisScores')) || [];
    scores.push({ username, score });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('tetrisScores', JSON.stringify(scores.slice(0, 10)));
}

function showHighScores() {
    const scores = JSON.parse(localStorage.getItem('tetrisScores')) || [];
    const highScoresDiv = document.createElement('div');
    highScoresDiv.innerHTML = '<h2>Таблица рекордов</h2>';
    scores.forEach((entry, index) => {
        highScoresDiv.innerHTML += `<p>${index + 1}. ${entry.username}: ${entry.score}</p>`;
    });
    document.body.appendChild(highScoresDiv);
}

function resetGame() {
    gameGrid = Array.from({ length: height }, () => Array(width).fill(0));
    currentFigure = null;
    nextFigure = null;
    score = 0;
    level = 1;
    document.getElementById('username-form').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
}

function updateScore() {
    document.getElementById('score').textContent = `Очки: ${score}`;
}

function updateLevel() {
    document.getElementById('level').textContent = `Уровень: ${level}`;
}

function rotateFigure(figure, rotation) {
    const size = figure.length;
    const newFigure = Array.from({ length: size }, () => Array(size).fill(0));

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (rotation === 0) {
                newFigure[y][x] = figure[y][x];
            } else if (rotation === 1) {
                newFigure[x][size - 1 - y] = figure[y][x];
            } else if (rotation === 2) {
                newFigure[size - 1 - y][size - 1 - x] = figure[y][x];
            } else if (rotation === 3) {
                newFigure[size - 1 - x][y] = figure[y][x];
            }
        }
    }

    return newFigure;
}

// Обработчики событий
document.getElementById('start-game').addEventListener('click', startGame);
document.addEventListener('keydown', (event) => {
    if (!currentFigure) return;
    switch (event.key) {
        case 'ArrowLeft':
            if (canMove(currentFigure.x - 1, currentFigure.y, currentFigure.rotation)) {
                currentFigure.x--;
            }
            break;
        case 'ArrowRight':
            if (canMove(currentFigure.x + 1, currentFigure.y, currentFigure.rotation)) {
                currentFigure.x++;
            }
            break;
        case 'ArrowDown':
            moveFigureDown();
            break;
        case 'ArrowUp':
            const newRotation = (currentFigure.rotation + 1) % 4;
            if (canMove(currentFigure.x, currentFigure.y, newRotation)) {
                currentFigure.rotation = newRotation;
            }
            break;
        case ' ':
            while (moveFigureDown()) {}
            break;
    }
});