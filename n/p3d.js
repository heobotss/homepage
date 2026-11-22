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

  /* ── 11-22 무료 자료 그림 ── 자료마다 그 자료의 생김새 그대로(가는 선 + 점). 빙글 돌지 않고 좌우로 천천히 흔들려 앞모습이 늘 읽힌다.
     S = 선과 점, T = 점줄(글 줄), F = 옅게 채운 판. 좌표 x 는 -1.3 ~ 1.3, y 는 -0.95 ~ 0.95, z 는 앞으로 나온 정도 */
  const dotsOn = (pts, h, gap) => { const out = [[pts[0][0], pts[0][1], pts[0][2], h]]; let rem = 0; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); let t = gap - rem; while (t <= d) { const u = t / d; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, h]); t += gap; } rem = d - (t - gap); } return out; };
  const RR = (w, hh, r, cx = 0, cy = 0, z = 0) => { const p = []; [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sx, sy], q) => { for (let i = 0; i <= 5; i++) { const a = (q + i / 5) * Math.PI / 2; p.push([cx + sx * (w / 2 - r) + Math.cos(a) * r, cy + sy * (hh / 2 - r) + Math.sin(a) * r, z]); } }); p.push(p[0]); return p; };
  const AR = (r, a0, a1, cx = 0, cy = 0, z = 0, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]; });
  const HL = (x0, x1, y, z = 0) => [[x0, y, z], [x1, y, z]];
  const holo = fn => () => { const P = [], L = [];
    const S = (pts, h = 0, gap = .1) => { L.push([pts, h, 0]); if (gap) P.push(...dotsOn(pts, h, gap)); };
    const T = (pts, h = 0, gap = .062) => { P.push(...dotsOn(pts, h, gap)); };
    const F = (pts, h = 0, gap = .1) => { L.push([pts, h, 1]); if (gap) P.push(...dotsOn(pts, h, gap)); };
    fn(S, T, F); P.lines = L; P.swing = 1; return P; };
  Object.assign(SHAPES, {
    /* 수업 기록 글 뼈대 6단계 — 원고 한 장 위에 선 등뼈와 마디 여섯 */
    spine: holo((S, T, F) => {
      F(RR(1.36, 1.74, .08, .05, 0, -.14));
      S([[-.42, .64, .12], [-.42, -.64, .12]], 0, .07);
      [.5, .34, .56, .26, .46, .38].forEach((len, i) => { const y = .64 - i * .256, h = i === 0 ? 1 : 0;
        S(AR(.062, 0, TAU, -.42, y, .12, 12), h, 0); F(AR(.03, 0, TAU, -.42, y, .12, 8), h, 0);
        T(HL(-.26, -.26 + len * 1.5, y + .035, .12), h); T(HL(-.26, -.26 + len * .9, y - .055, .12), 0, .075); });
    }),
    /* 1분 계산표 — 칸 나뉜 표와 떠오른 답 칸 */
    table: holo((S, T, F) => {
      const W = 2.0, H = 1.36, x0 = -1, y0 = .68, rh = H / 4;
      F(RR(W, H, .06, 0, 0, -.1));
      F([[x0, y0, -.1], [x0 + W, y0, -.1], [x0 + W, y0 - rh, -.1], [x0, y0 - rh, -.1], [x0, y0, -.1]], 0, 0);
      [2, 3].forEach(r => S(HL(x0, x0 + W, y0 - r * rh, -.1), 0, 0));
      S([[x0 + .8, y0, -.1], [x0 + .8, y0 - H, -.1]], 0, 0); S([[x0 + 1.4, y0, -.1], [x0 + 1.4, y0 - H, -.1]], 0, 0);
      for (let r = 0; r < 4; r++) { const y = y0 - (r + .5) * rh; T(HL(x0 + .12, x0 + .12 + [.4, .5, .36, .46][r], y, -.1)); T(HL(x0 + .95, x0 + 1.22, y, -.1)); if (r < 3) T(HL(x0 + 1.55, x0 + 1.84, y, -.1)); }
      F(RR(.6, rh, .05, x0 + 1.7, y0 - 3.5 * rh, .22), 1, .07); T(HL(x0 + 1.52, x0 + 1.88, y0 - 3.5 * rh, .22), 1, .05);
    }),
    /* 인스타 진단 — 폰 속 게시물 아홉 칸과 한 칸을 들여다보는 돋보기 */
    feed: holo((S, T, F) => {
      F(RR(1.04, 1.84, .14, 0, 0, -.1));
      S(AR(.09, 0, TAU, -.3, .68, -.02, 12), 0, 0); T(HL(-.15, .28, .68, -.02));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const hot = r === 1 && c === 2, x = -.3 + c * .3, y = .34 - r * .3; (hot ? F : S)(RR(.25, .25, .03, x, y, hot ? .2 : -.02), hot ? 1 : 0, hot ? .07 : 0); }
      S(AR(.3, 0, TAU, .3, .04, .36, 30), 1, .07); S([[.51, -.17, .36], [.8, -.46, .36]], 1, .06);
      T(HL(-.3, .1, -.62, -.02));
    }),
    /* 일지 사진 판독 — 손글씨 종이를 훑어 반듯한 숫자 줄로 */
    ocr: holo((S, T, F) => {
      F(RR(1.0, 1.34, .05, -.62, 0, -.12));
      for (let i = 0; i < 5; i++) { const y = .44 - i * .22; T(Array.from({ length: 15 }, (_, k) => [-1.0 + k * .052, y + Math.sin(k * 1.3 + i * 2) * .035, -.12]), 0, .05); }
      [[-1, 1], [1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => S([[-.62 + sx * .6, sy * .5, .08], [-.62 + sx * .6, sy * .77, .08], [-.62 + sx * .33, sy * .77, .08]], 1, .07));
      S(HL(-1.26, .02, .1, .1), 1, .05);
      T(HL(.1, .36, 0, 0), 1, .065); S([[.3, .07, 0], [.38, 0, 0], [.3, -.07, 0]], 1, 0);
      for (let i = 0; i < 5; i++) { const y = .44 - i * .22; S(RR(.2, .13, .03, .62, y, .16), 0, 0); T(HL(.8, 1.24, y, .16)); }
    }),
    /* 문자 + 답별 다음 한마디 — 보낸 문자, 돌아온 답, 답마다 갈리는 세 갈래 */
    chat: holo((S, T, F) => {
      F(RR(1.3, .5, .2, -.3, .56, -.1)); T(HL(-.75, .1, .62, -.1)); T(HL(-.75, -.2, .5, -.1));
      F(RR(.9, .42, .19, .5, .02, .18), 1, .07); T(HL(.2, .78, .02, .18), 1);
      [-.72, 0, .72].forEach(x => { S([[.5, -.2, .1], [x, -.5, .04]], 0, .075); S(RR(.56, .26, .12, x, -.64, .04), 0, 0); T(HL(x - .16, x + .16, -.64, .04), 0, .055); });
    }),
    /* OT 종이 한 장 — 집게 물린 종이와 순서대로 채우는 칸 */
    clip: holo((S, T, F) => {
      F(RR(1.3, 1.6, .06, 0, -.08, -.1));
      F(RR(.52, .2, .06, 0, .74, .06), 1, .06);
      [.4, .12, -.16, -.44].forEach((y, i) => { S(RR(.15, .15, .02, -.42, y, 0), 0, 0); T(HL(-.24, -.24 + [.66, .5, .7, .42][i], y, 0));
        if (i < 2) S([[-.47, y, .1], [-.43, y - .05, .1], [-.34, y + .07, .1]], 1, .04); });
      T(HL(-.48, .2, -.7, 0), 0, .075);
    }),
    /* 넘겨받은 회원 — 앞 선생님에게서 다음 선생님으로 건너가는 회원 기록 */
    relay: holo((S, T, F) => {
      const man = (x, z, h) => { S(AR(.2, 0, TAU, x, .22, z, 20), h, .08); S([...AR(.42, 0, Math.PI, x, -.6, z, 20), [x + .42, -.6, z]], h, .08); };
      man(-.8, -.06, 0); man(.8, .06, 1);
      F(RR(.44, .58, .05, 0, -.14, .3)); [.0, -.12, -.24].forEach((y, i) => T(HL(-.13, i === 2 ? .05 : .13, y, .3), 0, .05));
      T(AR(.66, Math.PI * .82, Math.PI * .18, 0, .14, .1, 30), 1, .07); S([[.4, .56, .1], [.55, .5, .1], [.56, .66, .1]], 1, 0);
    }),
    /* 모의고사 — 답 칸에 색칠한 답안지 */
    omr: holo((S, T, F) => {
      F(RR(1.34, 1.74, .06, 0, 0, -.1)); T(HL(-.5, .1, .68, -.1)); S(HL(-.55, .55, .56, -.1), 0, 0);
      [1, 3, 0, 2, 1].forEach((pick, r) => { const y = .36 - r * .235; T(HL(-.52, -.44, y, 0), 0, .04);
        for (let c = 0; c < 4; c++) { const x = -.2 + c * .23; if (c === pick) F(AR(.075, 0, TAU, x, y, .1, 12), 1, .05); else S(AR(.07, 0, TAU, x, y, 0, 12), 0, 0); } });
    }),
    /* 재등록 전자책 — 펼친 책과 다시 돌아오는 고리 */
    ebook: holo((S, T, F) => {
      const pg = (s, u, v, dz = 0) => [s * u * 1.1, -.86 + v * .9 + u * .1 - dz, u * .34 - u * u * .1];
      for (const s of [-1, 1]) { F([pg(s, 0, 0), pg(s, 1, 0), pg(s, 1, 1), pg(s, 0, 1), pg(s, 0, 0)], 0, .1);
        S([pg(s, 0, 0, .07), pg(s, 1, 0, .07), pg(s, 1, 0)], 0, 0);
        for (let i = 0; i < 4; i++) T([pg(s, .16, .82 - i * .2), pg(s, i === 3 ? .55 : .86, .82 - i * .2)], 0, .07); }
      S([pg(1, 0, 0), pg(1, 0, 1)], 1, .06);
      S(AR(.26, Math.PI * .65, Math.PI * 2.35, 0, .52, .2, 30), 1, .07); S([[.254, .756, .2], [.118, .752, .2], [.196, .64, .2]], 1, 0);
    }),
    /* 재등록 시점표 — 남은 횟수 눈금과 그날 할 말 네 장 */
    timeline: holo((S, T, F) => {
      S(HL(-1.25, 1.25, -.5, 0), 0, .07);
      for (let i = 0; i < 9; i++) { const x = -1.1 + i * .275; S([[x, -.44, 0], [x, -.56, 0]], 0, 0); }
      [5, 6, 7, 8].forEach((i, k) => { const x = -1.1 + i * .275, top = -.2 + k * .26, h = k === 3 ? 1 : 0, z = .06 + k * .07;
        S([[x, -.5, z], [x, top, z]], h, .07); (h ? F : S)(RR(.3, .2, .04, x, top + .1, z), h, h ? .06 : 0); T(HL(x - .08, x + .08, top + .1, z), h, .045); S(AR(.035, 0, TAU, x, -.5, z, 8), h, 0); });
      T(HL(-1.1, -.1, -.74, 0), 0, .09);
    }),
    /* 사진 허락 — 카메라와 「좋아요」 표시 */
    camera: holo((S, T, F) => {
      F(RR(1.6, 1.04, .14, -.1, -.12, -.12)); S(RR(.42, .16, .05, -.5, .46, -.12), 0, .08);
      S(AR(.36, 0, TAU, -.1, -.12, .08, 32), 0, .075); S(AR(.24, 0, TAU, -.1, -.12, .2, 24), 1, .07); F(AR(.1, 0, TAU, -.1, -.12, .3, 12), 1, 0);
      S(AR(.05, 0, TAU, .52, .22, -.06, 8), 0, 0);
      F(AR(.22, 0, TAU, .78, .52, .3, 22), 1, .07); S([[.68, .52, .32], [.75, .45, .32], [.89, .6, .32]], 1, 0);
    }),
    /* 100점 체크리스트 — 점수 눈금판과 바늘 */
    gauge: holo((S, T, F) => {
      const cy = -.48, a = Math.PI * .3;
      S(AR(1.02, Math.PI, 0, 0, cy, -.08, 40), 0, .08);
      for (let i = 0; i <= 10; i++) { const t = Math.PI - i * Math.PI / 10, r2 = i % 5 ? .82 : .76; S([[Math.cos(t) * .9, cy + Math.sin(t) * .9, -.08], [Math.cos(t) * r2, cy + Math.sin(t) * r2, -.08]], 0, 0); }
      S(AR(1.02, Math.PI, a, 0, cy, .1, 30), 1, .06); S(AR(.94, Math.PI, a, 0, cy, .1, 30), 1, 0);
      S([[0, cy, .22], [Math.cos(a) * .74, cy + Math.sin(a) * .74, .22]], 1, .06); F(AR(.07, 0, TAU, 0, cy, .22, 12), 1, 0);
      T(HL(-.3, .3, -.74, 0), 0, .075);
    }),
    /* 질문지 → 블로그 글 — 질문 세 개가 글 한 편으로 */
    qna: holo((S, T, F) => {
      F(RR(1.1, 1.6, .06, .42, 0, -.14)); [.56, .38, .2, .02, -.16, -.34, -.52].forEach((y, i) => T(HL(.02, i === 6 ? .5 : .84, y, -.14), 0, .07));
      const q = (x, y, z, r, h) => { (h ? F : S)(AR(r, 0, TAU, x, y, z, 22), h, .07); S([...AR(r * .34, Math.PI * .95, -Math.PI * .35, x, y + r * .22, z + .02, 10), [x, y - r * .22, z + .02]], h, 0); S(AR(r * .05, 0, TAU, x, y - r * .5, z + .02, 6), h, 0); };
      q(-.78, .46, .1, .3, 1); q(-.42, -.14, .26, .22, 0); q(-.9, -.5, 0, .18, 0);
    }),
    /* 플레이스 판정표 — 지도 위에 꽂힌 핀 */
    pin: holo((S, T, F) => {
      const y0 = -.62; for (let i = -3; i <= 3; i++) { S([[i * .36, y0, -.75], [i * .36, y0, .75]], 0, i % 3 ? 0 : .09); S([[-1.08, y0, i * .25], [1.08, y0, i * .25]], 0, i % 3 ? 0 : .09); }
      [.22, .46].forEach(r => S(Array.from({ length: 33 }, (_, k) => { const a = k / 32 * TAU; return [Math.cos(a) * r, y0, Math.sin(a) * r]; }), 1, .07));
      const b = -Math.PI * .22; S([...AR(.34, b, Math.PI * 1.22, 0, .42, 0, 30), [0, y0, 0], [Math.cos(b) * .34, .42 + Math.sin(b) * .34, 0]], 1, .07);
      S(AR(.13, 0, TAU, 0, .44, 0, 14), 0, 0);
    }),
    /* 리뷰 문장 5개 — 별 다섯과 받은 리뷰 한 줄 */
    stars: holo((S, T, F) => {
      [-1, -.5, 0, .5, 1].forEach(x => { const c = 1 - Math.abs(x), p = Array.from({ length: 11 }, (_, k) => { const a = Math.PI / 2 + k * Math.PI / 5, r2 = k % 2 ? .088 : .21; return [x * .98 + Math.cos(a) * r2, .42 + c * .1 + Math.sin(a) * r2, .06 + c * .2]; }); F(p, 1, .1); });
      F(RR(1.8, .62, .16, 0, -.42, -.1)); S([[-.5, -.73, -.1], [-.62, -.9, -.1], [-.3, -.73, -.1]], 0, 0);
      T(HL(-.68, .66, -.33, -.1)); T(HL(-.68, .2, -.5, -.1));
    }),
    /* 숫자로 보이는 수업일지 — 공책 위로 솟은 기록 막대 */
    chart: holo((S, T, F) => {
      F(RR(1.36, 1.7, .07, .06, 0, -.14)); for (let i = 0; i < 7; i++) S(AR(.035, 0, TAU, -.52, .66 - i * .22, -.14, 6), 0, 0);
      T(HL(-.34, .3, .62, -.14)); T(HL(-.34, 0, .48, -.14), 0, .075);
      S(HL(-.36, .62, -.6, .1), 0, .08);
      const H = [.22, .4, .34, .62, .86]; H.forEach((v, i) => { const x = -.24 + i * .2, h = i === 4 ? 1 : 0; (h ? F : S)([[x - .065, -.6, .1], [x - .065, -.6 + v, .1], [x + .065, -.6 + v, .1], [x + .065, -.6, .1]], h, .07); });
      S(H.map((v, i) => [-.24 + i * .2, -.6 + v + .1, .26]), 1, .06);
    }),
    /* 재등록률·소진률 계산 — 비율 고리와 채워진 만큼 */
    donut: holo((S, T, F) => {
      S(AR(.86, 0, TAU, -.3, 0, -.1, 44), 0, .08); S(AR(.56, 0, TAU, -.3, 0, -.1, 36), 0, 0);
      const a0 = Math.PI / 2, a1 = Math.PI / 2 - TAU * .68;
      F([...AR(.86, a0, a1, -.3, 0, .12, 36), ...AR(.56, a1, a0, -.3, 0, .12, 30), [-.3, .86, .12]], 1, .07);
      S(AR(.07, 0, TAU, -.4, .1, .2, 8), 0, 0); S(AR(.07, 0, TAU, -.2, -.1, .2, 8), 0, 0); S([[-.18, .16, .2], [-.42, -.16, .2]], 0, 0);
      [0, 1, 2].forEach(i => { const y = .34 - i * .3; S(RR(.12, .12, .02, .82, y, .05), i === 0 ? 1 : 0, 0); T(HL(.96, 1.3, y, .05), i === 0 ? 1 : 0, .06); });
    }),
  });

  const cache = {};
  const items = cvs.map((cv, n) => {
    const k = cv.dataset.p3d;
    if (!cache[k]) { seed = 7 + k.length * 31; cache[k] = (SHAPES[k] || SHAPES.grid)(); }
    return { cv, ctx: cv.getContext('2d'), pts: cache[k], lines: cache[k].lines, swing: cache[k].swing, on: false, a: cache[k].swing ? (STILL ? .12 : n * 1.37) : (k.length * 1.3) % TAU, mx: 0, my: 0, tx: 0, ty: 0, w: 0, h: 0, glow: 0, tg: 0 };
  });

  const DPR = Math.min(2, devicePixelRatio || 1);
  const size = it => { const r = it.cv.getBoundingClientRect(); it.w = r.width; it.h = r.height; it.cv.width = Math.round(r.width * DPR); it.cv.height = Math.round(r.height * DPR); };
  const css = getComputedStyle(document.documentElement);
  const BLUE = (css.getPropertyValue('--blue-rgb') || '91,143,250').trim(), INK = (css.getPropertyValue('--ink-rgb') || '242,240,235').trim();

  function draw(it, dt) {
    const { ctx, w, h } = it; if (!w) return;
    it.a += dt * .00028;
    it.mx += (it.tx - it.mx) * .06; it.my += (it.ty - it.my) * .06; it.glow += (it.tg - it.glow) * .08;
    const ay = it.swing ? Math.sin(it.a * 2.1) * .46 + it.mx * .45 : it.a + it.mx * .6, ax = it.swing ? -.1 + it.my * .3 : -.32 + it.my * .35, cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    const S = Math.min(w, h) * (it.swing ? .46 : .47), F = 3.2;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, w, h);
    if (it.lines) for (const [pts, hot, fl] of it.lines) {
      let zs = 0; ctx.beginPath();
      pts.forEach(([x, y, z], i) => { const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx, k = F / (F - z2), px = w / 2 + x1 * S * k, py = h / 2 - y1 * S * k; zs += z2; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
      const d = Math.max(0, Math.min(1, (zs / pts.length + .8) / 1.6));
      if (fl) { ctx.fillStyle = hot ? `rgba(${BLUE},${.15 + it.glow * .1})` : `rgba(${INK},.04)`; ctx.fill(); }
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = hot ? 1.3 : 1;
      ctx.strokeStyle = hot ? `rgba(${BLUE},${.7 + d * .3})` : `rgba(${INK},${.27 + d * .23 + it.glow * .08})`; ctx.stroke();
    }
    const out = [];
    for (const [x, y, z, hot] of it.pts) {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const k = F / (F - z2); out.push([w / 2 + x1 * S * k, h / 2 - y1 * S * k, z2, hot, k]);
    }
    out.sort((p, q) => p[2] - q[2]);
    for (const [px, py, z, hot, k] of out) {
      const d = (z + 1.2) / 2.4, al = Math.max(.2, Math.min(1, .38 + d * .62)) * (.85 + it.glow * .15), r = (hot ? 1.7 : 1.2) * (it.swing ? .78 : 1) * k * (.8 + it.glow * .15);
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
