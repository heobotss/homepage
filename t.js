/* 허봇스 유입 측정 (2026-09-18) — 어느 링크를 타고 왔는지 기억해 두고, 연락처를 남길 때 같이 보낸다
   링크 규칙 (결제\05_링크규칙.md):
     ?utm_source=instagram&utm_medium=reels&utm_content=R-01   ← 정식
     ?r=R-01                                                      ← 줄임 (인스타 릴스로 본다)
   - 링크 값은 이 브라우저에 30일 기억 (다른 링크를 타고 오면 새 값으로 바꾼다)
   - 방문(land)은 탭 하나에 한 번만 funnel_events 에 적는다. 이름·메일 같은 개인정보는 없다
   - 폼은 HBT.pack() 을 요청에 넣으면 된다 → { visitor, utm:{source,medium,campaign,content} } */
(function () {
  "use strict";
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
  var now = {
    source: clip(q.get("utm_source"), 40), medium: clip(q.get("utm_medium"), 40),
    campaign: clip(q.get("utm_campaign"), 60), content: clip(q.get("utm_content"), 40)
  };
  var r = clip(q.get("r"), 40);
  if (r && !now.source && !now.content) { now.source = "instagram"; now.medium = "reels"; now.content = r.toUpperCase(); }
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
          event: ev, page: String(page).slice(0, 60), visitor: visitor(),
          utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign, utm_content: utm.content
        })
      }).catch(function () {});
    } catch (e) {}
  }
  function pageName() {
    var p = location.pathname.replace(/index\.html$/, "").replace(/^\/|\/$/g, "");
    return p || "home";
  }

  /* 방문 — 탭마다 한 번. 링크를 타고 온 방문만 링크 값을 단다 (다시 들어온 방문은 빈칸 → 주간 표에서 「번호 없음」) */
  var EMPTY = { source: null, medium: null, campaign: null, content: null };
  if (!ss("hb-landed") || hasNow) { ss("hb-landed", "1"); send("land", pageName(), hasNow ? now : EMPTY); }

  window.HBT = {
    visitor: visitor,
    utm: kept,
    pack: function () { return { visitor: visitor(), utm: kept() }; },
    event: function (ev, page) { send(ev, page || pageName(), kept()); }
  };
})();
