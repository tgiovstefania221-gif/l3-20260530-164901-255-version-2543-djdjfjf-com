(function () {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    prev && prev.addEventListener("click", function () {
      showSlide(index - 1);
      startTimer();
    });

    next && next.addEventListener("click", function () {
      showSlide(index + 1);
      startTimer();
    });

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getGrid(id) {
    return document.getElementById(id);
  }

  function applyFilter(grid, value) {
    const term = normalize(value);
    Array.from(grid.querySelectorAll(".movie-card")).forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.rating,
        card.dataset.views,
        card.dataset.keywords
      ].join(" "));
      card.classList.toggle("is-filtered-out", term && !haystack.includes(term));
    });
  }

  function applySort(grid, value) {
    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const sorted = cards.sort(function (a, b) {
      if (value === "rating") {
        return Number(b.dataset.rating) - Number(a.dataset.rating);
      }

      if (value === "views") {
        return Number(b.dataset.views) - Number(a.dataset.views);
      }

      if (value === "year") {
        return Number(b.dataset.year) - Number(a.dataset.year);
      }

      return 0;
    });

    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  document.querySelectorAll("[data-card-filter]").forEach(function (input) {
    const grid = getGrid(input.dataset.cardFilter);

    if (grid) {
      input.addEventListener("input", function () {
        applyFilter(grid, input.value);
      });
    }
  });

  document.querySelectorAll("[data-card-sort]").forEach(function (select) {
    const grid = getGrid(select.dataset.cardSort);

    if (grid) {
      select.addEventListener("change", function () {
        applySort(grid, select.value);
      });
    }
  });

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function movieCardTemplate(movie) {
    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + movie.year + "\" data-rating=\"" + movie.rating + "\" data-views=\"" + movie.views + "\" data-keywords=\"" + escapeHtml(movie.keywords) + "\">",
      "  <a class=\"movie-card-link\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "    <div class=\"movie-cover\">",
      "      <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "      <div class=\"cover-mask\"></div>",
      "      <div class=\"score-pill\">★ " + movie.rating + "</div>",
      "      <p class=\"cover-summary\">" + escapeHtml(movie.oneLine) + "</p>",
      "    </div>",
      "    <div class=\"movie-card-body\">",
      "      <h3>" + escapeHtml(movie.title) + "</h3>",
      "      <div class=\"movie-meta-line\"><span>" + movie.year + "</span><span>" + escapeHtml(movie.duration) + "</span><span>" + Number(movie.views).toLocaleString() + "次</span></div>",
      "      <div class=\"movie-tags\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
      "    </div>",
      "  </a>",
      "</article>"
    ].join("");
  }

  const searchPage = document.querySelector("[data-search-page]");

  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const input = searchPage.querySelector("input[name='q']");
    const count = searchPage.querySelector("[data-search-count]");
    const title = searchPage.querySelector("[data-search-title]");
    const results = searchPage.querySelector("[data-search-results]");
    const dataNode = document.getElementById("search-data");
    let data = [];

    if (input) {
      input.value = query;
    }

    try {
      data = JSON.parse(dataNode ? dataNode.textContent : "[]");
    } catch (error) {
      data = [];
    }

    const term = normalize(query);
    const matched = term
      ? data.filter(function (movie) {
          return normalize([
            movie.title,
            movie.year,
            movie.category,
            movie.region,
            movie.type,
            movie.genre,
            movie.oneLine,
            movie.keywords
          ].join(" ")).includes(term);
        })
      : [];

    if (title) {
      title.textContent = term ? "“" + query + "”的搜索结果" : "搜索结果";
    }

    if (count) {
      count.textContent = term ? "找到 " + matched.length + " 个结果" : "输入关键词开始搜索";
    }

    if (results) {
      results.innerHTML = matched.length
        ? matched.map(movieCardTemplate).join("")
        : "<div class=\"search-empty\">" + (term ? "未找到相关内容" : "请输入关键词后查看结果") + "</div>";
    }
  }

  const backTop = document.createElement("button");
  backTop.className = "back-to-top";
  backTop.type = "button";
  backTop.textContent = "↑";
  backTop.setAttribute("aria-label", "返回顶部");
  document.body.appendChild(backTop);

  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", function () {
    backTop.classList.toggle("is-visible", window.scrollY > 420);
  });
})();
