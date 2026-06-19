(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = all('[data-hero-slide]', slider);
    var dots = all('[data-hero-dot]', slider);
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var cards = all('[data-filter-card]');
    var count = document.querySelector('[data-filter-count]');
    var empty = document.querySelector('[data-empty-state]');
    if (!input || !cards.length) {
      return;
    }

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var typeValue = typeSelect ? typeSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var typeMatched = !typeValue || text.indexOf(typeValue.toLowerCase()) !== -1;
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var matched = typeMatched && keywordMatched;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible ? '已显示 ' + visible + ' 部' : '';
      }
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', apply);
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    apply();
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card movie-card-compact">',
      '  <a class="movie-poster" href="' + movie.href + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-score">' + movie.rating + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + movie.href + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.type + ' · ' + movie.region) + '</p>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var heading = document.querySelector('[data-search-heading]');
    var summary = document.querySelector('[data-search-summary]');
    var input = document.getElementById('search-page-input');
    if (!results || !input || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function render(searchTerm) {
      var term = searchTerm.trim().toLowerCase();
      if (!term) {
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.searchText.indexOf(term) !== -1;
      }).slice(0, 80);
      heading.textContent = '搜索结果';
      summary.textContent = matched.length ? '以下内容匹配你的关键词。' : '没有找到匹配影片。';
      results.innerHTML = matched.map(cardTemplate).join('');
    }

    render(query);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
