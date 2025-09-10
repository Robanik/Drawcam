// --- Стартовый экран и кнопка "НАЧАТЬ ПРОСМОТР" ---
const startScreen = document.getElementById('startScreen');
const mainInterface = document.getElementById('mainInterface');
const startWatchBtn = document.getElementById('startWatch');

startWatchBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  mainInterface.classList.remove('hidden');
});

// --- Анимация кубов на фоне ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let cubes = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createCubes() {
  cubes = [];
  for (let i = 0; i < 30; i++) {
    cubes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20 + Math.random() * 40,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5,
      color: `rgba(94,234,212,${0.2 + Math.random()*0.5})`
    });
  }
}
createCubes();

function animateCubes() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  cubes.forEach(cube => {
    cube.x += cube.speedX;
    cube.y += cube.speedY;
    if (cube.x < -cube.size) cube.x = canvas.width;
    if (cube.x > canvas.width) cube.x = -cube.size;
    if (cube.y < -cube.size) cube.y = canvas.height;
    if (cube.y > canvas.height) cube.y = -cube.size;

    ctx.fillStyle = cube.color;
    ctx.fillRect(cube.x, cube.y, cube.size, cube.size);
  });
  requestAnimationFrame(animateCubes);
}
animateCubes();

// --- Панель Home/Settings ---
const sidepanel = document.getElementById('sidepanel');
const openPanelBtn = document.getElementById('openPanel');
const closePanelBtn = document.getElementById('closePanel');

openPanelBtn.addEventListener('click', () => {
  sidepanel.classList.add('open');
});
closePanelBtn.addEventListener('click', () => {
  sidepanel.classList.remove('open');
});

// --- Переключение вкладок ---
const navHome = document.getElementById('navHome');
const navSettings = document.getElementById('navSettings');
const panelHome = document.getElementById('panelHome');
const panelSettings = document.getElementById('panelSettings');

navHome.addEventListener('click', () => {
  panelHome.classList.remove('hidden');
  panelSettings.classList.add('hidden');
  navHome.classList.add('active');
  navSettings.classList.remove('active');
});

navSettings.addEventListener('click', () => {
  panelHome.classList.add('hidden');
  panelSettings.classList.remove('hidden');
  navHome.classList.remove('active');
  navSettings.classList.add('active');
});

// --- Настройки видео (обманка) ---
const fpsRange = document.getElementById('fpsRange');
const fpsValue = document.getElementById('fpsValue');
const mbpsRange = document.getElementById('mbpsRange');
const mbpsValue = document.getElementById('mbpsValue');
const qualitySelect = document.getElementById('qualitySelect');
const ytPlayer = document.getElementById('ytPlayer');

fpsRange.addEventListener('input', () => fpsValue.textContent = fpsRange.value);
mbpsRange.addEventListener('input', () => mbpsValue.textContent = mbpsRange.value);
qualitySelect.addEventListener('change', () => {
  const currentSrc = ytPlayer.src.split('&vq=')[0];
  ytPlayer.src = `${currentSrc}&vq=${qualitySelect.value}`;
});

// --- Вставка видео по URL ---
const urlInput = document.getElementById('urlInput');
const loadUrlBtn = document.getElementById('loadUrlBtn');
const currentTitle = document.getElementById('currentTitle');

loadUrlBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) return alert('Введите ссылку на видео!');
  let videoId;
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  if (match) videoId = match[1];
  else return alert('Неверная ссылка YouTube!');
  ytPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&vq=${qualitySelect.value}`;
  currentTitle.textContent = `Смотрим видео: ${videoId}`;
});

// --- Поиск видео по YouTube API ---
const API_KEY = "AIzaSyCgL1GFZltpURrlV_U2DWyH-8XT_h6tr8U"; // вставь свой ключ
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');

searchBtn.addEventListener('click', async () => {
  const query = searchInput.value.trim();
  if (!query) return alert('Введите название для поиска!');

  resultsDiv.innerHTML = 'Загрузка...';

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${API_KEY}`);
    const data = await response.json();

    resultsDiv.innerHTML = '';
    data.items.forEach(item => {
      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const thumb = item.snippet.thumbnails.medium.url;

      const div = document.createElement('div');
      div.className = 'result';
      div.innerHTML = `<img class="thumb" src="${thumb}"><div>${title}</div>`;

      div.addEventListener('click', () => {
        ytPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&vq=${qualitySelect.value}`;
        currentTitle.textContent = title;
      });

      resultsDiv.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = 'Ошибка поиска!';
  }
});
