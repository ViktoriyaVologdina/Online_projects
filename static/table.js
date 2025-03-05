document.addEventListener("DOMContentLoaded", function () {
    const table = document.getElementById('books-table'); // Получаем таблицу по ID  

    // Функция для получения данных с API (GET-запрос)
    async function getTableBooks() {
        try {
            const response = await fetch('http://localhost:5000/api/books', {
                method: 'GET' // Отправляем GET-запрос на сервер для получения списка книг
            });
            const result = await response.json(); // Преобразуем ответ в JSON
            console.log(result); // Выводим результат в консоль
            return result; // Возвращаем полученные данные
        } catch (error) {
            console.error("Ошибка загрузки данных: ", error);
            return [];
        }
    }

    // Функция для загрузки и отображения данных в таблице
    async function addTableBooks() {
        const itemTableBooks = await getTableBooks(); // Получаем данные с сервера

        itemTableBooks.reverse(); // Переворачиваем массив, чтобы новые строки были сверху

        // Отрисовать заявки в таблице
        const tbody = document.querySelector('.books__table-tbody');
        tbody.innerHTML = ''; // Очистим таблицу перед добавлением новых данных

        for (const item of itemTableBooks) {
            tbody.appendChild(tableItem(item)); // Добавляем строку в конец таблицы
        }

        numberTableRevers(); // Добавить нумерацию в таблице
        search(itemTableBooks); // Инициализируем поиск по таблиц
    }

    addTableBooks(); // Загружаем и отображаем данные при запуске страницы

    // Функция для создания строки в таблице
    function tableItem(obj) {
        const tr = document.createElement('tr'); // Создаем новый элемент строки
        tr.classList.add('books__table-tr', 'tr-body'); // Добавляем классы для строки

        // Создаем ячейки для каждого столбца
        const tdNumber = document.createElement('td');
        const tdDate = document.createElement('td');
        const tdFio = document.createElement('td');
        const tdBirth = document.createElement('td');
        const tdTicket = document.createElement('td');
        const tdPhone = document.createElement('td');
        const tdEmail = document.createElement('td');
        const tdApproval = document.createElement('td');

        // Функция для преобразования даты в формат 'ДД.ММ.ГГГГ'
        function formatDate(dateStr) {
            if (!dateStr) return "Не указана"; // Если дата пустая
            const date = new Date(dateStr); // Преобразуем строку в объект Date
            const day = String(date.getDate()).padStart(2, '0'); // Добавляем ведущий ноль, если нужно
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0, поэтому прибавляем 1
            const year = date.getFullYear(); // Получаем год
            return `${day}.${month}.${year}`; // Возвращаем строку в формате 'ДД.ММ.ГГГГ'
        }

        // Заполняем ячейки данными из объекта, используя функцию форматирования для дат
        tdDate.textContent = obj.request_date ? obj.request_date : "Не указана";  // Если дата заявки пустая, показываем "Не указана"
        tdFio.textContent = obj.fio || "Не указано";  // Если ФИО пустое, показываем "Не указано"
        tdBirth.textContent = formatDate(obj.birth_date) || "Не указано";  // Форматируем дату рождения
        tdTicket.textContent = obj.ticket_number || "Нет билета";  // Если нет читательского билета, показываем "Нет билета"
        tdPhone.textContent = obj.phone || "Не указан";  // Если телефон пустой, показываем "Не указан"
        tdEmail.textContent = obj.email || "Не указан";  // Если email пустой, показываем "Не указан"
        tdApproval.textContent = "Cогласен";  // Показываем "Не согласен" если согласие не указано

        // Добавляем ячейки в строку
        tr.append(
            tdNumber,
            tdDate,
            tdFio,
            tdBirth,
            tdTicket,
            tdPhone,
            tdEmail,
            tdApproval
        );

        return tr; // Возвращаем строку таблицы
    }

    // Функция для сортировки таблицы по столбцам
    function sortTable() {
        const headers = document.querySelectorAll('th'); // Заголовки таблицы
        const tbody = document.querySelector('.books__table-tbody'); // Тело таблицы
        const directions = Array.from(headers).map(() => 'sortUp'); // Изначально сортируем вверх

        // Функция преобразования данных для сортировки
        function transform(type, content) {
            switch (type) {
                case 'number': return parseInt(content, 10) || 0;
                case 'date': return content === "Не указана" ? 0 : Date.parse(content.split('.').reverse().join('-'));
                default: return content.toLowerCase();
            }
        };

        // Функция сортировки по конкретному столбцу
        function sortColumn(index) {
            const type = headers[index].getAttribute('data-type'); // Получаем тип данных столбца
            const rows = Array.from(tbody.querySelectorAll('tr')); // Все строки таблицы
            const direction = directions[index] || 'sortUp';
            const multiplay = direction === 'sortUp' ? 1 : -1;

            rows.sort((row1, row2) => {
                const cellA = row1.querySelectorAll('td')[index]?.textContent.trim();
                const cellB = row2.querySelectorAll('td')[index]?.textContent.trim();

                if (!cellA || !cellB) return 0; // Проверяем, чтобы не было ошибок

                const a = transform(type, cellA);
                const b = transform(type, cellB);

                switch (true) {
                    case a > b:
                        return 1 * multiplay;
                    case a < b:
                        return -1 * multiplay;
                    case a === b:
                        return 0;
                    default:
                        break;
                }

            });


            [].forEach.call(rows, (row) => {
                tbody.removeChild(row);
            });

            directions[index] = directions[index] == 'sortUp' ? 'sortDown' : 'sortUp';

            rows.forEach(newRow => {
                tbody.appendChild(newRow);
            });

            // updateSortArrows(index, directions[index]);
        };

        headers.forEach((header, index) => {
            if (header.getAttribute('id') === 'number') {
                header.addEventListener('click', toggleNumberSort);
            } else {
                header.addEventListener('click', () => sortColumn(index));
            }
        });
    }

    // Функция для пересчета номеров строк
    function numberTableRevers() {
        const rows = document.querySelectorAll('.books__table-tbody tr');
        const totalRows = rows.length; // Общее количество строк

        rows.forEach((row, index) => {
            const firstCell = row.cells[0]; // Берем первую ячейку в строке

            // Проверяем, есть ли первая ячейка и НЕ является ли ее текст "Ничего не найдено"
            if (firstCell && firstCell.textContent.trim() !== "Ничего не найдено") {
                firstCell.textContent = totalRows - index; // Присваиваем обратную нумерацию
            }
        });
    };

    let isAscending = true; // Глобальная переменная для отслеживания порядка сортировки

    // Функция для сортировки номеров строк
    function toggleNumberSort() {
        const tbody = document.querySelector('.books__table-tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        // Сортируем строки по индексу (номеру)
        rows.sort((row1, row2) => {
            const num1 = parseInt(row1.cells[0].textContent, 10) || 0;
            const num2 = parseInt(row2.cells[0].textContent, 10) || 0;

            return isAscending ? num1 - num2 : num2 - num1;
        });

        tbody.innerHTML = ''; // Очищаем таблицу
        rows.forEach(row => tbody.appendChild(row)); // Добавляем отсортированные строки обратно

        isAscending = !isAscending; // Переключаем направление сортировки
    }

    // Функция поиска по таблице
    function search(originalData) {
        const input = document.querySelector('.books-title__input'); // Поле ввода поиска
        const tbody = document.querySelector('.books__table-tbody'); // Тело таблицы

        async function rewiteTable(query) {
            tbody.innerHTML = ''; // Очищаем таблицу перед обновлением

            if (query.trim() === '') {
                // Если строка поиска пустая - вернуть таблицу к исходному виду
                originalData.forEach(item => tbody.appendChild(tableItem(item)));
            } else {
                // Приводим к нижнему регистру, чтобы исключить чувствительность к регистру
                const lowerQuery = query.toLowerCase();

                // Фильтрация данных по введенному значению
                const filteredData = originalData.filter(item =>
                    Object.values(item).some(value =>
                        value.toString().toLowerCase().includes(lowerQuery) // Теперь поиск не зависит от регистра
                    )
                );

                if (filteredData.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8">Ничего не найдено</td></tr>';
                } else {
                    filteredData.forEach(item => tbody.appendChild(tableItem(item)));
                }
            }

            numberTableRevers(); // Пересчитываем номера строк
        }

        // Обработчик ввода в поле поиска
        input.addEventListener('input', async () => {
            const value = input.value.trim();
            rewiteTable(value);
        });
    }

    sortTable()
    console.log("HTML загружен");
});
