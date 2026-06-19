import { H as Hls } from "./hls-local.js";

function attachSource(video, source) {
  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
        return;
      }

      hls.destroy();
    });

    window.addEventListener("pagehide", function () {
      hls.destroy();
    }, { once: true });

    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    return;
  }

  video.src = source;
}

export function initMoviePlayer(video, overlay, source) {
  if (!video || !source) {
    return;
  }

  let ready = false;

  async function start() {
    if (!ready) {
      attachSource(video, source);
      ready = true;
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });
}
