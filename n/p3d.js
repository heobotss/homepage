/* 점 입체 그림 (11-06 대표님 「싸구려 말고 3D로, 새롭고 신비하고 대단해 보이게」)
   카드 안 <canvas data-p3d="모양"> 에 점 수백 개로 만든 입체가 천천히 돈다. 사이트 등뼈 점과 같은 재료(흰 점 + 파란 점).
   - 화면에 보이는 그림만 그린다(IntersectionObserver) · 탭이 숨으면 멈춤 · 움직임 줄이기면 한 장만
   - 마우스를 대면 그쪽으로 기울고 점이 밝아진다
   - 모양은 아래 SHAPES 에 함수 하나씩. 좌표는 대략 -1 ~ 1, 마지막 값 1 이면 파란 점 */
(() => {
  const cvs = [...document.querySelectorAll('canvas[data-p3d]')];
  if (!cvs.length) return;
  const STILL = document.documentElement.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* 기본 도형 */
  const line = (a, b, n, h = 0) => Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, h]; });
  const rect = (w, hgt, z, n, h = 0, cx = 0, cy = 0) => {
    const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - hgt / 2, y1 = cy + hgt / 2, k = Math.max(2, Math.round(n / 4));
    return [...line([x0, y0, z], [x1, y0, z], k, h), ...line([x1, y0, z], [x1, y1, z], k, h), ...line([x1, y1, z], [x0, y1, z], k, h), ...line([x0, y1, z], [x0, y0, z], k, h)];
  };
  const fill = (w, hgt, z, n, h = 0, cx = 0, cy = 0) => Array.from({ length: n }, () => [cx + (rnd() - .5) * w, cy + (rnd() - .5) * hgt, z, h]);
  const ring = (r, n, y = 0, h = 0, tilt = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * TAU; return [Math.cos(a) * r, y + Math.sin(a) * r * Math.sin(tilt), Math.sin(a) * r * Math.cos(tilt), h]; });
  const sphere = (r, n, h = 0) => Array.from({ length: n }, (_, i) => { const y = 1 - (i / (n - 1)) * 2, rr = Math.sqrt(1 - y * y), a = i * 2.399963; return [Math.cos(a) * rr * r, y * r, Math.sin(a) * rr * r, h]; });
  const box = (w, hgt, d, n, h = 0, cx = 0, cy = 0, cz = 0) => {
    const p = [], k = Math.max(2, Math.round(n / 12)), X = [cx - w / 2, cx + w / 2], Y = [cy - hgt / 2, cy + hgt / 2], Z = [cz - d / 2, cz + d / 2];
    for (const y of Y) for (const z of Z) p.push(...line([X[0], y, z], [X[1], y, z], k, h));
    for (const x of X) for (const z of Z) p.push(...line([x, Y[0], z], [x, Y[1], z], k, h));
    for (const x of X) for (const y of Y) p.push(...line([x, y, Z[0]], [x, y, Z[1]], k, h));
    return p;
  };
  const rotY = (pts, a) => pts.map(([x, y, z, h]) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a), h]);
  const rotZ = (pts, a) => pts.map(([x, y, z, h]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z, h]);
  const move = (pts, dx, dy, dz) => pts.map(([x, y, z, h]) => [x + dx, y + dy, z + dz, h]);

  const SHAPES = {
    /* 센터 진단표 — 펼친 카드 석 장 */
    cards: () => [-.5, 0, .5].flatMap((o, i) => move(rotY([...rect(.7, 1, 0, 60, i === 2 ? 1 : 0), ...fill(.6, .9, 0, 40, 0)], o * .9), o * 1.1, 0, -Math.abs(o) * .4)),
    /* 트레이너 진단표 — 전국 지구 위 한 점 */
    globe: () => [...sphere(.85, 420), ...ring(1.05, 90, 0, 0, .35), ...move(sphere(.08, 30, 1), .45, .3, .62)],
    /* 수업일지 — 폰 한 대와 기록 줄 */
    phone: () => [...box(.9, 1.6, .12, 160), ...[-.45, -.2, .05, .3].flatMap((y, i) => line([-.3, y, .07], [i === 3 ? .1 : .3, y, .07], 14, i === 3 ? 1 : 0)), ...move(ring(.12, 20, 0, 1, Math.PI / 2), .22, .3, .07)],
    /* 블로그 진단서 — 돋보기 고리와 글 */
    lens: () => [...rotY(ring(.55, 120, 0, 1, Math.PI / 2), .5), ...line([.4, -.4, .25], [.85, -.85, .5], 24, 1), ...[-.2, 0, .2].flatMap(y => line([-.9, y, -.3], [.1, y, -.3], 22))],
    /* 내 블로그 순위판 — 깊이로 줄 선 오르는 막대 */
    rank: () => [0, 1, 2, 3, 4].flatMap(i => box(.22, .25 + i * .3, .22, 70, i === 4 ? 1 : 0, -.9 + i * .45, -.8 + (.25 + i * .3) / 2, (i - 2) * -.15)),
    /* 블로그 체급 판정 — 저울 위 두 체급 */
    scale: () => [...line([-1, .4, 0], [1, .4, 0], 40), ...line([0, .4, 0], [0, -.9, 0], 30), ...move(box(.55, .55, .55, 120), -.7, .1, 0), ...move(box(.35, .35, .35, 90, 1), .7, .22, 0)],
    /* 블로그 검수기 — 겹친 원고와 훑는 빛 */
    check: () => [...[0, 1, 2].flatMap(i => move(rect(1.1, 1.4, 0, 70), i * .12, -i * .1, -i * .25)), ...line([-.55, .1, .05], [.55, .1, .05], 40, 1), ...[-.4, -.2, .3, .5].flatMap(y => line([-.45, y, 0], [.45, y, 0], 18))],
    /* 블로그 레벨 — 오르는 계단 */
    stairs: () => Array.from({ length: 7 }, (_, i) => box(.28, .14 + i * .2, .5, 60, i === 6 ? 1 : 0, -.9 + i * .3, -.9 + (.14 + i * .2) / 2, 0)).flat(),
    /* 매달 재진단 — 두 겹 나선 */
    helix: () => Array.from({ length: 260 }, (_, i) => { const t = i / 259, a = t * TAU * 3, s = i % 2; return [Math.cos(a + s * Math.PI) * .55, -1 + t * 2, Math.sin(a + s * Math.PI) * .55, s && i > 200 ? 1 : 0]; }),
    /* 플레이스 추적기 — 지도 판과 핀 */
    map: () => { const p = []; for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) p.push([x * .18, -.35 + Math.sin(x * .7) * .06 + Math.cos(z * .6) * .06, z * .18, 0]); return [...p, ...line([.2, -.3, .1], [.2, .55, .1], 20, 1), ...move(sphere(.12, 40, 1), .2, .62, .1), ...line([-.5, -.3, -.4], [-.5, .25, -.4], 14), ...move(sphere(.08, 24), -.5, .3, -.4)]; },
    /* 재등록·VIP — 회원 무리와 가운데 한 무리 */
    people: () => [...[[-.6, 0, -.2], [.55, .2, -.3], [-.2, .45, .4], [.3, -.45, .35], [-.5, -.5, .2]].flatMap(c => move(sphere(.2, 60), ...c)), ...sphere(.3, 120, 1)],
    /* 회원 리포트·팀보드 — 두 화면 */
    board: () => [...move(rect(.9, .65, 0, 70), -.5, .3, 0), ...move(rect(.9, .65, 0, 70, 1), .5, -.2, -.4), ...Array.from({ length: 30 }, (_, i) => [-.9 + i * .027, .1 + Math.sin(i * .4) * .15, 0, 0]), ...[0, 1, 2, 3].flatMap(i => line([.15 + i * .2, -.5, -.4], [.15 + i * .2, -.4 + i * .08, -.4], 8, 1))],
    /* 유입경로 — 깔때기 */
    funnel: () => [...Array.from({ length: 6 }, (_, i) => ring(.95 - i * .15, 70 - i * 8, .8 - i * .3, i === 5 ? 1 : 0)).flat(), ...line([0, -.8, 0], [0, -1, 0], 8, 1)],
    /* 동네 시세표 — 물결 판 */
    wave: () => { const p = []; for (let x = -12; x <= 12; x++) for (let z = -6; z <= 6; z++) { const y = Math.sin(x * .45) * .25 + Math.cos(z * .7) * .1; p.push([x * .08, y, z * .1, x === 6 ? 1 : 0]); } return p; },
    /* AI 등장률 — 가운데 점과 궤도 */
    orbit: () => [...sphere(.22, 90, 1), ...ring(.6, 70, 0, 0, .3), ...rotZ(ring(.85, 90, 0, 0, 1.2), .5), ...rotZ(ring(.75, 80, 0, 0, 1.4), -.6), ...move(sphere(.06, 16, 1), .6, 0, 0)],
    /* 센터 블로그 레벨표 — 점 막대 격자 */
    matrix: () => { const p = []; const H = [.3, .9, .5, .7, .2, .6]; H.forEach((hh, r) => { for (let c = 0; c < 4; c++) { const v = hh * (1 - c * .18); p.push(...line([-.8 + c * .5, -.7, -.6 + r * .24], [-.8 + c * .5, -.7 + v, -.6 + r * .24], 10, r === 1 && c === 0 ? 1 : 0)); } }); return p; },
    /* 계산표 — 격자 상자 */
    grid: () => { const p = []; for (let x = -2; x <= 2; x++) for (let y = -2; y <= 2; y++) for (let z = -2; z <= 2; z++) if (Math.abs(x) === 2 || Math.abs(y) === 2 || Math.abs(z) === 2) p.push([x * .28, y * .28, z * .28, x === 2 && y === 2 ? 1 : 0]); return [...p, ...box(1.2, 1.2, 1.2, 140)]; },
    /* 글 뼈대 6단계 — 쌓인 층 */
    layers: () => Array.from({ length: 6 }, (_, i) => { const y = -.75 + i * .3, p = []; for (let a = 0; a < 9; a++) for (let b = 0; b < 6; b++) p.push([-.8 + a * .2, y, -.5 + b * .2, i === 5 ? 1 : 0]); return [...p, ...rect(1.7, 1.1, 0, 40, i === 5 ? 1 : 0).map(([x, z, _, h]) => [x, y, z, h])]; }).flat(),
    /* 계정 진단 — 겹친 고리 다섯 */
    rings: () => [0, 1, 2, 3, 4].flatMap(i => ring(.25 + i * .17, 40 + i * 14, 0, i === 4 ? 1 : 0, 1.1)),
    /* 사진 판독 — 사진 판과 훑는 빛 */
    scan: () => [...rect(1.4, 1, 0, 80), ...fill(1.3, .9, 0, 160), ...line([-.75, .15, .02], [.75, .15, .02], 50, 1), ...rect(1.6, .06, .02, 30, 1, 0, .15)],
    /* 모의고사 — 문제지 더미 */
    pages: () => Array.from({ length: 5 }, (_, i) => move(rotZ(rect(1, 1.3, 0, 60, i === 4 ? 1 : 0), (i - 2) * .07), 0, 0, -i * .16)).flat(),
    /* 전자책 — 펼친 책 */
    book: () => { const p = []; for (let i = 0; i < 420; i++) { const s = i % 2 ? 1 : -1, u = rnd(), v = rnd() * 1.3 - .65; p.push([s * u * 1.05, v, Math.sin(u * Math.PI) * .22 - u * .35, 0]); } for (let s = -1; s <= 1; s += 2) p.push(...Array.from({ length: 40 }, (_, k) => { const u = k / 39; return [s * u * 1.05, .65, Math.sin(u * Math.PI) * .22 - u * .35, s === 1 ? 1 : 0]; })); return [...p, ...line([0, -.65, 0], [0, .65, 0], 26, 1)]; },
  };

  const cache = {};
  const items = cvs.map(cv => {
    const k = cv.dataset.p3d;
    if (!cache[k]) { seed = 7 + k.length * 31; cache[k] = (SHAPES[k] || SHAPES.grid)(); }
    return { cv, ctx: cv.getContext('2d'), pts: cache[k], on: false, a: (k.length * 1.3) % TAU, mx: 0, my: 0, tx: 0, ty: 0, w: 0, h: 0, glow: 0, tg: 0 };
  });

  const DPR = Math.min(2, devicePixelRatio || 1);
  const size = it => { const r = it.cv.getBoundingClientRect(); it.w = r.width; it.h = r.height; it.cv.width = Math.round(r.width * DPR); it.cv.height = Math.round(r.height * DPR); };
  const css = getComputedStyle(document.documentElement);
  const BLUE = (css.getPropertyValue('--blue-rgb') || '79,134,247').trim(), INK = (css.getPropertyValue('--ink-rgb') || '242,240,235').trim();

  function draw(it, dt) {
    const { ctx, w, h } = it; if (!w) return;
    it.a += dt * .00028;
    it.mx += (it.tx - it.mx) * .06; it.my += (it.ty - it.my) * .06; it.glow += (it.tg - it.glow) * .08;
    const ay = it.a + it.mx * .6, ax = -.32 + it.my * .35, cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    const S = Math.min(w, h) * .47, F = 3.2;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, w, h);
    const out = [];
    for (const [x, y, z, hot] of it.pts) {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const k = F / (F - z2); out.push([w / 2 + x1 * S * k, h / 2 - y1 * S * k, z2, hot, k]);
    }
    out.sort((p, q) => p[2] - q[2]);
    for (const [px, py, z, hot, k] of out) {
      const d = (z + 1.2) / 2.4, al = Math.max(.2, Math.min(1, .38 + d * .62)) * (.85 + it.glow * .15), r = (hot ? 1.7 : 1.2) * k * (.8 + it.glow * .15);
      ctx.fillStyle = hot ? `rgba(${BLUE},${Math.min(1, al + .25)})` : `rgba(${INK},${al * .92})`;
      ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
      if (hot) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(${BLUE},${(.05 + d * .07) * (1 + it.glow)})`; ctx.beginPath(); ctx.arc(px, py, r * 5, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    }
  }

  items.forEach(it => {
    size(it);
    const host = it.cv.closest('.card') || it.cv.parentElement;
    host.addEventListener('pointermove', e => { const r = it.cv.getBoundingClientRect(); it.tx = ((e.clientX - r.left) / r.width - .5) * 2; it.ty = ((e.clientY - r.top) / r.height - .5) * 2; it.tg = 1; });
    host.addEventListener('pointerleave', () => { it.tx = 0; it.ty = 0; it.tg = 0; });
    draw(it, 0);
  });
  addEventListener('resize', () => items.forEach(it => { size(it); draw(it, 0); }));
  if (STILL) return;
  const io = new IntersectionObserver(es => es.forEach(e => { const it = items.find(x => x.cv === e.target); if (it) it.on = e.isIntersecting; }), { rootMargin: '80px' });
  items.forEach(it => io.observe(it.cv));
  let last = performance.now();
  (function tick(t) {
    const dt = Math.min(64, t - last); last = t;
    if (!document.hidden) for (const it of items) if (it.on) draw(it, dt);
    requestAnimationFrame(tick);
  })(last);
})();
