from flask import Flask, render_template, request, jsonify
import pyodbc
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Разрешаем все источники

def get_db_connection():
    """
    Функция для подключения к базе данных.
    Использует pyodbc для подключения к SQL Server.
    """
    # Строка подключения к базе данных (MSSQL LocalDB)
    conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};'
                          'SERVER=CBSWEBSERVICE\SQLEXPRESS;'  # Подключаемся к локальной базе
                          'DATABASE=BooksDB;'  # Указываем базу данных
                          'Trusted_Connection=yes;')  # Используем доверенное подключение (без пароля)
    return conn

# Главная страница с формой
@app.route('/')
def form():
    """
    Функция для отображения главной страницы с формой для подачи заявки.
    """
    return render_template('form.html')  # Отправляем шаблон формы

# Страница с таблицей данных
@app.route('/table')
def table():
    """
    Функция для отображения страницы с таблицей заявок.
    """
    return render_template('table.html')  # Отправляем шаблон таблицы с данными

# API для отправки данных (POST запрос)
@app.route('/api/books', methods=['POST'])
def create_book():
    try:
        # Получаем данные из запроса в формате JSON
        data = request.json
        print(f"Received data: {data}")  # Для отладки

        # Извлекаем данные
        fio = data.get('fio')
        birth_date = data.get('birth')
        ticket_number = data.get('ticket')  # ticket может быть None или пустым
        phone = data.get('phone')
        email = data.get('email')
        consent = data.get('approval')  # Согласие на обработку данных

        # Если consent равно "согласен(а)", конвертируем в True, иначе False
        consent = True if consent == "согласен(а)" else False

        # Проверка на обязательные поля
        if not fio or not birth_date or not phone or not email:
            return jsonify({"error": "Все обязательные поля должны быть заполнены!"}), 400  # Если обязательные поля не заполнены, возвращаем ошибку

        # Подключаемся к базе данных
        conn = get_db_connection()
        cursor = conn.cursor()

        # Если ticket_number пустой (None), то передаем NULL в запрос
        if ticket_number == "":
            ticket_number = None

        # Если ticket_number пустой (None), то передаем NULL в запрос
        if birth_date == "":
            birth_date = None

        print(f"ticket_number: {ticket_number}")  # Для отладки

        # Запрос для вставки данных в таблицу BookRequests
        query = """
        INSERT INTO BookRequests (FIO, BirthDate, TicketNumber, Phone, Email, PersonalDataConsent)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (fio, birth_date, ticket_number, phone, email, consent))  # Выполняем запрос с данными
        conn.commit()

        # Закрываем соединение с базой данных
        cursor.close()
        conn.close()

        return jsonify({"message": "Заявка успешно отправлена!"}), 201

    except Exception as e:
        # Если произошла ошибка, возвращаем сообщение об ошибке
        return jsonify({"error": f"Произошла ошибка: {str(e)}"}), 500
    



# API для получения данных (GET запрос)
@app.route('/api/books', methods=['GET'])
def get_books():
    """
    Функция для обработки GET-запроса, когда клиент хочет получить список всех заявок.
    """
    try:
        # Подключаемся к базе данных
        conn = get_db_connection()
        cursor = conn.cursor()

        # Запрос для получения всех записей из таблицы
        query = "SELECT * FROM BookRequests ORDER BY Id"
        cursor.execute(query)
        rows = cursor.fetchall()  # Получаем все строки

        # Формируем результат для ответа
        result = [
            {
                "id": row.Id,
                "request_date": row.RequestDate.strftime('%d.%m.%Y') if row.RequestDate else "",
                "fio": row.FIO,
                "birth_date": row.BirthDate.strftime('%d.%m.%Y'),
                "ticket_number": row.TicketNumber if row.TicketNumber else "",
                "phone": row.Phone,
                "email": row.Email,
                "consent": "Да" if row.PersonalDataConsent else "Нет"
            }
            for row in rows
        ]
        
        # Закрываем соединение с базой данных
        cursor.close()
        conn.close()

        # Отправляем результат в формате JSON
        return jsonify(result)

    except Exception as e:
        # Если произошла ошибка, возвращаем сообщение об ошибке
        return jsonify({"error": f"Произошла ошибка: {str(e)}"}), 500




# Запуск приложения
if __name__ == '__main__':
    # Запускаем приложение Flask в режиме отладки
    app.run(debug=True)
