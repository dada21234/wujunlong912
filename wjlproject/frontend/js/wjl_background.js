/**
 * 姓名：wujunlong | 学号：24001010912 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 说明：首页背景动画，canvas 绘制粒子网络，跟随鼠标产生轻微吸引力。
 */
(function () {
  const wjl_canvas = document.getElementById('wjl_canvas');
  if (!wjl_canvas) {
    return;
  }

  const wjl_ctx = wjl_canvas.getContext('2d');
  const wjl_pointCount = 70;
  const wjl_linkDistance = 140;
  const wjl_mouse = { wjl_x: -9999, wjl_y: -9999 };
  let wjl_points = [];
  let wjl_viewWidth = 0;
  let wjl_viewHeight = 0;
  const wjl_pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  function wjl_resizeCanvas() {
    wjl_viewWidth = window.innerWidth;
    wjl_viewHeight = window.innerHeight;
    wjl_canvas.width = wjl_viewWidth * wjl_pixelRatio;
    wjl_canvas.height = wjl_viewHeight * wjl_pixelRatio;
    wjl_canvas.style.width = wjl_viewWidth + 'px';
    wjl_canvas.style.height = wjl_viewHeight + 'px';
    wjl_ctx.setTransform(wjl_pixelRatio, 0, 0, wjl_pixelRatio, 0, 0);
    wjl_createPoints();
  }

  function wjl_createPoints() {
    wjl_points = [];
    for (let wjl_i = 0; wjl_i < wjl_pointCount; wjl_i++) {
      wjl_points.push({
        wjl_x: Math.random() * wjl_viewWidth,
        wjl_y: Math.random() * wjl_viewHeight,
        wjl_vx: (Math.random() - 0.5) * 0.35,
        wjl_vy: (Math.random() - 0.5) * 0.35,
        wjl_r: Math.random() * 1.6 + 0.8
      });
    }
  }

  function wjl_drawFrame() {
    wjl_ctx.clearRect(0, 0, wjl_viewWidth, wjl_viewHeight);

    // 粒子之间连线
    for (let wjl_i = 0; wjl_i < wjl_points.length; wjl_i++) {
      const wjl_p = wjl_points[wjl_i];

      for (let wjl_j = wjl_i + 1; wjl_j < wjl_points.length; wjl_j++) {
        const wjl_q = wjl_points[wjl_j];
        const wjl_dx = wjl_p.wjl_x - wjl_q.wjl_x;
        const wjl_dy = wjl_p.wjl_y - wjl_q.wjl_y;
        const wjl_distance = Math.sqrt(wjl_dx * wjl_dx + wjl_dy * wjl_dy);

        if (wjl_distance < wjl_linkDistance) {
          const wjl_alpha = (1 - wjl_distance / wjl_linkDistance) * 0.35;
          wjl_ctx.strokeStyle = 'rgba(120, 165, 255, ' + wjl_alpha.toFixed(3) + ')';
          wjl_ctx.lineWidth = 1;
          wjl_ctx.beginPath();
          wjl_ctx.moveTo(wjl_p.wjl_x, wjl_p.wjl_y);
          wjl_ctx.lineTo(wjl_q.wjl_x, wjl_q.wjl_y);
          wjl_ctx.stroke();
        }
      }
    }

    // 粒子本身与鼠标互动
    for (let wjl_k = 0; wjl_k < wjl_points.length; wjl_k++) {
      const wjl_point = wjl_points[wjl_k];
      const wjl_mdx = wjl_mouse.wjl_x - wjl_point.wjl_x;
      const wjl_mdy = wjl_mouse.wjl_y - wjl_point.wjl_y;
      const wjl_mouseDistance = Math.sqrt(wjl_mdx * wjl_mdx + wjl_mdy * wjl_mdy);

      if (wjl_mouseDistance < 180 && wjl_mouseDistance > 0.001) {
        wjl_point.wjl_x += (wjl_mdx / wjl_mouseDistance) * 0.45;
        wjl_point.wjl_y += (wjl_mdy / wjl_mouseDistance) * 0.45;
      }

      wjl_point.wjl_x += wjl_point.wjl_vx;
      wjl_point.wjl_y += wjl_point.wjl_vy;

      if (wjl_point.wjl_x < -20) {
        wjl_point.wjl_x = wjl_viewWidth + 20;
      }
      if (wjl_point.wjl_x > wjl_viewWidth + 20) {
        wjl_point.wjl_x = -20;
      }
      if (wjl_point.wjl_y < -20) {
        wjl_point.wjl_y = wjl_viewHeight + 20;
      }
      if (wjl_point.wjl_y > wjl_viewHeight + 20) {
        wjl_point.wjl_y = -20;
      }

      wjl_ctx.beginPath();
      wjl_ctx.fillStyle = 'rgba(170, 205, 255, 0.7)';
      wjl_ctx.arc(wjl_point.wjl_x, wjl_point.wjl_y, wjl_point.wjl_r, 0, Math.PI * 2);
      wjl_ctx.fill();
    }

    window.requestAnimationFrame(wjl_drawFrame);
  }

  window.addEventListener('resize', wjl_resizeCanvas);
  window.addEventListener('mousemove', function (wjl_event) {
    wjl_mouse.wjl_x = wjl_event.clientX;
    wjl_mouse.wjl_y = wjl_event.clientY;
  });
  window.addEventListener('mouseleave', function () {
    wjl_mouse.wjl_x = -9999;
    wjl_mouse.wjl_y = -9999;
  });

  wjl_resizeCanvas();
  window.requestAnimationFrame(wjl_drawFrame);
})();
