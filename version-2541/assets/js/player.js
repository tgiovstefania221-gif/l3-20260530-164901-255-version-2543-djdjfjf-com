(function () {
    var video = document.querySelector('[data-player]');
    var playButton = document.querySelector('[data-play-button]');

    if (!video || !playButton) {
        return;
    }

    var source = video.getAttribute('data-src');
    var shell = video.closest('.player-shell');
    var hlsInstance = null;

    function startPlayer() {
        if (!source) {
            playButton.textContent = '播放源不可用';
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                playButton.textContent = '再次点击播放';
            });
        }

        if (shell) {
            shell.classList.add('is-playing');
        }
    }

    playButton.addEventListener('click', startPlayer);
    video.addEventListener('play', function () {
        if (shell) {
            shell.classList.add('is-playing');
        }
    });
    video.addEventListener('pause', function () {
        if (shell) {
            shell.classList.remove('is-playing');
        }
    });
})();
