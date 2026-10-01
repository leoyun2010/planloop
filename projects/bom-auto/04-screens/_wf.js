/* bom-auto — 와이어프레임 공통 스크립트
   - 상태 전환: .pinbar 의 data-s 버튼 → 같은 이름의 [data-state] 블록만 표시. URL 해시와 동기화(뒤로가기로 되짚기 가능)
     한 요소가 여러 상태에 보이려면 data-state="a b c" 처럼 공백으로 나열한다.
   - 화면 이동: data-go="SCR-xxx.html[#상태]" 는 다른 목업으로, data-go="#상태" 는 같은 화면의 상태로 이동
   - 주석 번호 토글: body.nopins / 이동 요소 강조: body.showlinks
   개별 목업에서 수정하지 말 것. */
(function () {
  function apply(s) {
    if (!s) return;
    document.querySelectorAll("[data-state]").forEach(function (el) {
      el.classList.toggle("on", el.getAttribute("data-state").split(" ").indexOf(s) >= 0);
    });
    document.querySelectorAll(".pinbar [data-s]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-s") === s);
    });
  }
  function known(s) { return !!s && !!document.querySelector('[data-state~="' + s + '"], .pinbar [data-s="' + s + '"]'); }
  window.setState = function (s) {
    if (location.hash.slice(1) !== s) { location.hash = s; } else { apply(s); }
  };
  window.togglePins = function () { document.body.classList.toggle("nopins"); };
  window.toggleLinks = function () { document.body.classList.toggle("showlinks"); };
  window.addEventListener("hashchange", function () { var h = location.hash.slice(1); if (known(h)) apply(h); });
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-go]"); if (!el) return;
    if (el.classList.contains("dis")) return;                     // 비활성 버튼은 이동하지 않음(정책과 동일)
    e.preventDefault(); e.stopPropagation();
    var t = el.getAttribute("data-go");
    if (t.charAt(0) === "#") setState(t.slice(1)); else location.href = t;
  });
  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.querySelector(".pinbar");
    if (bar) {
      var sep = document.createElement("span"); sep.className = "sep"; bar.appendChild(sep);
      var b0 = document.createElement("button"); b0.textContent = "주석 번호 켜기/끄기"; b0.onclick = togglePins; bar.appendChild(b0);
      var b1 = document.createElement("button"); b1.textContent = "이동 가능 요소 표시"; b1.onclick = toggleLinks; bar.appendChild(b1);
      var b2 = document.createElement("button"); b2.textContent = "◀ 화면 목록"; b2.onclick = function () { location.href = "index.html"; }; bar.appendChild(b2);
    }
    var first = document.querySelector(".pinbar [data-s]");
    var h = location.hash.slice(1);
    var init = known(h) ? h : (document.body.getAttribute("data-init") || (first && first.getAttribute("data-s")) || "default");
    apply(init);
  });
})();
