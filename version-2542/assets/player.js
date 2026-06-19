(function () {
  var attachedPlayers = new WeakMap();

  function attachSource(video, source, onReady) {
    if (!video || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
      onReady();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var existing = attachedPlayers.get(video);
      if (existing) {
        onReady();
        return;
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      attachedPlayers.set(video, hls);
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        onReady();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          attachedPlayers.delete(video);
          video.src = source;
        }
      });
      return;
    }

    if (video.src !== source) {
      video.src = source;
    }
    onReady();
  }

  function startVideo(video, button, source) {
    attachSource(video, source, function () {
      if (button) {
        button.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    });
  }

  window.setupMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var source = config.source;
    if (!video || !source) {
      return;
    }

    if (button) {
      button.addEventListener('click', function () {
        startVideo(video, button, source);
      });
    }

    video.addEventListener('play', function () {
      if (!video.currentSrc) {
        startVideo(video, button, source);
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo(video, button, source);
      }
    });
  };
})();
