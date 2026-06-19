
const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => [...r.querySelectorAll(s)];

function cardText(card){ return `${card.dataset.title} ${card.dataset.genre} ${card.dataset.tags} ${card.dataset.region} ${card.dataset.year}`.toLowerCase(); }
function cardHit(card, q){ return !q || cardText(card).includes(q.toLowerCase()); }

function initMenu(){
  const btn = qs('[data-menu-toggle]');
  const menu = qs('[data-mobile-menu]');
  if(btn && menu) btn.addEventListener('click', ()=> menu.hidden = !menu.hidden);
}

function initLiveFilters(){
  qsa('[data-live-search]').forEach(input=>{
    const sel = input.dataset.liveSearch;
    const cards = qsa(sel);
    const counter = qs(input.dataset.liveCount || '');
    const apply = ()=>{
      const q = input.value.trim();
      let n=0;
      cards.forEach(card=>{ const ok = cardHit(card,q); card.style.display = ok ? '' : 'none'; if(ok) n++; });
      if(counter) counter.textContent = n;
    };
    input.addEventListener('input', apply);
    apply();
  });
}

function initSearchPage(){
  const box = qs('#search-input');
  const grid = qs('#search-results');
  if(!box || !grid || !window.SEARCH_INDEX) return;
  const render = ()=>{
    const q = box.value.trim().toLowerCase();
    const items = window.SEARCH_INDEX.filter(it => !q || [it.title,it.genre,it.region,it.one_line,it.tags,it.year].join(' ').toLowerCase().includes(q)).slice(0, 200);
    grid.innerHTML = items.map(it => `
      <a class="card" href="${it.url}">
        <div class="thumb"><img loading="lazy" src="${it.poster}" alt="${it.title}"></div>
        <div class="body">
          <h3>${it.title}</h3>
          <div class="text-xs text-amber-300/90 mb-2">${it.year} · ${it.region}</div>
          <p class="text-sm text-gray-300 line-clamp-3">${it.one_line}</p>
        </div>
      </a>`).join('') || '<div class="text-gray-400">未找到匹配影片。</div>';
  };
  box.addEventListener('input', render);
  render();
}

async function initPlayer(){
  const video = qs('video[data-hls]');
  if(!video) return;
  const playBtn = qs('[data-play-btn]');
  const overlay = qs('.play-overlay');
  const showBtn = ()=> { if(playBtn) playBtn.classList.remove('hidden'); if(overlay) overlay.style.opacity = '1'; };
  const hideBtn = ()=> { if(playBtn) playBtn.classList.add('hidden'); if(overlay) overlay.style.opacity = '0'; };

  try {
    const mod = await import('./video-player-dru42stk.js');
    const Hls = mod.H;
    if (Hls && Hls.isSupported && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(video.dataset.hls);
      hls.attachMedia(video);
    } else {
      video.src = video.dataset.mp4 || video.dataset.hls;
    }
  } catch (e) {
    video.src = video.dataset.mp4 || video.dataset.hls;
  }

  const play = async () => {
    try { await video.play(); hideBtn(); } catch(e) { showBtn(); }
  };
  if(playBtn) playBtn.addEventListener('click', play);
  video.addEventListener('play', hideBtn);
  video.addEventListener('pause', showBtn);
  video.addEventListener('ended', showBtn);
  if(overlay) overlay.addEventListener('click', play);
}

window.addEventListener('DOMContentLoaded', ()=>{
  initMenu();
  initLiveFilters();
  initSearchPage();
  initPlayer();
});
