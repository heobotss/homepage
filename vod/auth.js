/* 허봇스 계정 — 강의실·결제 페이지가 같이 쓴다.
   수업일지(app.heobotss.com)와 같은 Supabase 계정이다. 주소가 달라 로그인은 따로 한 번 한다. */
(function () {
  "use strict";
  var SB_URL = "https://kpubgeejyiupdvbbdxwt.supabase.co";
  var SB_KEY = "sb_publishable_09UkwFHF2-tqRQexECgFUw_eyrPlCvD";
  var sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, storageKey: "hb-auth" } });

  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var KR = {
    "Invalid login credentials": "이메일 또는 비밀번호가 맞지 않습니다",
    "User already registered": "이미 가입된 이메일입니다. 로그인해 주세요",
    "Password should be at least 6 characters.": "비밀번호는 6자 이상이어야 합니다",
    "Email rate limit exceeded": "메일을 너무 자주 요청했습니다. 잠시 뒤 다시 시도해 주세요"
  };
  function kr(e) { var m = (e && (e.message || e)) || ""; return KR[m] || m; }

  /* 로그인 · 가입 · 비밀번호 찾기 상자를 target 안에 그린다. 끝나면 onDone(session) */
  function mountAuth(target, onDone, opts) {
    opts = opts || {};
    var mode = "login";
    var box = el(
      '<section class="card auth">' +
      '<h2 id="aT">로그인</h2>' +
      '<p class="note" id="aS" style="margin:-4px 0 10px">' + esc(opts.lead || "구매한 강의는 이 계정에서 봅니다. 수업일지를 쓰신다면 같은 계정으로 로그인하세요.") + '</p>' +
      '<div id="aName" hidden><label for="aNm">이름</label><input type="text" id="aNm" autocomplete="name" placeholder="실명"></div>' +
      '<label for="aEm">이메일</label><input type="email" id="aEm" autocomplete="email" placeholder="you@example.com">' +
      '<div id="aPwWrap"><label for="aPw">비밀번호</label><input type="password" id="aPw" autocomplete="current-password" placeholder="6자 이상"></div>' +
      '<p class="msg" id="aMsg"></p>' +
      '<button class="btn" id="aGo" type="button">로그인</button>' +
      '<p class="note" style="margin-top:14px;display:flex;gap:14px;flex-wrap:wrap">' +
      '<a href="#" id="aSw">처음이신가요? 가입하기</a><a href="#" id="aFg">비밀번호를 잊었어요</a></p>' +
      '</section>');
    target.innerHTML = ""; target.appendChild(box);
    var $ = function (id) { return box.querySelector("#" + id); };
    function set(m) {
      mode = m;
      $("aName").hidden = m !== "signup";
      $("aPwWrap").hidden = m === "forgot";
      $("aT").textContent = m === "signup" ? "가입하기" : m === "forgot" ? "비밀번호 찾기" : "로그인";
      $("aGo").textContent = m === "signup" ? "가입하고 시작하기" : m === "forgot" ? "재설정 메일 받기" : "로그인";
      $("aSw").textContent = m === "login" ? "처음이신가요? 가입하기" : "이미 계정이 있어요 — 로그인";
      $("aPw").setAttribute("autocomplete", m === "signup" ? "new-password" : "current-password");
      $("aMsg").textContent = "";
    }
    $("aSw").onclick = function (e) { e.preventDefault(); set(mode === "login" ? "signup" : "login"); };
    $("aFg").onclick = function (e) { e.preventDefault(); set("forgot"); };
    $("aPw").addEventListener("keydown", function (e) { if (e.key === "Enter") $("aGo").click(); });
    $("aGo").onclick = async function () {
      var email = $("aEm").value.trim(), pw = $("aPw").value, name = $("aNm").value.trim();
      $("aMsg").textContent = "";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $("aMsg").textContent = "이메일을 확인해 주세요"; return; }
      $("aGo").disabled = true;
      try {
        if (mode === "forgot") {
          var r0 = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/vod/" });
          if (r0.error) throw r0.error;
          $("aMsg").style.color = "var(--sage)"; $("aMsg").textContent = "재설정 메일을 보냈습니다. 메일의 링크를 눌러 새 비밀번호를 정하세요.";
        } else if (mode === "signup") {
          if (name.length < 2) throw new Error("이름을 적어 주세요");
          if (pw.length < 6) throw new Error("비밀번호는 6자 이상이어야 합니다");
          var r1 = await sb.auth.signUp({ email: email, password: pw, options: { data: { name: name } } });
          if (r1.error) throw r1.error;
          if (!r1.data.session) { var r2 = await sb.auth.signInWithPassword({ email: email, password: pw }); if (r2.error) throw r2.error; }
          onDone && onDone((await sb.auth.getSession()).data.session);
        } else {
          var r3 = await sb.auth.signInWithPassword({ email: email, password: pw });
          if (r3.error) throw r3.error;
          onDone && onDone(r3.data.session);
        }
      } catch (e) { $("aMsg").style.color = ""; $("aMsg").textContent = kr(e); }
      $("aGo").disabled = false;
    };
    set(opts.mode || "login");
  }

  /* 메일의 재설정 링크로 들어오면 새 비밀번호를 받는다 */
  sb.auth.onAuthStateChange(function (ev) {
    if (ev !== "PASSWORD_RECOVERY") return;
    setTimeout(async function () {
      var pw = prompt("새 비밀번호를 입력하세요 (6자 이상)");
      if (!pw) return;
      var r = await sb.auth.updateUser({ password: pw });
      alert(r.error ? "변경하지 못했습니다: " + kr(r.error) : "비밀번호를 바꿨습니다.");
      history.replaceState(null, "", location.pathname);
    }, 300);
  });

  window.HB = { sb: sb, SB_URL: SB_URL, SB_KEY: SB_KEY, mountAuth: mountAuth, esc: esc, kr: kr,
    session: async function () { return (await sb.auth.getSession()).data.session; } };
})();
