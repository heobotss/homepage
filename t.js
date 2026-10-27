/* 허봇스 유입 측정 (2026-09-18) — 어느 링크를 타고 왔는지 기억해 두고, 연락처를 남길 때 같이 보낸다
   링크 규칙 (결제\05_링크규칙.md):
     ?utm_source=instagram&utm_medium=reels&utm_content=R-01   ← 정식
     ?r=R-01                                                      ← 줄임 (인스타 릴스로 본다)
   - 링크 값은 이 브라우저에 30일 기억 (다른 링크를 타고 오면 새 값으로 바꾼다)
   - 방문(land)은 탭 하나에 한 번만 funnel_events 에 적는다. 이름·메일 같은 개인정보는 없다
   - 폼은 HBT.pack() 을 요청에 넣으면 된다 → { visitor, utm:{source,medium,campaign,content} } */
(function () {
  "use strict";
  /* 로컬 미리보기·검수에서는 세지 않는다 — 운영 통계가 더러워진다 (10-01)
     10-27 수업일지(app.heobotss.com)도 같은 파일을 불러 센다 — 일지 축 릴스 링크가 거기로 간다 */
  var HOST = location.hostname, APP = HOST === "app.heobotss.com";
  if (HOST !== "heobotss.com" && HOST !== "www.heobotss.com" && !APP) return;
  var URL_ = "https://kpubgeejyiupdvbbdxwt.supabase.co/rest/v1/funnel_events";
  var KEY = "sb_publishable_09UkwFHF2-tqRQexECgFUw_eyrPlCvD";
  var DAYS = 30;
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function ss(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
  }
  function clip(s, n) { s = String(s || "").trim().replace(/[^\w.\-가-힣]/g, "").slice(0, n); return s || null; }
  /* 강의 소개 페이지와 같은 방문자 id (heobotss-vid) */
  function visitor() {
    var k = "heobotss-vid", v = ls(k);
    if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); ls(k, v); }
    return v || "";
  }

  var q = new URLSearchParams(location.search);

  /* 10-27 대표님 방문 구분(mine) — 시험 방문이 방문자·진단 시작·결제 클릭에 그대로 섞이던 것(전수 점검 D).
     ?mine=1 로 한 번 들어오면 이 브라우저는 계속 「내 방문」, ?mine=0 이면 해제.
     대표님 메일로 로그인한 적이 있는 브라우저도 저절로 「내 방문」이 된다 (메일은 보내지 않고 이 브라우저 안에서만 본다) */
  if (q.get("mine") === "1") ls("hb-mine", "1");
  if (q.get("mine") === "0") { try { localStorage.removeItem("hb-mine"); } catch (e) {} }
  (function () {
    var 내메일 = /^gjwodbs77(\+[^@]*)?@gmail\.com$|^gjwodbs7@naver\.com$/i;
    ["hb-auth", "sb-kpubgeejyiupdvbbdxwt-auth-token"].forEach(function (k) {
      try { var o = JSON.parse(ls(k) || "null"); var m = o && o.user && o.user.email; if (m && 내메일.test(m)) ls("hb-mine", "1"); } catch (e) {}
    });
  })();
  var MINE = ls("hb-mine") === "1" ? 1 : 0;
  var now = {
    source: clip(q.get("utm_source"), 40), medium: clip(q.get("utm_medium"), 40),
    campaign: clip(q.get("utm_campaign"), 60), content: clip(q.get("utm_content"), 40)
  };
  var r = clip(q.get("r"), 40);
  if (r && !now.source && !now.content) {
    now.content = r.toUpperCase();
    /* T- 로 시작하면 트레이너 성적표 카드의 추천 링크다 (성적표인증\트레이너.json) — 「추천」 채널로 따로 센다 */
    if (now.content.indexOf("T-") === 0) { now.source = "referral"; now.medium = "trainer"; }
    else { now.source = "instagram"; now.medium = "reels"; }
  }
  var hasNow = !!(now.source || now.content);

  if (hasNow) ls("hb-utm", JSON.stringify({ u: now, at: Date.now() }));
  function kept() {
    try {
      var o = JSON.parse(ls("hb-utm") || "null");
      if (o && Date.now() - o.at < DAYS * 864e5) return o.u;
    } catch (e) {}
    return { source: null, medium: null, campaign: null, content: null };
  }

  function send(ev, page, utm) {
    try {
      fetch(URL_, {
        method: "POST", keepalive: true,
        headers: { "Content-Type": "application/json", apikey: KEY, Prefer: "return=minimal" },
        body: JSON.stringify({
          event: ev, page: String(page).slice(0, 60), visitor: visitor(), mine: MINE,
          utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign, utm_content: utm.content
        })
      }).catch(function () {});
    } catch (e) {}
  }
  function pageName() {
    var p = location.pathname.replace(/index\.html$/, "").replace(/^\/|\/$/g, "");
    if (APP) return p ? "app/" + p : "app";
    return p || "home";
  }

  /* 방문 — 탭마다 한 번. 링크를 타고 온 방문만 링크 값을 단다 (다시 들어온 방문은 빈칸 → 주간 표에서 「번호 없음」) */
  var EMPTY = { source: null, medium: null, campaign: null, content: null };
  if (!ss("hb-landed") || hasNow) { ss("hb-landed", "1"); send("land", pageName(), hasNow ? now : EMPTY); }

  /* 10-14 — 수익 갈래가 결과만 남고 새는 단계가 안 보이던 것(진단 A14).
     결제 페이지로 가는 링크는 buy, 해시 화면 열람은 view 로 남긴다. 개인정보 없음 */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="pay/?p="]');
    if (!a) return;
    var m = /[?&]p=([A-Za-z0-9_\-]+)/.exec(a.getAttribute("href") || "");
    send("buy", "pay:" + (m ? m[1] : "?"), kept());
  }, true);
  window.addEventListener("hashchange", function () {
    var h = (location.hash || "").replace(/^#\/?/, "").split(/[?#]/)[0];
    if (h) send("view", "#" + h.slice(0, 40), kept());
  });

  /* 10-27 홈 스크롤 — 해시가 안 바뀌면 view 가 안 찍혀 「홈에서 뭘 봤는지」가 0이었다(전수 점검 D).
     메인 페이지에서 화면마다 25·50·75·100% 를 처음 넘을 때 한 번씩 view 「#home:50%」 로 남긴다 */
  if (!APP && /^\/(index\.html)?$/.test(location.pathname)) {
    var 찍음 = {}, 대기 = null;
    var 재기 = function () {
      대기 = null;
      var 화면 = (location.hash || "").replace(/^#\/?/, "").split(/[?#]/)[0] || "home";
      if (화면.indexOf("s-") === 0) 화면 = "home";
      var 높이 = document.documentElement.scrollHeight - innerHeight;
      if (높이 < 200) return;
      var 비율 = Math.min(100, Math.round(scrollY / 높이 * 100));
      [25, 50, 75, 100].forEach(function (n) {
        var k = 화면 + ":" + n;
        if (비율 >= n - (n === 100 ? 3 : 0) && !찍음[k] && !ss("hb-sc-" + k)) {
          찍음[k] = 1; ss("hb-sc-" + k, "1"); send("view", ("#" + 화면).slice(0, 40) + ":" + n + "%", kept());
        }
      });
    };
    addEventListener("scroll", function () { if (!대기) 대기 = setTimeout(재기, 400); }, { passive: true });
  }

  window.HBT = {
    visitor: visitor,
    utm: kept,
    pack: function () { return { visitor: visitor(), utm: kept() }; },
    event: function (ev, page) { send(ev, page || pageName(), kept()); }
  };
})();
