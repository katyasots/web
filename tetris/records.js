let records = [];

function updateRecords() {
  // Добавляем текущий счет и имя игрока в массив рекордов
  records.push({ name: name, score: score });

  // Сортируем рекорды по убыванию счета
  records.sort((a, b) => b.score - a.score);

  // Ограничиваем количество рекордов до 5
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
  // Обновляем рекорды
  updateRecords();
  // Отображаем контекстное меню
  gameOverMenu.style.display = 'block';

  // Получаем таблицу рекордов
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

// Инициализация рекордов при загрузке страницы
if (localStorage.getItem('records')) {
  records = JSON.parse(localStorage.getItem('records'));
}