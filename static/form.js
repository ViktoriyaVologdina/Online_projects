// Ожидание полной загрузки DOM перед выполнением скриптов
document.addEventListener("DOMContentLoaded", function () {
    addElectronicBook(); // Инициализация функций для работы с формой
    console.log("HTML загружен"); // Логирование успешной загрузки HTML
});

// Флаг для отслеживания, был ли уже добавлен обработчик отправки формы
let isSubmitHandlerAdded = false;

// Основная функция для настройки формы
async function addElectronicBook() {
    numberTicketNot(); // Управление отображением блока с номером билета
    electronicValidate(); // Инициализация валидации формы

    const formElectronicBook = document.getElementById('form');

    // Добавление обработчика отправки формы, если он еще не был добавлен
    if (!isSubmitHandlerAdded) {
        formElectronicBook.addEventListener('submit', handleFormSubmit);
        isSubmitHandlerAdded = true;
    }
}

// Функция-обработчик отправки формы
async function handleFormSubmit(e) {
    e.preventDefault(); // Предотвращение стандартного поведения формы (перезагрузки страницы)

    const formElectronicBook = document.getElementById('form');
    const submitButton = document.getElementById('sendBook');

    // Блокировка кнопки отправки и изменение её текста на время обработки
    submitButton.disabled = true;
    submitButton.textContent = "Отправка...";

    // Создание объекта с данными из формы
    const obj = objElectronicBook();
    console.log(obj); // Логирование данных формы

    // Отправка данных на сервер и получение результата
    const success = await postElectronicBooks(obj);

    // Если отправка успешна, показать сообщение и сбросить форму
    if (success) {
        showSuccessMessage();
        formElectronicBook.reset();
    }

    // Разблокировка кнопки отправки и восстановление её текста
    submitButton.disabled = false;
    submitButton.textContent = "Отправить";
}

// Функция для отправки данных на сервер
async function postElectronicBooks(books) {
    try {
        const response = await fetch('http://localhost:5000/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(books) // Преобразование данных в JSON
        });

        // Проверка на успешный ответ сервера
        if (!response.ok) {
            throw new Error(`Ошибка! Код: ${response.status}`);
        }

        console.log(await response.json()); // Логирование ответа сервера
        return true; // Успешная отправка

    } catch (err) {
        console.error(err); // Логирование ошибки
        alert("Ошибка при отправке. Попробуйте снова."); // Уведомление пользователя
        return false; // Неудачная отправка
    }
}

// Функция для получения данных из формы
function receiveDataForm() {
    const fio = document.getElementById('electronic-fio');
    const birth = document.getElementById('electronic-birth');
    const ticket = document.getElementById('ticket-number');
    const phone = document.getElementById('electronic-phone');
    const email = document.getElementById('electronic-email');

    // Обработка номера билета (если поле пустое, значение будет null)
    const ticketValue = ticket.value.trim() || null;

    // Проверка согласия на обработку данных
    const approval = document.getElementById('data').checked ? "согласен(а)" : "";

    // Вспомогательная функция для форматирования текущей даты
    function formatDate() {
        const newDate = new Date();
        const yyyy = newDate.getFullYear();
        let mm = newDate.getMonth() + 1;
        mm = mm < 10 ? '0' + mm : mm;
        let dd = newDate.getDate();
        dd = dd < 10 ? '0' + dd : dd;
        return `${yyyy}-${mm}-${dd}`;
    }

    // Возвращение объекта с данными из формы
    return {
        date: formatDate(), // Текущая дата
        fio: fio.value.trim(), // ФИО
        birth: birth.value, // Дата рождения
        ticket: ticketValue, // Номер билета
        phone: phone.value, // Телефон
        email: email.value.trim(), // Email
        approval // Согласие на обработку данных
    };
}

// Функция для создания объекта с данными из формы
function objElectronicBook() {
    return { ...receiveDataForm() }; // Использование spread-оператора для копирования данных
}

// Функция для управления отображением блока с номером билета
function numberTicketNot() {
    const form = document.getElementById('form');
    const numberTicketBlock = document.getElementById('number-ticket');

    // Обработчик изменения состояния формы
    form.onchange = function (e) {
        if (e.target.value == "ticket-not") {
            numberTicketBlock.classList.add('none'); // Скрыть блок, если билета нет
        } else if (e.target.value == "ticket-yes") {
            numberTicketBlock.classList.remove('none'); // Показать блок, если билет есть
        }
    }
}

// Функция для валидации формы с использованием библиотеки JustValidate
function electronicValidate() {
    const validation = new JustValidate('.electronic__form');

    // Маска для поля телефона
    const selector = document.querySelector("input[type='tel']");
    Inputmask({ "mask": "+7 (999) 999-99-99" }).mask(selector);

    // Добавление правил валидации для каждого поля
    validation
        .addField('#ticket-number', [{
            rule: 'required',
            errorMessage: 'Обязательное поле'
        }])
        .addField('#electronic-fio', [{
            rule: 'required',
            errorMessage: 'Обязательное поле'
        }])
        .addField('#electronic-birth', [{
            rule: 'required',
            errorMessage: 'Обязательное поле'
        }])
        .addField('#electronic-phone', [{
            rule: 'required',
            errorMessage: 'Обязательное поле'
        }])
        .addField('#electronic-email', [{
            rule: 'required',
            errorMessage: 'Обязательное поле'
        }])
        .addRequiredGroup('#radio-data', 'Обязательное поле'); // Валидация группы радио-кнопок
}

// Функция для отображения сообщения об успешной отправке формы
function showSuccessMessage() {
    const message = document.createElement("p");
    message.textContent = "Форма успешно отправлена!";
    message.classList.add("success-message"); // Добавление стиля для сообщения
    document.querySelector(".electronic__btn").appendChild(message); // Добавление сообщения в DOM

    setTimeout(() => message.remove(), 15000); // Удаление сообщения через 15 секунд
}