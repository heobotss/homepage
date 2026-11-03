/* 허봇스 개편 1102 — 공통 동작 (11-03 시각 90 판 · 2차).
   라이브러리: _lib\gsap.min.js · _lib\ScrollTrigger.min.js (GSAP 3.13.0, 상업 사용 무료) · _lib\lenis.min.js (Lenis 1.3.11, MIT). 외부 주소에서 불러오지 않는다.
   ① 30초 재 보기: 지금 사이트(site/index.html)의 #dist 분포와 pctOf·rank 계산 그대로. 화면 안에서만 계산하고 아무것도 저장·전송하지 않는다.
   ② 움직임: 효과지도_1103.md 의 화면별 주연 효과. 전부 html.fx(자바스크립트 + GSAP + 움직임 허용) 아래에서만 돈다.
      움직임 줄이기·GSAP 없음이면 .still 로 두고 전부 끈다. 글은 끝 상태에서 언제나 읽힌다.
      고정 화면은 CSS sticky 가 맡고, ScrollTrigger 는 진행도(0~1)만 읽는다.
   ③ 등뼈(.spine): 세 페이지 뒤에 고정된 WebGL 한 장. 화면(8~12천 점, 휴대폰 3.5천)의 점들이 스크롤에 따라 그 화면의 모양(data-shape)으로 모인다.
      v2(11-03): 모양은 전부 둥글고(은하 나선·고리 터널·레이더·궤도·빛무리·호·고리·곡선·글자), 섹션 진입 이벤트가 아니라 매 프레임 스크롤 자리에서 무게를 구해 모양 사이를 연속 보간한다.
      문의 점 우주(28,200개)도 같은 캔버스·같은 컨텍스트에 그린다(무대 자리에만). 마우스가 다가오면 살짝 흩어졌다 돌아온다. WebGL 없음·움직임 줄이기면 꺼진다.
   ④ 미리보기 층: 실제 주소(/trainer/ 등)를 그대로 적어 둔 링크를 이 폴더 안 파일·지금 살아 있는 대체 주소로 잇는다. 배포 때 ④만 뺀다. */

/* ★ 직접 교육한 트레이너·센터 대표 수. 실제로 센 숫자가 오면 여기 한 곳만 채운다(예: '1234'). 비어 있으면 숫자 없이 「직접 교육한 트레이너·센터 대표」만 쓴다. */
const 교육인원 = '';

(function () {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverable = matchMedia('(pointer:fine)').matches;
  const hasGS = !!(window.gsap && window.ScrollTrigger);
  const FX = !reduce && hasGS;
  root.classList.toggle('fx', FX);
  root.classList.toggle('still', !FX);
  if (FX) gsap.registerPlugin(ScrollTrigger);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const fmtNum = n => Number(n).toLocaleString('ko-KR');
  const wide = () => innerWidth > 900;
  const BAR = 64;
  const TONE = { black: '#0A0A0B', deep: '#0A0F1E', ink: '#121214' };
  /* 요소의 글자(빛 겹 .gl 제외) */
  const ownText = el => [...el.childNodes].filter(n => !(n.nodeType === 1 && n.classList.contains('gl'))).map(n => n.textContent).join('');

  document.querySelectorAll('[data-edu]').forEach(el => {
    const n = String(교육인원).replace(/[^\d]/g, '');
    el.textContent = n ? ' ' + fmtNum(n) + '명' : '';
  });

  /* ───────── 관성 스크롤 (Lenis) ───────── */
  let lenis = null;
  if (FX && window.Lenis) {
    lenis = new Lenis({ lerp: .085, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const goY = (y, ms) => {
    if (lenis) lenis.scrollTo(y, { duration: (ms || 1200) / 1000, easing: easeIO });
    else { root.style.scrollBehavior = 'auto'; scrollTo(0, y); root.style.scrollBehavior = ''; }
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || !lenis) return;
    const t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); lenis.scrollTo(t, { offset: -(BAR + 16), duration: 1.3, easing: easeIO });
  });

  /* ───────── ① 30초 재 보기 ───────── */
  const DIST = {
    리뷰수: { 이름: '방문자 리뷰', 단위: '건', 역방향: false, 중앙값: 69, q: [1,1,1,1,2,2,3,3,4,4,5,6,7,7,8,9,10,11,12,13,14,15,16,17,19,20,21,22,24,25,27,28,30,31,33,35,37,39,41,43,45,47,49,51,53,56,58,61,64,66,69,72,75,78,82,85,88,92,96,100,105,109,114,118,123,128,133,138,144,151,158,164,172,180,190,199,208,220,232,244,258,273,290,311,331,356,382,414,445,485,529,580,647,722,814,938,1084,1279,1560,2155,19294] },
    블로그카페리뷰: { 이름: '블로그 글', 단위: '건', 역방향: false, 중앙값: 65, q: [0,0,0,0,1,1,1,1,2,2,2,3,3,3,4,4,5,5,6,6,7,8,8,9,10,11,12,13,14,15,16,18,19,21,22,24,26,28,30,33,35,37,40,42,45,48,51,54,57,61,65,68,73,76,81,85,90,95,100,105,111,116,123,130,136,143,150,158,166,174,184,193,203,213,225,237,249,260,274,288,304,319,337,355,377,400,427,454,483,519,559,608,665,727,802,896,1029,1199,1464,1879,17956] },
    최근리뷰경과일: { 이름: '마지막 리뷰', 단위: '일', 역방향: true, 중앙값: 38, q: [0,0,0,1,1,1,1,1,1,2,2,2,2,3,3,3,4,4,4,5,5,6,6,6,7,7,8,8,9,9,10,11,12,13,13,14,15,16,17,19,20,22,23,25,27,28,30,31,34,36,38,41,43,46,49,53,56,60,64,67,72,77,82,88,95,102,111,119,128,141,151,162,175,191,212,229,248,273,301,328,364,400,435,479,531,582,644,711,771,834,912,980,1068,1136,1222,1322,1414,1540,1703,1999,3482] }
  };
  function pctOf(m, v) {
    const q = m.q;
    if (v <= q[0]) { if (v < q[0]) return -1; let b = 0; while (b < 100 && q[b + 1] === q[0]) b++; return b / 2; }
    if (v >= q[100]) return 100;
    let i = 1; for (; i <= 100 && v > q[i]; i++) {}
    if (q[i] === v) { let a = i; while (a > 0 && q[a - 1] === v) a--; let b = i; while (b < 100 && q[b + 1] === v) b++; return (a + b) / 2; }
    const span = q[i] - q[i - 1];
    return (i - 1) + (span > 0 ? (v - q[i - 1]) / span : 0);
  }
  function rank(m, v) {
    const pc = pctOf(m, v);
    if (pc < 0) return { out: true, text: '표본 밖', top: 0 };
    const top = Math.max(1, Math.min(99, Math.round(m.역방향 ? pc : 100 - pc)));
    return { out: false, top, text: top <= 50 ? '상위 ' + top + '%' : '하위 ' + (100 - top) + '%' };
  }
  function ridge(m) {
    if (m.능선) return m.능선;
    const q = m.q, lo = q[0];
    let hi = q[97]; if (!(hi > lo)) hi = q[100];
    const P = 0.42, K = Math.pow(hi - lo + 1, P) - 1;
    const X = v => { const c = clamp(v, lo, hi); return 0.02 + (K > 0 ? (Math.pow(c - lo + 1, P) - 1) / K : 0) * 0.96; };
    const B = 76, W = 320, H = 96; const bin = new Array(B + 1).fill(0);
    for (let k = 0; k < 97; k++) {
      const a = X(q[k]) * B, b = X(q[k + 1]) * B;
      if (b - a < 1e-9) { bin[Math.min(B, Math.round(a))] += 1; continue; }
      const dens = 1 / (b - a);
      for (let j = Math.floor(a); j <= Math.min(B, Math.floor(b)); j++) { const s0 = Math.max(a, j), e0 = Math.min(b, j + 1); if (e0 > s0) bin[j] += dens * (e0 - s0); }
    }
    for (let r = 0; r < 2; r++) { const c0 = bin.slice(); for (let j = 0; j <= B; j++) bin[j] = (c0[Math.max(0, j - 1)] + c0[j] * 2 + c0[Math.min(B, j + 1)]) / 4; }
    const mx = Math.max(...bin);
    const d = ['M0,' + H], hs = [];
    for (let j = 0; j <= B; j++) { const hh = mx > 0 ? bin[j] / mx : 0; hs.push(hh); d.push('L' + (j / B * W).toFixed(1) + ',' + (H - hh * (H - 4)).toFixed(1)); }
    d.push('L' + W + ',' + H + 'Z');
    m.능선 = { d: d.join(' '), X, W, H, hs };
    return m.능선;
  }

  document.querySelectorAll('[data-tool]').forEach(tool => {
    const fxKind = tool.dataset.fx || '';
    const inputs = [...tool.querySelectorAll('input[data-k]')];
    const box = tool.querySelector('.res');
    const rankEl = box.querySelector('.rank'), sayEl = box.querySelector('.say'), other = box.querySelector('.other');
    const svg = box.querySelector('.ridge'), pathEl = svg.querySelector('path');
    const mark = box.querySelector('.mark'), mid = box.querySelector('.mid'), footL = box.querySelector('.foot-l');
    const nextEl = tool.querySelector('.next');
    let last = inputs[0].dataset.k, lastRank = '', drawnFor = '';
    if (FX && fxKind === 'gauge') inputs.forEach(i => { const g = document.createElement('span'); g.className = 'gauge'; g.setAttribute('aria-hidden', 'true'); g.append(document.createElement('i')); i.closest('.fld').append(g); });
    function setRank(text, on) {
      rankEl.classList.toggle('on', on);
      const m = FX && fxKind === 'slot' && /^(상위|하위) (\d+)%$/.exec(text);
      if (!m || text === lastRank) { if (!m) rankEl.textContent = text; lastRank = text; return; }
      lastRank = text;
      rankEl.textContent = ''; rankEl.setAttribute('aria-label', text);
      rankEl.append(m[1] + ' '); /* flex 안에서 보통 공백은 사라지므로 묶음 공백 */
      [...m[2]].forEach((ch, k) => {
        const rd = document.createElement('span'); rd.className = 'rd';
        for (let r = 0; r < 20; r++) { const i = document.createElement('i'); i.textContent = r % 10; rd.append(i); }
        rankEl.append(rd);
        gsap.fromTo(rd.children, { y: 0 }, { y: '-' + ((10 + +ch) * 1.1) + 'em', duration: .9 + k * .25, ease: 'power3.out', delay: k * .08 });
      });
      rankEl.append('%');
    }
    function draw(key) {
      if (!FX || drawnFor === key) return; drawnFor = key;
      const len = pathEl.getTotalLength();
      svg.classList.remove('drawn');
      gsap.fromTo(pathEl, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', onComplete: () => svg.classList.add('drawn') });
    }
    function paint() {
      const m = DIST[last], rg = ridge(m);
      svg.setAttribute('viewBox', '0 0 ' + rg.W + ' ' + rg.H);
      pathEl.setAttribute('d', rg.d);
      mid.style.left = (rg.X(m.중앙값) * 100).toFixed(2) + '%';
      footL.textContent = '전국 중앙값 ' + fmtNum(m.중앙값) + m.단위;
      const cur = inputs.find(i => i.dataset.k === last);
      const raw = cur.value.trim();
      if (raw === '' || !(Number(raw) >= 0)) {
        setRank('상위 ○%', false); mark.classList.remove('on');
        sayEl.textContent = '전국 28,200곳 기준';
        if (nextEl) nextEl.hidden = true;
      } else {
        const v = Number(raw), r = rank(m, v);
        draw(last);
        setRank(r.out ? '표본 밖' : r.text, true);
        mark.style.left = (rg.X(v) * 100).toFixed(2) + '%'; mark.classList.add('on');
        sayEl.textContent = m.이름 + ' ' + fmtNum(v) + m.단위 + (m.역방향 ? ' 전' : '') + ' · 전국 중앙값 ' + fmtNum(m.중앙값) + m.단위 + (m.역방향 ? ' 전' : '');
        if (nextEl) nextEl.hidden = false;
      }
      inputs.forEach(i => {
        const g = i.closest('.fld').querySelector('.gauge i'); if (!g) return;
        const vv = i.value.trim(); const mm = DIST[i.dataset.k];
        if (vv === '' || !(Number(vv) >= 0)) { g.style.width = '0'; return; }
        const pc = Math.max(0, pctOf(mm, Number(vv))); g.style.width = (mm.역방향 ? 100 - pc : pc).toFixed(1) + '%';
      });
      if (other) {
        other.textContent = '';
        inputs.filter(i => i.dataset.k !== last && i.value.trim() !== '' && Number(i.value) >= 0).forEach(i => {
          const mm = DIST[i.dataset.k], rr = rank(mm, Number(i.value));
          const p = document.createElement('p'); const s = document.createElement('span'); const b = document.createElement('b');
          s.textContent = mm.이름; b.textContent = rr.text; p.append(s, b); other.append(p);
        });
        other.hidden = !other.childElementCount;
      }
    }
    inputs.forEach(i => {
      i.addEventListener('input', () => { last = i.dataset.k; paint(); });
      i.addEventListener('focus', () => { if (i.value.trim() !== '') { last = i.dataset.k; paint(); } });
    });
    tool.addEventListener('submit', e => e.preventDefault());
    paint();
    if (!FX) svg.classList.add('drawn');
  });

  /* ───────── 공통 바탕 효과 ───────── */
  if (FX) {
    const g = document.createElement('div'); g.className = 'grain'; g.setAttribute('aria-hidden', 'true');
    const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'); const id = x.createImageData(160, 160); const d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    x.putImageData(id, 0, 0); g.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    document.body.append(g);
    let gt = 0; gsap.ticker.add(t => { if (t - gt > .12) { gt = t; g.style.backgroundPosition = (Math.random() * 160 | 0) + 'px ' + (Math.random() * 160 | 0) + 'px'; } });
  }
  const top = document.querySelector('.top');
  if (FX && top) addEventListener('scroll', () => top.classList.toggle('thin', scrollY > 40), { passive: true });
  /* 단추 + 하단 사다리 카드(v3): 테두리를 도는 빛(.sp). 자석(커서 따라오기)은 단추에만, 마우스 기기에서만 */
  if (FX) document.querySelectorAll('.btn, .ladder a').forEach(b => {
    const sp = document.createElement('i'); sp.className = 'sp'; sp.setAttribute('aria-hidden', 'true'); b.append(sp);
    if (!hoverable || !b.classList.contains('btn')) return;
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .32, duration: .45, ease: 'power2.out' }); });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.45)' }));
  });
  if (FX && hoverable) document.querySelectorAll('.glass').forEach(g => {
    g.addEventListener('pointermove', e => { const r = g.getBoundingClientRect(); g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px'); g.classList.add('lit'); });
    g.addEventListener('pointerleave', () => g.classList.remove('lit'));
  });
  const veil = (function () {
    if (!FX) return { cover: (cb) => cb() };
    const c = document.createElement('canvas'); c.className = 'veil'; c.setAttribute('aria-hidden', 'true'); document.body.append(c);
    const x = c.getContext('2d'); const S = 44;
    function run(dir, ox, oy, cb) {
      c.width = innerWidth; c.height = innerHeight;
      const cols = Math.ceil(innerWidth / S) + 1, rows = Math.ceil(innerHeight / S) + 1, maxD = Math.hypot(innerWidth, innerHeight);
      const t0 = performance.now(), dur = 620;
      function f(now) {
        const t = clamp((now - t0) / dur, 0, 1);
        x.clearRect(0, 0, c.width, c.height); x.fillStyle = '#4F86F7';
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
          const px = i * S, py = j * S, dd = Math.hypot(px - ox, py - oy) / maxD;
          let k = clamp((t * 1.45 - dd * .45) / 1, 0, 1); if (dir < 0) k = 1 - k;
          const r = S * .78 * easeIO(k); if (r <= 0) continue;
          x.beginPath(); x.arc(px, py, r, 0, 6.2832); x.fill();
        }
        if (t < 1) requestAnimationFrame(f); else { if (dir < 0) x.clearRect(0, 0, c.width, c.height); cb && cb(); }
      }
      requestAnimationFrame(f);
    }
    if (sessionStorage.getItem('hb-veil')) { sessionStorage.removeItem('hb-veil'); run(-1, innerWidth / 2, innerHeight / 2); }
    return { cover: (cb, ox, oy) => run(1, ox == null ? innerWidth / 2 : ox, oy == null ? innerHeight / 2 : oy, () => { sessionStorage.setItem('hb-veil', '1'); cb(); }) };
  })();
  /* 점 커서 + 마우스를 따라오는 빛 + 섹션마다 번지는 빛 */
  const ptr = { x: innerWidth / 2, y: innerHeight / 3, on: false };
  (function () {
    const fx = document.querySelector('.bgfx'), dot = document.querySelector('.dot');
    if (!FX || !fx) return;
    const light = fx.querySelector('.light'), glow = fx.querySelector('.glow');
    let tx = innerWidth * .5, ty = innerHeight * .3, lx = tx, ly = ty, dx = tx, dy = ty, moved = false, t0 = performance.now();
    if (hoverable && dot) {
      root.classList.add('cur');
      const lab = document.createElement('em'); dot.append(lab);
      addEventListener('pointermove', e => {
        tx = e.clientX; ty = e.clientY; moved = true; ptr.x = tx; ptr.y = ty; ptr.on = true;
        dot.style.opacity = 1;
        const t = e.target; const cl = t.closest ? t.closest.bind(t) : () => null;
        const pick = cl('[data-cur="보기"], .ring .pane, .wall img, .proof .shot, .cols img, .card-it img');
        const drag = cl('[data-cur="끌기"]');
        const link = !pick && !drag && cl('a, button, label, .card-link');
        dot.classList.toggle('pick', !!pick); dot.classList.toggle('drag', !!drag && !pick); dot.classList.toggle('link', !!link); dot.classList.toggle('big', !!link && !cl('input'));
        lab.textContent = pick ? '보기' : drag ? '끌기' : '';
      }, { passive: true });
      document.addEventListener('pointerleave', () => { dot.style.opacity = 0; ptr.on = false; });
    }
    const lightOn = () => hoverable || innerWidth > 720; /* 폰은 .light 를 CSS 로 끄므로 매 프레임 자리 계산도 건너뛴다(11-03 모바일 점검) */
    gsap.ticker.add(() => {
      const now = performance.now();
      if (!moved) { const t = (now - t0) / 1000; tx = innerWidth * (.5 + .32 * Math.sin(t * .23)); ty = innerHeight * (.35 + .22 * Math.cos(t * .17)); }
      lx += (tx - lx) * .06; ly += (ty - ly) * .06;
      if (lightOn()) light.style.transform = 'translate(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px)';
      if (dot && hoverable) { dx += (tx - dx) * .25; dy += (ty - dy) * .25; dot.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)'; }
    });
    const POS = { l: [.12, .55], c: [.5, .5], r: [.88, .55], b: [.5, 1.05] };
    let cur = null;
    const ioG = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting || e.target === cur) return;
        cur = e.target;
        const k = POS[e.target.dataset.glow] || POS.b, x = innerWidth * k[0], y = innerHeight * k[1];
        glow.style.transform = 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px)';
      });
    }, { threshold: .3 });
    document.querySelectorAll('[data-glow]').forEach(s => ioG.observe(s));
  })();
  if (FX) {
    let tone = 'black';
    const setTone = k => { if (tone === k || !TONE[k]) return; tone = k; gsap.to(root, { '--bg': TONE[k], duration: 1.4, ease: 'power2.out' }); };
    document.querySelectorAll('[data-tone]').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: self => { if (self.isActive) setTone(s.dataset.tone); } }));
    ScrollTrigger.create({ start: 0, end: 300, onLeaveBack: () => setTone('black') });
  }

  /* ───────── ③ 등뼈 — 세 페이지 뒤에 고정된 점 한 장 ─────────
     v2(11-03, 대표님 2·9번 + 클로드 11번). 모양은 「섹션 진입 때 한 번 바꾸기」가 아니라 매 프레임 스크롤 자리에서 계산한다.
       · data-shape 섹션마다 점 N개의 자리(loc, 요소 자리 0~1)와 밝기(wt)를 미리 만들어 둔다(화면 크기·글꼴이 바뀌면 다시).
       · 매 프레임, 섹션이 화면을 덮는 비율(0~1)에서 무게 w 를 매끈하게(smoothstep .3→.8) 구하고,
         점의 목표 = Σ w·그 모양 자리 + (1−Σw)·흩어진 자리. 두 모양이 겹치는 구간은 그 사이를 직선으로 건너간다.
       · 그래서 어디서 멈추든 중간 모양이 자연스럽고, 빠른 스크롤·역스크롤에서도 상태가 꼬일 것이 없다(기억하는 상태가 없다).
     v1 의 오류 원인(대표님 「아래로 스크롤하면 잘 안 된다」): ScrollTrigger onToggle 로 모양을 한 번만 바꿨고, 겹친 두 섹션 중 나중 것이 이기며,
       먼저 켜진 섹션이 나가도 남은 섹션의 모양을 되살리지 않았다(상태 꼬임). 또 바뀔 때마다 점 배정을 다시 섞어(Math.random) 점이 화면을 가로질러 날았고,
       「화면 밖 = 흩어짐」 뒤에 다음 모양이 따로 시작돼 끊겼다. 지금은 배정이 고정(씨앗 난수)이고 모양 사이를 보간한다.
     모양은 전부 둥근 것: galaxy(은하 나선·매듭 4) rings(고리 터널 4) radar(기울어진 레이더) orbit(타원 궤도 둘) halo(빛무리) arcs(호 둘) ring curve fan text.
     검수: window.__spineBounds() = 지금 가장 센 모양의 점들이 실제로 있는 자리(px, 가운데 좌표 포함). window.__spineShapes() = 섹션별 무게 */
  const spine = (function () {
    if (!FX) return null;
    const c = document.createElement('canvas'); c.className = 'spine'; c.setAttribute('aria-hidden', 'true');
    const bg = document.querySelector('.bgfx'); if (bg) bg.after(c); else document.body.prepend(c);
    let gl = null;
    try { gl = c.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false }); } catch (err) { gl = null; }
    if (!gl) { root.classList.add('nostars'); c.remove(); return null; }
    function shader(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    function program(vs, fs, attrs, unis) {
      const p = gl.createProgram(); gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const A = {}, U = {}; attrs.forEach(n => { A[n] = gl.getAttribLocation(p, n); }); unis.forEach(n => { U[n] = gl.getUniformLocation(p, n); });
      return { p, A, U };
    }
    const FRAG = 'precision mediump float;varying float V,K;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float e=pow(1.-r*2.,1.6);vec3 c=mix(vec3(.2,.42,.97),vec3(.86,.92,1.),K)*e*V;gl_FragColor=vec4(c,clamp(max(c.r,max(c.g,c.b)),0.,1.));}';
    let PD;
    try {
      PD = program('attribute vec2 p;attribute float s,w;uniform float T,PX,A;varying float V,K;void main(){gl_Position=vec4(p,0.,1.);float tw=.7+.3*sin(T*(1.+s*2.)+s*80.);gl_PointSize=(1.4+s*s*2.6)*PX*(.5+.8*w);V=(.32+.7*s*s)*tw*A*(.28+.72*w);K=clamp(s*s*1.2+max(0.,w-1.)*.5,0.,1.);}', FRAG, ['p', 's', 'w'], ['T', 'PX', 'A']);
    } catch (err) { root.classList.add('nostars'); c.remove(); return null; }
    let W = innerWidth, H = innerHeight, dpr = 1;
    function size() { dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; c.width = Math.max(1, Math.round(W * dpr)); c.height = Math.max(1, Math.round(H * dpr)); }
    size();
    const N = wide() ? clamp(Math.round(innerWidth * innerHeight / 125), 8000, 12000) : 2600; /* 폰 3,500 → 2,600 (11-03 모바일 점검: 프레임 확보) */
    const pos = new Float32Array(N * 2), vel = new Float32Array(N * 2), sr = new Float32Array(N), wt = new Float32Array(N), scat = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) { sr[i] = Math.random(); scat[i * 2] = Math.random(); scat[i * 2 + 1] = Math.random(); pos[i * 2] = scat[i * 2] * 2 - 1; pos[i * 2 + 1] = 1 - scat[i * 2 + 1] * 2; wt[i] = .5; }
    const bufP = gl.createBuffer(), bufS = gl.createBuffer(), bufW = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufS); gl.bufferData(gl.ARRAY_BUFFER, sr, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufW); gl.bufferData(gl.ARRAY_BUFFER, wt, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufP); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.clearColor(0, 0, 0, 0);
    /* 씨앗 난수 — 모양마다 같은 씨앗이라 창 크기가 바뀌어 다시 만들어도 점 배정이 같다(점이 날아가지 않는다) */
    function prng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    const gauss = R => (R() + R() + R() - 1.5) / 1.5; /* −1~1, 가운데가 두꺼움 */
    const TAU = 6.283185307;
    /* 모양 — (el, r=요소 자리, R=난수) → { pts:[[u,v,wt?]…], use, jit, arm? } . u·v 는 요소 자리 0~1. 원은 px 로 재서 둥글게 그린다 */
    const SH = {
      /* 은하 나선(트레이너 네 단계) — 팔 둘, 가운데 핵, 바깥 흐린 원반. 팔 위 밝은 매듭 4개가 네 단계. arm(t) 는 매듭 1→4 를 지나는 팔의 자리 */
      galaxy: (el, r, R) => {
        const w = r.width, h = r.height, Rm = .46 * Math.min(w, h), cx = .5, cy = .5, ty = .8;
        const arm = (t, k) => { const th = t * 7.2 + (k || 0) * Math.PI - 1.2, ro = Rm * (.08 + .92 * Math.pow(t, 1.15)); return [cx + Math.cos(th) * ro / w, cy + Math.sin(th) * ro * ty / h]; };
        const pts = [];
        for (let k = 0; k < 2; k++) for (let i = 0; i < 1300; i++) { const t = Math.pow(R(), .85), p = arm(t, k), sg = 3 + 16 * t; pts.push([p[0] + gauss(R) * sg / w, p[1] + gauss(R) * sg * ty / h, .75 + .45 * (1 - t)]); }
        for (let i = 0; i < 520; i++) pts.push([cx + gauss(R) * Rm * .1 / w, cy + gauss(R) * Rm * .1 * ty / h, 1.15]);
        for (let i = 0; i < 700; i++) { const a = R() * TAU, ro = Rm * 1.06 * Math.sqrt(R()); pts.push([cx + Math.cos(a) * ro / w, cy + Math.sin(a) * ro * ty / h, .3]); }
        const KT = [.2, .44, .68, .92];
        KT.forEach(t => { const p = arm(t, 0); for (let i = 0; i < 110; i++) pts.push([p[0] + gauss(R) * 7 / w, p[1] + gauss(R) * 7 * ty / h, 1.9]); });
        return { pts, use: .64, jit: .0015, arm: t => arm(t, 0), knots: KT };
      },
      /* 고리 터널(센터 네 단계) — 동심원 4개, 중심은 요소 정중앙. 안쪽(먼) 고리는 어둡고 촘촘, 바깥(가까운) 고리는 밝다. 고리 사이에 흩뿌린 점 */
      rings: (el, r, R) => {
        const w = r.width, h = r.height, m = Math.min(w, h), pts = [];
        [.13, .23, .33, .43].forEach((f, k) => { const ro = f * m, n = 520 + k * 240, sg = 2.5 + k * 2; for (let i = 0; i < n; i++) { const a = (i + R()) / n * TAU, d = ro + gauss(R) * sg; /* 각도는 고르게(가운데가 정확히 요소 가운데) */ pts.push([.5 + Math.cos(a) * d / w, .5 + Math.sin(a) * d / h, .55 + .15 * k]); } });
        for (let i = 0; i < 480; i++) { const a = R() * TAU, d = m * (.1 + .36 * R()); pts.push([.5 + Math.cos(a) * d / w, .5 + Math.sin(a) * d / h, .3]); }
        return { pts, use: .6, jit: .001, center: [.5, .5] };
      },
      /* 기울어진 레이더(센터 첫 화면) — 동네 지도 위 동심 타원 5개 + 살 12 + 그 위에 흩어진 센터 점들 */
      radar: (el, r, R) => {
        const w = r.width, h = r.height, cx = .5, cy = .66, Rm = .5 * w, ty = .36, pts = [];
        [.14, .26, .38, .5, .62].forEach((f, k) => { const ro = f * Rm; for (let i = 0; i < 560; i++) { const a = R() * TAU, d = ro + gauss(R) * 2.5; pts.push([cx + Math.cos(a) * d / w, cy + Math.sin(a) * d * ty / h, .6 + .08 * k]); } });
        for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; for (let i = 0; i < 90; i++) { const d = Rm * (.1 + .55 * i / 89); pts.push([cx + Math.cos(a) * d / w, cy + Math.sin(a) * d * ty / h, .4]); } }
        for (let i = 0; i < 360; i++) { const a = R() * TAU, d = Rm * .64 * Math.sqrt(R()); pts.push([cx + Math.cos(a) * d / w, cy + Math.sin(a) * d * ty / h, 1.3]); }
        return { pts, use: .6, jit: .0015 };
      },
      /* 타원 궤도 둘(내 이름 카드) — 카드를 ±28° 로 도는 두 궤도 */
      orbit: (el, r, R) => {
        const w = r.width, h = r.height, a = .78 * w, b = .34 * h, pts = [];
        [-.49, .49].forEach(rot => { const cr = Math.cos(rot), sn = Math.sin(rot); for (let i = 0; i < 1000; i++) { const t = R() * TAU, x = Math.cos(t) * a, y = Math.sin(t) * b; pts.push([.5 + (x * cr - y * sn) / w + gauss(R) * 2 / w, .5 + (x * sn + y * cr) / h + gauss(R) * 2 / h, .9]); } });
        for (let i = 0; i < 300; i++) { const t = R() * TAU, d = Math.sqrt(R()); pts.push([.5 + Math.cos(t) * a * d / w, .5 + Math.sin(t) * b * d * 1.6 / h, .3]); }
        return { pts, use: .46, jit: .001 };
      },
      /* 빛무리(수업일지 폰) — 폰을 감싸는 둥근 고리 + 안쪽 흐린 원반 */
      halo: (el, r, R) => {
        const w = r.width, h = r.height, Rm = .62 * h, pts = [];
        for (let i = 0; i < 1500; i++) { const a = (i + R()) / 1500 * TAU, d = Rm + gauss(R) * 11; pts.push([.5 + Math.cos(a) * d / w, .5 + Math.sin(a) * d / h, .95]); }
        for (let i = 0; i < 520; i++) { const a = R() * TAU, d = Rm * .96 * Math.sqrt(R()); pts.push([.5 + Math.cos(a) * d / w, .5 + Math.sin(a) * d / h, .3]); }
        return { pts, use: .5, jit: .001 };
      },
      /* 호 둘(센터 2.3배) — 같은 중심의 호 둘, 바깥 호가 2.3 몫(230°)·안쪽 호가 1 몫(100°). 흐린 온전한 원이 눈금 자리 */
      arcs: (el, r, R) => {
        const w = r.width, h = r.height, cx = .72, cy = .5, pts = [];
        [[.4 * h, 230, 1, 960], [.28 * h, 100, .7, 520]].forEach(([ro, deg, wt0, n]) => {
          for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + R() * deg / 360 * TAU, d = ro + gauss(R) * 3; pts.push([cx + Math.cos(a) * d / w, cy + Math.sin(a) * d / h, wt0]); }
          for (let i = 0; i < 300; i++) { const a = R() * TAU, d = ro + gauss(R) * 1.5; pts.push([cx + Math.cos(a) * d / w, cy + Math.sin(a) * d / h, .28]); }
        });
        return { pts, use: .5, jit: .001 };
      },
      /* 다이얼 고리(트레이너 100점) — 그대로 둥글다 */
      ring: (el, r, R) => { const pts = []; for (let i = 0; i < 1500; i++) { const a = R() * TAU; pts.push([.5 + Math.cos(a) * .47, .5 + Math.sin(a) * .47, 1]); } for (let i = 0; i < 500; i++) { const a = R() * TAU; pts.push([.5 + Math.cos(a) * .4, .5 + Math.sin(a) * .4, .8]); } return { pts, use: .6, jit: .004 }; },
      /* 부채꼴(센터 사례 책상) */
      fan: (el, r, R) => { const pts = []; [.3, .5, .7, .9].forEach(ro => { for (let i = 0; i < 300; i++) { const a = (-.95 + 1.9 * i / 299); pts.push([.5 + Math.sin(a) * ro * .66, 1.08 - Math.cos(a) * ro, 1]); } }); [-.95, -.475, 0, .475, .95].forEach(a => { for (let i = 0; i < 120; i++) { const ro = .2 + .72 * i / 119; pts.push([.5 + Math.sin(a) * ro * .66, 1.08 - Math.cos(a) * ro, .8]); } }); return { pts, use: .6, jit: .004 }; },
      /* 분포 곡선(문 숫자 띠) */
      curve: (el, r, R) => { const hs = ridge(DIST.리뷰수).hs, pts = []; for (let i = 0; i < 1800; i++) { const t = i / 1799, x = t * (hs.length - 1), k = Math.floor(x), f = x - k, hh = hs[k] * (1 - f) + (hs[Math.min(hs.length - 1, k + 1)] || 0) * f; pts.push([.04 + t * .92, .78 - hh * .5, 1]); } return { pts, use: .6, jit: .006 }; },
      /* 글자(거대한 이름) — 글자를 캔버스에 찍어 칠해진 자리만 */
      text: (el, r, R) => {
        const cs = getComputedStyle(el), txt = el.dataset.t || ownText(el);
        const Wd = Math.ceil(r.width) + 8, Hd = Math.ceil(r.height) + 8; if (Wd < 10 || Hd < 10 || !txt) return { pts: [], use: 0 };
        const cv = document.createElement('canvas'); cv.width = Wd; cv.height = Hd; const x = cv.getContext('2d');
        x.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; if ('letterSpacing' in x) x.letterSpacing = cs.letterSpacing;
        x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText(txt, 4, Hd / 2);
        const px = x.getImageData(0, 0, Wd, Hd).data, pts = [], st = Math.max(3, Math.round(Wd / 260));
        for (let j = 0; j < Hd; j += st) for (let i = 0; i < Wd; i += st) if (px[(j * Wd + i) * 4 + 3] > 110) pts.push([(i - 4) / r.width, (j - 4) / r.height, 1]);
        return { pts, use: .9, jit: .002 };
      }
    };
    /* 섹션별 모양 등록 — data-shape="galaxy|rings|radar|orbit|halo|arcs|ring|fan|curve|text", data-shape-el 은 그 화면 안의 요소(자리 기준) */
    const secs = [...document.querySelectorAll('[data-shape]')].filter(s => SH[s.dataset.shape]);
    const shapes = secs.map((sec, k) => ({ sec, kind: sec.dataset.shape, sel: sec.dataset.shapeEl || '', el: null, loc: new Float32Array(N * 2), wt: new Float32Array(N), K: 0, ok: false, w: 0, seed: 1000 + k * 7919, meta: {} }));
    function build(sh) {
      sh.el = sh.sel ? sh.sec.querySelector(sh.sel) : sh.sec; sh.ok = false;
      if (!sh.el) return;
      const r = sh.el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
      const R = prng(sh.seed), s = SH[sh.kind](sh.el, r, R), pts = s.pts, M = pts.length;
      sh.meta = s; sh.K = M ? Math.min(N, Math.round(N * (s.use || .6))) : 0;
      if (!M) return;
      for (let i = M - 1; i > 0; i--) { const j = R() * (i + 1) | 0; const t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
      const jit = s.jit || .002;
      for (let i = 0; i < N; i++) {
        if (i < sh.K) { const p = pts[i % M]; sh.loc[i * 2] = p[0] + (R() - .5) * jit; sh.loc[i * 2 + 1] = p[1] + (R() - .5) * jit; sh.wt[i] = p[2] == null ? 1 : p[2]; }
        else { sh.loc[i * 2] = scat[i * 2]; sh.loc[i * 2 + 1] = scat[i * 2 + 1]; sh.wt[i] = .22; }
      }
      sh.ok = true;
    }
    function buildAll() { shapes.forEach(build); }
    buildAll();
    /* 무게: 섹션이 화면을 덮는 비율(섹션이 화면보다 작으면 그 높이 기준) → smoothstep(.3, .8) */
    const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    function weigh() {
      shapes.forEach(sh => {
        if (!sh.ok) { sh.w = 0; return; }
        const r = sh.sec.getBoundingClientRect(), hm = Math.max(1, Math.min(r.height, H));
        const cov = (Math.min(r.bottom, H) - Math.max(r.top, 0)) / hm;
        sh.w = r.bottom < -H || r.top > 2 * H ? 0 : smooth(.3, .8, cov);
        sh.r = sh.w > 0 ? sh.el.getBoundingClientRect() : null;
      });
    }
    /* 검수용 */
    window.__spineShapes = () => shapes.map(sh => ({ kind: sh.kind, w: +sh.w.toFixed(3), ok: sh.ok }));
    window.__spineBounds = () => {
      let top = null; shapes.forEach(sh => { if (!top || sh.w > top.w) top = sh; });
      if (!top || top.w < .5 || !top.K) return null;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, sx = 0, sy = 0, n = 0;
      for (let i = 0; i < top.K; i++) { if (top.wt[i] < .5) continue; const x = (pos[i * 2] + 1) / 2 * W, y = (1 - pos[i * 2 + 1]) / 2 * H; n++; sx += x; sy += y; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (!n) return null;
      const er = top.el.getBoundingClientRect();
      return { kind: top.kind, w: +top.w.toFixed(3), left: x0, top: y0, right: x1, bottom: y1, cx: sx / n, cy: sy / n, elCx: er.left + er.width / 2, elCy: er.top + er.height / 2, n };
    };
    let doorDraw = null, hidden = false;
    document.addEventListener('visibilitychange', () => { hidden = document.hidden; });
    const t0 = performance.now();
    function bindDots() {
      gl.useProgram(PD.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufP); gl.enableVertexAttribArray(PD.A.p); gl.vertexAttribPointer(PD.A.p, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufS); gl.enableVertexAttribArray(PD.A.s); gl.vertexAttribPointer(PD.A.s, 1, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufW); gl.enableVertexAttribArray(PD.A.w); gl.vertexAttribPointer(PD.A.w, 1, gl.FLOAT, false, 0, 0);
    }
    const act = [];
    gsap.ticker.add(() => {
      if (hidden) return;
      const t = (performance.now() - t0) / 1000;
      gl.viewport(0, 0, c.width, c.height); gl.clear(gl.COLOR_BUFFER_BIT);
      let cover = 0;
      if (doorDraw) cover = doorDraw(t);
      const A = .8 * (1 - cover); if (A <= .01) return;
      weigh();
      act.length = 0; let sum = 0;
      shapes.forEach(sh => { if (sh.w > .002 && sh.r) { act.push(sh); sum += sh.w; } });
      const nm = sum > 1 ? 1 / sum : 1, scW = 1 - sum * nm;
      act.forEach(sh => { const r = sh.r; sh.k = sh.w * nm; sh.ax = r.left / W * 2 - 1; sh.aw = r.width / W * 2; sh.ay = 1 - r.top / H * 2; sh.ah = r.height / H * 2; });
      const px = ptr.x / W * 2 - 1, py = 1 - ptr.y / H * 2, push = ptr.on && hoverable, na = act.length;
      for (let i = 0; i < N; i++) {
        const j = i * 2, k = .045 + sr[i] * .065;
        let tx = scW * (scat[j] * 2 - 1), ty = scW * (1 - scat[j + 1] * 2), tw = scW * .5;
        for (let a = 0; a < na; a++) { const sh = act[a]; tx += sh.k * (sh.ax + sh.loc[j] * sh.aw); ty += sh.k * (sh.ay - sh.loc[j + 1] * sh.ah); tw += sh.k * sh.wt[i]; }
        wt[i] = tw;
        let vx = vel[j] * .84, vy = vel[j + 1] * .84;
        if (push) { const dx = (pos[j] - px) * W * .5, dy = (pos[j + 1] - py) * H * .5, d = Math.hypot(dx, dy); if (d < 160 && d > .1) { const f = (1 - d / 160) * .9; vx += dx / d * f * 2 / W * 2.2; vy += dy / d * f * 2 / H * 2.2; } }
        vel[j] = vx; vel[j + 1] = vy;
        pos[j] += (tx - pos[j]) * k + vx; pos[j + 1] += (ty - pos[j + 1]) * k + vy;
      }
      bindDots();
      gl.bindBuffer(gl.ARRAY_BUFFER, bufP); gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufW); gl.bufferSubData(gl.ARRAY_BUFFER, 0, wt);
      gl.uniform1f(PD.U.T, t); gl.uniform1f(PD.U.PX, dpr); gl.uniform1f(PD.U.A, A);
      gl.drawArrays(gl.POINTS, 0, N);
    });
    let rsT = 0;
    addEventListener('resize', () => { size(); clearTimeout(rsT); rsT = setTimeout(buildAll, 150); });
    return { gl, c, program, shader, FRAG, get dpr() { return dpr; }, get W() { return W; }, get H() { return H; }, setDoor(fn) { doorDraw = fn; }, refresh: buildAll, shapeFor(sec) { return shapes.find(sh => sh.sec === sec) || null; } };
  })();

  /* ───────── ② 등장 ───────── */
  /* 낱말 마스크: 제목을 낱말마다 상자에 넣고 줄 번호를 매긴다(흐림 없이 아래에서 솟음) */
  function wordMask(el) {
    if (el.classList.contains('wm-host')) return;
    const walk = node => [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        if (!c.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.append(t); return; }
          const w = document.createElement('span'); w.className = 'wm'; const i = document.createElement('i'); i.textContent = t; w.append(i); frag.append(w);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1) {
        if (c.tagName === 'BR' || c.classList.contains('gl')) return;
        if (c.classList.contains('glint') || c.hasAttribute('data-land') || c.classList.contains('reelw')) {
          const w = document.createElement('span'); w.className = 'wm' + (c.hasAttribute('data-land') ? ' free' : ''); const i = document.createElement('i'); c.replaceWith(w); w.append(i); i.append(c);
        } else walk(c);
      }
    });
    walk(el); glue(el); el.classList.add('wm-host'); lines(el);
  }
  /* 띄어쓰기 없이 붙은 낱말 상자끼리(「카드 12장」+「으로」, 「몇 점」+「짜리」)는 한 덩이(.nw)로 묶어 조사가 다음 줄로 떨어지지 않게 한다 */
  function glue(el) {
    const isWm = n => n && n.nodeType === 1 && n.classList.contains('wm');
    const scan = node => [...node.childNodes].forEach(n => {
      if (!isWm(n)) { if (n.nodeType === 1 && !n.classList.contains('wm')) scan(n); return; }
      if (n.parentElement.classList.contains('nw')) return;
      const run = [n]; let s = n.nextSibling;
      while (isWm(s)) { run.push(s); s = s.nextSibling; }
      if (run.length > 1) { const g = document.createElement('span'); g.className = 'nw'; n.before(g); run.forEach(r => g.append(r)); }
    });
    scan(el);
  }
  function lines(el) { const tops = []; el.querySelectorAll(':scope .wm').forEach(w => { const t = Math.round(w.offsetTop / 10); let k = tops.indexOf(t); if (k < 0) { tops.push(t); k = tops.length - 1; } w.style.setProperty('--l', k); }); }
  const masked = [];
  if (FX) document.querySelectorAll('h1.rv, h2.rv').forEach(el => { wordMask(el); masked.push(el); });
  addEventListener('resize', () => masked.forEach(lines));
  const reveals = [...document.querySelectorAll('.rv, .mask')];
  if (FX && 'IntersectionObserver' in window) {
    const seen = new WeakMap();
    reveals.forEach(el => { const p = el.parentElement, n = seen.get(p) || 0; seen.set(p, n + 1); el.style.setProperty('--d', Math.min(n, 5) * 70 + 'ms'); });
    document.querySelectorAll('.mask .ln').forEach((ln, i) => ln.style.setProperty('--d', (i % 6) * 100 + 'ms'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .08 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('on'));
  /* 빛이 스치는 글자 */
  function glintify(el) {
    if (el.querySelector(':scope > .gl')) return el.querySelector(':scope > .gl');
    const d = document.createElement('span'); d.className = 'gl'; d.setAttribute('aria-hidden', 'true'); d.textContent = ownText(el); el.append(d); return d;
  }
  function glintRun(el, dur) { glintify(el); gsap.fromTo(el, { '--gx': '-30%' }, { '--gx': '140%', duration: dur || 1.4, ease: 'power2.inOut' }); }
  if (FX) {
    const ioL = new IntersectionObserver(es => es.forEach(e => {
      const el = e.target;
      if (!e.isIntersecting) { if (el._loop) { el._loop.kill(); el._loop = null; } return; }
      if (el.dataset.glint === 'loop') { el._loop = gsap.delayedCall(.6, function tick() { glintRun(el, 2.2); el._loop = gsap.delayedCall(4.2, tick); }); }
      else { glintRun(el, 1.4); ioL.unobserve(el); }
    }), { threshold: .4 });
    document.querySelectorAll('.glint[data-glint]').forEach(el => { glintify(el); ioL.observe(el); });
  }
  /* 커서 근처 글자만 밝아지는 큰 제목(.proxi) */
  if (FX && hoverable) {
    const hosts = [...document.querySelectorAll('.proxi')];
    hosts.forEach(h => {
      const walk = node => [...node.childNodes].forEach(c => {
        if (c.nodeType === 3) { if (!c.textContent.trim()) return; const frag = document.createDocumentFragment(); [...c.textContent].forEach(ch => { if (/\s/.test(ch)) { frag.append(ch); return; } const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; frag.append(s); }); c.replaceWith(frag); }
        else if (c.nodeType === 1 && !c.classList.contains('gl') && !c.classList.contains('reelw')) walk(c);
      });
      walk(h); h._ch = [...h.querySelectorAll('.ch')];
    });
    let raf = 0;
    addEventListener('pointermove', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; hosts.forEach(h => {
      const r = h.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const near = ptr.x > r.left - 220 && ptr.x < r.right + 220 && ptr.y > r.top - 220 && ptr.y < r.bottom + 220;
      if (!near && h._cold) return; h._cold = !near;
      h._ch.forEach(s => { const b = s.getBoundingClientRect(); const d = Math.hypot(b.left + b.width / 2 - ptr.x, b.top + b.height / 2 - ptr.y); s.style.setProperty('--b', near ? clamp(1 - d / 190, 0, 1).toFixed(2) : 0); });
    }); }); }, { passive: true });
  }
  /* 커졌다 작아지며 안착하는 단어(data-land) */
  if (FX) {
    const ioD = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; ioD.unobserve(e.target); gsap.fromTo(e.target, { scale: 2.6, y: -26, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: .75, ease: 'back.out(1.5)', delay: .15, clearProps: 'transform' }); }), { threshold: .5 });
    document.querySelectorAll('[data-land]').forEach(el => ioD.observe(el));
  }
  /* ③ 숫자 세기: 0 에서 굴러 올라간다(흐림 없음) */
  const counted = new WeakSet();
  function countUp(el) {
    if (counted.has(el)) return; counted.add(el);
    const to = +el.dataset.count, dec = el.dataset.dec ? 1 : 0, t0 = performance.now(), dur = 1800;
    el.classList.add('on');
    if (!FX) return;
    const step = now => { const p = Math.min(1, (now - t0) / dur), v = to * (1 - Math.pow(1 - p, 4)); el.textContent = dec ? v.toFixed(1) : fmtNum(Math.round(v)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  if (FX && 'IntersectionObserver' in window) {
    const ioN = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting || e.target.hasAttribute('data-wait')) return; ioN.unobserve(e.target); countUp(e.target); }), { threshold: .5 });
    document.querySelectorAll('[data-count]').forEach(el => ioN.observe(el));
  } else document.querySelectorAll('[data-count]').forEach(el => el.classList.add('on'));
  /* ① 글자 차오름 */
  const fills = [...document.querySelectorAll('.fill')];
  if (FX) fills.forEach(el => {
    const walk = node => [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) { frag.append(t); return; } const s = document.createElement('span'); s.className = 'w' + (node.classList && node.classList.contains('blue') ? ' blue-w' : ''); s.textContent = t; frag.append(s); });
        c.replaceWith(frag);
      } else if (c.nodeType === 1) walk(c);
    });
    walk(el);
  });
  /* ⑤ 거대한 이름: 아래에서 위로 함께 차오르고 빛이 유리처럼 스친다. 트레이너는 파랑이 같이 차오른다 */
  const giants = [...document.querySelectorAll('.giant b')];
  giants.forEach(b => { b.dataset.t = b.textContent; });
  if (FX) giants.forEach(b => {
    b.classList.add('glint'); glintify(b);
    const g = b.closest('.giant');
    /* t 는 ScrollTrigger.create 보다 먼저 선언한다 — 거대 이름이 이미 화면 안이면 create 중에 onEnter 가 바로 불려 t 를 읽는다(11-03 센터에서 오류) */
    let t = null; function loop() { stop(); t = gsap.delayedCall(.8, function tick() { glintRun(b, 2.6); t = gsap.delayedCall(5, tick); }); } function stop() { if (t) { t.kill(); t = null; } }
    ScrollTrigger.create({ trigger: g, start: 'top 90%', end: 'bottom bottom', onEnter: () => loop(), onEnterBack: () => loop(), onLeave: stop, onLeaveBack: stop });
  });

  /* ───────── 화면별 주연 효과 ───────── */
  const pins = [...document.querySelectorAll('.pin')];
  let ticking = false;
  function onScroll() {
    ticking = false;
    const H = innerHeight;
    if (FX) {
      reveals.forEach(el => { if (!el.classList.contains('on') && el.getBoundingClientRect().top < H) el.classList.add('on'); });
      document.querySelectorAll('[data-count]:not(.on):not([data-wait])').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < H * .8 && r.bottom > 0) countUp(el); });
      fills.forEach(el => {
        const r = el.getBoundingClientRect();
        const p = clamp((H * .85 - r.top) / (Math.min(r.height, H * .5) + H * .15), 0, 1);
        const ws = el.querySelectorAll('.w'), n = Math.round(p * ws.length);
        ws.forEach((w, i) => w.classList.toggle('on', i < n));
      });
      giants.forEach(b => {
        const r = b.getBoundingClientRect(), g = b.closest('.giant');
        const k = clamp((H - r.top) / (r.height + H * .1), 0, 1);
        b.style.setProperty('--g', (k * 100).toFixed(1) + '%');
        const bf = g.querySelector('.blue-fill'); if (bf) bf.style.clipPath = 'inset(' + ((1 - clamp((H - g.getBoundingClientRect().top) / (g.offsetHeight + H * .1), 0, 1)) * 100).toFixed(1) + '% 0 0 0)';
      });
      if (wide()) pins.forEach(el => {
        const r = el.getBoundingClientRect();
        const p = clamp(-(r.top - BAR) / Math.max(1, r.height - H), 0, .999);
        const k = Math.floor(p * 3);
        if (el._k === k) return; const was = el._k; el._k = k;
        el.querySelectorAll('.steps>li').forEach((x, i) => x.classList.toggle('on', i === k));
        el.querySelectorAll('.pin-phone img').forEach((x, i) => { x.classList.toggle('on', i === k); x.classList.toggle('was', i === was && was !== k); });
        el.querySelectorAll('.jn-say>span').forEach((x, i) => x.classList.toggle('on', i === k));
        el.querySelectorAll('.prog i').forEach((x, i) => x.classList.toggle('on', i <= k));
      });
    }
    door.update();
  }
  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  if (FX) document.querySelectorAll('.pin .steps b').forEach(b => { const i = document.createElement('i'); i.textContent = b.textContent; b.textContent = ''; b.append(i); });
  /* v2(4번): 가운데 정렬 — 각 단계의 설명 한 줄을 폰 아래(.jn-say)에 복제해 두고, 단어와 같은 박자로 교대한다 */
  if (FX) document.querySelectorAll('.pin .jn').forEach(jn => {
    const ph = jn.querySelector('.pin-phone'); if (!ph) return;
    const say = document.createElement('div'); say.className = 'jn-say'; say.setAttribute('aria-hidden', 'true');
    jn.querySelectorAll('.steps>li').forEach((li, i) => { const s = document.createElement('span'); s.textContent = li.querySelector('span').textContent; if (i === 0) s.classList.add('on'); say.append(s); });
    ph.after(say);
  });

  if (FX && hoverable) {
    document.querySelectorAll('.tilt, .doors a').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.classList.add('live');
        el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 14).toFixed(2) + 'deg');
        const f = el.querySelector('.foil'); if (f) { f.classList.add('live'); f.style.setProperty('--mx', (e.clientX - r.left) + 'px'); f.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
      });
      el.addEventListener('pointerleave', () => { el.classList.remove('live'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); const f = el.querySelector('.foil'); if (f) f.classList.remove('live'); });
    });
  }
  if (FX) {
    const ioT = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; ioT.unobserve(e.target);
      const el = e.target, full = el.dataset.type; let i = 0; el.placeholder = '';
      const t = setInterval(() => { i++; el.placeholder = full.slice(0, i) + (i < full.length ? '|' : ''); if (i >= full.length) clearInterval(t); }, 70);
    }), { threshold: .6 });
    document.querySelectorAll('[data-type]').forEach(el => ioT.observe(el));
  }

  /* ── 문: 28,200개의 점 ── 등뼈 캔버스의 무대 자리에 그린다. 0 → 28,200 이 올라가며 점이 켜지고(1.1초), 점들이 「몇 번째」로 모였다 또렷한 글자로 교체된다(총 2.5초).
     진행도 p 하나(스크롤)에서 상자·문 상태가 나온다. 점의 위치는 연출이고 실제 지도가 아니다 */
  const door = (function () {
    const el = document.querySelector('.door');
    const noop = { update() {} };
    if (!el) return noop;
    const stick = el.querySelector('.door-stick'), me = el.querySelector('.who');
    const title = el.querySelector('.door-title'), h1 = title.querySelector('h1'), go = title.querySelector('.go'), open = el.querySelector('.door-open');
    const countEl = el.querySelector('.count-in'), countNum = countEl && countEl.querySelector('b'), burst = el.querySelector('.burst');
    if (!FX || !spine) return noop;
    const gl = spine.gl;
    let PG;
    try {
      PG = spine.program(
        'attribute vec3 a,b,d;attribute float s;attribute vec2 e;uniform float T,P1,P2,RX,RY,ASP,PX,SC,REV,G,GS,PS,OY,A;varying float V,K;' +
        'mat3 ry(float r){float c=cos(r),n=sin(r);return mat3(c,0.,-n,0.,1.,0.,n,0.,c);}' +
        'mat3 rx(float r){float c=cos(r),n=sin(r);return mat3(1.,0.,0.,0.,c,n,0.,-n,c);}' +
        'void main(){float l=s*.42;float m1=smoothstep(l,l+.58,P1),m2=smoothstep(l,l+.58,P2);' +
        'vec3 dr=a+.03*vec3(sin(T*.31+s*41.),cos(T*.23+s*73.),sin(T*.19+s*91.));' +
        'float sw=(1.-m1)*m1*7.;float cs=cos(sw),sn=sin(sw);vec3 q=mix(dr,b,m1);q.xz=mat2(cs,-sn,sn,cs)*q.xz;' +
        'q=rx(RX+.2*m1)*ry(T*(.05+.26*m1)+RY)*q;q=mix(q,d,m2);' +
        'float pz=1.9/(2.7-q.z);float fit=min(1.,ASP/1.2)*SC*PS;vec2 cp=vec2(q.x*pz*fit/ASP,q.y*pz*fit+OY);' +
        'float gm=step(s,GS)*G;cp=mix(cp,e,gm);gl_Position=vec4(cp,0.,1.);' +
        'gl_PointSize=(1.2+s*s*s*3.6+m1*(1.-m2)*.7+m2*.4)*PX*pz+gm*2.2*PX;' +
        'float tw=.72+.28*sin(T*(1.+s*2.)+s*80.);float core=exp(-dot(a,a)*2.4);V=(.24+.95*s*s+core*1.1*(1.-m1)+.3*m1-.1*m2)*tw;' +
        'V*=1.-smoothstep(REV,REV+.05,s);V*=A;V+=gm*1.7;K=clamp(s*s+core*.75*(1.-m1)+gm*.5,0.,1.);}', spine.FRAG,
        ['a', 'b', 'd', 's', 'e'], ['T', 'P1', 'P2', 'RX', 'RY', 'ASP', 'PX', 'SC', 'REV', 'G', 'GS', 'PS', 'OY', 'A']);
    } catch (err) { root.classList.add('nostars'); return noop; }
    const N = 28200, F = 12, D = new Float32Array(N * F);
    const g = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    for (let i = 0; i < N; i++) {
      const u = Math.random(); let ax, ay, az;
      if (u < .82) { const r = .12 + 1.32 * Math.pow(Math.random(), .72), arm = Math.floor(Math.random() * 3), th = arm * 2.094 + r * 3.1 + g() * .3; ax = Math.cos(th) * r; az = Math.sin(th) * r; ay = g() * .13 * (1.5 - r); }
      else { const ph = Math.random() * 6.283, co = Math.random() * 2 - 1, si = Math.sqrt(1 - co * co), rr = 1.5 + Math.random() * 1.3; ax = si * Math.cos(ph) * rr; ay = co * rr * .72; az = si * Math.sin(ph) * rr; }
      const h = .62, v = [Math.random() < .5 ? -h : h, Math.random() < .5 ? -h : h, (Math.random() * 2 - 1) * h]; let bx, by, bz;
      if (Math.random() < .56) { const a = Math.floor(Math.random() * 3); bx = v[a % 3]; by = v[(a + 1) % 3]; bz = v[(a + 2) % 3]; }
      else { const f = Math.floor(Math.random() * 3), q = [(Math.random() * 2 - 1) * h, (Math.random() * 2 - 1) * h, (Math.random() * 2 - 1) * h]; q[f] = Math.random() < .5 ? -h : h; bx = q[0]; by = q[1]; bz = q[2]; }
      const k = i * F; D[k] = ax; D[k + 1] = ay; D[k + 2] = az; D[k + 3] = bx; D[k + 4] = by; D[k + 5] = bz; D[k + 9] = Math.random(); D[k + 10] = 0; D[k + 11] = 0;
    }
    let asp = 1;
    /* v2(11-03 대표님 1번): 점 테두리 = 유리 카드의 실제 자리(열린 뒤 .door-open 이 서는 자리 = CSS top 56% − 높이/2)에서 안쪽 6px, 모서리 반지름 = 카드 반지름(16px) − 6px.
       v1 은 .door-open 이 무대 50% 에 선다고 가정해(실제 56%) 테두리가 카드보다 위에 그려졌고, 모서리가 각지고, 점마다 z 를 흔들어(±.02) 원근으로 테두리가 ±0.75% 늘었다 줄었다. 전부 고침 */
    const DOOR_IN = 6;
    function doorRects() {
      const sr = stick.getBoundingClientRect(), orc = open.getBoundingClientRect();
      const openTop = (parseFloat(getComputedStyle(open).top) || sr.height * .56) - open.offsetHeight / 2; /* 열린 뒤 .door-open 위쪽 자리(무대 기준 px) */
      return [...open.querySelectorAll('.doors a')].map(a => {
        const r = a.getBoundingClientRect(), rad = Math.max(0, (parseFloat(getComputedStyle(a).borderTopLeftRadius) || 16) - DOOR_IN);
        const left = r.left - sr.left + DOOR_IN, top = r.top - orc.top + openTop + DOOR_IN, w = r.width - DOOR_IN * 2, h = r.height - DOOR_IN * 2;
        return { left, top, w, h, rad, sw: sr.width, sh: sr.height };
      });
    }
    /* 둥근 사각형 둘레의 자리 — 둘레 길이 t(0~1) → px */
    function roundRectAt(R, t) {
      const { w, h, rad } = R, sw = w - 2 * rad, sh = h - 2 * rad, arc = Math.PI / 2 * rad, P = 2 * (sw + sh) + 4 * arc; let L = t * P;
      const segs = [[sw, 0], [arc, 1], [sh, 2], [arc, 3], [sw, 4], [arc, 5], [sh, 6], [arc, 7]];
      for (const [len, kind] of segs) {
        if (L <= len) {
          const f = len > 0 ? L / len : 0;
          switch (kind) {
            case 0: return [rad + sw * f, 0];
            case 1: return [rad + sw + Math.sin(f * Math.PI / 2) * rad, rad - Math.cos(f * Math.PI / 2) * rad];
            case 2: return [w, rad + sh * f];
            case 3: return [rad + sw + Math.cos(f * Math.PI / 2) * rad, rad + sh + Math.sin(f * Math.PI / 2) * rad];
            case 4: return [rad + sw * (1 - f), h];
            case 5: return [rad - Math.sin(f * Math.PI / 2) * rad, rad + sh + Math.cos(f * Math.PI / 2) * rad];
            case 6: return [0, rad + sh * (1 - f)];
            default: return [rad - Math.cos(f * Math.PI / 2) * rad, rad - Math.sin(f * Math.PI / 2) * rad];
          }
        }
        L -= len;
      }
      return [rad, 0];
    }
    let doorRs = [];
    function doors() {
      const rs = doorRects(); if (rs.length < 2) return; doorRs = rs;
      const k = (1.9 / 2.7) * Math.min(1, asp / 1.2);
      for (let i = 0; i < N; i++) {
        const R = rs[i % 2]; let x, y;
        if (Math.random() < .8) { const p = roundRectAt(R, Math.random()); x = R.left + p[0] + g() * .6; y = R.top + p[1] + g() * .6; }
        else { x = R.left + Math.random() * R.w; y = R.top + Math.random() * R.h; }
        /* 무대 px → 클립(−1~1). 셰이더의 원근(pz=1.9/(2.7−z))·fit(k) 을 되돌려 넣는다. z 는 0 — 테두리가 원근으로 어긋나지 않게 */
        const cx = x / R.sw * 2 - 1, cy = 1 - y / R.sh * 2;
        const q = i * F; D[q + 6] = cx / k * asp; D[q + 7] = cy / k; D[q + 8] = 0;
      }
    }
    /* 검수용: 열린 뒤 점 테두리가 설 자리(화면 px)와 실제 카드 자리 */
    window.__doorBounds = () => {
      const sr = stick.getBoundingClientRect();
      return doorRs.map((R, i) => { const a = open.querySelectorAll('.doors a')[i], r = a.getBoundingClientRect(); return { dots: { left: sr.left + R.left, top: sr.top + R.top, right: sr.left + R.left + R.w, bottom: sr.top + R.top + R.h, rad: R.rad }, card: { left: r.left + DOOR_IN, top: r.top + DOOR_IN, right: r.right - DOOR_IN, bottom: r.bottom - DOOR_IN } }; });
    };
    let GS = 0;
    function letters() {
      const sp = h1.querySelector('.blue'); if (!sp) return;
      const sr = stick.getBoundingClientRect(), r = sp.getBoundingClientRect(), cs = getComputedStyle(sp);
      const W = Math.ceil(r.width) + 8, Hh = Math.ceil(r.height) + 8; if (W < 10 || Hh < 10) return;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; const x = cv.getContext('2d');
      x.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; if ('letterSpacing' in x) x.letterSpacing = cs.letterSpacing;
      x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText(ownText(sp), 4, Hh / 2);
      const px = x.getImageData(0, 0, W, Hh).data, pts = [], st = innerWidth > 720 ? 2 : 3;
      for (let j = 0; j < Hh; j += st) for (let i = 0; i < W; i += st) if (px[(j * W + i) * 4 + 3] > 110) pts.push([((r.left - sr.left - 4 + i) / sr.width) * 2 - 1, 1 - ((r.top - sr.top - 4 + j) / sr.height) * 2]);
      if (!pts.length) return;
      for (let i = pts.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; const t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
      GS = Math.min(.7, pts.length * 1.25 / N); let j = 0;
      for (let i = 0; i < N; i++) { const k = i * F; if (D[k + 9] < GS) { const p = pts[j++ % pts.length]; D[k + 10] = p[0]; D[k + 11] = p[1]; } }
    }
    const buf = gl.createBuffer();
    function upload() { gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, D, gl.STATIC_DRAW); }
    function bind() {
      gl.useProgram(PG.p); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      [['a', 3, 0], ['b', 3, 3], ['d', 3, 6], ['s', 1, 9], ['e', 2, 10]].forEach(n => { const l = PG.A[n[0]]; gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n[1], gl.FLOAT, false, F * 4, n[2] * 4); });
    }
    function size() { asp = stick.clientWidth / Math.max(1, stick.clientHeight); doors(); letters(); upload(); }
    const lp = { x: .5, y: .5, sx: .5, sy: .5, in: false };
    if (hoverable) {
      stick.addEventListener('pointermove', e => { const r = stick.getBoundingClientRect(); lp.x = (e.clientX - r.left) / r.width; lp.y = (e.clientY - r.top) / r.height; lp.in = true; });
      stick.addEventListener('pointerleave', () => { lp.x = .5; lp.y = .5; lp.in = false; });
    }
    let p = 0, p1 = 0, p2 = 0, intro = true;
    const st = { rev: 0, g: 0 };
    function apply() {
      p1 = easeIO(seg(p, 0, .55)); p2 = easeIO(seg(p, .42, .9));
      const t = 1 - seg(p, 0, .3);
      if (!intro) {
        title.style.opacity = t.toFixed(3); title.style.visibility = t <= 0 ? 'hidden' : 'visible';
        title.style.transform = 'translateY(calc(-50% - ' + (40 * (1 - t)).toFixed(1) + 'px))';
        go.style.pointerEvents = t > .5 ? 'auto' : 'none';
      }
      const o = easeIO(seg(p, .8, 1));
      open.style.opacity = o.toFixed(3); open.style.visibility = o > .01 ? 'visible' : 'hidden'; open.style.pointerEvents = o > .6 ? 'auto' : 'none';
      open.style.transform = 'translateY(calc(-50% + ' + (24 * (1 - o)).toFixed(1) + 'px))';
      el.classList.toggle('opened', p > .9);
      me.style.opacity = clamp(1 - p1 * 6, 0, 1).toFixed(3);
      if (burst) { const bu = Math.sin(seg(p, .7, .92) * Math.PI); burst.style.opacity = (bu * .7).toFixed(2); burst.style.transform = 'scale(' + (.6 + bu * 1.4).toFixed(2) + ')'; }
    }
    /* 등뼈가 매 프레임 부른다. 무대 자리(sticky 화면)에만 그리고, 무대가 화면을 얼마나 덮는지(0~1) 돌려준다 */
    function draw(t) {
      const r = stick.getBoundingClientRect(), H = spine.H, W = spine.W, dpr = spine.dpr;
      const top = Math.max(0, r.top), bot = Math.min(H, r.bottom); if (bot <= top) return 0;
      const cover = (bot - top) / H;
      lp.sx += (lp.x - lp.sx) * .05; lp.sy += (lp.y - lp.sy) * .05;
      const rx = .46 + (lp.sy - .5) * .34 + p * .18, ry = (lp.sx - .5) * .9 + p * .5, sc = 1 + .22 * seg(p, 0, .5) * (1 - seg(p, .5, 1));
      /* 휴대폰(720px 이하): 나선이 제목 뒤를 지나지 않게 제목 아래(화면 55~85%)로 내리고 0.6배·밝기 60%. 상자·문으로 모이는 단계(p2)에서는 원래 자리로 돌아온다. PC 는 그대로 */
      const ph = innerWidth <= 720, ps = ph ? .55 + .45 * p2 : 1, oy = ph ? -.56 * (1 - p2) : 0, br = ph ? .6 + .4 * p2 : 1; /* 6-6: 폰은 나선을 제목 아래(화면 65~90%)로 더 내리고 0.55배 — 제목 뒤 어둠 없이도 대비가 선다 */
      gl.viewport(Math.round(r.left * dpr), Math.round((H - r.bottom) * dpr), Math.round(r.width * dpr), Math.round(r.height * dpr));
      gl.enable(gl.SCISSOR_TEST); gl.scissor(Math.round(r.left * dpr), Math.round((H - bot) * dpr), Math.round(r.width * dpr), Math.round((bot - top) * dpr));
      bind();
      gl.uniform1f(PG.U.T, t); gl.uniform1f(PG.U.P1, p1); gl.uniform1f(PG.U.P2, p2); gl.uniform1f(PG.U.RX, rx); gl.uniform1f(PG.U.RY, ry); gl.uniform1f(PG.U.ASP, asp); gl.uniform1f(PG.U.PX, dpr); gl.uniform1f(PG.U.SC, sc);
      gl.uniform1f(PG.U.REV, st.rev); gl.uniform1f(PG.U.G, st.g); gl.uniform1f(PG.U.GS, GS); gl.uniform1f(PG.U.PS, ps); gl.uniform1f(PG.U.OY, oy); gl.uniform1f(PG.U.A, br);
      gl.drawArrays(gl.POINTS, 0, N);
      gl.disable(gl.SCISSOR_TEST); gl.viewport(0, 0, Math.round(W * dpr), Math.round(H * dpr));
      const x = .98, y = asp < .95 ? -.88 : -.42, z = .42, a = t * .05 + ry, cA = Math.cos(a), sA = Math.sin(a), x1 = cA * x + sA * z, z1 = -sA * x + cA * z, cX = Math.cos(rx), sX = Math.sin(rx), y2 = cX * y - sX * z1, z2 = sX * y + cX * z1, pz = 1.9 / (2.7 - z2), fit = Math.min(1, asp / 1.2) * sc * ps;
      let mx = (x1 * pz * fit / asp * .5 + .5) * stick.clientWidth, my = (-(y2 * pz * fit + oy) * .5 + .5) * stick.clientHeight;
      if (ph) { /* 파란 점·「선생님은 어디쯤일까요」는 단추와 겹치지 않게 오른쪽 아래, 단추에서 24px 넘게 떨어뜨린다 */
        const gr = go.getBoundingClientRect(), sr = stick.getBoundingClientRect(), minY = gr.bottom - sr.top + 24 + 14;
        my = Math.min(Math.max(my, minY, stick.clientHeight * .87), stick.clientHeight - 62); mx = Math.min(Math.max(mx, stick.clientWidth * .62), stick.clientWidth - 28); /* 나선(55~85%) 아래·하단 안내 위 */
      }
      if (lp.in) { const px = lp.x * stick.clientWidth, py = lp.y * stick.clientHeight, dd = Math.hypot(px - mx, py - my); if (dd < 280) { const f = (1 - dd / 280) * .6; mx += (px - mx) * f; my += (py - my) * f; } }
      me.style.transform = 'translate(' + mx.toFixed(1) + 'px,' + my.toFixed(1) + 'px)';
      return cover;
    }
    new IntersectionObserver(es => { root.classList.toggle('instage', es[0].isIntersecting && es[0].intersectionRatio > .5); }, { threshold: [0, .5, 1] }).observe(stick);
    /* 문 무대의 문서 안 자리. el.offsetTop 은 offsetParent(main, position:relative) 기준이라 0 이 나와 — 맨 위(scrollY 0)에서 진행도가 이미 64/span 만큼 가 있었다.
       PC 는 span 이 커서 제목이 60% 투명도로만 보였지만, 폰(iPhone 13: span 432px)은 진행도 .16 → 제목 48%·「눌러서 열어 보기」 pointer-events none 으로 죽어 있었다(11-03 모바일 점검에서 발견, 「PC 는 되는데 폰은 안 되던 것」). */
    const docTop = () => el.getBoundingClientRect().top + scrollY;
    function update() {
      const span = el.offsetHeight - stick.offsetHeight;
      const raw = span > 0 ? (scrollY - docTop() + BAR) / span : 0;
      p = clamp(raw / .95, 0, 1);
      if (intro && scrollY > 24) endIntro();
      apply();
    }
    const endY = () => docTop() - BAR + (el.offsetHeight - stick.offsetHeight) * .95;
    go.addEventListener('click', () => goY(endY(), 2200));
    /* 「다시 보기」 단추는 6-2 로 없앴다 — 맨 위로 스크롤하면 p 가 0 으로 돌아가 스스로 닫힌다 */
    open.addEventListener('focusin', () => { if (p < 1) goY(endY(), 10); });
    open.querySelectorAll('.doors a').forEach(a => a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey) return; e.preventDefault();
      const r = a.getBoundingClientRect(), f = document.createElement('div'); f.className = 'fillcard';
      Object.assign(f.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
      document.body.append(f);
      gsap.to(a, { opacity: 0, duration: .25 });
      gsap.to(f, { left: 0, top: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: .7, ease: 'power3.inOut', onComplete: () => { sessionStorage.setItem('hb-veil', '1'); location.href = a.href; } });
    }));
    let tl = null;
    function endIntro() {
      if (!intro) return; intro = false;
      if (tl) { tl.kill(); tl = null; }
      st.rev = 1.06; st.g = 0;
      if (countEl) countEl.style.opacity = 0;
      title.style.opacity = ''; el.classList.add('ready');
      try { sessionStorage.setItem('hb-intro', '1'); } catch (err) {}
      apply();
    }
    function runIntro() {
      let seen = false; try { seen = !!sessionStorage.getItem('hb-intro'); } catch (err) {}
      if (seen || scrollY > 24) { endIntro(); return; }
      const num = { v: 0 }; const gw = h1.querySelector('.glint');
      tl = gsap.timeline({ onComplete: endIntro });
      tl.to(st, { rev: 1.06, duration: 1.1, ease: 'power1.inOut' }, 0);
      if (countNum) tl.to(num, { v: 28200, duration: 1.1, ease: 'power2.out', onUpdate: () => { countNum.textContent = fmtNum(Math.round(num.v)); } }, 0);
      if (countEl) tl.to(countEl, { opacity: 0, duration: .35 }, 1.0);
      if (innerWidth <= 720) { /* 6-6 ③ 폰: 점이 글자로 모이는 단계·투명도 등장 없이, 숫자가 다 세이면 제목이 바로 또렷하게 */
        tl.set(title, { opacity: 1 }, 1.15);
        if (gw) tl.add(() => glintRun(gw, 1.1), 1.25);
      } else {
        tl.to(st, { g: 1, duration: .75, ease: 'power3.inOut' }, 1.05);
        tl.to(title, { opacity: 1, duration: .5, ease: 'power2.out' }, 1.9);
        tl.to(st, { g: 0, duration: .7, ease: 'power2.inOut' }, 2.0);
        if (gw) tl.add(() => glintRun(gw, 1.1), 2.05);
      }
    }
    size(); addEventListener('resize', () => { size(); update(); });
    const ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    ready.then(() => { size(); update(); runIntro(); });
    addEventListener('load', size);
    spine.setDoor(draw);
    update();
    return { update };
  })();

  /* ── 문: 숫자 띠 ── */
  (function () {
    const bp = document.querySelector('.bandpin'); if (!bp || !FX) return;
    const stage = bp.querySelector('.band-stage'), huge = bp.querySelector('.huge'), cell = bp.querySelector('.n28');
    if (!stage || !huge || !cell) return;
    const waits = [...bp.querySelectorAll('[data-wait]')];
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      let start = { x: 0, y: 0, s: 1 };
      function layout() {
        const sr = stage.getBoundingClientRect(), cr = cell.getBoundingClientRect();
        huge.style.fontSize = getComputedStyle(cell).fontSize; huge.style.left = (cr.left - sr.left) + 'px'; huge.style.top = (cr.top - sr.top) + 'px';
        huge.style.transform = 'none';
        const hr = huge.getBoundingClientRect();
        const S = Math.min(sr.width * .9 / hr.width, sr.height * .62 / hr.height);
        start = { x: (sr.width - hr.width * S) / 2 - (cr.left - sr.left), y: (sr.height - hr.height * S) / 2 - (cr.top - sr.top), s: S };
      }
      const st = ScrollTrigger.create({
        trigger: bp, start: 'top ' + BAR + 'px', end: 'bottom bottom', scrub: true, onRefresh: layout,
        onUpdate: self => {
          const p = self.progress, k = easeIO(seg(p, .06, .7));
          huge.style.transform = 'translate(' + (start.x * (1 - k)).toFixed(1) + 'px,' + (start.y * (1 - k)).toFixed(1) + 'px) scale(' + (start.s + (1 - start.s) * k).toFixed(4) + ')';
          const landed = p > .7; bp.classList.toggle('landed', landed);
          if (landed) waits.forEach(w => { w.removeAttribute('data-wait'); countUp(w); });
        }
      });
      layout();
      return () => { st.kill(); huge.style.transform = ''; bp.classList.add('landed'); };
    });
    mm.add('(max-width: 900px)', () => { bp.classList.add('landed'); waits.forEach(w => w.removeAttribute('data-wait')); });
  })();

  /* ── 트레이너 첫 화면: 고정 없이 — 스크롤하면 제목이 커지며 빠르게 흐려지고(0.6화면 안) 다음 화면이 바로 뒤따른다 ── */
  (function () {
    const hero = document.querySelector('.hero'); if (!hero || !FX) return;
    const stage = hero.querySelector('.hero-stage');
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const a = gsap.fromTo(stage, { scale: 1, yPercent: 0 }, { scale: 2.2, yPercent: -8, ease: 'power2.in', immediateRender: false, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .25 } });
      const b = gsap.fromTo(stage, { opacity: 1 }, { opacity: 0, ease: 'power1.in', immediateRender: false, scrollTrigger: { trigger: hero, start: 'top top', end: '62% top', scrub: .25 } });
      return () => { [a, b].forEach(t => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); gsap.set(stage, { clearProps: 'all' }); };
    });
    mm.add('(max-width: 900px)', () => {
      const tw = gsap.fromTo(stage, { opacity: 1 }, { opacity: .25, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: 'bottom 60%', end: 'bottom 10%', scrub: true } });
      return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(stage, { clearProps: 'all' }); };
    });
  })();
  if (FX) document.querySelectorAll('.route').forEach(r => {
    const as = [...r.querySelectorAll('a')]; as.forEach((a, i) => { a.style.setProperty('--d', (i * 140) + 'ms'); const s = document.createElement('span'); s.append(...[...a.childNodes].filter(n => n.nodeType === 3)); a.prepend(s); });
    ScrollTrigger.create({ trigger: r, start: 'top 88%', once: true, onEnter: () => as.forEach(a => a.classList.add('on')) });
  });

  /* ── 트레이너 네 칸: v2 — PC 는 파란 점이 등뼈 은하 나선의 팔을 따라 매듭 1→4 로 간다(칸 아래 선은 밟은 만큼 찬다). 휴대폰·WebGL 없음은 칸 옆 선을 따라 ── */
  (function () {
    const fh = document.querySelector('.fourh'); if (!fh || !FX) return;
    const track = fh.querySelector('.fh-track'), cells = [...track.querySelectorAll(':scope > div')], svg = fh.querySelector('.fh-line'), dot = fh.querySelector('.fh-dot'), stage = fh.querySelector('.fh-stage');
    if (!track || !svg || !dot) return;
    const gal = spine && spine.shapeFor(fh);
    const NS = 'http://www.w3.org/2000/svg';
    const segs = cells.map(() => { const dim = document.createElementNS(NS, 'path'), lit = document.createElementNS(NS, 'path'); lit.setAttribute('class', 'lit'); svg.append(dim, lit); return { dim, lit, len: 0, a: null, b: null }; });
    let travel = 0, total = 0;
    function layout() {
      const horiz = wide();
      track.style.transform = '';
      const tr = track.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + tr.width + ' ' + tr.height); svg.style.width = tr.width + 'px'; svg.style.height = tr.height + 'px';
      total = 0;
      cells.forEach((c, i) => {
        const r = c.getBoundingClientRect(), n = c.querySelector('.n').getBoundingClientRect(), s = segs[i];
        if (horiz) { const y = n.top - tr.top + n.height / 2; s.a = [r.left - tr.left + 8, y]; s.b = [r.right - tr.left - 8, y]; }
        else { const x = -16; s.a = [x, r.top - tr.top + 8]; s.b = [x, r.bottom - tr.top - 8]; }
        s.len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); total += s.len;
        const d = 'M' + s.a[0].toFixed(1) + ',' + s.a[1].toFixed(1) + 'L' + s.b[0].toFixed(1) + ',' + s.b[1].toFixed(1);
        s.dim.setAttribute('d', d); s.lit.setAttribute('d', d); s.lit.style.strokeDasharray = s.len; s.lit.style.strokeDashoffset = s.len;
      });
      travel = horiz ? Math.max(0, tr.right - innerWidth + parseFloat(getComputedStyle(root).getPropertyValue('--gut'))) : 0;
    }
    function at(p) {
      let L = p * total, px = segs[0].a[0], py = segs[0].a[1];
      segs.forEach((s, i) => {
        const k = clamp(L / Math.max(1, s.len), 0, 1);
        s.lit.style.strokeDashoffset = (s.len * (1 - k)).toFixed(1);
        if (L > 0 || i === 0) { px = s.a[0] + (s.b[0] - s.a[0]) * k; py = s.a[1] + (s.b[1] - s.a[1]) * k; }
        L -= s.len;
      });
      const sg = stage.getBoundingClientRect();
      if (wide() && gal && gal.ok && gal.meta.arm) {
        const kt = gal.meta.knots, u = gal.meta.arm(kt[0] + (kt[kt.length - 1] - kt[0]) * p);
        px = u[0] * sg.width; py = u[1] * sg.height;
      } else { const tr = track.getBoundingClientRect(); px += tr.left - sg.left; py += tr.top - sg.top; }
      dot.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px)';
    }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const st = ScrollTrigger.create({ trigger: fh, start: 'top ' + BAR + 'px', end: 'bottom bottom', scrub: true, onRefresh: layout, onUpdate: s => { track.style.transform = 'translateX(' + (-s.progress * travel).toFixed(1) + 'px)'; at(seg(s.progress, .04, .96)); } });
      layout(); at(0);
      return () => { st.kill(); track.style.transform = ''; };
    });
    mm.add('(max-width: 900px)', () => {
      const st = ScrollTrigger.create({ trigger: track, start: 'top 75%', end: 'bottom 55%', scrub: true, onRefresh: layout, onUpdate: s => at(s.progress) });
      layout(); at(0);
      return () => st.kill();
    });
  })();

  /* ── 트레이너 먼저 해 본 분들: 입체 회전목마 — 왼쪽 큰 글자, 오른쪽 판(50도 간격이라 옆 판이 비스듬히 보인다) ── */
  (function () {
    const rp = document.querySelector('.ringpin'); if (!rp || !FX) return;
    const ring = rp.querySelector('.ring'), panes = [...ring.querySelectorAll('.pane')], caps = [...rp.querySelectorAll('.ring-cap p')];
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const n = panes.length, step = 50; let rz = 420;
      function layout() { rz = Math.max(300, Math.min(520, innerWidth * .3)); panes.forEach((p, i) => { p.style.setProperty('--a', (i * step) + 'deg'); p.style.setProperty('--rz', rz + 'px'); }); }
      let cur = -1;
      function set(p) {
        ring.style.transform = 'translateZ(' + (-rz) + 'px) rotateY(' + (-p * step * (n - 1)).toFixed(2) + 'deg)';
        const k = clamp(Math.round(p * (n - 1)), 0, n - 1);
        if (k !== cur) { cur = k; panes.forEach((x, i) => x.classList.toggle('front', i === k)); caps.forEach((x, i) => x.classList.toggle('on', i === k)); }
      }
      const st = ScrollTrigger.create({ trigger: rp, start: 'top ' + BAR + 'px', end: 'bottom bottom', scrub: true, onRefresh: layout, onUpdate: s => set(seg(s.progress, .05, .92)) });
      layout(); set(0);
      return () => { st.kill(); ring.style.transform = ''; panes.forEach(x => x.classList.remove('front')); caps.forEach(x => x.classList.add('on')); };
    });
  })();

  /* ── 트레이너 후기 벽: 파란 먹빛 작은 판이 곡면으로 흐르고, 커서 주변만 본색. 손이 없으면 빛이 혼자 천천히 떠돈다 ── */
  (function () {
    const wall = document.querySelector('.wall'); if (!wall || !FX) return;
    const dim = wall.querySelector('.wall-dim'), rows = [...dim.querySelectorAll('.row')];
    rows.forEach(r => [...r.children].forEach(k => { const c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.alt = ''; r.append(c); }));
    const lit = dim.cloneNode(true); lit.className = 'rows wall-lit'; lit.setAttribute('aria-hidden', 'true'); lit.querySelectorAll('img').forEach(i => { i.alt = ''; });
    const lamp = document.createElement('i'); lamp.className = 'lamp';
    const et = document.createElement('i'); et.className = 'edge t'; const eb = document.createElement('i'); eb.className = 'edge b';
    wall.append(lit, lamp, et, eb);
    const litRows = [...lit.querySelectorAll('.row')];
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const SPEED = [1, -1, .6, -.8];
      function set(p) {
        const cw = wall.clientWidth;
        rows.forEach((r, i) => {
          const w = r.scrollWidth, run = Math.max(0, w - cw) * .5, sp = SPEED[i % SPEED.length], x = sp > 0 ? -p * run * sp : -run + p * run * -sp;
          const t = 'translateX(' + x.toFixed(1) + 'px)'; r.style.transform = t; litRows[i].style.transform = t;
        });
      }
      const st = ScrollTrigger.create({ trigger: wall, start: 'top 95%', end: 'bottom 5%', scrub: .2, onUpdate: s => set(s.progress) });
      set(0);
      let hot = false, lastMove = 0, inView = false;
      const place = (x, y, r) => { lit.style.clipPath = 'circle(' + r + 'px at ' + x.toFixed(0) + 'px ' + y.toFixed(0) + 'px)'; lamp.style.transform = 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px)'; };
      if (hoverable) {
        wall.addEventListener('pointermove', e => { const r = wall.getBoundingClientRect(); hot = true; lastMove = performance.now(); place(e.clientX - r.left, e.clientY - r.top, 190); wall.classList.add('hot'); });
        wall.addEventListener('pointerleave', () => { hot = false; });
      }
      const vis = ScrollTrigger.create({ trigger: wall, start: 'top 90%', end: 'bottom 10%', onToggle: s => { inView = s.isActive; } });
      const tick = () => {
        if (!inView || (hot && performance.now() - lastMove < 1800)) return;
        const t = performance.now() / 1000, cw = wall.clientWidth, ch = wall.clientHeight;
        place(cw * (.5 + .42 * Math.sin(t * .31)), ch * (.5 + .34 * Math.cos(t * .23)), 170); wall.classList.add('hot');
      };
      gsap.ticker.add(tick);
      return () => { st.kill(); vis.kill(); gsap.ticker.remove(tick); rows.forEach((r, i) => { r.style.transform = ''; litRows[i].style.transform = ''; }); };
    });
    mm.add('(max-width: 900px)', () => {
      const st = ScrollTrigger.create({ trigger: wall, start: 'top 80%', end: 'bottom 40%', onUpdate: s => rows.forEach((r, i) => r.classList.toggle('lit', s.progress > (i + .5) / rows.length)) });
      return () => st.kill();
    });
  })();

  /* ── 트레이너 100점 진단: 눈금 다이얼 ── */
  (function () {
    const dp = document.querySelector('.dialpin'); if (!dp) return;
    const dial = dp.querySelector('.dial'), core = dial && dial.querySelector('.core b');
    if (!dial) return;
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 400 400'); svg.setAttribute('aria-hidden', 'true');
    const gT = document.createElementNS(NS, 'g'); svg.append(gT);
    const ticks = [];
    for (let i = 0; i <= 100; i++) {
      const a = (-135 + i * 2.7) * Math.PI / 180, ten = i % 10 === 0, r1 = ten ? 158 : 168, r2 = 182;
      const l = document.createElementNS(NS, 'line'); l.setAttribute('x1', 200 + Math.sin(a) * r1); l.setAttribute('y1', 200 - Math.cos(a) * r1); l.setAttribute('x2', 200 + Math.sin(a) * r2); l.setAttribute('y2', 200 - Math.cos(a) * r2); l.setAttribute('class', 'tick' + (ten ? ' ten' : ''));
      gT.append(l); ticks.push(l);
      if (i === 0 || i === 30 || i === 100) { const t = document.createElementNS(NS, 'text'); t.setAttribute('x', 200 + Math.sin(a) * 138); t.setAttribute('y', 200 - Math.cos(a) * 138 + 5); t.setAttribute('class', 'lbl'); t.textContent = i; gT.append(t); }
    }
    const nd = document.createElementNS(NS, 'line'); nd.setAttribute('class', 'needle'); nd.setAttribute('x1', 200); nd.setAttribute('y1', 200 - 150); nd.setAttribute('x2', 200); nd.setAttribute('y2', 200 - 196);
    svg.append(nd); dial.prepend(svg);
    const FINAL = core ? core.textContent : '';
    if (!FX) return;
    let lastV = -1, lastT = 0;
    function set(p) {
      const v = Math.round(p * 100);
      gT.style.transform = 'rotate(' + (-v * 2.7) + 'deg)'; gT.style.transformOrigin = '200px 200px';
      if (v !== lastV) { lastV = v; ticks.forEach((t, i) => t.classList.toggle('lit', i <= v)); }
      if (core) { const now = performance.now(); if (p >= .94) core.textContent = FINAL; else if (now - lastT > 70) { lastT = now; core.textContent = String(Math.floor(Math.random() * 100)).padStart(2, '0'); } }
    }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => { const st = ScrollTrigger.create({ trigger: dp, start: 'top ' + BAR + 'px', end: 'bottom bottom', scrub: true, onUpdate: s => set(seg(s.progress, .05, .92)) }); set(0); return () => st.kill(); });
    mm.add('(max-width: 900px)', () => { const st = ScrollTrigger.create({ trigger: dial, start: 'top 85%', end: 'bottom 35%', scrub: true, onUpdate: s => set(s.progress) }); set(0); return () => st.kill(); });
  })();

  /* ── 트레이너 멤버십: 「9,900」 쿵 ── */
  if (FX) document.querySelectorAll('.one-price').forEach(box => {
    const p = box.querySelector('.p'); if (!p) return;
    const ring = document.createElement('i'); ring.className = 'thud'; ring.setAttribute('aria-hidden', 'true'); box.append(ring);
    ScrollTrigger.create({ trigger: box, start: 'top 80%', once: true, onEnter: () => {
      const pr = p.getBoundingClientRect(), br = box.getBoundingClientRect();
      ring.style.left = (pr.left - br.left + pr.width * .5) + 'px'; ring.style.top = (pr.top - br.top + pr.height * .6) + 'px';
      const tl = gsap.timeline();
      tl.fromTo(p, { scale: 3.2, y: -90, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: .6, ease: 'power4.in' });
      tl.fromTo(box, { y: 0 }, { y: 10, duration: .08, ease: 'power1.in' }).to(box, { y: 0, duration: .9, ease: 'elastic.out(1,.35)' });
      tl.fromTo(ring, { scale: .2, opacity: .9 }, { scale: 2.4, opacity: 0, duration: 1, ease: 'power2.out' }, '-=.98');
    } });
  });

  /* 센터 제목: 「몇」 자리에 숫자가 룰렛처럼 돌다 「?」로 멈추고 「몇」으로 바뀐다 */
  (function () {
    const w = document.querySelector('.reelw'); if (!w || !FX) return;
    const i = w.querySelector('i'), m = w.querySelector('em'); if (!i || !m) return;
    gsap.set(m, { opacity: 0, position: 'absolute', left: 0, right: 0 });
    let n = 0; const tk = setInterval(() => { n++; i.textContent = n < 14 ? String(1 + Math.floor(Math.random() * 40)) : '?'; if (n >= 19) { clearInterval(tk); gsap.to(i, { opacity: 0, duration: .4 }); gsap.to(m, { opacity: 1, duration: .5, onComplete: () => { i.remove(); gsap.set(m, { clearProps: 'position,left,right' }); } }); } }, 80);
  })();

  /* ── 센터 네 칸: 터널 — 빛나는 문틀을 차례로 통과한다. 뒤 문은 작게 비치고, 앞 문은 지나가며 커진다 ── */
  (function () {
    const tn = document.querySelector('.tunnel'); if (!tn || !FX) return;
    const four = tn.querySelector('.four'), gatesBox = tn.querySelector('.gates'); if (!four || !gatesBox) return;
    const cells = [...four.children];
    const gates = cells.map((c, i) => {
      const g = document.createElement('div'); g.className = 'gate'; g.setAttribute('aria-hidden', 'true');
      const k = document.createElement('span'); k.className = 'k'; k.textContent = '0' + (i + 1) + ' / 04';
      const n = c.querySelector('.n').cloneNode(true); n.querySelectorAll('[data-count]').forEach(e => { e.classList.add('on'); e.removeAttribute('data-count'); });
      const h = c.querySelector('h3').cloneNode(true), p = c.querySelector('p').cloneNode(true);
      g.append(k, n, h, p); gatesBox.append(g); return g;
    });
    const Z = 760, DEPTH = Z * (gates.length - 1);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      function set(p) {
        const cam = p * DEPTH;
        gates.forEach((g, i) => {
          const z = -i * Z + cam;
          const o = z > 80 ? 1 - seg(z, 80, 640) : z < -Z * .98 ? .08 + .1 * seg(z, -DEPTH, -Z) : .18 + .82 * seg(z, -Z * .98, -60);
          g.style.transform = 'translateZ(' + z.toFixed(1) + 'px)'; g.style.opacity = o.toFixed(3); g.style.visibility = o < .01 ? 'hidden' : 'visible';
          g.classList.toggle('far', z < -Z * .6);
        });
      }
      const st = ScrollTrigger.create({ trigger: tn, start: 'top ' + BAR + 'px', end: 'bottom bottom', scrub: .25, onUpdate: s => set(seg(s.progress, .03, .97)) });
      set(0);
      return () => st.kill();
    });
  })();

  /* ── 센터 먼저 고친 센터: 흩어진 책상 → 정돈 + 핵심 문구 ── */
  (function () {
    const desk = document.querySelector('.desk'); if (!desk || !FX) return;
    const figs = [...desk.querySelectorAll('.proof')], cap = desk.querySelector('.desk-cap');
    const seed = [[-14, -120, 40, 12], [9, 60, -30, -9], [-6, -40, 90, 5], [16, 110, 20, -14]];
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      function set(p) {
        const k = easeIO(seg(p, .05, .6));
        figs.forEach((f, i) => { const s = seed[i % seed.length]; f.style.transform = 'translate(' + (s[1] * (1 - k)).toFixed(1) + 'px,' + (s[2] * (1 - k)).toFixed(1) + 'px) rotate(' + (s[0] * (1 - k)).toFixed(2) + 'deg) rotateX(' + (s[3] * (1 - k)).toFixed(2) + 'deg)'; });
        desk.classList.toggle('tidy', p > .58);
        if (cap) { const c = seg(p, .62, .86); cap.style.opacity = c.toFixed(3); cap.style.transform = 'translateY(' + (30 * (1 - c)).toFixed(1) + 'px)'; }
      }
      const st = ScrollTrigger.create({ trigger: desk, start: 'top ' + BAR + 'px', end: 'bottom bottom', scrub: .2, onUpdate: s => set(s.progress) });
      set(0);
      return () => { st.kill(); figs.forEach(f => { f.style.transform = ''; }); desk.classList.add('tidy'); if (cap) { cap.style.opacity = ''; cap.style.transform = ''; } };
    });
  })();

  /* ── 센터 후기 벽: 다섯 기둥이 서로 다른 속도 ── */
  (function () {
    const cols = document.querySelector('.cols'); if (!cols) return;
    const col = [...cols.querySelectorAll('.col')]; col.forEach((c, i) => c.style.setProperty('--i', i));
    if (!FX) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 721px)', () => {
      const RATE = [1, -1, .55, -.7, .85];
      function set(p) { const bh = cols.clientHeight; col.forEach((c, i) => { const run = Math.max(0, c.scrollHeight - bh) * .5, rt = RATE[i % RATE.length]; const y = rt > 0 ? -p * run * rt : -run + p * run * -rt; c.style.transform = 'translateY(' + y.toFixed(1) + 'px)'; }); }
      const st = ScrollTrigger.create({ trigger: cols, start: 'top 95%', end: 'bottom 5%', scrub: .25, onUpdate: s => set(s.progress) });
      set(0);
      return () => { st.kill(); col.forEach(c => { c.style.transform = ''; }); };
    });
  })();

  /* ── 센터 카드 12장: 카드 덱 돌리기 ── */
  (function () {
    const hs = document.querySelector('.hs'); if (!hs || !FX) return;
    const rail = hs.querySelector('.rail'), cards = [...hs.querySelectorAll('.card-it')];
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const COLS = 6, GAP = 16; let cw = 160, ch = 240, pos = [];
      const jitter = cards.map((_, i) => ((i * 7919) % 13 - 6) * .6);
      function layout() {
        const W = rail.clientWidth, Hh = rail.clientHeight;
        cw = Math.floor(Math.min(200, (W - GAP * (COLS - 1)) / COLS, (Hh - 60 - GAP) / 2 * .72)); hs.style.setProperty('--cw', cw + 'px');
        ch = cards[0].offsetHeight; const gridW = COLS * cw + (COLS - 1) * GAP, gridH = 2 * ch + GAP, sx = (W - gridW) / 2, sy = (Hh - gridH) / 2;
        const baseTop = Hh - 32 - ch, baseCx = W / 2;
        pos = cards.map((c, i) => { const col = i % COLS, row = Math.floor(i / COLS); return { x: sx + col * (cw + GAP) + cw / 2 - baseCx, y: sy + row * (ch + GAP) - baseTop }; });
      }
      function set(p) {
        cards.forEach((c, i) => {
          const a = i / cards.length * .74, k = easeIO(seg(p, a, a + .22)), lift = Math.sin(k * Math.PI) * 90, sc = 1 + .9 * (1 - k);
          const vis = clamp((p - (a - .06)) / .05, 0, 1);
          c.style.opacity = (i < 6 ? 1 : vis).toFixed(2);
          c.style.transform = 'translate(' + (pos[i].x * k).toFixed(1) + 'px,' + (pos[i].y * k - lift - (1 - k) * (i % 6) * 10 - (1 - k) * 150).toFixed(1) + 'px) rotate(' + (jitter[i] * (1 - k) * 3).toFixed(2) + 'deg) rotateX(' + ((1 - k) * 22).toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')';
          c.style.zIndex = k > 0 && k < 1 ? 20 : 10 - (i % 3);
        });
        hs.classList.toggle('spread', p > .93);
      }
      const st = ScrollTrigger.create({ trigger: hs, start: 'top ' + BAR + 'px', end: 'bottom bottom', scrub: .2, onRefresh: layout, onUpdate: s => set(s.progress) });
      layout(); set(0);
      return () => { st.kill(); cards.forEach(c => { c.style.cssText = ''; }); hs.classList.add('spread'); };
    });
  })();

  /* ── 센터 2.3배 ── */
  (function () {
    const bp = document.querySelector('.barpin'); if (!bp || !FX) return;
    const stage = bp.querySelector('.bar-stage'), huge = bp.querySelector('.x23'), slot = bp.querySelector('.x23-slot'), bars = [...bp.querySelectorAll('.bars .bar i')];
    if (!stage || !huge || !slot) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      let start = { x: 0, y: 0, s: 1 };
      function layout() {
        const sr = stage.getBoundingClientRect(), cr = slot.getBoundingClientRect();
        huge.style.fontSize = getComputedStyle(slot).fontSize; huge.style.left = (cr.left - sr.left) + 'px'; huge.style.top = (cr.top - sr.top) + 'px'; huge.style.transform = 'none';
        const hr = huge.getBoundingClientRect(); const S = Math.min(sr.width * .8 / hr.width, sr.height * .6 / hr.height);
        start = { x: (sr.width - hr.width * S) / 2 - (cr.left - sr.left), y: (sr.height - hr.height * S) / 2 - (cr.top - sr.top), s: S };
      }
      const st = ScrollTrigger.create({
        trigger: bp, start: 'top ' + BAR + 'px', end: 'bottom bottom', scrub: true, onRefresh: layout,
        onUpdate: s => {
          const p = s.progress, k = easeIO(seg(p, .25, .72)), b = easeIO(seg(p, .05, .5));
          huge.style.transform = 'translate(' + (start.x * (1 - k)).toFixed(1) + 'px,' + (start.y * (1 - k)).toFixed(1) + 'px) scale(' + (start.s + (1 - start.s) * k).toFixed(4) + ')';
          bars.forEach((bar, i) => { bar.style.transform = 'scaleX(' + (i === 0 ? b : b * (1 / 2.3)).toFixed(3) + ')'; });
          bp.classList.toggle('landed', p > .74);
        }
      });
      layout();
      return () => { st.kill(); huge.style.transform = ''; bars.forEach(b => { b.style.transform = ''; }); bp.classList.add('landed'); };
    });
    mm.add('(max-width: 900px)', () => { bp.classList.add('landed'); const st = ScrollTrigger.create({ trigger: bp.querySelector('.bars'), start: 'top 85%', once: true, onEnter: () => bars.forEach((bar, i) => gsap.fromTo(bar, { scaleX: 0 }, { scaleX: i === 0 ? 1 : 1 / 2.3, duration: 1.2, ease: 'power3.out', delay: i * .15 })) }); return () => st.kill(); });
  })();

  /* ── 센터 준비 중 도구 3개: 김 서린 유리 ── */
  if (FX) document.querySelectorAll('.tri .card').forEach((card, idx) => {
    const cv = document.createElement('canvas'); cv.className = 'fog'; cv.setAttribute('aria-hidden', 'true'); card.classList.add('fogged'); card.append(cv);
    const x = cv.getContext('2d'); let W = 0, Hh = 0, wiped = 0, auto = null;
    function paintFog() {
      W = card.clientWidth; Hh = card.clientHeight; cv.width = W; cv.height = Hh;
      x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(20,20,22,.9)'; x.fillRect(0, 0, W, Hh);
      x.fillStyle = 'rgba(242,240,235,.05)'; for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(Math.random() * W, Math.random() * Hh, 20 + Math.random() * 60, 0, 6.2832); x.fill(); }
      x.fillStyle = 'rgba(79,134,247,.06)'; for (let i = 0; i < 10; i++) { x.beginPath(); x.arc(Math.random() * W, Math.random() * Hh, 30 + Math.random() * 80, 0, 6.2832); x.fill(); }
    }
    function wipe(px, py, r) {
      x.globalCompositeOperation = 'destination-out';
      const g = x.createRadialGradient(px, py, r * .2, px, py, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 6.2832); x.fill(); wiped++;
    }
    function autoWipe() {
      if (auto) return; const o = { t: 0 };
      auto = gsap.to(o, { t: 1, duration: 2.4, ease: 'power1.inOut', onUpdate: () => { const t = o.t; wipe(W * (.1 + .8 * t), Hh * (.5 + .38 * Math.sin(t * 9)), 64); wipe(W * (.9 - .8 * t), Hh * (.5 - .38 * Math.cos(t * 7)), 56); }, onComplete: () => { gsap.to(cv, { opacity: 0, duration: .8, onComplete: () => { card.classList.remove('fogged'); } }); } });
    }
    paintFog(); addEventListener('resize', paintFog);
    if (hoverable) card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(); wipe(e.clientX - r.left, e.clientY - r.top, 54); if (wiped > 60) autoWipe(); });
    ScrollTrigger.create({ trigger: card, start: 'top 80%', once: true, onEnter: () => gsap.delayedCall(hoverable ? 2.6 + idx * .5 : 1 + idx * .5, autoWipe) });
  });

  pins.forEach(el => {
    const set = () => { el.querySelectorAll('.pin-anchor').forEach((a, i) => { a.style.top = (FX && wide()) ? ((el.offsetHeight - innerHeight) * ((i + .3) / 3)).toFixed(0) + 'px' : '0'; }); };
    set(); addEventListener('resize', set);
  });

  if (FX) { let rT = 0; document.querySelectorAll('img[loading="lazy"]').forEach(i => i.addEventListener('load', () => { clearTimeout(rT); rT = setTimeout(() => ScrollTrigger.refresh(), 200); })); }
  addEventListener('resize', requestTick);
  addEventListener('load', () => { requestTick(); if (FX) ScrollTrigger.refresh(); });
  addEventListener('scroll', requestTick, { passive: true });
  /* 상단 줄이 64 ↔ 52px 로 줄었다 돌아오는 .4s 동안 문 무대의 문서 자리도 같이 움직인다 — 맨 위로 돌아온 뒤 마지막 scroll 이벤트가 중간값(52)으로 진행도를 계산해 제목이 90% 에 머물렀다(11-03 폰 점검). 전환이 끝나면 한 번 더 계산 */
  if (FX && top) top.addEventListener('transitionend', e => { if (e.propertyName === 'height') requestTick(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (FX) { ScrollTrigger.refresh(); masked.forEach(lines); if (spine) spine.refresh(); } requestTick(); });
  onScroll();

  /* ───────── ④ 미리보기 층 (배포 때 이 절 전체와 .toast 를 뺀다) ───────── */
  const isLive = /(^|\.)heobotss\.com$/.test(location.hostname);
  const LIVE = 'https://heobotss.com';
  const MAP = {
    '/': '../문/index.html',
    '/trainer/': '../trainer/index.html',
    '/center/': '../center/index.html',
    '/center/check/': '../center/index.html#c5',
    '/check/': LIVE + '/#/check',
    '/journal/': 'https://app.heobotss.com/',
    '/proof/': LIVE + '/#/facts',
    '/tools/': LIVE + '/#/tools',
    '/about/': LIVE + '/',
    '/free/': LIVE + '/free/rereg/'
  };
  let toastT = 0;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 5000);
  }
  if (!isLive) {
    /* v3: 「/trainer/#t-vod」처럼 # 가 붙은 주소는 앞부분만 표에서 찾고 # 은 그대로 잇는다(문 하단 사다리 「VOD 강의」 → 트레이너 길의 메일 칸) */
    document.querySelectorAll('a[href^="/"]').forEach(a => { const h = a.getAttribute('href'), i = h.indexOf('#'), path = i < 0 ? h : h.slice(0, i), hash = i < 0 ? '' : h.slice(i); a.setAttribute('href', path in MAP ? MAP[path] + hash : LIVE + h); });
  }
  if (FX) document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a || a.closest('.doors') || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    const h = a.getAttribute('href'); if (!/index\.html/.test(h) || /^#/.test(h)) return;
    e.preventDefault(); veil.cover(() => { location.href = a.href; }, e.clientX, e.clientY);
  });
  document.querySelectorAll('form[data-preview]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const msg = f.querySelector('.msg'); let bad = null;
      f.querySelectorAll('input[required]').forEach(i => {
        const v = i.value.trim();
        const ok = i.dataset.check === 'naver' ? (/^https?:\/\/\S+$/.test(v) && /naver/i.test(v)) : v.length > 0;
        i.classList.toggle('err', !ok); if (!ok && !bad) bad = i;
      });
      if (bad) { msg.className = 'msg'; msg.textContent = bad.dataset.say || '칸을 채워 주세요.'; bad.focus(); return; }
      msg.className = 'msg pv'; msg.textContent = '미리보기라 전송하지 않았습니다. 완성본에서는 여기서 카카오 또는 이메일로 계정을 정하고 바로 신청됩니다.';
    });
  });
  /* 열리면 메일로 알려 드리는 칸(VOD 준비 중): 붙일 서버 호출 = site\free\_틀.html earlyForm 과 같은 길(news_signup). free-claim 의 "early" 는 이 칸과 무관 */
  document.querySelectorAll('form[data-early]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const email = f.querySelector('input[type="email"]'), agree = f.querySelector('input[type="checkbox"]'), msg = f.querySelector('.msg');
      const v = email.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { email.classList.add('err'); msg.className = 'msg'; msg.textContent = '메일 주소를 다시 확인해 주세요.'; email.focus(); return; }
      email.classList.remove('err');
      if (!agree.checked) { msg.className = 'msg'; msg.textContent = '알림을 보내려면 수신 동의가 필요합니다.'; agree.focus(); return; }
      msg.className = 'msg pv'; msg.textContent = '미리보기라 적어 두지 않았습니다. 완성본에서는 news_signup 으로 메일을 적어 두고, 열리는 날 아침에 먼저 보내 드립니다.';
    });
  });
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
    if (!isLive) { toast('미리보기: 완성본에서는 ' + b.dataset.copy + ' 가 복사됩니다. 받는 페이지 /journal/ 이 아직 없습니다.'); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(() => toast('링크를 복사했습니다.'));
  }));
})();
