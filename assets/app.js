import { H as Hls } from './hls-vendor-dru42stk.js';

function setupMobileMenu() {
  const button = document.querySelector('[data-mobile-menu-button]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (!button || !panel) {
    return;
  }

  button.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    if (timer || slides.length <= 1) {
      return;
    }

    timer = window.setInterval(() => {
      showSlide(current + 1);
    }, 5000);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stop();
      showSlide(index);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function setupFilters() {
  const panel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-filter-grid]');

  if (!panel || !grid) {
    return;
  }

  const input = panel.querySelector('[data-filter-input]');
  const yearSelect = panel.querySelector('[data-filter-year]');
  const regionSelect = panel.querySelector('[data-filter-region]');
  const typeSelect = panel.querySelector('[data-filter-type]');
  const count = panel.querySelector('[data-filter-count]');
  const cards = Array.from(grid.querySelectorAll('.movie-card'));
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (input && initialQuery) {
    input.value = initialQuery;
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const applyFilter = () => {
    const query = normalize(input ? input.value : '');
    const year = normalize(yearSelect ? yearSelect.value : '');
    const region = normalize(regionSelect ? regionSelect.value : '');
    const type = normalize(typeSelect ? typeSelect.value : '');
    let visible = 0;

    cards.forEach((card) => {
      const search = normalize(card.dataset.search);
      const cardYear = normalize(card.dataset.year);
      const cardRegion = normalize(card.dataset.region);
      const cardType = normalize(card.dataset.type);
      const matchQuery = !query || search.includes(query);
      const matchYear = !year || cardYear === year;
      const matchRegion = !region || cardRegion === region;
      const matchType = !type || cardType === type;
      const shouldShow = matchQuery && matchYear && matchRegion && matchType;

      card.classList.toggle('is-hidden', !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = String(visible);
    }
  };

  [input, yearSelect, regionSelect, typeSelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });

  applyFilter();
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('.js-hls-player'));

  players.forEach((video) => {
    const source = video.dataset.src;
    const box = video.closest('.player-box');
    const overlay = box ? box.querySelector('.player-overlay') : null;
    const message = box ? box.querySelector('[data-player-message]') : null;
    let hls = null;
    let loaded = false;

    const setMessage = (text) => {
      if (message) {
        message.textContent = text || '';
      }
    };

    const hideOverlay = () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    };

    const loadSource = () => {
      if (loaded || !source) {
        return;
      }

      loaded = true;
      setMessage('正在加载播放源...');

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setMessage('播放源已就绪');
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请刷新页面后重试');
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', () => {
          setMessage('播放源已就绪');
        }, { once: true });
      } else {
        setMessage('当前浏览器不支持 HLS 播放，请更换现代浏览器');
      }
    };

    video.addEventListener('play', () => {
      loadSource();
      hideOverlay();
    });

    video.addEventListener('playing', () => {
      setMessage('');
      hideOverlay();
    });

    video.addEventListener('pause', () => {
      if (!video.ended) {
        setMessage('已暂停');
      }
    });

    if (overlay) {
      overlay.addEventListener('click', async () => {
        loadSource();
        hideOverlay();

        try {
          await video.play();
        } catch (error) {
          setMessage('请再次点击播放器开始播放');
        }
      });
    }

    loadSource();
  });
}

function setupAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));

      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHeroCarousel();
  setupFilters();
  setupPlayers();
  setupAnchorScroll();
});
