const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware для CORS
app.use(cors());

// Маршрут для получения значения счетчика
app.get("/clicks", (req, res) => {
  fs.readFile("clicks.txt", "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.send({ clicks: 0 });
      }
      console.error(err);
      return res.status(500).send("Ошибка чтения файла");
    }
    const clicks = parseInt(data) || 0;
    res.send({ clicks });
  });
});

// Маршрут для увеличения значения счетчика
app.post("/clicks", (req, res) => {
  fs.readFile("clicks.txt", "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      console.error(err);
      return res.status(500).send("Ошибка чтения файла");
    }
    const clicks = parseInt(data) || 0;
    const newClicks = clicks + 1;
    fs.writeFile("clicks.txt", newClicks.toString(), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Ошибка записи файла");
      }
      res.send({ clicks: newClicks });
    });
  });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
