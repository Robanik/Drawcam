// --- Настройка Canvas для анимации 3D квадратиков ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

// Генерация кубов
const cubes = [];
for(let i=0; i<30; i++){
  cubes.push({
    x: Math.random()*w,
    y: Math.random()*h,
    z: Math.random()*500,
    size: 20 + Math.random()*30,
    speed: 0.5 + Math.random()
  });
}

function draw(){
  ctx.clearRect(0,0,w,h);
  for(let cube of cubes){
    cube.z -= cube.speed;
    if(cube.z<1) cube.z = 500;
    const scale = 200 / cube.z;
    const x = (cube.x - w/2) * scale + w/2;
    const y = (cube.y - h/2) * scale + h/2;
    const s = cube.size * scale;
    ctx.fillStyle = `rgba(94,234,212,0.4)`;
    ctx.fillRect(x - s/2, y - s/2, s, s);
  }
  requestAnimationFrame(draw);
}
draw();

// --- Кнопка НАЧАТЬ ПРОСМОТР ---
const startBtn = document.getElementById('startWatch');
const startScreen = document.getElementById('startScreen');
const mainInterface = document.getElementById('mainInterface');

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  mainInterface.classList.remove('hidden');
});

// --- Боковая панель ---
const panel = document.getElementById('sidepanel');
document.getElementById('openPanel').addEventListener('click', () => panel.classList.add('open'));
document.getElementById('closePanel').addEventListener('click', () => panel.classList.remove('open'));

// --- Навигация вкладок панели ---
document.getElementById('navHome').addEventListener('click', () => {
  document.getElementById('panelHome').classList.remove('hidden');
  document.getElementById('panelSettings').classList.add('hidden');
});
document.getElementById('navSettings').addEventListener('click', () => {
  document.getElementById('panelHome').classList.add('hidden');
  document.getElementById('panelSettings').classList.remove('hidden');
});

// --- YouTube player ---
const API_KEY = 'YOUR_API_KEY_HERE';

function extractVideoId(urlOrId){
  if(!urlOrId) return null;
  try{
    const url = new URL(urlOrId);
    if(url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    if(url.searchParams.get('v')) return url.searchParams.get('v');
  }catch(e){}
  const idRegex = /([a-zA-Z0-9_-]{11})/;
  const match = urlOrId.match(idRegex);
  return match ? match[1] : null;
}

function setPlayerVideo(videoId){
  const iframe = document.getElementById('ytPlayer');
  if(!videoId){ iframe.src=''; document.getElementById('currentTitle').textContent=''; return; }
  iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  if(API_KEY !== 'YOUR_API_KEY_HERE'){
    fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`)
      .then(r=>r.json()).then(data=>{
        if(data.items && data.items[0]) document.getElementById('currentTitle').textContent = data.items[0].snippet.title;
      }).catch(()=>{});
  }
}

// --- Кнопка Открыть видео ---
document.getElementById('loadUrlBtn').addEventListener('click', ()=>{
  const val = document.getElementById('urlInput').value.trim();
  const vid = extractVideoId(val);
  if(vid) setPlayerVideo(vid);
  else alert('Не удалось извлечь ID видео из ссылки.');
});

// --- Поиск видео ---
document.getElementById('searchBtn').addEventListener('click', ()=>{
  const q = document.getElementById('searchInput').value.trim();
  if(!q) return alert('Введите поисковый запрос.');
  if(API_KEY==='YOUR_API_KEY_HERE') return alert('Введите API_KEY в коде, чтобы включить поиск.');
  searchYouTube(q);
});

function searchYouTube(query){
  const encoded = encodeURIComponent(query);
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encoded}&key=${API_KEY}`)
    .then(r=>r.json()).then(data=>{
      const results = document.getElementById('results');
      results.innerHTML='';
      if(!data.items || data.items.length===0){ results.innerHTML='<div>Ничего не найдено</div>'; return; }
      data.items.forEach(item=>{
        const vid = item.id.videoId;
        const thumb = item.snippet.thumbnails && item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : '';
        const title = item.snippet.title;

        const div = document.createElement('div'); div.className='result';
        const img = document.createElement('img'); img.className='thumb'; img.src = thumb;
        const meta = document.createElement('div'); meta.style.flex='1';
        meta.innerHTML = `<div style="font-weight:700">${title}</div>`;
        const playBtn = document.createElement('button'); playBtn.className='primary'; playBtn.textContent='Play';
        playBtn.addEventListener('click', ()=> setPlayerVideo(vid));

        div.appendChild(img); div.appendChild(meta); div.appendChild(playBtn);
        results.appendChild(div);
      });
    }).catch(err=>{ console.error(err); alert('Ошибка поиска. Проверьте API_KEY и соединение.'); });
}

// --- Enter для поиска или загрузки ---
document.getElementById('urlInput').addEventListener('keydown', e=>{ if(e.key==='Enter') document.getElementById('loadUrlBtn').click(); });
document.getElementById('searchInput').addEventListener('keydown', e=>{ if(e.key==='Enter') document.getElementById('searchBtn').click(); });
