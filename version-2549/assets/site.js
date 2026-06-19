(function () {
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-global-search]').forEach(function (input) {
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const value = input.value.trim();
                const target = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
                window.location.href = target;
            }
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dots button'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = slides.findIndex(function (slide) {
            return slide.classList.contains('active');
        });

        if (active < 0) {
            active = 0;
        }

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
                dot.setAttribute('aria-selected', dotIndex === active ? 'true' : 'false');
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
            });
        }

        if (slides.length > 1) {
            setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        show(active);
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const keyword = scope.querySelector('[data-filter-keyword]');
        const year = scope.querySelector('[data-filter-year]');
        const kind = scope.querySelector('[data-filter-kind]');
        const cards = Array.from(scope.querySelectorAll('.movie-card, .rank-row'));
        const empty = scope.querySelector('[data-empty-note]');

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function apply() {
            const q = normalize(keyword ? keyword.value : '');
            const selectedYear = normalize(year ? year.value : '');
            const selectedKind = normalize(kind ? kind.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                const cardYear = normalize(card.getAttribute('data-year'));
                const cardKind = normalize(card.getAttribute('data-type'));
                const okKeyword = !q || text.indexOf(q) !== -1;
                const okYear = !selectedYear || cardYear === selectedYear;
                const okKind = !selectedKind || cardKind === selectedKind;
                const ok = okKeyword && okYear && okKind;

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [keyword, year, kind].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q');
        if (keyword && initial) {
            keyword.value = initial;
        }
        apply();
    });

    document.querySelectorAll('.player-frame').forEach(function (frame) {
        const video = frame.querySelector('video');
        const trigger = frame.querySelector('[data-start]');
        const streamUrl = frame.getAttribute('data-stream');
        let hlsInstance = null;

        function attachStream() {
            if (!video || !streamUrl || video.getAttribute('data-ready') === '1') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            video.setAttribute('data-ready', '1');
        }

        function start() {
            attachStream();
            frame.classList.add('is-playing');
            if (video) {
                const playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            }
        }

        if (trigger) {
            trigger.addEventListener('click', function (event) {
                event.preventDefault();
                start();
            });
        }

        frame.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            start();
        });

        if (video) {
            video.addEventListener('play', function () {
                frame.classList.add('is-playing');
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
