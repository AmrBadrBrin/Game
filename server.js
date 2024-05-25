const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json()); // Middleware для обработки JSON-тел запросов
app.use(express.static(path.join(__dirname, 'public')));

// Функция для чтения данных из файла
function readData(callback) {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return callback(null, {}); // Если файл не существует, возвращаем пустой объект
      }
      return callback(err);
    }
    callback(null, JSON.parse(data));
  });
}

// Функция для записи данных в файл
function writeData(data, callback) {
  fs.writeFile("data.json", JSON.stringify(data, null, 2), callback);
}

// Define a route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для получения значения счетчика и данных о пользователях
app.get("/clicks", (req, res) => {
  readData((err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Ошибка чтения файла");
    }
    const totalClicks = Object.values(data).reduce(
      (sum, userClicks) => sum + userClicks,
      0
    );
    const results = Object.entries(data).map(([user, clicks]) => ({
      user,
      clicks,
    }));
    res.send({ clicks: totalClicks, results });
  });
});

// Маршрут для увеличения значения счетчика пользователя
app.post("/clicks", (req, res) => {
  const user = req.body.user || "аноним"; // Получаем имя пользователя из запроса, если нет, то "аноним"
  readData((err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Ошибка чтения файла");
    }
    data[user] = (data[user] || 0) + 1; // Увеличиваем количество нажатий для пользователя
    writeData(data, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Ошибка записи файла");
      }
      const totalClicks = Object.values(data).reduce(
        (sum, userClicks) => sum + userClicks,
        0
      );
      const results = Object.entries(data).map(([user, clicks]) => ({
        user,
        clicks,
      }));
      res.send({ clicks: totalClicks, results });
    });
  });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
