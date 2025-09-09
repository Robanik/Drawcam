// ====== КЛИЕНТСКИЙ JS ДЛЯ ROBIKS ======

// Ссылки на элементы
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const squares = document.querySelectorAll(".square");
const mainContent = document.getElementById("mainContent");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.querySelector(".menu-btn");
const urlInput = document.getElementById("urlInput");
const loadUrlBtn = document.getElementById("loadUrlBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsContainer = document.getElementById("results");
const playerIframe = document.getElementById("ytPlayer");
const currentTitle = document.getElementById("currentTitle");

// Настройки
let settings = {
  fps: 60,
  mbps: 50,
  quality: "720p"
};

// ====== СТАРТОВОЕ МЕНЮ ======
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  mainContent.style.display = "block";
});

document.addEventListener("mousemove", e => {
  squares.forEach(sq => {
    const rect = sq.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width/2);
    const dy = e.clientY - (rect.top + rect.height/2);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    sq.style.transform = `rotate(${angle}deg)`;
  });
});

// ====== БОКОВАЯ ПАНЕЛЬ ======
function toggleSidebar() {
  sidebar.classList.toggle("active");
}
menuBtn.addEventListener("click", toggleSidebar);

function openHome() {
  alert("Home: Здесь будет главный интерфейс");
}

function openSettings() {
  let newFPS = prompt("FPS (35-120)", settings.fps);
  let newMBPS = prompt("Mbps (20-120)", settings.mbps);
  let newQuality = prompt("Качество (144p - 4k)", settings.quality);
  if(newFPS) settings.fps = Math.min(120, Math.max(35, parseInt(newFPS)));
  if(newMBPS) settings.mbps = Math.min(120, Math.max(20, parseInt(newMBPS)));
  if(newQuality) settings.quality = newQuality;
  alert(`Настройки обновлены:\nFPS: ${settings.fps}\nMbps: ${settings.mbps}\nКачество: ${settings.quality}`);
}

// ====== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======
function setPlayerVideo(videoId) {
  fetch(`/video/${videoId}`)
    .then(res => res.json())
    .then(data => {
      if(data.url){
        playerIframe.src = data.url + `?autoplay=1`;
        currentTitle.textContent = data.id;
      } else {
        alert("Не удалось получить видео");
      }
    })
    .catch(()=>alert("Ошибка сервера"));
}

// ====== ЗАГРУЗКА ПО ID/ССЫЛКЕ ======
loadUrlBtn.addEventListener("click", () => {
  const val = urlInput.value.trim();
  if(!val) return alert("Введите ссылку или ID видео");
  let id = val.match(/([a-zA-Z0-9_-]{11})/)?.[1] || val;
  setPlayerVideo(id);
});

// ====== ПОИСК ВИДЕО ======
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if(!query) return alert("Введите поисковый запрос");
  fetch(`/search?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      resultsContainer.innerHTML = "";
      if(!data || !data.length) {
        resultsContainer.innerHTML = "<div>Ничего не найдено</div>";
        return;
      }
      data.forEach(v => {
        const div = document.createElement("div");
        div.className = "result";
        const img = document.createElement("img");
        img.src = v.thumbnail; img.className = "thumb";
        const meta = document.createElement("div");
        meta.className = "meta";
        meta.innerHTML = `<div style="font-weight:600">${v.title}</div><div style="font-size:13px;color:#9fb2d6">ID: ${v.id}</div>`;
        const playBtn = document.createElement("button");
        playBtn.textContent = "Play";
        playBtn.addEventListener("click", ()=> setPlayerVideo(v.id));
        div.appendChild(img);
        div.appendChild(meta);
        div.appendChild(playBtn);
        resultsContainer.appendChild(div);
      });
    })
    .catch(()=>alert("Ошибка поиска"));
});

// ====== ПОДДЕРЖКА ?v=ID В URL ======
(function(){
  const params = new URLSearchParams(window.location.search);
  const v = params.get("v");
  if(v) setPlayerVideo(v);
})();
