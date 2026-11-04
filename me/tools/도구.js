/* 내 프로그램 화면 (2026-11-03)
   접근은 서버 함수 tool_tier 하나만 믿는다. 화면을 속여도 서버 정책이 막는다. */
(function () {
  "use strict";
  var HB = window.HB, sb = HB.sb, esc = HB.esc;
  var 앱 = document.getElementById("app");
  var 층순서 = { none: 0, member: 1, center: 2 };
  var 층 = "none", 나 = null;

  var 도구 = [
    { id: "blog", 이름: "내 블로그 진단서", 말: "왜 검색에 안 걸리는지 소견서 한 장", 층: "free", 그림: 진단화면 },
    { id: "rank", 이름: "내 블로그 순위판 · 레벨", 말: "키워드 순위를 매주 재고, 레벨과 지킨 자리를 봅니다", 층: "member", 그림: 순위화면 },
    { id: "tier", 이름: "블로그 체급 판정", 말: "이 키워드에 지금 도전해도 되는지 먼저 봅니다", 층: "member", 그림: 체급화면 },
    { id: "review", 이름: "블로그 검수기", 말: "올리기 전에 고칠 곳을 한 줄씩 받습니다", 층: "member", 그림: 검수화면 },
    { id: "center", 이름: "센터 등록", 말: "플레이스 번호와 키워드를 한 번만 넣습니다", 층: "center", 그림: 등록화면 },
    { id: "rediag", 이름: "매달 재진단", 말: "지난달과 무엇이 달라졌는지 카드로 봅니다", 층: "center", 그림: 재진단화면 },
    { id: "place", 이름: "센터 플레이스 추적기", 말: "우리 검색어 순위와 경쟁 센터 변화를 매주 봅니다", 층: "center", 그림: 추적화면 },
    { id: "rereg", 이름: "재등록 · VIP 추적 · 팀보드", 말: "파일 두 개로 재등록률과 지금 연락할 회원이 나옵니다", 층: "center", 주소: "rereg/" },
    { id: "inflow", 이름: "유입경로 추적기", 말: "문의가 어느 채널에서 왔는지 쌓고 분기로 봅니다", 층: "center", 그림: 유입화면 },
    { id: "market", 이름: "동네 시세표", 말: "PT 회당·헬스 월당 시세와 영업시간, 개업·폐업 수", 층: "center", 그림: 시세화면 },
    { id: "ai", 이름: "AI 등장률", 말: "AI 답에 우리 센터가 나오는 비율을 분기마다 잽니다", 층: "center", 그림: AI화면 },
    { id: "levels", 이름: "센터 블로그 레벨표", 말: "선생님들 블로그 레벨과 글이 멈춘 사람을 한 표로", 층: "center", 그림: 레벨화면 }
  ];

  function 쓸수있나(d) {
    if (d.층 === "free") return !!나;
    return 층순서[층] >= 층순서[d.층];
  }
  function 그리기(h) { 앱.innerHTML = h; window.scrollTo(0, 0); }
  function 머리(이름, 말) {
    return '<a class="back" href="#">← 내 프로그램</a><h1>' + esc(이름) + '</h1><p class="lead">' + esc(말) + "</p>";
  }
  function 값(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }

  function 목록() {
    var h = '<h1>내 프로그램</h1><p class="lead">설치 없이 여기서 바로 씁니다.</p>';
    [["free", "무료"], ["member", "멤버십"], ["center", "센터 플랜"]].forEach(function (t) {
      h += '<p class="tier">' + t[1] + '</p><div class="grid">';
      도구.filter(function (d) { return d.층 === t[0]; }).forEach(function (d) {
        var 됨 = 쓸수있나(d);
        var 곳 = !됨 ? "/plan/" : (d.주소 || "#" + d.id);
        h += '<a class="tool' + (됨 ? "" : " off") + '" href="' + 곳 + '"><b>' + esc(d.이름) + "</b><span>" +
          esc(됨 ? d.말 : (t[0] === "center" ? "센터 플랜에서 씁니다" : "멤버십에서 씁니다")) + "</span></a>";
      });
      h += "</div>";
    });
    그리기(h);
  }

  /* 대기 줄 공통: 넣고 → 결과가 나올 때까지 본다 */
  function 일넣기(tool, input, 결과칸, 그림) {
    var 칸 = document.getElementById(결과칸);
    칸.innerHTML = '<p class="msg ok">순서를 기다리는 중입니다. 보통 몇 분 안에 나옵니다. 이 화면을 닫으셔도 결과는 남습니다.</p>';
    return sb.from("tool_jobs").insert({ tool: tool, input: input }).select("id").single().then(function (r) {
      if (r.error) throw r.error;
      기다리기(r.data.id, 칸, 그림);
    }).catch(function (e) {
      칸.innerHTML = '<p class="msg">' + esc(HB.kr(e) || e.message || "넣지 못했습니다. 잠시 뒤 다시 해 주세요.") + "</p>";
    });
  }
  function 기다리기(id, 칸, 그림) {
    var n = 0;
    (function 묻기() {
      sb.from("tool_jobs").select("status,result,error").eq("id", id).single().then(function (r) {
        if (!document.body.contains(칸)) return;
        var d = r.data;
        if (d && d.status === "done") { 칸.innerHTML = 그림(d.result); return; }
        if (d && d.status === "failed") { 칸.innerHTML = '<p class="msg">' + esc(d.error || "처리하지 못했습니다.") + "</p>"; return; }
        if (++n < 120) setTimeout(묻기, 10000);
        else 칸.innerHTML = '<p class="msg ok">시간이 더 걸리고 있습니다. 나중에 이 화면을 다시 열면 지난 결과가 보입니다.</p>';
      });
    })();
  }
  function 지난결과(tool, 칸id, 그림) {
    sb.from("tool_jobs").select("status,result,created_at").eq("tool", tool).eq("status", "done")
      .order("created_at", { ascending: false }).limit(1).then(function (r) {
        var 칸 = document.getElementById(칸id);
        if (칸 && r.data && r.data[0] && !칸.innerHTML) {
          칸.innerHTML = '<p class="note">지난 결과 ' + esc(r.data[0].created_at.slice(0, 10)) + "</p>" + 그림(r.data[0].result);
        }
      });
  }
  function 폼(id, 칸들, 글자) {
    return '<form id="' + id + '" class="card">' + 칸들.map(function (c) {
      return "<label for=\"" + c[0] + "\">" + esc(c[1]) + "</label>" + (c[3] ? '<small class="why">' + esc(c[3]) + "</small>" : "") +
        (c[4] === "area" ? '<textarea id="' + c[0] + '" rows="3" placeholder="' + esc(c[2] || "") + '"></textarea>'
          : '<input id="' + c[0] + '" placeholder="' + esc(c[2] || "") + '" autocomplete="off">');
    }).join("") + '<button class="go">' + esc(글자) + "</button></form>";
  }

  function 진단화면() {
    그리기(머리("내 블로그 진단서", "아이디를 넣으면 지금 고칠 순서가 나옵니다.") +
      폼("f", [["blog", "블로그 주소나 아이디", "blog.naver.com/아이디"], ["kw", "노리는 키워드 (선택)", "원주 PT"]], "진단받기") + '<div id="r"></div>');
    function 그림(d) {
      return '<div class="card"><h2>' + esc(d.블로그) + "</h2><p>방문 " + (d.방문 || 0).toLocaleString() + " · 이웃 " + (d.이웃 || 0).toLocaleString() + " · 최근 30일 글 " + d.글30일 + "건</p>" +
        (d.소견.length ? d.소견.map(function (x) { return '<p><span class="dot ' + esc(x.색) + '"></span>' + esc(x.말) + "</p>"; }).join("") : "<p>지금 걸리는 곳이 없습니다.</p>") +
        '<p class="note">우리 기준입니다. 네이버 공식 지표가 아닙니다.</p></div>';
    }
    document.getElementById("f").onsubmit = function (e) { e.preventDefault(); 일넣기("blogdiag", { blog: 값("blog"), keyword: 값("kw") }, "r", 그림); };
    지난결과("blogdiag", "r", 그림);
  }

  function 체급화면() {
    그리기(머리("블로그 체급 판정", "상위 글 체급과 내 블로그를 맞대 바로 답합니다.") +
      폼("f", [["blog", "내 블로그 주소나 아이디", "blog.naver.com/아이디"], ["kw", "도전할 키워드", "원주 PT"]], "판정받기") + '<div id="r"></div>');
    function 그림(d) {
      var 색 = d.답 === "도전 가능" ? "도전" : (d.답 === "아직" ? "아직" : "빠듯");
      return '<div class="card"><p class="note">「' + esc(d.키워드 || "") + '」</p><p class="answer ' + 색 + '">' + esc(d.답) + "</p><p>" + esc(d.이유) + "</p>" +
        (d.표준글자수 ? "<p>이 판의 표준은 " + d.표준글자수.toLocaleString() + "자 · 사진 " + (d.표준사진 || 0) + "장입니다.</p>" : "") +
        (d.표 && d.표.length ? '<div class="scroll"><table><tr><th>순위</th><th>내 체급 이하</th><th>글자</th><th>사진</th></tr>' + d.표.map(function (x) {
          return "<tr><td>" + x.순위 + "위</td><td>" + (x.내체급이하 ? "예" : "-") + "</td><td>" + (x.글자수 == null ? "-" : x.글자수.toLocaleString()) + "</td><td>" + (x.사진 == null ? "-" : x.사진) + "</td></tr>";
        }).join("") + "</table></div>" : "") + '<p class="note">' + esc(d.기준 || "") + "</p></div>";
    }
    document.getElementById("f").onsubmit = function (e) { e.preventDefault(); 일넣기("tier", { blog: 값("blog"), keyword: 값("kw") }, "r", 그림); };
    지난결과("tier", "r", 그림);
  }

  function 검수화면() {
    그리기(머리("블로그 검수기", "글 주소를 넣으면 고칠 곳을 한 줄씩 돌려줍니다.") +
      폼("f", [["url", "글 주소", "https://blog.naver.com/아이디/글번호"], ["kw", "메인 키워드", "원주 PT"]], "검수받기") + '<div id="r"></div>');
    function 그림(d) {
      return '<div class="card"><h2>' + esc(d.글제목 || "") + "</h2>" +
        (d.통과 ? '<p class="msg ok">기계로 보는 항목은 고칠 곳이 없습니다.</p>' : "<p>고칠 곳 " + d.고칠곳.length + '개</p><ul class="fix">' + d.고칠곳.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>") +
        (d.사람확인 ? '<p class="note">문장 품질 같은 ' + d.사람확인 + "개 항목은 기계로 판단하지 않았습니다.</p>" : "") + "</div>";
    }
    document.getElementById("f").onsubmit = function (e) { e.preventDefault(); 일넣기("review", { url: 값("url"), keyword: 값("kw") }, "r", 그림); };
    지난결과("review", "r", 그림);
  }

  function 순위화면() {
    그리기(머리("내 블로그 순위판", "키워드 순위를 매주 재서 올랐는지 내렸는지 보여 줍니다. 레벨과 지킨 자리도 여기에 나옵니다.") + '<div id="r"></div>' +
      폼("f", [["name", "이름", "리뷰·블로그에 쓰는 이름"], ["blog", "블로그 주소나 아이디", "blog.naver.com/아이디"], ["kws", "추적할 키워드", "원주 PT, 원주 헬스장", "쉼표로 나눠 10개까지", "area"]], "등록하기"));
    function 그림(d) {
      return '<div class="card"><p><a href="' + esc(d.주소) + '" target="_blank" rel="noopener">내 순위판 열기</a></p><p class="note">주소는 나만 아는 긴 주소입니다. 매주 월요일에 갱신됩니다.</p></div>';
    }
    document.getElementById("f").onsubmit = function (e) { e.preventDefault(); 일넣기("rank_register", { name: 값("name"), blog: 값("blog"), keywords: 값("kws") }, "r", 그림); };
    지난결과("rank_register", "r", 그림);
  }

  function 내센터() { return sb.from("center_profiles").select("*").maybeSingle(); }

  function 등록화면() {
    그리기(머리("센터 등록", "한 번만 넣으면 추적기와 재진단이 이 정보로 돕니다.") +
      폼("f", [["pid", "플레이스 주소나 번호", "https://map.naver.com/... 또는 숫자", "이름으로 받지 않습니다. 같은 이름 지점이 겹치기 때문입니다."],
        ["pname", "센터 이름", "화면과 메일에 쓰는 이름"], ["region", "지역", "원주 또는 서울 강남구", "시·군·구까지"],
        ["kws", "우리 검색어", "원주 PT, 원주 헬스장", "쉼표로 나눠 10개까지", "area"],
        ["comps", "경쟁 센터 플레이스 번호 (선택)", "1234567, 7654321", "쉼표로 나눠 10곳까지", "area"],
        ["trs", "선생님 블로그 (선택)", "김선생 kimpt01\n이선생 leept02", "한 줄에 이름과 블로그 아이디", "area"]], "저장하기") + '<div id="r"></div>');
    내센터().then(function (r) {
      var c = r.data; if (!c) return;
      document.getElementById("pid").value = c.place_id; document.getElementById("pname").value = c.place_name;
      document.getElementById("region").value = c.region; document.getElementById("kws").value = (c.keywords || []).join(", ");
      document.getElementById("comps").value = (c.competitors || []).join(", ");
      document.getElementById("trs").value = (c.trainers || []).map(function (t) { return t.name + " " + t.blog; }).join("\n");
    });
    document.getElementById("f").onsubmit = function (e) {
      e.preventDefault();
      var 칸 = document.getElementById("r");
      var 나눔 = function (v) { return v.split(/[,\n]/).map(function (x) { return x.trim(); }).filter(Boolean); };
      var m = 값("pid").match(/(\d{4,15})(?!.*\d{4,15})/);
      if (!m) { 칸.innerHTML = '<p class="msg">플레이스 번호를 찾지 못했습니다. 주소에 있는 숫자를 넣어 주세요.</p>'; return; }
      var 줄 = { user_id: 나.id, place_id: m[1], place_name: 값("pname"), region: 값("region"),
        keywords: 나눔(값("kws")).slice(0, 10), competitors: 나눔(값("comps")).filter(function (x) { return /^\d{4,15}$/.test(x); }).slice(0, 10),
        trainers: 값("trs").split("\n").map(function (s) { var p = s.trim().split(/\s+/); return p.length >= 2 ? { name: p.slice(0, -1).join(" "), blog: p[p.length - 1] } : null; }).filter(Boolean),
        updated_at: new Date().toISOString() };
      if (!줄.place_name || !줄.region) { 칸.innerHTML = '<p class="msg">센터 이름과 지역을 넣어 주세요.</p>'; return; }
      sb.from("center_profiles").upsert(줄).then(function (x) {
        칸.innerHTML = x.error ? '<p class="msg">' + esc(HB.kr(x.error) || "저장하지 못했습니다.") + "</p>" : '<p class="msg ok">저장했습니다. 다음 월요일 리포트부터 이 정보로 잽니다.</p>';
      });
    };
  }

  function 결과목록(kind, 빈말, 그림) {
    var 칸 = document.getElementById("r");
    sb.from("center_reports").select("*").eq("kind", kind).order("period", { ascending: false }).limit(12).then(function (r) {
      if (!r.data || !r.data.length) { 칸.innerHTML = '<div class="card"><p>' + esc(빈말) + "</p></div>"; return; }
      칸.innerHTML = r.data.map(그림).join("");
      r.data.forEach(function (d, i) { (d.files || []).length && 카드넣기(d, i); });
    });
  }
  function 카드넣기(d, i) {
    var 칸 = document.getElementById("cards" + i); if (!칸) return;
    sb.storage.from("center-reports").createSignedUrls(d.files, 3600).then(function (r) {
      칸.innerHTML = (r.data || []).map(function (x) { return x.signedUrl ? '<a href="' + esc(x.signedUrl) + '" target="_blank" rel="noopener"><img loading="lazy" alt="진단 카드" src="' + esc(x.signedUrl) + '"></a>' : ""; }).join("");
    });
  }
  function 재진단화면() {
    그리기(머리("매달 재진단", "매달 초 다시 재서 지난번과 무엇이 달라졌는지 보여 줍니다.") + '<div id="r"></div>');
    결과목록("rediag", "아직 결과가 없습니다. 센터를 등록하면 이번 달 재진단부터 여기에 올라옵니다.", function (d, i) {
      return '<div class="card"><h2>' + esc(d.title) + "</h2><p>" + esc(d.payload.전진단 || "") + " 이후 변화 · 카드 " + (d.payload.장수 || d.files.length) + '장</p><div class="cards" id="cards' + i + '"></div></div>';
    });
  }
  function 추적화면() {
    그리기(머리("센터 플레이스 추적기", "매주 월요일 메일로 보내고, 지난 기록은 여기에 쌓입니다.") + '<div id="r"></div>');
    결과목록("place_weekly", "아직 결과가 없습니다. 센터 등록을 마치면 다음 월요일부터 올라옵니다.", function (d) {
      var p = d.payload;
      var 표 = function (줄) { return '<div class="scroll"><table><tr><th>검색어</th><th>순위</th><th>변화</th></tr>' + 줄.map(function (x) { return "<tr><td>" + esc(x.키워드) + "</td><td>" + esc(x.순위) + "</td><td>" + esc(x.변화) + "</td></tr>"; }).join("") + "</table></div>"; };
      return '<div class="card"><h2>' + esc(d.title) + '</h2><p class="note">측정일 ' + esc(p.기준일) + "</p>" + 표(p.내순위) + (p.경쟁 || []).map(function (c) { return "<h3>" + esc(c.이름) + "</h3>" + 표(c.줄); }).join("") + '<p class="note">공개 화면을 잰 값입니다. 위치·시각에 따라 달라질 수 있습니다.</p></div>';
    });
  }

  var 채널 = ["네이버 플레이스", "블로그", "인스타그램", "지인 소개", "회원 소개", "전단·현수막", "지나가다", "기타"];
  function 유입화면() {
    그리기(머리("유입경로 추적기", "문의 한 건을 10초에 적으면 어느 채널이 회원을 데려오는지 나옵니다.") +
      '<form id="f" class="card"><label for="d">문의 날짜</label><input id="d" type="date"><label for="c">어디서 알고 왔나</label><select id="c">' + 채널.map(function (x) { return "<option>" + x + "</option>"; }).join("") +
      '</select><label for="i">관심 (선택)</label><input id="i" placeholder="PT, 필라테스"><label for="o">결과</label><select id="o"><option>진행</option><option>등록</option><option>미등록</option></select><label for="t">담당 (선택)</label><input id="t"><label for="m">메모 (선택)</label><small class="why">회원 이름과 연락처는 적지 말아 주세요.</small><input id="m" maxlength="200"><button class="go">기록하기</button><p id="s" class="msg"></p></form><div id="r"></div>');
    document.getElementById("d").value = new Date(Date.now() + 324e5).toISOString().slice(0, 10);
    function 표그리기() {
      sb.from("center_inflow").select("id,asked_on,channel,interest,outcome,trainer").order("asked_on", { ascending: false }).limit(2000).then(function (r) {
        var 줄 = r.data || [], 칸 = document.getElementById("r");
        if (!칸) return;
        칸.innerHTML = 유입요약(줄);
      });
    }
    document.getElementById("f").onsubmit = function (e) {
      e.preventDefault();
      sb.from("center_inflow").insert({ asked_on: 값("d"), channel: 값("c"), interest: 값("i") || null, outcome: 값("o"), trainer: 값("t") || null, memo: 값("m") || null }).then(function (x) {
        var s = document.getElementById("s");
        s.textContent = x.error ? (HB.kr(x.error) || "저장하지 못했습니다.") : "기록했습니다."; s.className = "msg" + (x.error ? "" : " ok");
        if (!x.error) { document.getElementById("i").value = ""; document.getElementById("m").value = ""; 표그리기(); }
      });
    };
    표그리기();
  }
  function 유입요약(줄) {
    if (!줄.length) return '<div class="card"><p>첫 문의를 적으면 표가 나옵니다.</p></div>';
    var 분기 = function (d) { return d.slice(0, 4) + "년 " + (Math.floor((+d.slice(5, 7) - 1) / 3) + 1) + "분기"; };
    var 묶음 = {};
    줄.forEach(function (x) { var q = 분기(x.asked_on); (묶음[q] = 묶음[q] || {})[x.channel] = 묶음[q][x.channel] || { 문의: 0, 등록: 0 }; 묶음[q][x.channel].문의++; if (x.outcome === "등록") 묶음[q][x.channel].등록++; });
    return Object.keys(묶음).sort().reverse().map(function (q) {
      var 줄들 = Object.keys(묶음[q]).map(function (c) { return { c: c, v: 묶음[q][c] }; }).sort(function (a, b) { return b.v.문의 - a.v.문의; });
      return '<div class="card"><h2>' + q + '</h2><div class="scroll"><table><tr><th>채널</th><th>문의</th><th>등록</th><th>등록률</th></tr>' + 줄들.map(function (x) {
        return "<tr><td>" + esc(x.c) + "</td><td>" + x.v.문의 + "</td><td>" + x.v.등록 + "</td><td>" + Math.round(x.v.등록 / x.v.문의 * 100) + "%</td></tr>";
      }).join("") + "</table></div></div>";
    }).join("");
  }

  /* 프로그램이 만든 글을 그대로 안전하게 보여 준다(HTML 은 전부 이스케이프) */
  function 글그림(md) {
    var 줄 = String(md || "").split("\n"), h = "", 표 = false;
    줄.forEach(function (l) {
      if (/^\|/.test(l)) {
        if (/^\|[\s:|-]+\|$/.test(l)) return;
        if (!표) { h += '<div class="scroll"><table>'; 표 = true; }
        h += "<tr>" + l.split("|").slice(1, -1).map(function (c) { return "<td>" + 글(c.trim()) + "</td>"; }).join("") + "</tr>"; return;
      }
      if (표) { h += "</table></div>"; 표 = false; }
      if (/^## /.test(l)) h += "<h2>" + 글(l.slice(3)) + "</h2>";
      else if (/^# /.test(l)) h += "<h1>" + 글(l.slice(2)) + "</h1>";
      else if (/^> /.test(l)) h += "<blockquote>" + 글(l.slice(2)) + "</blockquote>";
      else if (/^---/.test(l)) h += "";
      else if (l.trim()) h += "<p>" + 글(l) + "</p>";
    });
    return h + (표 ? "</table></div>" : "");
  }
  function 글(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`/g, ""); }

  function 시세화면() {
    그리기(머리("동네 시세표", "우리 동네 값과 영업시간, 새로 생기고 닫은 곳의 수를 봅니다.") +
      폼("f", [["reg", "지역", "원주 또는 서울 강남구", "시·군·구 단위"], ["our", "우리 센터 이름 (선택)", "표에서 우리 자리를 함께 봅니다"]], "시세표 받기") + '<div id="r"></div>');
    function 그림(d) {
      var o = d.개업폐업 && d.개업폐업.표;
      return '<div class="card md">' + (o ? "<h2>개업 · 폐업 (인허가 파일 " + esc(d.개업폐업.기준파일일) + " 기준)</h2><p>영업 중 " + o.영업중 + "곳 · 최근 90일 개업 " + o.최근90일개업 + "곳 · 폐업 " + o.최근90일폐업 + "곳</p>" : "") +
        글그림(d.단가) + 글그림(d.운영시간) + '<p class="note">' + esc(d.기준 || "") + "</p></div>";
    }
    document.getElementById("f").onsubmit = function (e) { e.preventDefault(); 일넣기("market", { region: 값("reg"), our: 값("our") }, "r", 그림); };
    지난결과("market", "r", 그림);
    내센터().then(function (r) { if (r.data) { document.getElementById("reg").value = r.data.region; document.getElementById("our").value = r.data.place_name; } });
  }

  function AI화면() {
    그리기(머리("AI 등장률", "「우리 지역 PT 추천해 줘」라고 물었을 때 우리 센터가 답에 나오는 비율입니다. 분기에 한 번 잽니다.") +
      '<div class="card"><p>등록한 센터와 지역으로 잽니다.</p><button class="go" id="go">이번 분기 재기</button></div><div id="r"></div>');
    function 그림(d) {
      return '<div class="card"><h2>' + esc(d.지역) + " · " + esc(d.잰날) + '</h2><p class="answer">' + (d.전체비율 == null ? "-" : d.전체비율 + "%") + "</p><p>" + d.전체질문 + "번 물어 " + d.전체등장 + '번 나왔습니다.</p><div class="scroll"><table><tr><th>엔진</th><th>질문</th><th>등장</th><th>비율</th></tr>' +
        d.엔진별.map(function (x) { return "<tr><td>" + esc(x.엔진) + "</td><td>" + x.질문 + "</td><td>" + x.등장 + "</td><td>" + x.비율 + "%</td></tr>"; }).join("") + "</table></div>" +
        (d.자주나온출처.length ? "<h3>AI가 자주 근거로 든 사이트</h3><p>" + d.자주나온출처.map(function (x) { return esc(x.사이트); }).join(" · ") + "</p>" : "") + '<p class="note">' + esc(d.말) + "</p></div>";
    }
    document.getElementById("go").onclick = function () { this.disabled = true; 일넣기("ai", {}, "r", 그림); };
    지난결과("ai", "r", 그림);
  }

  function 레벨화면() {
    그리기(머리("센터 블로그 레벨표", "선생님들 블로그 레벨과 글이 멈춘 사람을 한 표로 봅니다.") +
      '<div class="card"><p>센터 등록에 넣은 선생님 블로그로 잽니다.</p><button class="go" id="go">지금 표 받기</button></div><div id="r"></div>');
    function 그림(d) {
      if (!d.표.length) return '<div class="card"><p>센터 등록에 선생님 블로그를 넣어 주세요.</p></div>';
      return '<div class="card"><div class="scroll"><table><tr><th>선생님</th><th>레벨</th><th>마지막 글</th><th>상태</th></tr>' + d.표.map(function (x) {
        return "<tr><td>" + esc(x.이름) + "</td><td>" + (x.레벨 == null ? "측정 중" : "LV" + x.레벨) + "</td><td>" + (x.마지막글경과일 == null ? "-" : x.마지막글경과일 + "일 전") + "</td><td>" + esc(x.상태) + "</td></tr>";
      }).join("") + '</table></div><p class="note">레벨은 순위판에 등록한 선생님부터 나옵니다. 우리 기준이며 네이버 공식 지표가 아닙니다.</p></div>';
    }
    document.getElementById("go").onclick = function () { 일넣기("levels", {}, "r", 그림); };
    지난결과("levels", "r", 그림);
  }

  function 길찾기() {
    var id = location.hash.slice(1);
    var d = 도구.filter(function (x) { return x.id === id; })[0];
    if (d && d.그림) {
      if (!쓸수있나(d)) { 그리기(머리(d.이름, d.층 === "center" ? "센터 플랜에서 씁니다." : "멤버십에서 씁니다.") + '<p><a href="/plan/">플랜 보기</a></p>'); return; }
      d.그림(); return;
    }
    목록();
  }

  HB.session().then(function (s) {
    나 = s && s.user;
    if (!나) {
      그리기('<h1>내 프로그램</h1><p class="lead">수업일지·강의실과 같은 계정으로 들어옵니다.</p><div id="authBox" class="card"></div>');
      HB.mountAuth(document.getElementById("authBox"), function () { location.reload(); }, {});
      return;
    }
    return sb.rpc("tool_tier").then(function (r) {
      층 = r.error ? "none" : (r.data || "none");
      window.addEventListener("hashchange", 길찾기);
      길찾기();
    });
  }).catch(function () { 그리기('<p class="msg">불러오지 못했습니다. 새로고침해 주세요.</p>'); });

  /* 시험용으로만 노출 */
  window.__도구 = { 유입요약: 유입요약, 글그림: 글그림 };
})();
