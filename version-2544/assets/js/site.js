(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function resetHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    startHero();
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      resetHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      resetHero();
    });
  });

  function filterCards(scope) {
    var root = scope || document;
    var input = root.querySelector('[data-filter-input]') || document.querySelector('[data-filter-input]');
    var year = root.querySelector('[data-year-filter]') || document.querySelector('[data-year-filter]');
    var region = root.querySelector('[data-region-filter]') || document.querySelector('[data-region-filter]');
    var type = root.querySelector('[data-type-filter]') || document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var query = input ? input.value.trim().toLowerCase() : '';
    var yearValue = year ? year.value : '';
    var regionValue = region ? region.value : '';
    var typeValue = type ? type.value : '';

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
      var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
      var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
      card.classList.toggle('is-hidden', !(matchQuery && matchYear && matchRegion && matchType));
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-input], [data-year-filter], [data-region-filter], [data-type-filter]')).forEach(function (control) {
    var eventName = control.tagName === 'INPUT' ? 'input' : 'change';
    control.addEventListener(eventName, function () {
      filterCards(document);
    });
  });

  window.initPlayer = function (source) {
    var video = document.getElementById('movieVideo');
    var button = document.querySelector('.player-cover');
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (started) {
        return Promise.resolve();
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }

      video.src = source;
      return Promise.resolve();
    }

    function play() {
      prepare().then(function () {
        if (button) {
          button.classList.add('hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
