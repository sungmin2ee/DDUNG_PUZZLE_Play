(function (root) {
  'use strict';
  // The browser owns letterboxing; Unity always sees the same portrait aspect.
  function fit(width, height, footerHeight) {
    const availableHeight = Math.max(0, height - footerHeight);
    const canvasWidth = Math.max(0, Math.min(width, availableHeight * 9 / 16));
    return { width: canvasWidth, height: canvasWidth * 16 / 9 };
  }
  if (typeof module === 'object' && module.exports) module.exports = { fit: fit };
  if (!root.document) return;
  const doc = root.document;
  const host = doc.getElementById('unity-container');
  const player = doc.getElementById('unity-player');
  const canvas = doc.getElementById('unity-canvas');
  const footer = doc.getElementById('unity-footer');
  const button = doc.getElementById('fullscreen');
  let frame = 0;
  function resize() {
    frame = 0;
    const box = host.getBoundingClientRect();
    const style = root.getComputedStyle(host);
    const width = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = box.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const size = fit(width, height, footer.getBoundingClientRect().height);
    player.style.setProperty('--canvas-width', size.width + 'px');
    player.style.setProperty('--canvas-height', size.height + 'px');
    // Leave canvas.width/height to Unity so DPR and pointer coordinates stay in sync.
  }
  function scheduleResize() { if (!frame) frame = root.requestAnimationFrame(resize); }
  root.addEventListener('resize', scheduleResize);
  root.addEventListener('orientationchange', scheduleResize);
  if (root.visualViewport) root.visualViewport.addEventListener('resize', scheduleResize);
  if (root.ResizeObserver) new root.ResizeObserver(scheduleResize).observe(host);
  doc.addEventListener('fullscreenchange', () => {
    button.textContent = doc.fullscreenElement ? '전체화면 종료' : '전체화면';
    scheduleResize();
    canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener('pointerdown', () => canvas.focus({ preventScroll: true }));
  canvas.addEventListener('contextmenu', event => event.preventDefault());
  button.addEventListener('click', async () => {
    try {
      if (doc.fullscreenElement) await doc.exitFullscreen();
      else await host.requestFullscreen();
    } catch (error) { console.warn('Fullscreen request was not accepted:', error); }
  });
  root.DdungPortrait = {
    fit: fit,
    ready: function () {
      button.hidden = !(doc.fullscreenEnabled && host.requestFullscreen);
      button.disabled = false;
      scheduleResize();
    }
  };
  resize();
})(typeof window === 'object' ? window : globalThis);
