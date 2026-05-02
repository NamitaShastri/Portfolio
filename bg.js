
(function () {
  const mainCanvas    = document.getElementById('bg-canvas');
  const circuitCanvas = document.getElementById('circuit-canvas');
  const mCtx = mainCanvas.getContext('2d');
  const cCtx = circuitCanvas.getContext('2d');

  let W, H;
  let mode = 'neural'; 
  let mouse = { x: -999, y: -999 };
  let animId;

 
  function resize() {
    W = mainCanvas.width = circuitCanvas.width = window.innerWidth;
    H = mainCanvas.height = circuitCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildCircuit(); });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const nodes = [];
  const NODE_COUNT = 70;
  const LINK_DIST  = 130;

  function buildNodes() {
    nodes.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x:  Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r:  Math.random() * 1.6 + 0.4,
        opacity: Math.random() * 0.5 + 0.15,
        pulse: Math.random() * Math.PI * 2,
        ps: 0.018 + Math.random() * 0.02,
        color: ['#00f5ff','#00f5ff','#a855f7','#00ff88','#f0abfc'][Math.floor(Math.random()*5)],
        burst: 0
      });
    }
  }
  buildNodes();

  function drawNeural() {
    mCtx.clearRect(0, 0, W, H);

    // Starfield base
    for (let i = 0; i < 80; i++) {
      const sx = (i * 173.7 + 50) % W;
      const sy = (i * 97.3  + 80) % H;
      const sz = (Math.sin(Date.now() * 0.0003 + i) * 0.5 + 0.5) * 0.4 + 0.05;
      mCtx.beginPath();
      mCtx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      mCtx.fillStyle = '#e0f4ff';
      mCtx.globalAlpha = sz;
      mCtx.fill();
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      n.pulse += n.ps;
      if (n.burst > 0) n.burst -= 0.03;

      // Wrap
      if (n.x < -10) n.x = W + 10;
      if (n.x > W + 10) n.x = -10;
      if (n.y < -10) n.y = H + 10;
      if (n.y > H + 10) n.y = -10;

      // Mouse repulsion
      const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
      const md  = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 120) {
        const f = (120 - md) / 120 * 0.5;
        n.vx += (mdx / md) * f * 0.09;
        n.vy += (mdy / md) * f * 0.09;
        n.burst = Math.min(n.burst + 0.1, 1);
      }
      n.vx *= 0.994; n.vy *= 0.994;

      // Draw node
      const op = (n.opacity * (0.7 + 0.3 * Math.sin(n.pulse))) + n.burst * 0.4;
      const nr = n.r + n.burst * 3;
      mCtx.beginPath();
      mCtx.arc(n.x, n.y, nr, 0, Math.PI * 2);
      mCtx.fillStyle = n.color;
      mCtx.globalAlpha = Math.min(op, 1);
      mCtx.fill();

      // Burst glow
      if (n.burst > 0) {
        mCtx.beginPath();
        mCtx.arc(n.x, n.y, nr * 3, 0, Math.PI * 2);
        const g = mCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, nr * 3);
        g.addColorStop(0, n.color.replace(')', ',0.3)').replace('rgb','rgba'));
        g.addColorStop(1, 'transparent');
        mCtx.fillStyle = g;
        mCtx.globalAlpha = n.burst * 0.4;
        mCtx.fill();
      }

      // Connections + pulse waves
      for (let j = i + 1; j < nodes.length; j++) {
        const q   = nodes[j];
        const dx  = n.x - q.x, dy = n.y - q.y;
        const d   = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          const strength = (1 - d / LINK_DIST);
          // Base line
          mCtx.beginPath();
          mCtx.strokeStyle = '#00f5ff';
          mCtx.globalAlpha = strength * 0.07;
          mCtx.lineWidth = 0.6;
          mCtx.moveTo(n.x, n.y);
          mCtx.lineTo(q.x, q.y);
          mCtx.stroke();

          // Pulse wave along connection
          const wavePos = (Date.now() * 0.001 + i * 0.3) % 1;
          const wx = n.x + (q.x - n.x) * wavePos;
          const wy = n.y + (q.y - n.y) * wavePos;
          mCtx.beginPath();
          mCtx.arc(wx, wy, 1.5, 0, Math.PI * 2);
          mCtx.fillStyle = '#00f5ff';
          mCtx.globalAlpha = strength * 0.25;
          mCtx.fill();
        }
      }
    }
    mCtx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════ MATRIX RAIN
  const matrixCols  = [];
  const CHAR_SET    = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01001101NamitaAIMLQUANTUM';
  let matrixInitialized = false;

  function initMatrix() {
    const cols = Math.floor(W / 16);
    matrixCols.length = 0;
    for (let i = 0; i < cols; i++) {
      matrixCols.push({
        y: Math.random() * H,
        speed: 1 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.5
      });
    }
    matrixInitialized = true;
  }

  function drawMatrix() {
    mCtx.fillStyle = 'rgba(2,4,8,0.08)';
    mCtx.fillRect(0, 0, W, H);
    mCtx.font = '13px JetBrains Mono, monospace';

    for (let i = 0; i < matrixCols.length; i++) {
      const col = matrixCols[i];
      const ch  = CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];
      const x   = i * 16;

      // Lead char brighter
      mCtx.fillStyle = `rgba(0,255,136,${col.opacity})`;
      mCtx.globalAlpha = 1;
      mCtx.fillText(ch, x, col.y);

      // Trail
      mCtx.fillStyle = `rgba(0,245,255,${col.opacity * 0.4})`;
      const trail = CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];
      mCtx.fillText(trail, x, col.y - 16);

      col.y += col.speed;
      if (col.y > H + 20) {
        col.y = -20;
        col.speed  = 1 + Math.random() * 3;
        col.opacity = 0.3 + Math.random() * 0.5;
      }
    }
    mCtx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════ STARFIELD
  const stars = [];
  function buildStars() {
    stars.length = 0;
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        z: Math.random() * W,
        pz: 0
      });
    }
  }
  buildStars();

  function drawStarfield() {
    mCtx.fillStyle = 'rgba(2,4,8,0.25)';
    mCtx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    for (const s of stars) {
      s.pz = s.z;
      s.z  -= 2.5;
      if (s.z <= 0) { s.x = Math.random() * W; s.y = Math.random() * H; s.z = W; s.pz = s.z; }

      const sx = (s.x - cx) * (W / s.z) + cx;
      const sy = (s.y - cy) * (W / s.z) + cy;
      const px = (s.x - cx) * (W / s.pz) + cx;
      const py = (s.y - cy) * (W / s.pz) + cy;
      const size = Math.max(0.5, (1 - s.z / W) * 2.5);
      const op   = (1 - s.z / W) * 0.7;

      mCtx.beginPath();
      mCtx.moveTo(px, py);
      mCtx.lineTo(sx, sy);
      mCtx.strokeStyle = '#e0f4ff';
      mCtx.globalAlpha = op;
      mCtx.lineWidth = size;
      mCtx.stroke();
    }
    mCtx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════ CIRCUIT TRACES
  const circuits = [];
  function buildCircuit() {
    circuits.length = 0;
    const count = Math.floor(W / 80);
    for (let i = 0; i < count; i++) {
      const startX = Math.random() * W;
      const startY = Math.random() * H;
      const segs   = [];
      let cx2 = startX, cy2 = startY;
      for (let s = 0; s < 4 + Math.floor(Math.random() * 5); s++) {
        const dir = Math.floor(Math.random() * 4);
        const len = 30 + Math.random() * 80;
        const nx  = cx2 + (dir === 0 ? len : dir === 1 ? -len : 0);
        const ny  = cy2 + (dir === 2 ? len : dir === 3 ? -len : 0);
        segs.push({ x1: cx2, y1: cy2, x2: nx, y2: ny });
        cx2 = nx; cy2 = ny;
      }
      circuits.push({ segs, pulse: Math.random(), speed: 0.003 + Math.random() * 0.006, color: Math.random() > 0.5 ? '#00f5ff' : '#a855f7' });
    }
  }
  buildCircuit();

  function drawCircuit() {
    cCtx.clearRect(0, 0, W, H);
    for (const c of circuits) {
      c.pulse = (c.pulse + c.speed) % 1;
      const totalLen = c.segs.length;

      for (let i = 0; i < c.segs.length; i++) {
        const seg = c.segs[i];
        cCtx.beginPath();
        cCtx.moveTo(seg.x1, seg.y1);
        cCtx.lineTo(seg.x2, seg.y2);
        cCtx.strokeStyle = c.color;
        cCtx.globalAlpha = 0.04;
        cCtx.lineWidth = 1;
        cCtx.stroke();

        // Corner dot
        cCtx.beginPath();
        cCtx.arc(seg.x1, seg.y1, 2, 0, Math.PI * 2);
        cCtx.fillStyle = c.color;
        cCtx.globalAlpha = 0.1;
        cCtx.fill();
      }

      // Moving pulse along circuit
      const segIdx = Math.floor(c.pulse * totalLen);
      const segFrac = (c.pulse * totalLen) % 1;
      if (segIdx < c.segs.length) {
        const seg = c.segs[segIdx];
        const px  = seg.x1 + (seg.x2 - seg.x1) * segFrac;
        const py  = seg.y1 + (seg.y2 - seg.y1) * segFrac;
        cCtx.beginPath();
        cCtx.arc(px, py, 3, 0, Math.PI * 2);
        const g = cCtx.createRadialGradient(px, py, 0, px, py, 10);
        g.addColorStop(0, c.color);
        g.addColorStop(1, 'transparent');
        cCtx.fillStyle = g;
        cCtx.globalAlpha = 0.7;
        cCtx.fill();
      }
    }
    cCtx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════ MAIN LOOP
  function loop() {
    if (mode === 'neural')    drawNeural();
    else if (mode === 'matrix') drawMatrix();
    else if (mode === 'starfield') drawStarfield();
    drawCircuit();
    animId = requestAnimationFrame(loop);
  }
  loop();

  // ═══════════════════════════════════════ MODE TOGGLE
  const toggle     = document.getElementById('bg-mode-toggle');
  const modeLabel  = document.getElementById('bg-mode-label');
  const MODES      = ['neural', 'matrix', 'starfield'];
  const LABELS     = ['NEURAL', 'MATRIX', 'STARFIELD'];
  let modeIdx = 0;

  if (toggle) {
    toggle.addEventListener('click', () => {
      modeIdx = (modeIdx + 1) % MODES.length;
      mode = MODES[modeIdx];
      modeLabel.textContent = LABELS[modeIdx];
      if (mode === 'matrix' && !matrixInitialized) initMatrix();
      if (mode === 'matrix') mCtx.fillStyle = '#020408'; mCtx.fillRect(0,0,W,H);
    });
  }
})();