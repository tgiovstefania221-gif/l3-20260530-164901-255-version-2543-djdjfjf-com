(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFiltering() {
    var field = document.querySelector(".filter-field");
    var select = document.querySelector(".sort-select");
    var grid = document.querySelector(".sortable-grid");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    cards.forEach(function(card, index) {
      card.dataset.id = String(index + 1);
    });

    function filterCards() {
      var keyword = field ? field.value.trim().toLowerCase() : "";
      cards.forEach(function(card) {
        var text = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type
        ].join(" ").toLowerCase();
        card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
      });
    }

    function sortCards() {
      if (!select) {
        return;
      }
      var mode = select.value;
      var sorted = cards.slice().sort(function(a, b) {
        if (mode === "rating") {
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        }
        if (mode === "views") {
          return Number(b.dataset.views) - Number(a.dataset.views);
        }
        if (mode === "year") {
          return Number(b.dataset.year) - Number(a.dataset.year);
        }
        return Number(a.dataset.id) - Number(b.dataset.id);
      });
      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
    }

    if (field) {
      field.addEventListener("input", filterCards);
    }
    if (select) {
      select.addEventListener("change", sortCards);
      sortCards();
    }
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    var summary = document.getElementById("searchSummary");
    if (!results || !input || !summary || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    input.value = keyword;

    function movieCard(movie) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" title="' + escapeHtml(movie.title) + '">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-gradient"></span>',
        '<span class="poster-score">' + escapeHtml(movie.rating) + '</span>',
        '<span class="poster-play">▶</span>',
        '</a>',
        '<div class="card-body">',
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<p>' + escapeHtml(movie.text) + '</p>',
        '<div class="card-tags"><span>' + escapeHtml(movie.channel) + '</span></div>',
        '</div>',
        '</article>'
      ].join("");
    }

    function runSearch(value) {
      var q = value.trim().toLowerCase();
      var list = window.SEARCH_MOVIES;
      if (q) {
        list = list.filter(function(movie) {
          return movie.search.indexOf(q) !== -1;
        });
      } else {
        list = list.slice(0, 40);
      }
      results.innerHTML = list.slice(0, 120).map(movieCard).join("");
      summary.textContent = q ? '“' + value.trim() + '” 的相关结果' : "输入关键词后可按标题、地区、类型、年份与标签检索。";
    }

    runSearch(keyword);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    players.forEach(function(player) {
      var video = player.querySelector("video");
      var layer = player.querySelector(".play-layer");
      if (!video || !layer) {
        return;
      }
      var source = video.querySelector("source");
      var stream = source ? source.getAttribute("src") : video.getAttribute("src");
      var loaded = false;
      var hlsInstance = null;

      function attachStream() {
        if (loaded || !stream) {
          return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
          video.src = stream;
          loaded = true;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          loaded = true;
          return new Promise(function(resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          });
        }
        video.src = stream;
        loaded = true;
        return Promise.resolve();
      }

      function begin() {
        attachStream().then(function() {
          player.classList.add("is-playing");
          var result = video.play();
          if (result && result.catch) {
            result.catch(function() {});
          }
        });
      }

      layer.addEventListener("click", begin);
      video.addEventListener("click", function() {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener("play", function() {
        player.classList.add("is-playing");
      });
      video.addEventListener("ended", function() {
        player.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function() {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function() {
    setupMenu();
    setupHero();
    setupFiltering();
    setupSearchPage();
    setupPlayers();
  });
})();
