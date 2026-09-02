/* ============================================================
   전도집회 운영 시스템 — 와이어프레임 공통 동작
   목업이 실제로 동작하게 만드는 최소 헬퍼 모음.
   화면 고유 로직은 각 목업 파일 안에 둔다.
   ============================================================ */

/* ---------- 토스트 ---------- */
function toast(msg, ms) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), ms || 2600);
}

/* ---------- 모달 ---------- */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('on'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = id ? document.getElementById(id) : document.querySelector('.mask.on');
  if (m) { m.classList.remove('on'); document.body.style.overflow = ''; }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('click', e => { if (e.target.classList && e.target.classList.contains('mask')) closeModal(e.target.id); });

/* ---------- 탭 ----------
   <div class="tabs" data-tabs="key"><button data-tab="all" class="on">전체</button>...</div>
   onTab(key, fn) 으로 전환 시 콜백을 받는다.                                     */
const _tabCbs = {};
function onTab(key, fn) { (_tabCbs[key] = _tabCbs[key] || []).push(fn); }
document.addEventListener('click', e => {
  const btn = e.target.closest('.tabs [data-tab]');
  if (!btn) return;
  const wrap = btn.closest('.tabs');
  const key = wrap.dataset.tabs;
  wrap.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b === btn));
  (_tabCbs[key] || []).forEach(fn => fn(btn.dataset.tab));
});
function currentTab(key) {
  const on = document.querySelector(`.tabs[data-tabs="${key}"] [data-tab].on`);
  return on ? on.dataset.tab : null;
}

/* ---------- 선택형 옵션 (모바일 .pick) ---------- */
document.addEventListener('click', e => {
  const opt = e.target.closest('.pick .opt');
  if (!opt) return;
  const pick = opt.closest('.pick');
  pick.querySelectorAll('.opt').forEach(o => o.classList.toggle('sel', o === opt));
  pick.dispatchEvent(new CustomEvent('picked', { detail: { value: opt.dataset.value || opt.textContent.trim() } }));
});
function pickValue(sel) {
  const on = document.querySelector(`${sel} .opt.sel`);
  return on ? (on.dataset.value || on.textContent.trim()) : null;
}

/* ---------- 전체 선택 체크박스 ----------
   <input type="checkbox" data-all="rows">  /  <input type="checkbox" data-row="rows"> */
document.addEventListener('change', e => {
  const all = e.target.closest('[data-all]');
  if (all) {
    const k = all.dataset.all;
    document.querySelectorAll(`[data-row="${k}"]`).forEach(c => {
      if (c.disabled || c.closest('tr')?.classList.contains('hidden')) return;
      c.checked = all.checked;
      c.closest('tr')?.classList.toggle('sel', c.checked);
    });
    fireSelect(k);
    return;
  }
  const row = e.target.closest('[data-row]');
  if (row) {
    row.closest('tr')?.classList.toggle('sel', row.checked);
    fireSelect(row.dataset.row);
  }
});
const _selCbs = {};
function onSelect(key, fn) { (_selCbs[key] = _selCbs[key] || []).push(fn); }
function selected(key) {
  return [...document.querySelectorAll(`[data-row="${key}"]:checked`)].filter(c => !c.closest('tr')?.classList.contains('hidden'));
}
function fireSelect(key) { (_selCbs[key] || []).forEach(fn => fn(selected(key))); }
function clearSelect(key) {
  document.querySelectorAll(`[data-row="${key}"]`).forEach(c => { c.checked = false; c.closest('tr')?.classList.remove('sel'); });
  const all = document.querySelector(`[data-all="${key}"]`);
  if (all) all.checked = false;
  fireSelect(key);
}

/* ---------- 테이블 검색·필터 ----------
   rows: tbody tr 목록. test(tr) 가 false면 숨긴다.                                */
function filterRows(tbodySel, test) {
  const rows = document.querySelectorAll(`${tbodySel} tr`);
  let shown = 0;
  rows.forEach(tr => {
    const ok = test(tr);
    tr.classList.toggle('hidden', !ok);
    if (ok) shown++;
  });
  return shown;
}
function textOf(tr) { return (tr.innerText || '').replace(/\s+/g, ' ').toLowerCase(); }

/* ---------- 상태 칩 ---------- */
const CHIP = {
  '매칭':      'ok',
  '확인':      'ok',
  '부분 매칭': 'warn',
  '미매칭':    'bad',
  '대기':      'warn',
  '취소':      'neu',
  '환불':      'bad',
  '해당 없음': 'neu',
};
function chip(label) {
  return `<span class="chip ${CHIP[label] || 'neu'}">${label}</span>`;
}
function setChip(el, label) {
  el.className = `chip ${CHIP[label] || 'neu'}`;
  el.textContent = label;
}

/* ---------- 상태 데모 전환 (기본/로딩/빈/에러) ----------
   각 목업은 #st-default #st-loading #st-empty #st-error 블록을 두고 이 함수를 쓴다. */
function showState(name) {
  ['default', 'loading', 'empty', 'error'].forEach(s => {
    const el = document.getElementById('st-' + s);
    if (el) el.classList.toggle('hidden', s !== name);
  });
  document.querySelectorAll('.statebar [data-state]').forEach(b => b.classList.toggle('on', b.dataset.state === name));
}

/* ---------- 핀(주석 번호) 토글 ---------- */
function togglePins() {
  document.body.classList.toggle('nopins');
  const b = document.getElementById('pinBtn');
  if (b) b.textContent = document.body.classList.contains('nopins') ? '주석 번호 켜기' : '주석 번호 끄기';
}

/* ---------- 정책 검증 헬퍼 (POL 의사코드를 목업에서 실제로 돌린다) ---------- */
const WF = {
  /* POL-042 입력값 형식·길이 */
  normalizePhone: v => (v || '').replace(/[^0-9]/g, ''),
  checkName(v) {
    const s = (v || '').trim();
    if (!s) return '이름을 입력해 주세요.';
    if (s.length < 2 || s.length > 20) return '이름은 2자 이상 20자 이하로 입력해 주세요.';
    return null;
  },
  checkPhone(v) {
    const p = WF.normalizePhone(v);
    if (!p) return '휴대폰 번호를 입력해 주세요.';
    if (!/^\d{10,11}$/.test(p)) return '휴대폰 번호는 숫자 10~11자리로 입력해 주세요.';
    return null;
  },
  checkText(v, max) {
    if ((v || '').length > (max || 500)) return `${max || 500}자 이내로 입력해 주세요.`;
    return null;
  },
  /* 필드에 에러를 붙이거나 지운다 (.inp + .errmsg 구조) */
  mark(inputEl, msg) {
    const box = inputEl.closest('.field, .mfield') || inputEl.parentElement;
    let em = box.querySelector('.errmsg');
    if (!em) { em = document.createElement('div'); em.className = 'errmsg'; box.appendChild(em); }
    inputEl.classList.toggle('err', !!msg);
    em.classList.toggle('on', !!msg);
    em.textContent = msg || '';
    return !msg;
  },
  /* 숫자 포맷 */
  won: n => n.toLocaleString('ko-KR') + '원',
  num: n => n.toLocaleString('ko-KR'),
};

/* ---------- 목업 공통 초기화 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('toast')) {
    const t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t);
  }
});

/* ---------- 화면 간 이동 ----------
   목업은 같은 폴더의 정적 파일이라 실제로 이동한다.
   주의: 페이지를 옮기면 그 화면의 모의 데이터는 초기화된다(각 목업이 독립 파일이기 때문). */
const SCREEN_FILES = {
  'SCR-001': 'SCR-001-접수홈',
  'SCR-002': 'SCR-002-접수폼-기본정보',
  'SCR-003': 'SCR-003-동행자추가',
  'SCR-004': 'SCR-004-상태입력',
  'SCR-005': 'SCR-005-동의',
  'SCR-006': 'SCR-006-신청완료',
  'SCR-007': 'SCR-007-본인확인',
  'SCR-008': 'SCR-008-마이페이지',
  'SCR-009': 'SCR-009-공지일정',
  'SCR-010': 'SCR-010-셔틀',
  'SCR-011': 'SCR-011-상담안내',
  'SCR-012': 'SCR-012-안내문보관함',
  'SCR-013': 'SCR-013-통합대시보드',
  'SCR-014': 'SCR-014-집회설정',
  'SCR-015': 'SCR-015-접수환불관리',
  'SCR-016': 'SCR-016-입금매칭',
  'SCR-017': 'SCR-017-명찰출력',
  'SCR-018': 'SCR-018-숙소배치도',
  'SCR-019': 'SCR-019-상담현황판',
  'SCR-020': 'SCR-020-상담스케줄',
  'SCR-021': 'SCR-021-상담접수배치',
  'SCR-022': 'SCR-022-셔틀관리',
  'SCR-023': 'SCR-023-공지안내문',
  'SCR-024': 'SCR-024-계정권한',
  'SCR-025': 'SCR-025-변경이력',
};

/* 화면 간 이동 시 넘길 맥락 (예: 목록을 어떤 필터로 열지). 도착 화면에서 navContext()로 읽는다. */
function goScreen(target, opts) {
  opts = opts || {};
  const id = (String(target).match(/SCR-\d{3}/) || [])[0];
  const file = id && SCREEN_FILES[id];
  if (!file) { toast(`${target} 화면은 아직 목업이 없습니다.`); return; }
  try {
    sessionStorage.setItem('wf_from', location.pathname.split('/').pop());
    sessionStorage.setItem('wf_ctx', JSON.stringify(opts.context || null));
  } catch (e) {}
  const go = () => { location.href = encodeURI(file + '.html'); };
  if (opts.message) { toast(opts.message, opts.delay || 1100); setTimeout(go, opts.delay || 1100); }
  else go();
}
function navContext() {
  try { return JSON.parse(sessionStorage.getItem('wf_ctx') || 'null'); } catch (e) { return null; }
}
function goBackScreen() {
  let from = null;
  try { from = sessionStorage.getItem('wf_from'); } catch (e) {}
  if (from) location.href = encodeURI(from);
  else history.length > 1 ? history.back() : (location.href = 'index.html');
}

/* [data-nav]는 실제로 이동한다. 사이드 내비처럼 나중에 그려지는 요소도 잡히도록 위임으로 처리. */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-nav]');
  if (!el) return;
  const v = el.dataset.nav;
  const id = (String(v).match(/SCR-\d{3}/) || [])[0];
  if (id && SCREEN_FILES[id]) { goScreen(id); return; }
  if (v === '이전') { goBackScreen(); return; }
  toast(`${v} — 이동할 화면이 지정되지 않았습니다.`);
});

/* 상단 상태 바에 화면 이동 버튼을 자동으로 붙인다 (25개 목업 공통) */
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.querySelector('.statebar');
  if (!bar) return;
  const nav = document.createElement('span');
  nav.style.cssText = 'display:flex;gap:6px;align-items:center;margin-right:10px;padding-right:10px;border-right:1px solid #ccc';
  nav.innerHTML =
    `<button onclick="location.href='index.html'" title="화면 목록 뷰어">☰ 화면 목록</button>` +
    `<button onclick="goBackScreen()" title="이전 화면">← 뒤로</button>`;
  bar.insertBefore(nav, bar.firstChild);
});

/* ---------- 관리자 공통 사이드 내비 ----------
   각 목업이 같은 메뉴 구조를 쓰도록 한 곳에서 만든다. POL-031 권한에 따라 잠금 표시. */
const ADMIN_MENUS = [
  { id: 'dashboard', label: '통합 대시보드', scr: 'SCR-013' },
  { grp: '접수 · 입금' },
  { id: 'registrants', label: '접수 · 환불 관리', scr: 'SCR-015' },
  { id: 'payments',    label: '입금 매칭',        scr: 'SCR-016' },
  { id: 'badges',      label: '명찰 출력',        scr: 'SCR-017' },
  { id: 'lodging',     label: '숙소 배치도',      scr: 'SCR-018' },
  { grp: '상담' },
  { id: 'counseling',  label: '상담 현황판',      scr: 'SCR-019' },
  { id: 'schedule',    label: '상담 스케줄',      scr: 'SCR-020' },
  { id: 'cregist',     label: '상담 접수 · 배치', scr: 'SCR-021' },
  { grp: '안내 · 시스템' },
  { id: 'shuttle',     label: '셔틀 관리',        scr: 'SCR-022' },
  { id: 'content',     label: '공지 · 안내문',    scr: 'SCR-023' },
  { id: 'conferences', label: '집회 생성 · 설정', scr: 'SCR-014' },
  { id: 'accounts',    label: '계정 · 권한',      scr: 'SCR-024', adminOnly: true },
  { id: 'logs',        label: '변경 이력',        scr: 'SCR-025' },
];

/* role: '전체 어드민' | '본부 총괄' | '본부 팀원' | '셔틀팀' */
function sideNav(active, role) {
  role = role || '본부 팀원';
  const allowed = role === '셔틀팀' ? ['shuttle'] : null;   /* POL-031 · POL-032 */
  let html = `<div class="conf"><div class="cl"><span class="n">1</span>현재 집회</div><div class="cn">2026 금수원 대전도집회</div></div>`;
  for (const m of ADMIN_MENUS) {
    if (m.grp) { html += `<div class="grp">${m.grp}</div>`; continue; }
    const hidden = allowed && !allowed.includes(m.id);
    const locked = m.adminOnly && role !== '전체 어드민';
    if (hidden) continue;                                   /* 권한 없는 메뉴는 노출하지 않는다 */
    if (locked) {
      html += `<div class="nav locked" title="전체 어드민만 접근 (POL-030)"><span class="di"></span>${m.label} 🔒</div>`;
    } else if (m.id === active) {
      html += `<div class="nav on"><span class="di"></span>${m.label}</div>`;
    } else {
      html += `<div class="nav" data-nav="${m.scr} ${m.label}"><span class="di"></span>${m.label}</div>`;
    }
  }
  return html;
}
function mountSideNav(active, role) {
  const el = document.querySelector('aside.side');
  if (el) el.innerHTML = sideNav(active, role);
}
