// server.js
import express from "express";
import { exec } from "child_process";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.static(__dirname));

// Главная страница
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// Получение прямой ссылки на видео
app.get("/video/:id", (req, res) => {
  const id = req.params.id;
  exec(
    `yt-dlp -f "best[ext=mp4]" -g https://www.youtube.com/watch?v=${id}`,
    (err, stdout, stderr) => {
      if (err) return res.status(500).json({ error: "yt-dlp error" });
      res.json({ id, url: stdout.trim() });
    }
  );
});

// Поиск видео
app.get("/search", (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Нет запроса" });

  exec(
    `yt-dlp "ytsearch10:${q}" --skip-download --print-json`,
    (err, stdout, stderr) => {
      if (err) return res.status(500).json({ error: "yt-dlp search error" });
      const lines = stdout.trim().split("\n").map(l => JSON.parse(l));
      const results = lines.map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        uploader: v.uploader
      }));
      res.json(results);
    }
  );
});

app.listen(process.env.PORT || 3000, () =>
  console.log("ROBIKS запущен на порту", process.env.PORT || 3000)
);
