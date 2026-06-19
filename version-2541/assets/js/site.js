(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        }, { once: true });
    });

    var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentHero = 0;

    function showHero(index) {
        if (!heroSlides.length) {
            return;
        }

        currentHero = (index + heroSlides.length) % heroSlides.length;
        heroSlides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentHero);
        });
        heroDots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentHero);
        });
    }

    heroDots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
        });
    });

    if (heroSlides.length > 1) {
        setInterval(function () {
            showHero(currentHero + 1);
        }, 5600);
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var searchInput = scope.querySelector('[data-local-search]');
        var yearSelect = scope.querySelector('[data-year-filter]');
        var countLabel = scope.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        function applyFilter() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matched = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear === year);

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (countLabel) {
                countLabel.textContent = visible + ' 部';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
    });

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var globalInput = searchPage.querySelector('[data-global-search]');
        var globalCategory = searchPage.querySelector('[data-global-category]');
        var globalCount = searchPage.querySelector('[data-global-count]');
        var resultBox = searchPage.querySelector('[data-search-results]');
        var movies = [];

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function renderResults() {
            var query = globalInput.value.trim().toLowerCase();
            var category = globalCategory.value;
            var matched = movies.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
                return (!query || haystack.indexOf(query) !== -1) && (!category || movie.categorySlug === category);
            }).slice(0, 120);

            resultBox.innerHTML = matched.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '    <a class="poster-wrap" href="' + movie.url + '">',
                    '        <span class="poster-fallback">' + escapeHtml(movie.title) + '</span>',
                    '        <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '        <span class="duration">' + escapeHtml(movie.duration) + '</span>',
                    '        <span class="play-float">▶</span>',
                    '    </a>',
                    '    <div class="card-body">',
                    '        <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                    '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                    '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                    '        <div class="score-row"><span>热度 ' + escapeHtml(movie.views) + '</span><span>评分 ' + escapeHtml(movie.rating) + '</span></div>',
                    '    </div>',
                    '</article>'
                ].join('');
            }).join('');

            if (globalCount) {
                globalCount.textContent = matched.length + ' 部';
            }
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery) {
            globalInput.value = initialQuery;
        }

        fetch('data/movies-search.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                movies = data;
                renderResults();
            })
            .catch(function () {
                if (globalCount) {
                    globalCount.textContent = '搜索数据载入失败';
                }
            });

        globalInput.addEventListener('input', renderResults);
        globalCategory.addEventListener('change', renderResults);
    }
})();
