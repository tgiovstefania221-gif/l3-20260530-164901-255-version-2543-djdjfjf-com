(function () {
  var menuButton = document.querySelector(".menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("is-menu-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var queryInput = document.querySelector(".site-search");
  var categorySelect = document.querySelector(".category-filter");
  var yearSelect = document.querySelector(".year-filter");
  var count = document.querySelector(".filter-count");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card, .searchable-grid .rank-row"));

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function getText(card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-category"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-region"),
      card.textContent
    ].join(" "));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = normalize(queryInput ? queryInput.value : "");
    var category = normalize(categorySelect ? categorySelect.value : "");
    var year = normalize(yearSelect ? yearSelect.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var text = getText(card);
      var cardCategory = normalize(card.getAttribute("data-category"));
      var cardYear = Number(card.getAttribute("data-year") || 0);
      var yearMatch = true;

      if (year === "2022") {
        yearMatch = cardYear <= 2022;
      } else if (year) {
        yearMatch = String(cardYear) === year;
      }

      var matched = (!query || text.indexOf(query) !== -1) && (!category || cardCategory === category) && yearMatch;
      card.classList.toggle("is-hidden-by-filter", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = "已显示 " + visible + " 部";
    }
  }

  [queryInput, categorySelect, yearSelect].forEach(function (el) {
    if (el) {
      el.addEventListener("input", applyFilters);
      el.addEventListener("change", applyFilters);
    }
  });

  if (queryInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      queryInput.value = q;
    }
  }

  applyFilters();
}());
