(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-scroll-target');
      var target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var input = target.querySelector('input');
        if (input) {
          setTimeout(function () {
            input.focus();
          }, 350);
        }
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var index = 0;
  var timer = null;

  function showSlide(next) {
    if (!slides.length) {
      return;
    }
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = setInterval(function () {
      showSlide(index + 1);
    }, 5000);
  }

  function resetHero() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(index - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(index + 1);
      resetHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var dotIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(dotIndex);
      resetHero();
    });
  });

  startHero();

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applySearch(panel) {
    var input = panel.querySelector('.movie-search');
    var filter = panel.querySelector('.movie-filter');
    var scope = panel.nextElementSibling;
    var cards = [];

    if (scope) {
      cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    }

    if (!cards.length) {
      cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    }

    function run() {
      var q = normalize(input ? input.value : '');
      var typeValue = normalize(filter ? filter.value : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-meta'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region')
        ].join(' '));
        var typeText = normalize(card.getAttribute('data-type'));
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchType = !typeValue || typeText.indexOf(typeValue) !== -1 || haystack.indexOf(typeValue) !== -1;
        card.hidden = !(matchText && matchType);
      });
    }

    if (input) {
      input.addEventListener('input', run);
    }
    if (filter) {
      filter.addEventListener('change', run);
    }
  }

  document.querySelectorAll('.search-panel').forEach(applySearch);
})();

function initMoviePlayer(source, selector) {
  var root = document.querySelector(selector);
  if (!root) {
    return;
  }

  var video = root.querySelector('video');
  var overlay = root.querySelector('.player-overlay');
  var attached = false;
  var hlsInstance = null;

  if (!video || !overlay) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start() {
    attach();
    overlay.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!attached) {
      start();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('error', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    attached = false;
  });
}
