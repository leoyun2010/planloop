# 정책서 — BoM 자동 작성·검증 서비스 (bom-auto)

| 항목 | 내용 |
|---|---|
| 문서 버전 | v1.0 |
| 상태 | 승인 |
| 작성일 | 2026-09-30 |
| 최종 수정일 | 2026-10-01 |
| 근거 회의록 | [2026-09-30 기획 인터뷰 결정사항](minutes/2026-09-30-기획인터뷰-결정사항.md) — D-01 ~ D-41 (D-26 ~ D-41은 이 문서 작성·검토 중 결정) |
| 근거 자료 | 샘플 폴더 `C:\Users\user\Downloads\BoM 자동화 프로그램\` 벤더 BoM 11개 (Cisco CCW 5, Dell Configurator 6) — 전수 분석 |
| 관련 문서 | [01-prd.md](01-prd.md), [00-brief.md](00-brief.md), [03-ia.md](03-ia.md), [04-screens/](04-screens/), [05-qa-tc.md](05-qa-tc.md) |

> 정책서는 "시스템이 어떤 규칙으로 검증하는가"를 정의한다.
> 설명이 아니라 **검증 가능한 규칙**으로 쓴다. 정책 문서 자체가 스펙이자 테스트 기준이 되어,
> 개발자·QA(사람이든 Claude든)가 이 문서만 보고 되묻지 않고 판단할 수 있어야 한다.
> 각 정책은 6요소를 갖춘다: 규칙 / 적용 시점 / 위반 시 처리(문구 그대로) / 예외 / 검증 의사코드 / 관련 TC

## 0. 읽는 법

- **정책 상태**
  - `확정` — 근거가 있다. 결정(D-xx), PRD에 명시된 값, 샘플 전수 분석 결과 중 하나다.
  - `검토중` — 이 문서가 처음 제안한 값(「제안값」)이 들어 있다. v0.5에서 제안값 10건을 모두 확정해 현재 0건이다(D-35).
  - `미확정` — 외부 조건이 정해져야 확정할 수 있다(보안 부서 확인, 보관 기간 등).
- **관련 TC는 [05-qa-tc.md](05-qa-tc.md) v1.0 기준으로 채웠다.** 정책마다 그 정책을 참조하는 모든 TC를 적었고, 위반 케이스 TC(유형 예외·경계)는 05-qa-tc.md 커버리지 표 2에 따로 모았다. 관련 화면(SCR)은 [03-ia.md](03-ia.md) v0.1 기준으로 채웠다.
- **문구**: 「」 안이 사용자에게 보이는 문구 원문이다. `{변수}`는 값으로 바뀐다. 문구는 이 문서가 기준이며, 화면·API·xlsx에서 같은 문구를 쓴다.
- **의사코드 공통 약속** (JS)
  - `ok()` 통과 · `block(code, vars)` 차단(저장·실행 거부) · `warn(code, vars)` 경고 · `finding(rule, grade, row, field, code, vars)` 검증 판정 1건
  - 금액·비율은 `Decimal`(NFR-012)로 계산한다. 의사코드의 `D(x)`는 Decimal 생성, `floor`는 소수점 아래 버림이다.
  - 날짜는 KST(Asia/Seoul) 기준이다.
- **PRD v0.3과 달라진 점** — 샘플 11개 파일을 분석하면서 드러난 사실이다. [01-prd.md](01-prd.md) v0.4에 함께 반영했다.

| # | PRD v0.3 | 샘플에서 확인한 사실 | 이 문서의 규칙 |
|---|---|---|---|
| 1 | Cisco 가격형 List 금액 = `Unit List Price × Quantity` | 구독 행의 `Unit List Price`는 **월 단가**다. 인터터치 10.2 LIC-CW-A는 `Unit List Price` 31,741원 × 252 = 7,998,732원이지만, `Extended List Price`는 479,923,920원이다 | List 단가 = `Unit List Price (With Duration)`(없으면 `Unit List Price`) — POL-019 |
| 2 | R1: 모든 행에 SKU 필수 | Dell 상위 품목(그룹 행)에는 SKU 값이 없다. 이대로면 Dell 기준 샘플도 확정할 수 없다 | Dell 상위 품목·하위 제품 행은 SKU 검사 제외 — POL-022 |
| 3 | Dell 계층 2단(그룹 행 → 옵션 행) | Dell 스토리지 5개 파일은 **그룹 제품 행 → 하위 제품 행 → 옵션 행** 3단이다 | 행 유형 「하위 제품」 추가(D-26) — POL-016 |
| 4 | Dell 원본 라인 번호 = `그룹 ID` | CASE2_Server는 상위 품목 5개의 그룹 ID가 모두 `5623942.2.1`이다 | `{그룹 ID}-{상위 품목 순번}` — POL-017 |
| 5 | Cisco 구분: SOFTWARE(subscription) | 가격형 `Category` 값은 PRODUCT·SERVICE·**SUBSCRIPTION**이다 | SUBSCRIPTION → SOFTWARE. 구성형 판정 규칙은 가격형 3개 파일 79행의 Category와 100% 일치 — POL-018 |
| 6 | 기간(개월) — 정수로 가정 | 인터터치 구독 기간에 58.10·59.74·59.81개월이 있다 | 기간은 소수점 둘째 자리까지 — POL-017 |
| 7 | R5: 같은 상위 품목·모듈 안의 같은 SKU | EY한영 4.0·5.0은 서로 다른 상위 품목이 같은 SKU(CAB-C15-CBN-KOR=)다. Dell 스토리지는 하위 제품마다 같은 SKU(883-BBFN)가 들어 있다 | 대상은 구성품만, 범위는 직계 상위(하위 제품 포함) — POL-026 |
| 8 | EoX에 없는 SKU = 확인 불가(경고) | 기준 샘플 36행 대부분이 부속·라이선스 SKU여서 경고가 수십 건 생긴다 | EoX 정상 응답 + 레코드 없음 = 판매중(D-28) — POL-029. MVP는 AI 검색이라 P1(REQ-029) 도입 때 적용(D-38) |

- **참조 구현**: 부록 A의 기대 결과표는 이 문서의 POL-015 ~ POL-019, POL-022 ~ POL-028, POL-030 규칙을 그대로 옮긴 스크립트로 샘플을 변환해 만들었다. 샘플 11개 전체의 결과 요약은 부록 A.4에 있다.

### 현재 상태

| 구분 | 건수 | 정책 |
|---|---|---|
| 전체 | 39건 | POL-001 ~ POL-039 |
| 확정 | 37건 | 아래 목록에서 상태가 「확정」인 것. 제안값 10건은 2026-10-01에 그대로 확정(D-35) |
| 검토중 | 0건 | — |
| 미확정 | 2건 | POL-011, POL-013 — 보관 기간 미정(OI-12). MVP는 삭제 없이 보관(D-36) |

## 정책 목록

| ID | 분류 | 정책명 | 관련 REQ | 관련 TC | 상태 |
|---|---|---|---|---|---|
| POL-001 | 회원/인증 | Naver Works SSO 로그인·세션 | REQ-001, NFR-004 | TC-001, TC-002, TC-003, TC-004, TC-005, TC-006, TC-147 | 확정 |
| POL-002 | 회원/인증 | 최초 로그인 등록·역할 대기 | REQ-001, REQ-002, REQ-020 | TC-007, TC-008, TC-009, TC-021, TC-148 | 확정 |
| POL-003 | 콘텐츠/데이터 | BoM 건 입력값 | REQ-003 | TC-023, TC-024, TC-025, TC-026, TC-027, TC-150 | 확정 |
| POL-004 | 콘텐츠/데이터 | 버전 상태 전이·삭제 | REQ-011, REQ-012 | TC-023, TC-066, TC-076, TC-108, TC-109, TC-110, TC-111, TC-112, TC-154 | 확정 |
| POL-005 | 콘텐츠/데이터 | 동시 편집 충돌 방지 | REQ-006 | TC-066, TC-067, TC-074, TC-075, TC-131, TC-155 | 확정 |
| POL-006 | 콘텐츠/데이터 | BoM 목록·검색 | REQ-014 | TC-028, TC-029, TC-030, TC-031, TC-032, TC-033, TC-034, TC-035, TC-046, TC-108, TC-149 | 확정 |
| POL-007 | 콘텐츠/데이터 | 다운로드 파일명 | REQ-013, REQ-018, REQ-028 | TC-016, TC-048, TC-093, TC-113, TC-115, TC-134, TC-135, TC-140 | 확정 |
| POL-008 | 권한/등급 | 역할별 기능 권한 | REQ-002, NFR-005 | TC-011, TC-012, TC-013, TC-014, TC-016, TC-048, TC-076, TC-107, TC-112, TC-151, TC-159 | 확정 |
| POL-009 | 권한/등급 | 작성자 전용 정보(가격·견적) | REQ-015, NFR-005 | TC-013, TC-015, TC-016, TC-017, TC-028, TC-084, TC-087, TC-111, TC-116, TC-159 | 확정 |
| POL-010 | 권한/등급 | 역할 변경 | REQ-020 | TC-014, TC-019, TC-020, TC-021, TC-022, TC-158 | 확정 |
| POL-011 | 운영 | 감사 로그 | NFR-008 | TC-003, TC-006, TC-019, TC-023, TC-036, TC-048, TC-093, TC-104, TC-106, TC-107, TC-108, TC-112, TC-113, TC-116, TC-118, TC-134, TC-140, TC-156 | 미확정 |
| POL-012 | 법/개인정보 | LLM 전송 범위·기록 | REQ-009, REQ-008, NFR-007 | TC-094, TC-095, TC-098, TC-102, TC-103, TC-143 | 확정 |
| POL-013 | 법/개인정보 | 사용자 정보 수집·보관 | REQ-001, REQ-020 | TC-007, TC-010, TC-018, TC-147 | 미확정 |
| POL-014 | 업로드·변환 | 업로드 파일 허용 조건 | REQ-004, NFR-002, NFR-011 | TC-047, TC-049, TC-050, TC-051, TC-052, TC-053, TC-054, TC-152 | 확정 |
| POL-015 | 업로드·변환 | 벤더 형식 판별 | REQ-004 | TC-036, TC-037, TC-038, TC-039, TC-055, TC-056, TC-057, TC-058 | 확정 |
| POL-016 | 업로드·변환 | 품목 행 판별·계층 | REQ-005 | TC-036, TC-037, TC-038, TC-040, TC-041, TC-046, TC-059, TC-060, TC-061, TC-063 | 확정 |
| POL-017 | 업로드·변환 | 표준 BoM 필드 매핑 | REQ-005 | TC-040, TC-041, TC-042, TC-043, TC-044, TC-045, TC-065 | 확정 |
| POL-018 | 업로드·변환 | 구분 판정 | REQ-005 | TC-041, TC-042, TC-064, TC-086 | 확정 |
| POL-019 | 업로드·변환 | 가격 정보 매핑 | REQ-005, REQ-016 | TC-042, TC-043, TC-044, TC-062, TC-070, TC-121, TC-124, TC-128 | 확정 |
| POL-020 | 업로드·변환 | 표준 BoM 편집 | REQ-006 | TC-067, TC-068, TC-069, TC-070, TC-071, TC-072, TC-073, TC-077 | 확정 |
| POL-021 | 검증 | 검증 실행·판정 공통 | REQ-007, REQ-010 | TC-067, TC-078, TC-083, TC-088, TC-089, TC-090, TC-091, TC-092, TC-093, TC-153 | 확정 |
| POL-022 | 검증 | R1 필수 필드 | REQ-007 | TC-080, TC-081 | 확정 |
| POL-023 | 검증 | R2 수량 | REQ-007 | TC-082 | 확정 |
| POL-024 | 검증 | R3 SKU 형식 | REQ-007 | TC-083, TC-144 | 확정 |
| POL-025 | 검증 | R4 가격 값 범위 | REQ-007 | TC-017, TC-084 | 확정 |
| POL-026 | 검증 | R5 중복 SKU | REQ-007 | TC-079, TC-091 | 확정 |
| POL-027 | 검증 | R6 서비스·구독 기간 불일치 | REQ-007 | TC-078, TC-085, TC-091 | 확정 |
| POL-028 | 검증 | R7 미분류 | REQ-007 | TC-086 | 확정 |
| POL-029 | 검증 | R8 EOS 조회·판정 | REQ-008, REQ-019 | TC-094, TC-095, TC-096, TC-097, TC-142, TC-143, TC-144, TC-145, TC-146, TC-157 | 확정 |
| POL-030 | 검증 | R9 벤더 파일 합계 불일치 | REQ-007 | TC-017, TC-087 | 확정 |
| POL-031 | 검증 | AI 검토 권고 | REQ-009 | TC-090, TC-098, TC-099, TC-100, TC-101, TC-132 | 확정 |
| POL-032 | 검증 | BoM 확정 조건 | REQ-011 | TC-080, TC-088, TC-098, TC-104, TC-105, TC-106, TC-107, TC-153 | 확정 |
| POL-033 | 견적·출력 | 견적 생성·저장 조건 | REQ-016 | TC-108, TC-117, TC-118, TC-120, TC-122, TC-123, TC-124, TC-129, TC-130, TC-139, TC-155 | 확정 |
| POL-034 | 견적·출력 | 원가 계산 | REQ-016, NFR-012 | TC-118, TC-119, TC-120, TC-121, TC-122, TC-130 | 확정 |
| POL-035 | 견적·출력 | 환율·DC율 입력 | REQ-016 | TC-120, TC-125, TC-126, TC-127, TC-128 | 확정 |
| POL-036 | 견적·출력 | 견적가·마진율 | REQ-017 | TC-118, TC-119, TC-129, TC-130, TC-134 | 확정 |
| POL-037 | 견적·출력 | 고객 견적서 | REQ-018, REQ-009 | TC-132, TC-133, TC-134, TC-135, TC-136, TC-137, TC-138, TC-139, TC-156 | 확정 |
| POL-038 | 견적·출력 | 원가분석표 | REQ-028 | TC-139, TC-140, TC-141 | 확정 |
| POL-039 | 견적·출력 | 표준 BoM·검증 리포트 xlsx | REQ-013, REQ-010 | TC-093, TC-113, TC-114 | 확정 |

**정책을 두지 않은 REQ**: REQ-021 ~ REQ-027(P1·P2)은 PRD에서 규칙을 「2차 기획에서 정한다」로 남겨 두었다. 2차 기획 때 정책을 추가한다.

## 1. 회원/인증 정책

### POL-001 Naver Works SSO 로그인·세션

- **규칙** (한 문장): 모든 화면과 API는 Naver Works SSO로 만든 유효 세션이 있어야 쓸 수 있다. 세션은 마지막 요청 후 **120분**(유휴) 또는 로그인 후 **10시간**(최대) 중 먼저 오는 시점에 만료된다 .
- **적용 시점**: 모든 화면 진입, 모든 `/api/*` 요청, SSO 콜백 `GET /auth/callback`, 로그아웃 `POST /auth/logout`
- **위반/실패 시 처리**
  - 세션 없이 화면에 접근하면 차단한다. 요청한 URL을 `returnTo`로 보존하고 Naver Works 로그인으로 이동한다. 문구는 표시하지 않는다.
  - 세션 없이 API를 호출하면 차단한다. HTTP 401과 `{"code":"AUTH_REQUIRED","message":"로그인이 필요합니다."}`를 반환하고, 데이터는 반환하지 않는다.
  - 사용 중 세션이 만료되면(화면이 401을 받으면) 「로그인 시간이 만료되었습니다. 다시 로그인해 주세요.」를 표시한 뒤 로그인으로 이동한다.
  - Naver Works 인증에 실패하거나 사용자가 취소하면 세션을 만들지 않는다. 문구: 「Naver Works 인증에 실패했습니다. 다시 시도하거나 관리자에게 문의해 주세요.」 [다시 로그인]
  - 로그인 성공·실패는 감사 로그에 기록한다(POL-011).
- **예외**: `GET /healthz`(서버 상태 확인)는 인증에서 제외한다. 이 API는 데이터를 반환하지 않는다. `returnTo`가 같은 출처의 상대 경로(`/`로 시작하고 `//`로 시작하지 않음)가 아니면 무시하고 BoM 목록으로 이동한다(외부 주소로 보내는 리다이렉트 방지).
- **검증 의사코드**:

  ```js
  const IDLE_MIN = 120, MAX_HOURS = 10; // D-35
  function checkPol001(req, now) {
    const s = req.session;
    if (!s) return req.isApi ? block("AUTH_REQUIRED", {status: 401}) : redirectToSso(req.url);
    if (now - s.lastSeenAt > IDLE_MIN * 60e3 || now - s.loginAt > MAX_HOURS * 3600e3) {
      destroy(s);
      return req.isApi ? block("AUTH_REQUIRED", {status: 401}) : redirectToSso(req.url);
    }
    s.lastSeenAt = now;
    return ok();
  }
  function safeReturnTo(p) {
    return typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : "/boms";
  }
  ```

- **관련 요구사항**: REQ-001, NFR-004
- **관련 화면**: SCR-001
- **관련 테스트**: TC-001, TC-002, TC-003, TC-004, TC-005, TC-006, TC-147

### POL-002 최초 로그인 등록·역할 대기

- **규칙** (한 문장): Naver Works 계정으로 처음 로그인한 사용자는 역할 「역할 미지정」으로 자동 등록된다. 역할은 관리자만 수동으로 지정한다. 부서 정보로 자동 지정하지 않는다(D-32).
- **적용 시점**: SSO 콜백에서 Naver Works 계정 ID로 사용자를 찾지 못했을 때. 이후 역할 미지정 사용자의 모든 화면 진입과 API 요청.
- **위반/실패 시 처리**
  - 역할 미지정 사용자는 역할 대기 화면만 볼 수 있다(차단). 문구: 「역할이 지정되지 않았습니다. 관리자(CSD)가 역할을 지정하면 서비스를 이용할 수 있습니다.」 [로그아웃]
  - 역할 미지정 사용자가 API를 호출하면 HTTP 403과 `{"code":"ROLE_PENDING","message":"역할이 지정되지 않았습니다."}`를 반환한다.
- **예외**: 배포 설정 `BOOTSTRAP_ADMIN_ACCOUNTS`에 적힌 Naver Works 계정은 처음 로그인할 때 「관리자」로 등록한다. 관리자가 한 명도 없으면 아무도 역할을 지정할 수 없기 때문이다. 이름·부서는 로그인할 때마다 Naver Works 값으로 갱신하되, 역할은 바꾸지 않는다.
- **검증 의사코드**:

  ```js
  function onSsoCallback(nw, config) {
    let u = users.findByNwId(nw.id);
    if (!u) {
      const role = config.BOOTSTRAP_ADMIN_ACCOUNTS.includes(nw.email) ? "관리자" : "역할 미지정";
      u = users.create({nwId: nw.id, name: nw.name, email: nw.email, dept: nw.dept ?? "", role, firstLoginAt: now()});
    } else {
      users.update(u.id, {name: nw.name, dept: nw.dept ?? "", lastLoginAt: now()}); // role 유지
    }
    return u;
  }
  function checkPol002(user, req) {
    if (user.role !== "역할 미지정") return ok();
    if (req.isApi && req.path !== "/auth/logout") return block("ROLE_PENDING", {status: 403});
    return req.isApi ? ok() : showScreen("역할 대기");
  }
  ```

- **관련 요구사항**: REQ-001, REQ-002, REQ-020
- **관련 화면**: SCR-001, SCR-002, SCR-012
- **관련 테스트**: TC-007, TC-008, TC-009, TC-021, TC-148

## 2. 콘텐츠/데이터 정책

### POL-003 BoM 건 입력값

- **규칙** (한 문장): BoM 건의 고객사명은 **1~50자**, 건명은 **1~100자**다(앞뒤 공백을 뺀 글자 수). 줄바꿈과 제어 문자는 쓸 수 없고, 같은 고객사명·건명의 중복은 허용한다.
- **적용 시점**: BoM 건 생성 폼 저장, `POST /api/boms`
- **위반/실패 시 처리**: 차단(저장하지 않음). 항목 아래에 문구를 표시한다.
  - 빈 값: 「고객사명을 입력해 주세요.」 / 「건명을 입력해 주세요.」
  - 길이 초과: 「고객사명은 50자 이내로 입력해 주세요.」 / 「건명은 100자 이내로 입력해 주세요.」
  - 줄바꿈·제어 문자: 「줄바꿈과 제어 문자는 입력할 수 없습니다.」
- **예외**: 글자 수는 유니코드 코드 포인트 기준이다(한글 1자 = 1). MVP에는 BoM 건 정보를 수정하는 기능이 없다(PRD에 없음).
- **검증 의사코드**:

  ```js
  const LIMIT = {customer: 50, title: 100}; // D-35
  function checkPol003(input) {
    for (const [k, label] of [["customer", "고객사명"], ["title", "건명"]]) {
      const v = (input[k] ?? "").trim();
      if (v.length === 0) return block("MSG_REQUIRED", {field: label});
      if ([...v].length > LIMIT[k]) return block("MSG_TOO_LONG", {field: label, max: LIMIT[k]});
      if (/[\u0000-\u001F\u007F]/.test(v)) return block("MSG_CONTROL_CHAR");
    }
    return ok(); // 중복 검사 없음
  }
  ```

- **관련 요구사항**: REQ-003
- **관련 화면**: SCR-004
- **관련 테스트**: TC-023, TC-024, TC-025, TC-026, TC-027, TC-150

### POL-004 버전 상태 전이·삭제

- **규칙** (한 문장): 버전은 「작성중 → 확정」 한 방향으로만 바뀐다. 새 버전은 최신 버전이 「확정」일 때만 만들 수 있다. 한 BoM 건의 「작성중」 버전은 최대 1개다. BoM 건은 확정 버전이 하나도 없을 때만 작성자가 삭제할 수 있다.
- **상태 정의**
  - 버전 상태: `작성중` / `확정`. BoM 건의 상태는 최신 버전의 상태다.
  - 버전의 검증 상태: `미검증`(검증한 적 없음) / `검증 완료`(최신 검증이 현재 내용 기준) / `재검증 필요`(검증 뒤 내용이 바뀜)
  - 새 버전: 번호는 직전 최대 번호 + 1이다. 최신 확정 버전의 행과 가격 정보를 셀 단위로 복사한다. 검증 결과·「확인함」·견적은 복사하지 않으므로 검증 상태는 `미검증`에서 시작한다.
  - 계보 ID: 모든 행은 **계보 ID**를 가진다. 변환·직접 추가로 생긴 행은 새 계보 ID를 받고, 새 버전으로 복사된 행은 원본 행의 계보 ID를 이어받는다. 버전 비교(REQ-012)는 계보 ID가 같은 행끼리 필드를 비교한다. 한쪽에만 있는 계보 ID는 추가·삭제로 표시한다. 행 번호만 달라진 경우는 변경으로 보지 않는다. 비작성자에게는 가격 필드의 차이를 보여주지 않는다(POL-009).
- **적용 시점**: 새 버전 만들기 `POST /api/boms/{id}/versions`, BoM 건 삭제 `DELETE /api/boms/{id}`, 확정 버전에 대한 모든 변경 API(업로드·편집·검증 실행·확정)
- **위반/실패 시 처리**: 차단. HTTP 409와 함께 아래 문구를 반환하고 화면에 표시한다.
  - 최신 버전이 작성중인데 새 버전을 요청하면(확정한 적이 없는 v1 포함): 「작성 중인 버전(v{n})이 이미 있습니다.」 — 이 경우가 새 버전을 막는 유일한 조건이다(D-39)
  - 확정 버전이 있는 BoM 건을 삭제하려 하면: 「확정된 버전이 있는 BoM은 삭제할 수 없습니다.」
  - 확정 버전을 변경하려 하면: 「확정된 버전은 수정할 수 없습니다. 새 버전을 만들어 수정해 주세요.」
  - 삭제 가능한 건을 삭제할 때 확인 대화상자: 「이 BoM 건과 올린 파일, 검증 결과가 모두 삭제됩니다. 삭제하시겠습니까?」 [삭제] [취소]
- **예외**: 없다. 관리자도 확정 버전을 수정·삭제할 수 없다. 확정 취소 기능은 없다(REQ-011).
- **검증 의사코드**:

  ```js
  function canCreateVersion(bom) {
    const latest = bom.versions.at(-1);
    if (latest.status === "작성중") return block("MSG_DRAFT_EXISTS", {n: latest.no});
    return ok(); // latest.status === "확정"
  }
  function canDeleteBom(bom, user) {
    if (bom.authorId !== user.id) return block("FORBIDDEN", {status: 403});
    if (bom.versions.some(v => v.status === "확정")) return block("MSG_HAS_CONFIRMED");
    return ok();
  }
  function assertEditable(version) {
    return version.status === "확정" ? block("MSG_CONFIRMED_LOCKED", {status: 409}) : ok();
  }
  ```

- **관련 요구사항**: REQ-011, REQ-012
- **관련 화면**: SCR-005, SCR-008
- **관련 테스트**: TC-023, TC-066, TC-076, TC-108, TC-109, TC-110, TC-111, TC-112, TC-154

### POL-005 동시 편집 충돌 방지

- **규칙** (한 문장): 작성중 버전을 바꾸는 모든 요청은 화면이 불러온 수정 번호(`revision`)가 서버의 현재 수정 번호와 같을 때만 반영된다. 다르면 거부하고 자동 병합하지 않는다.
- **적용 시점**: 표준 BoM 편집 저장, 행 추가·삭제, 파일 업로드 — 버전 내용을 바꾸는 모든 API. 반영에 성공하면 `revision`을 1 올린다. 같은 규칙을 견적 저장(견적 자체의 `revision`)에도 적용한다.
- **위반/실패 시 처리**
  - 수정 번호가 다르면 차단한다. HTTP 409 `STALE_REVISION`과 함께 문구를 표시한다: 「다른 창에서 먼저 저장된 내용이 있습니다. 새로고침한 뒤 다시 수정해 주세요.」 입력하던 내용은 사용자가 복사할 수 있게 화면에 남겨 둔다.
  - 저장하지 않은 변경이 있는 채로 서비스 안의 다른 화면으로 이동하면 확인 대화상자를 띄운다: 「저장하지 않은 변경 사항이 있습니다. 이 화면을 떠나시겠습니까?」 [떠나기] [머무르기]
  - 탭 닫기와 새로고침에는 브라우저 기본 확인 대화상자를 띄운다. 이 대화상자의 문구는 브라우저가 정하므로 지정할 수 없다.
- **예외**: 경고·권고의 「확인함」 체크는 검증 결과에 붙는 기록이므로 `revision`을 올리지 않는다.
- **검증 의사코드**:

  ```js
  function applyMutation(version, clientRevision, mutate) {
    // DB: UPDATE ... SET revision = revision + 1 WHERE id = ? AND revision = ?  (영향 행 0 → 충돌)
    if (version.revision !== clientRevision) return block("STALE_REVISION", {status: 409});
    mutate(version);
    version.revision += 1;
    version.validationState = version.validationState === "미검증" ? "미검증" : "재검증 필요";
    return ok();
  }
  ```

- **관련 요구사항**: REQ-006
- **관련 화면**: SCR-005, SCR-006, SCR-009
- **관련 테스트**: TC-066, TC-067, TC-074, TC-075, TC-131, TC-155

### POL-006 BoM 목록·검색

- **규칙** (한 문장): BoM 목록은 한 페이지에 **20건**을 최종 수정일시 내림차순으로 보여준다. 검색 조건끼리는 모두 AND로 결합한다.
- **조건별 규칙**

| 조건 | 규칙 |
|---|---|
| 고객사명·건명 | 부분 일치, 대소문자·앞뒤 공백 무시 |
| SKU | **3자 이상**. BoM 건 **최신 버전**의 개별 SKU(Dell 쉼표 목록은 나눠서) 중 입력값을 포함하는 것이 있으면 일치. 대소문자 무시 |
| 벤더 | Cisco / Dell. 최신 버전에 그 벤더 행이 1개 이상이면 일치 |
| 작성자 | 사용자 선택 (이름으로 찾기) |
| 상태 | 작성중 / 확정 (최신 버전 상태) |
| 최종 수정일 기간 | 시작일 00:00:00 ~ 종료일 23:59:59 (KST), 양 끝 포함 |
| 내 BoM만 보기 | 작성자 = 로그인 사용자 |

- **최종 수정일시가 바뀌는 사건**: BoM 건 생성, 파일 업로드, 편집 저장, 확정, 새 버전 생성. 검증 실행과 다운로드는 최종 수정일시를 바꾸지 않는다.
- **목록의 벤더 열**: 최신 버전에 있는 벤더를 「Cisco」, 「Dell」, 「Cisco, Dell」로 표시한다.
- **적용 시점**: BoM 목록 화면, `GET /api/boms?customer=&title=&sku=&vendor=&author=&status=&from=&to=&mine=&page=`
- **위반/실패 시 처리**
  - SKU를 1~2자로 입력하면 검색을 실행하지 않는다. 문구: 「SKU는 3자 이상 입력해 주세요.」
  - 시작일이 종료일보다 늦으면 검색을 실행하지 않는다. 문구: 「시작일이 종료일보다 늦습니다.」
  - 검색 조건이 있는데 결과가 0건이면: 「조건에 맞는 BoM이 없습니다.」
  - 검색 조건 없이 목록이 0건이면: 「등록된 BoM이 없습니다.」 영업에게는 [새 BoM] 버튼을 함께 표시한다.
- **예외**: 가격 필드는 검색 대상이 아니다(REQ-015). 정렬 기준이 같으면 BoM 건 ID 내림차순으로 정렬한다.
- **검증 의사코드**:

  ```js
  const PAGE_SIZE = 20; // D-35
  function checkPol006(q) {
    if (q.sku != null && q.sku.trim().length > 0 && q.sku.trim().length < 3) return block("MSG_SKU_MIN3");
    if (q.from && q.to && q.from > q.to) return block("MSG_DATE_ORDER");
    return ok();
  }
  function matches(bom, q, user) {
    const v = bom.latestVersion, norm = x => x.trim().toLowerCase();
    const skus = v.rows.flatMap(r => (r.sku ?? "").split(",").map(norm)).filter(Boolean);
    return (!q.customer || norm(bom.customer).includes(norm(q.customer)))
      && (!q.title || norm(bom.title).includes(norm(q.title)))
      && (!q.sku || skus.some(s => s.includes(norm(q.sku))))
      && (!q.vendor || v.rows.some(r => r.vendor === q.vendor))
      && (!q.author || bom.authorId === q.author)
      && (!q.status || v.status === q.status)
      && (!q.from || bom.updatedAt >= startOfDayKST(q.from))
      && (!q.to || bom.updatedAt <= endOfDayKST(q.to))
      && (!q.mine || bom.authorId === user.id);
  }
  // 정렬: updatedAt desc, id desc
  ```

- **관련 요구사항**: REQ-014
- **관련 화면**: SCR-003
- **관련 테스트**: TC-028, TC-029, TC-030, TC-031, TC-032, TC-033, TC-034, TC-035, TC-046, TC-108, TC-149

### POL-007 다운로드 파일명

- **규칙** (한 문장): 시스템이 만드는 파일의 이름은 `{고객사명}_{건명}_{종류}_v{버전}.{확장자}`다. 종류는 `BoM` / `검증리포트` / `견적서` / `원가분석표` 중 하나다.
- **정제 규칙**: ① `\ / : * ? " < > |`와 제어 문자는 `_`로 바꾼다. ② 연속 공백은 한 칸으로 줄인다. ③ 고객사명·건명은 각각 앞뒤 공백과 끝의 마침표를 뺀 뒤 **최대 40자**로 자른다.
- **적용 시점**: 표준 BoM·검증 리포트·고객 견적서·원가분석표 다운로드 응답의 `Content-Disposition` 헤더. 한글이 깨지지 않도록 `filename*=UTF-8''…` 형식으로 보낸다.
- **위반/실패 시 처리**: 차단하지 않는다. 쓸 수 없는 문자는 규칙대로 바꾸며, 문구는 없다. 예: 고객사명 「A/S 센터」, 건명 「1:1 교체」, v2 → `A_S 센터_1_1 교체_BoM_v2.xlsx`
- **예외**: 원본 벤더 파일은 업로드할 때의 파일명 그대로 내려준다. 한 버전에 견적이 여러 개여도 견적서 파일명은 같다(구분은 감사 로그의 견적 ID로 한다).
- **검증 의사코드**:

  ```js
  const PART_MAX = 40; // D-35
  function clean(part) {
    let s = part.replace(/[\\/:*?"<>|\u0000-\u001F\u007F]/g, "_").replace(/\s+/g, " ").trim().replace(/\.+$/, "");
    return [...s].slice(0, PART_MAX).join("");
  }
  function fileName(bom, kind, versionNo, ext) {
    return `${clean(bom.customer)}_${clean(bom.title)}_${kind}_v${versionNo}.${ext}`;
  }
  ```

- **관련 요구사항**: REQ-013, REQ-018, REQ-028
- **관련 화면**: SCR-005, SCR-007, SCR-008, SCR-009, SCR-010
- **관련 테스트**: TC-016, TC-048, TC-093, TC-113, TC-115, TC-134, TC-135, TC-140

## 3. 결제/과금 정책

해당 없음 — 이 서비스에는 결제·과금 기능이 없다. 원가·견적가 계산은 [10장](#10-견적출력-정책)에서 정한다.

## 4. 알림 정책

해당 없음 — PRD에 알림(메일·메신저·푸시) 요구사항이 없다. 검증 리포트 공유는 사용자가 xlsx를 직접 전달한다(REQ-010).

## 5. 권한/등급 정책

| 역할 | 설명 | 주요 권한 |
|---|---|---|
| 역할 미지정 | 처음 로그인한 사용자. 관리자가 역할을 지정하기 전 | 역할 대기 화면, 로그아웃 |
| 영업 | BoM 건의 작성자 (40명) | 본인 BoM 건 생성·업로드·편집·검증·확정·새 버전, 본인 건의 가격·견적·견적서·원가분석표. 전사 BoM 조회, EOS 검색 |
| 엔지니어 | 공유된 BoM의 조회자 (150명) | 전사 BoM 조회(가격 제외), 검증 리포트 조회·다운로드, 표준 BoM 다운로드, EOS 검색 |
| 관리자 | CSD 담당자 | 엔지니어 권한 + 사용자 역할 관리. 가격·견적은 볼 수 없다 |

### POL-008 역할별 기능 권한

- **규칙** (한 문장): 각 기능은 아래 표에서 ○인 역할만 쓸 수 있다. 권한은 화면이 아니라 **서버 API에서** 요청마다 검사한다(NFR-005).

| 기능 | 대표 API | 영업 | 엔지니어 | 관리자 |
|---|---|---|---|---|
| BoM 목록·상세·버전 비교 조회 (가격 제외) | `GET /api/boms`, `GET /api/boms/{id}` | ○ | ○ | ○ |
| 검증 리포트 조회·xlsx 다운로드 | `GET /api/validations/{id}` | ○ | ○ | ○ |
| 표준 BoM xlsx 다운로드 | `GET /api/versions/{id}/bom.xlsx` | ○ | ○ | ○ |
| SKU EOS 단건 검색 | `GET /api/eos?vendor=&sku=` | ○ | ○ | ○ |
| BoM 건 생성 | `POST /api/boms` | ○ | × | × |
| 업로드·편집·검증 실행·확인함·확정·새 버전·BoM 건 삭제 | `POST/PUT/DELETE /api/boms/{id}/…` | 작성자만 | × | × |
| 원본 벤더 파일 다운로드 | `GET /api/files/{id}` | 작성자만 | × | × |
| 가격 정보·견적·견적서·원가분석표 | `/api/quotes/…` | 작성자만 | × | × |
| 사용자 역할 관리 | `/api/users/…` | × | × | ○ |

- 「작성자만」은 **역할이 영업이고** BoM 건의 작성자일 때다. 작성자의 역할이 엔지니어로 바뀌면 그 사용자는 자기 건의 가격·견적도 볼 수 없다.
- **적용 시점**: 모든 API 요청(서버 미들웨어), 화면 렌더링(메뉴·버튼 표시 여부)
- **위반/실패 시 처리**
  - 권한이 없는 기능의 메뉴·버튼은 화면에 표시하지 않는다.
  - 권한 없이 API를 호출하면 차단한다. HTTP 403 `{"code":"FORBIDDEN","message":"이 기능을 사용할 권한이 없습니다."}`
  - 권한 없는 화면 URL로 직접 들어오면 「이 기능을 사용할 권한이 없습니다.」와 [BoM 목록으로]를 표시한다.
- **예외**: 없다. 관리자도 BoM 편집과 가격 조회는 할 수 없다. 역할 미지정 사용자는 POL-002를 따른다.
- **검증 의사코드**:

  ```js
  const MATRIX = {
    READ_BOM: ["영업", "엔지니어", "관리자"], READ_VALIDATION: ["영업", "엔지니어", "관리자"],
    DOWNLOAD_BOM: ["영업", "엔지니어", "관리자"], EOS_SEARCH: ["영업", "엔지니어", "관리자"],
    CREATE_BOM: ["영업"], EDIT_BOM: ["영업*"], DOWNLOAD_ORIGINAL: ["영업*"], QUOTE: ["영업*"],
    MANAGE_USERS: ["관리자"],
  }; // "영업*" = 영업이면서 작성자
  function authorize(user, action, bom) {
    const role = users.get(user.id).role;             // 매 요청 DB 조회 (POL-010)
    const allowed = MATRIX[action];
    if (allowed.includes(role)) return ok();
    if (allowed.includes("영업*") && role === "영업" && bom?.authorId === user.id) return ok();
    return block("FORBIDDEN", {status: 403});
  }
  ```

- **관련 요구사항**: REQ-002, NFR-005
- **관련 화면**: SCR-003, SCR-005, SCR-007, SCR-009, SCR-012, SCR-013 (메뉴·버튼 표시는 전 화면 GNB)
- **관련 테스트**: TC-011, TC-012, TC-013, TC-014, TC-016, TC-048, TC-076, TC-107, TC-112, TC-151, TC-159

### POL-009 작성자 전용 정보(가격·견적)

- **규칙** (한 문장): 가격 정보(통화·List 단가·List 금액·할인율·벤더 Net 금액)와 견적 정보(환율·DC율·마진율·원가·견적가·견적서·원가분석표)는 BoM 건 작성자(역할 영업)에게만 보낸다. 그 밖의 사용자에게는 가려진 값이 아니라 **필드 자체를 빼고** 응답한다.
- **적용 시점**: BoM 상세·행 목록·버전 비교·검증 결과 조회 API의 응답 직렬화, 견적 API, 원본 벤더 파일 다운로드(가격형 CCW·Dell 원본에는 가격이 들어 있다)
- **위반/실패 시 처리**
  - 작성자가 아니면 가격 필드를 응답에서 제거한다. 값이 `null`인 키로도 보내지 않는다. 화면에는 가격 열과 견적 탭이 없다.
  - 견적·견적서·원가분석표·원본 파일 API는 차단한다. HTTP 403 「이 기능을 사용할 권한이 없습니다.」
  - R4·R9 판정의 금액 상세(POL-025, POL-030)도 작성자에게만 보낸다.
- **예외**: 없다(관리자 포함). 표준 BoM xlsx와 검증 리포트 xlsx에는 작성자가 받더라도 가격이 들어가지 않는다(POL-039). 감사 로그에도 금액을 쓰지 않는다(POL-011).
- **검증 의사코드**:

  ```js
  const PRICE_FIELDS = ["currency", "listUnitPrice", "listAmount", "discountRate", "vendorNetAmount"];
  function serializeRow(row, viewer, bom) {
    const out = {...row};
    if (!(viewer.role === "영업" && bom.authorId === viewer.id)) for (const f of PRICE_FIELDS) delete out[f];
    return out;
  }
  // 테스트 기준: 비작성자 응답 JSON에서 PRICE_FIELDS 중 어떤 키도 존재하지 않아야 한다 (!("listAmount" in row))
  ```

- **관련 요구사항**: REQ-015, NFR-005
- **관련 화면**: SCR-005, SCR-007, SCR-008, SCR-009, SCR-013
- **관련 테스트**: TC-013, TC-015, TC-016, TC-017, TC-028, TC-084, TC-087, TC-111, TC-116, TC-159

### POL-010 역할 변경

- **규칙** (한 문장): 관리자는 사용자를 1명 이상 골라 역할(영업·엔지니어·관리자·역할 미지정) 하나를 한 번에 지정할 수 있다. 자기 자신의 관리자 역할은 바꿀 수 없다. 바뀐 역할은 해당 사용자의 다음 요청부터 적용된다.
- **적용 시점**: 사용자 역할 관리 화면의 [역할 지정], `PATCH /api/users/roles` `{userIds: [...], role}`
- **위반/실패 시 처리**
  - 선택한 사용자가 0명이면 [역할 지정] 버튼이 비활성이다.
  - 선택에 자기 자신이 들어 있고 새 역할이 관리자가 아니면, 요청 전체를 차단한다(일부만 반영하지 않음). 문구: 「자신의 관리자 역할은 해제할 수 없습니다. 선택 목록에서 본인을 빼 주세요.」
  - 성공하면: 「{n}명의 역할을 변경했습니다: {역할}」
  - 역할이 바뀐 사용자마다 변경자·일시·이전 역할·새 역할을 기록한다(POL-011).
- **예외**: 이전 역할과 새 역할이 같은 사용자는 기록하지 않고 {n}에서도 뺀다. 역할은 세션에 캐시하지 않고 요청마다 DB에서 읽는다. 역할이 바뀌어도 그 사용자가 작성한 BoM 건은 그대로 남는다(OI-10).
- **검증 의사코드**:

  ```js
  function changeRoles(admin, userIds, role) {
    if (userIds.length === 0) return block("MSG_NO_SELECTION");
    if (userIds.includes(admin.id) && role !== "관리자") return block("MSG_SELF_ADMIN");
    let n = 0;
    tx(() => userIds.forEach(id => {
      const u = users.get(id);
      if (u.role === role) return;
      audit("ROLE_CHANGE", {by: admin.id, target: id, from: u.role, to: role});
      users.update(id, {role}); n++;
    }));
    return ok({message: `${n}명의 역할을 변경했습니다: ${role}`});
  }
  ```

- **관련 요구사항**: REQ-020
- **관련 화면**: SCR-012
- **관련 테스트**: TC-014, TC-019, TC-020, TC-021, TC-022, TC-158

## 6. 운영/어뷰징 정책

신고·제재·금칙어는 해당 없음 — 사내 인증 사용자 전용 서비스이며, 사용자끼리 주고받는 게시물이 없다.

### POL-011 감사 로그 [미확정]

- **규칙** (한 문장): 아래 사건은 발생할 때마다 일시·사용자 ID·사건 종류·대상 ID·결과(성공/실패)를 감사 로그에 한 줄씩 남긴다. 감사 로그는 누구도 수정·삭제할 수 없다.

| 사건 | 대상 ID |
|---|---|
| 로그인 성공·실패, 로그아웃 | 사용자 |
| 역할 변경 (이전·새 역할 포함) | 사용자 |
| BoM 건 생성·삭제, 파일 업로드 | BoM 건, 파일 |
| 새 버전 생성, 확정, 「확인함」 체크·해제, 「AI 검토 없이 확정」 | 버전, 검증 결과 |
| 견적 생성·저장 | 견적 |
| 모든 다운로드 — 표준 BoM, 검증 리포트, 고객 견적서(양식·형식 포함), 원가분석표, 원본 벤더 파일 | 버전·검증 결과·견적·파일 |

- **적용 시점**: 표의 사건을 처리하는 API가 끝나는 시점(성공과 실패 모두)
- **위반/실패 시 처리**: 다운로드 요청에서 감사 로그를 쓰지 못하면 다운로드도 차단한다. HTTP 500과 문구 「요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.」 나머지 사건은 처리를 끝내고 기록 실패를 서버 오류 로그에 남긴다.
- **예외**: 목록·상세 조회는 기록하지 않는다. 로그에는 금액·가격 값을 쓰지 않는다(POL-009). **보관 기간은 미정이다(OI-12)** — MVP는 삭제 기능 없이 모두 보관하고, 2차 착수 전에 정한다(D-36). MVP에는 감사 로그 조회 화면이 없다.
- **검증 의사코드**:

  ```js
  function audited(event, targetIdOf, handler, {mandatory = false} = {}) {
    return async (req) => {
      let res, result = "성공";
      try { res = await handler(req); } catch (e) { result = "실패"; throw e; }
      finally {
        const entry = {at: now(), userId: req.user?.id, event, targetId: targetIdOf(req, res), result};
        assertNoMoney(entry);                  // 금액 필드가 있으면 개발 단계에서 실패
        const written = await auditLog.append(entry);
        if (!written && mandatory && result === "성공") throw httpError(500, "MSG_TRY_LATER");
      }
      return res;
    };
  }
  // 다운로드 핸들러는 mandatory: true
  ```

- **관련 요구사항**: NFR-008
- **관련 화면**: 해당 없음
- **관련 테스트**: TC-003, TC-006, TC-019, TC-023, TC-036, TC-048, TC-093, TC-104, TC-106, TC-107, TC-108, TC-112, TC-113, TC-116, TC-118, TC-134, TC-140, TC-156

## 7. 법적/개인정보 정책

### POL-012 LLM 전송 범위·기록

- **규칙** (한 문장): LLM은 사내 승인 클라우드 LLM(기업 계약, 학습 미사용)만 호출한다. LLM 입력에는 **구성 필드만** 넣는다. 가격 정보·견적 정보·고객사명·건명·사용자 개인정보는 넣지 않는다.
- **전송 필드**
  - AI 검토 권고(REQ-009): 행 번호, 벤더, 행 유형, 상위 행 번호, 구분, 모듈명, SKU, 품명, 수량, 서비스·구독 기간, 구독 정보
  - EOS AI 검색(REQ-008·019, Cisco·Dell 공통 — D-38): SKU, 품명, 모듈명. 단건 검색(REQ-019)은 입력한 SKU만
- **근거**: D-11은 전송 범위를 제한하지 않는다. 다만 호환성·누락·불필요 항목 판단에 가격과 고객사명은 필요 없다. 그래서 이 범위로 좁혔고(D-34), 구성 정보 전송은 허용으로 확정했다(D-37, OI-13 해결).
- **적용 시점**: LLM API를 호출하기 직전(서버의 LLM 클라이언트 한 곳에서 검사)
- **위반/실패 시 처리**: 입력에 허용 목록 밖의 필드가 있으면 호출하지 않고 차단한다. 서버 오류 로그에 기록하고, 해당 단계는 실패로 처리한다. 사용자에게는 AI 검토 실패 문구(POL-031) 또는 EOS 「확인 불가」(POL-029)가 표시된다.
- **기록**: LLM 요청·응답 원문을 검증 결과 ID와 함께 저장한다. 보관 기간은 해당 검증 결과와 같다(BoM 건을 삭제하면 함께 삭제). 화면에서는 조회할 수 없고, 사후 추적용으로 DB에만 남긴다.
- **예외**: 사내 보안 정책이 바뀌어 전송 범위가 달라지면 이 정책의 전송 필드만 고친다.
- **검증 의사코드**:

  ```js
  const LLM_ALLOWED = {
    REVIEW: ["rowNo", "vendor", "rowType", "parentRowNo", "category", "module", "sku", "name", "qty", "durationMonths", "subscriptionInfo"],
    EOS: ["sku", "name", "module"],                  // Cisco·Dell AI 검색 (D-38)
  };
  function buildLlmInput(purpose, rows) {
    const allowed = new Set(LLM_ALLOWED[purpose]);
    for (const r of rows) for (const k of Object.keys(r)) if (!allowed.has(k)) return block("LLM_FIELD_NOT_ALLOWED", {field: k});
    return ok(rows);
  }
  ```

- **관련 요구사항**: REQ-009, REQ-008, NFR-007
- **관련 화면**: 해당 없음
- **관련 테스트**: TC-094, TC-095, TC-098, TC-102, TC-103, TC-143

### POL-013 사용자 정보 수집·보관 [미확정]

- **규칙** (한 문장): 사용자 정보는 Naver Works가 주는 이름·계정(메일)·부서와, 시스템이 기록하는 최초·최근 로그인 일시만 저장한다. 그 밖의 개인정보는 수집하지 않는다.
- **적용 시점**: SSO 콜백(POL-002), 사용자 목록 화면
- **위반/실패 시 처리**: Naver Works 응답에 계정 ID·이름·메일 중 하나라도 없으면 로그인을 실패로 처리하고 세션을 만들지 않는다. 문구: 「Naver Works 계정 정보를 받지 못했습니다. 관리자에게 문의해 주세요.」
- **예외**: 부서가 없으면 빈 값으로 저장한다. Naver Works 계정이 비활성화된 사용자(퇴사자 등)는 로그인할 수 없지만, BoM 작성자 표시를 위해 사용자 정보는 남긴다. **보관·파기 기간은 미정이다(OI-12)** — MVP는 삭제하지 않고 보관하며, 2차 착수 전에 정한다(D-36).
- **검증 의사코드**:

  ```js
  const USER_FIELDS = ["nwId", "name", "email", "dept", "role", "firstLoginAt", "lastLoginAt"];
  function checkPol013(nw) {
    if (!nw.id || !nw.name || !nw.email) return block("MSG_NW_PROFILE_MISSING");
    return ok(); // 저장 스키마는 USER_FIELDS 외 컬럼을 두지 않는다
  }
  ```

- **관련 요구사항**: REQ-001, REQ-020
- **관련 화면**: SCR-001, SCR-002, SCR-012
- **관련 테스트**: TC-007, TC-010, TC-018, TC-147

## 8. 파일 업로드·변환 정책

### POL-014 업로드 파일 허용 조건

- **규칙** (한 문장): 작성자는 작성중 버전에 `.xls`(Excel 97-2003 BIFF8)·`.xlsx`·`.csv`(UTF-8 또는 CP949) 파일을 올릴 수 있다. 파일 1개는 **10MB 이하**이고, 읽는 시트의 머리글 행 아래 비어 있지 않은 행이 **3,000행 이하**여야 한다(NFR-002).
- **검사 순서**: ① 확장자 → ② 크기 → ③ 열기(손상·암호·인코딩) → ④ 빈 파일 → ⑤ 형식 판별(POL-015) → ⑥ 데이터 행 수 → ⑦ 변환(POL-016). 먼저 걸린 사유 하나만 표시한다.
- **적용 시점**: 파일 업로드 영역에 파일을 놓거나 선택할 때, `POST /api/versions/{id}/files`
- **위반/실패 시 처리**: 차단한다. 파일을 저장하지 않고 표준 BoM도 바꾸지 않는다. 사유별 문구:

| 사유 | 문구 |
|---|---|
| ① 허용하지 않는 확장자 | 「.xls, .xlsx, .csv 파일만 올릴 수 있습니다.」 |
| ② 10MB 초과 | 「파일 크기는 10MB 이하여야 합니다. (현재 {크기}MB)」 — 소수 첫째 자리 |
| ③ 열 수 없음 | 「파일을 열 수 없습니다. 파일이 손상되었는지 확인해 주세요.」 |
| ③ 암호 걸림 | 「암호가 걸린 파일은 읽을 수 없습니다. 암호를 해제한 뒤 다시 올려 주세요.」 |
| ③ CSV 인코딩 | 「CSV 파일의 문자 인코딩을 읽을 수 없습니다. UTF-8 또는 CP949로 저장해 주세요.」 |
| ④ 빈 파일 | 「빈 파일입니다. 내용이 있는 파일을 올려 주세요.」 |
| ⑥ 3,000행 초과 | 「데이터 행은 3,000행 이하여야 합니다. (현재 {n}행)」 |

- **예외**: 확장자는 대소문자를 구분하지 않는다. `.xlsm`·`.xlsb`·`.pdf`는 받지 않는다(PDF는 P2, REQ-026). 여러 파일을 한 번에 고르면 고른 순서대로 한 개씩 처리한다. 앞 파일이 실패해도 뒤 파일은 처리한다. CSV는 UTF-8(BOM 포함 허용)로 먼저 읽고, 실패하면 CP949로 읽는다.
- **검증 의사코드**:

  ```js
  const MAX_BYTES = 10 * 1024 * 1024, MAX_ROWS = 3000; // NFR-002 (D-35)
  function checkPol014(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xls", "xlsx", "csv"].includes(ext)) return block("MSG_EXT");
    if (file.size > MAX_BYTES) return block("MSG_SIZE", {mb: (file.size / 1048576).toFixed(1)});
    const wb = tryOpen(file, ext);                   // csv: utf-8(sig) → cp949
    if (wb.error === "ENCRYPTED") return block("MSG_ENCRYPTED");
    if (wb.error === "ENCODING") return block("MSG_CSV_ENCODING");
    if (wb.error) return block("MSG_CORRUPT");
    if (wb.sheets.every(s => s.rows.every(isEmptyRow))) return block("MSG_EMPTY");
    const det = detectFormat(wb);                    // POL-015
    if (!det.ok) return det;
    const n = det.sheet.rows.slice(det.headerIndex + 1).filter(r => !isEmptyRow(r)).length;
    if (n > MAX_ROWS) return block("MSG_ROWS", {n});
    return ok(det);
  }
  ```

- **관련 요구사항**: REQ-004, NFR-002, NFR-011
- **관련 화면**: SCR-006
- **관련 테스트**: TC-047, TC-049, TC-050, TC-051, TC-052, TC-053, TC-054, TC-152

### POL-015 벤더 형식 판별

- **규칙** (한 문장): 시트마다 앞에서부터 **60행** 안에서 아래 시그니처를 찾고, 시그니처가 맞는 첫 시트를 읽는다. 머리글 셀은 앞뒤 공백을 빼고 대소문자를 무시해 **완전 일치**로 비교한다. 행 번호는 고정하지 않는다.

| 형식 | 시그니처 (모두 만족) |
|---|---|
| Cisco CCW 가격형 | ① 60행 안의 어느 셀 값이 `Price Quotation` ② 한 행에 `#`·`Part Number`·`Part Description`·`Quantity`가 모두 있음(그 행이 머리글 행) ③ 머리글 행에 `Unit List Price`·`Discount %`·`Unit Net Price`가 모두 있음 |
| Cisco CCW 구성형 | 위 ①·②는 만족하고 ③은 만족하지 않음 |
| Dell Solutions Configurator | ① 한 행에 `그룹 이름`·`그룹 ID`·`제품 이름`·`옵션 ID`·`SKU`·`상위 오더 코드`가 모두 있음(머리글 행) ② 머리글 행 위에 `솔루션 ID:`로 시작하는 셀이 있음 |

- 시트 이름(`QUOTE` 등)은 판별 조건이 아니다. CSV에는 시트 이름이 없기 때문이다.
- 샘플 11개는 모두 자동 판별된다. 머리글 행은 CCW 31행·40행, Dell 7행이다(부록 A.4).
- **적용 시점**: 업로드 검사 ⑤단계(POL-014)
- **위반/실패 시 처리**
  - 판별 성공 시 안내(차단 아님)
    - 구성형: 「Cisco CCW(구성형)로 인식했습니다. 단가가 없어 견적은 단가 입력 후 만들 수 있습니다. 가격형으로 다시 내보내면 단가가 자동으로 들어갑니다.」
    - 가격형: 「Cisco CCW(가격형)로 인식했습니다.」
    - Dell: 「Dell Solutions Configurator 파일로 인식했습니다.」
  - 판별 실패: 「파일 형식을 판별하지 못했습니다. 형식을 직접 선택해 주세요.」와 선택지 [Cisco CCW 구성형] [Cisco CCW 가격형] [Dell Solutions Configurator] [취소]를 표시한다.
  - 직접 고른 형식은 ①(`Price Quotation`·`솔루션 ID:`) 조건 없이 머리글 행만 찾는다. 그 형식의 필수 머리글이 없으면 차단한다: 「선택한 형식의 필수 컬럼이 없습니다: {컬럼 목록}」 변환하지 않고 파일도 저장하지 않는다.
  - 60행 안에서 머리글 행을 찾지 못한 파일은 판별 실패와 같다. 직접 골라도 찾지 못하면 「품목 표의 머리글 행을 찾지 못했습니다. 벤더 도구에서 내보낸 원본 파일인지 확인해 주세요.」를 표시한다.
- **예외**: 시트가 여러 개면 시그니처가 맞는 첫 시트만 읽고, 나머지 시트는 무시한다.
- **검증 의사코드**:

  ```js
  const SCAN = 60; // D-35
  const CISCO_REQ = ["#", "Part Number", "Part Description", "Quantity"];
  const CISCO_PRICE = ["Unit List Price", "Discount %", "Unit Net Price"];
  const DELL_REQ = ["그룹 이름", "그룹 ID", "제품 이름", "옵션 ID", "SKU", "상위 오더 코드"];
  const norm = c => String(c ?? "").trim().toLowerCase();
  const findHeader = (rows, req) => rows.slice(0, SCAN).findIndex(r => req.every(h => r.map(norm).includes(norm(h))));
  const hasCell = (rows, pred) => rows.some(r => r.some(c => pred(String(c ?? "").trim())));
  // 자동 판별
  function detectFormat(wb) {
    for (const sh of wb.sheets) {
      const hc = findHeader(sh.rows, CISCO_REQ);
      if (hc >= 0 && hasCell(sh.rows.slice(0, SCAN), t => t.toLowerCase() === "price quotation")) {
        const priced = CISCO_PRICE.every(h => sh.rows[hc].map(norm).includes(norm(h)));
        return ok({format: priced ? "CISCO_PRICED" : "CISCO_CONFIG", sheet: sh, headerIndex: hc});
      }
      const hd = findHeader(sh.rows, DELL_REQ);
      if (hd >= 0 && hasCell(sh.rows.slice(0, hd), t => t.startsWith("솔루션 ID:")))
        return ok({format: "DELL", sheet: sh, headerIndex: hd});
    }
    return block("MSG_DETECT_FAILED");
  }
  // 사용자가 형식을 직접 고른 경우: 머리글 행만 찾는다
  function detectForced(wb, format) {
    const req = {CISCO_CONFIG: CISCO_REQ, CISCO_PRICED: [...CISCO_REQ, ...CISCO_PRICE], DELL: DELL_REQ}[format];
    for (const sh of wb.sheets) {
      const h = findHeader(sh.rows, req);
      if (h >= 0) return ok({format, sheet: sh, headerIndex: h});
    }
    const best = bestPartialHeader(wb, req);            // 필수 머리글이 가장 많이 있는 행
    if (!best) return block("MSG_HEADER_NOT_FOUND");
    return block("MSG_REQUIRED_COLUMNS_MISSING", {columns: req.filter(h => !best.map(norm).includes(norm(h)))});
  }
  ```

- **관련 요구사항**: REQ-004
- **관련 화면**: SCR-006
- **관련 테스트**: TC-036, TC-037, TC-038, TC-039, TC-055, TC-056, TC-057, TC-058

### POL-016 품목 행 판별·계층

- **규칙** (한 문장): 머리글 행 아래의 행을 아래 규칙으로 **품목 행**과 **부가 정보 행**, **버리는 행**으로 나눈다. 품목 행에는 행 유형(상위 품목 / 하위 제품 / 구성품)과 직계 상위 행을 붙인다.
- **행 유형** (D-26으로 「하위 제품」 추가)

| 행 유형 | 뜻 | SKU | 금액 합산 |
|---|---|---|---|
| 상위 품목 | 제품 한 단위. 최상위 행 | Cisco 있음 / Dell 없음 | Cisco 합산 / Dell 제외(구성품의 합이므로) |
| 하위 제품 | **Dell 전용.** 그룹 제품 안의 제품 묶음(예: Unity 380 Hybrid DPE). 구분선·소계 역할 | 없음 | 제외 |
| 구성품 | 상위 품목 또는 하위 제품에 딸린 행 | 있음 | 합산 |

- **Cisco CCW**
  1. `#` 값이 `^\d+(\.\d+)+$`에 맞는 행이 품목 행이다.
  2. `N.0` 형태(점이 하나이고 끝이 0)면 상위 품목이다. 그 밖의 `N.x`·`N.x.y`는 같은 `N`의 `N.0`을 직계 상위로 하는 구성품이다(3단 번호도 2단으로 편다). 같은 `N`의 `N.0`이 없으면 그 행을 상위 품목으로 둔다.
  3. `#`이 비어 있고 `Part Number` 칸이 `Requested Start Date`로 시작하는 행은 부가 정보 행이다. 바로 위 품목 행의 **구독 정보**로 붙인다.
  4. 그 밖의 행(합계 행 `Total List Price`·`Discounts`·`Quote Total` 등, `Note`, 약관, 빈 행)은 버린다. 단, `Quote Total` 행의 금액은 BoM 파일 정보로 보관한다(R9용, POL-030).
  5. 머리글 위의 `Currency:` 값은 BoM 파일 정보로 보관한다(POL-019).
- **Dell Solutions Configurator**
  1. `그룹 ID`가 있는 행이 상위 품목이다. 그룹 ID가 같은 행이 여러 개여도 각 행이 별도의 상위 품목이다(CASE2_Server는 5개가 모두 `5623942.2.1`).
  2. `그룹 ID`와 `옵션 ID`가 비어 있고 `제품 이름`이 있는 행은 직전 상위 품목의 하위 제품이다.
  3. `옵션 ID`가 있는 행은 구성품이다. 직계 상위는 같은 상위 품목 안에서 가장 최근의 하위 제품이다. 하위 제품이 없으면 상위 품목이다.
  4. 「* Solutions Configurator 가격 책정은…」 주석 행과 빈 행은 버린다. 머리글 위 메타 행의 `솔루션 ID:`·`솔루션 이름:`·`솔루션 표시 가격:`은 BoM 파일 정보로 보관한다.
- **적용 시점**: 업로드 검사 ⑦단계(변환), 형식 판별 직후
- **위반/실패 시 처리**
  - 필수 필드의 원천 컬럼(POL-017 표의 ○ 필드)이 머리글에 없으면 변환을 중단한다: 「필수 컬럼이 없어 변환할 수 없습니다: {컬럼 목록}」
  - 품목 행이 0개면 변환을 중단한다: 「품목 행을 찾지 못했습니다.」
  - CCW의 `#` 열 셀이 텍스트가 아니라 숫자 셀이면(엑셀에서 다시 저장해 `1.10`과 `1.1`을 구분할 수 없음) 변환을 중단한다: 「# 열이 숫자로 바뀌어 라인 번호를 읽을 수 없습니다. CCW에서 다시 내보낸 원본 파일을 올려 주세요.」
  - 중단하면 파일을 저장하지 않는다.
  - 변환에 성공하면 요약을 표시한다: 「총 {N}행 변환(상위 품목 {A}, 구성품 {B}), 미분류 {M}행」 — 하위 제품이 있으면 「총 {N}행 변환(상위 품목 {A}, 하위 제품 {C}, 구성품 {B}), 미분류 {M}행」
- **예외**: Dell에서 첫 상위 품목보다 앞에 나온 옵션 행은 버리고, 요약 끝에 「상위 품목이 없는 옵션 행 {n}개를 건너뛰었습니다.」를 붙인다. 파일을 2개 이상 올리면 행은 파일 순서대로 이어 붙고, 행 번호는 BoM 전체에서 1부터 다시 매긴다.
- **검증 의사코드**:

  ```js
  const LINE = /^\d+(\.\d+)+$/;
  function classifyCisco(rows, h) {
    const items = [], tops = {};
    for (let i = h + 1; i < rows.length; i++) {
      const c = rows[i];
      if (c.cellType("#") === "number") return block("MSG_LINE_NUMERIC");
      const line = str(c["#"]);
      if (LINE.test(line)) {
        const [n, ...rest] = line.split(".");
        const isTop = rest.length === 1 && rest[0] === "0";
        const it = {line, srcRow: i + 1, parent: isTop ? null : (tops[n] ?? null)};
        it.rowType = it.parent ? "구성품" : "상위 품목";
        if (isTop) tops[n] = it;
        items.push(it);
      } else if (!line && str(c["Part Number"]).startsWith("Requested Start Date") && items.length) {
        items.at(-1).subscriptionInfo = str(c["Part Number"]);
      } // 그 밖은 버림
    }
    return items.length ? ok(items) : block("MSG_NO_ITEMS");
  }
  function classifyDell(rows, h) {
    const items = []; let top = null, sub = null, skipped = 0;
    for (let i = h + 1; i < rows.length; i++) {
      const c = rows[i];
      if (str(c["그룹 ID"])) { top = {rowType: "상위 품목", parent: null, srcRow: i + 1}; sub = null; items.push(top); }
      else if (str(c["제품 이름"]) && !str(c["옵션 ID"]) && top) { sub = {rowType: "하위 제품", parent: top, srcRow: i + 1}; items.push(sub); }
      else if (str(c["옵션 ID"])) { if (!top) { skipped++; continue; } items.push({rowType: "구성품", parent: sub ?? top, srcRow: i + 1}); }
    }
    return items.length ? ok({items, skipped}) : block("MSG_NO_ITEMS");
  }
  ```

- **관련 요구사항**: REQ-005
- **관련 화면**: SCR-005, SCR-006
- **관련 테스트**: TC-036, TC-037, TC-038, TC-040, TC-041, TC-046, TC-059, TC-060, TC-061, TC-063

### POL-017 표준 BoM 필드 매핑

- **규칙** (한 문장): 품목 행은 아래 매핑표대로 표준 BoM 필드로 옮긴다. 변환은 규칙 기반이며 LLM을 쓰지 않는다. 같은 파일은 항상 셀 단위로 같은 결과가 나온다.

| 필드 | Cisco CCW | Dell — 상위 품목 | Dell — 하위 제품 | Dell — 구성품 |
|---|---|---|---|---|
| 행 번호 | BoM 전체 순번 | 같음 | 같음 | 같음 |
| 벤더 | `Cisco` | `Dell` | `Dell` | `Dell` |
| 원본 라인 번호 | `#` 원문 (예: `1.0.1`) | `{그룹 ID}-{p}` (p = 파일 안 상위 품목 순번, 1부터) | `{상위 품목 라인}.S{k}` (k = 상위 품목 안 하위 제품 순번) | `{상위 품목 라인}.{o}` (o = 상위 품목 안 옵션 순번. 하위 제품 경계와 상관없이 이어짐) |
| 상위 행 번호 | 구성품이면 `N.0` 행의 행 번호 | 빈 값 | 상위 품목 행 번호 | 직계 상위(하위 제품 또는 상위 품목) 행 번호 |
| 행 유형 | POL-016 | 상위 품목 | 하위 제품 | 구성품 |
| 구분 | POL-018 | `PRODUCT` | `PRODUCT` | POL-018 |
| 모듈명 | 빈 값 | 빈 값 | 빈 값 | `모듈 이름` |
| SKU | `Part Number` | 빈 값 (원본에 없음) | 빈 값 | `SKU` 원문 그대로 (쉼표 목록 보존) |
| 옵션 ID | 빈 값 | 빈 값 | 빈 값 | `옵션 ID` |
| 품명 | `Part Description` | `제품 이름` | `제품 이름` | `옵션 이름` |
| 수량 | `Quantity` (구성품 수량은 이미 전체 수량) | `제품 수량` | `제품 수량` | `수량` |
| 서비스·구독 기간(개월) | ① `Service Duration` 숫자 ② 자기 구독 정보의 `Requested For : NN Months` ③ 상위 품목 구독 정보의 같은 값 — 처음 나오는 값 | 빈 값 | 빈 값 | `옵션 이름`에서 `/(\d+(\.\d+)?)\s*개월/`의 마지막 일치값 |
| 구독 정보 | 부가 정보 행 원문 | 빈 값 | 빈 값 | 빈 값 |
| EOS 상태 | 검증 결과(POL-029) | 빈 값 | 빈 값 | 검증 결과 |
| 원본 파일명 / 원본 행 번호 | 파일명 / 시트 행 번호(1부터) | 같음 | 같음 | 같음 |
| 비고 | 빈 값 | 빈 값 | 빈 값 | 빈 값 |

- **값 정리**: 모든 텍스트는 앞뒤 공백을 뺀다(Dell `제품 이름`의 끝 공백 등). 그 밖의 변형(대문자화, 쉼표 뒤 공백 정리)은 하지 않는다. 수량 `2.0` → `2`. 기간은 소수점 둘째 자리까지 저장한다(`58.10` → 58.1). `-`·`--`·빈 셀은 빈 값이다. `Pricing Term (in Months)`는 과금 주기이므로 기간으로 쓰지 않는다.
- **적용 시점**: 변환(POL-016 직후)
- **위반/실패 시 처리**: 일부 행의 값이 비어 있으면 변환을 계속하고, 빈 값은 검증(POL-022 등)에서 판정한다. 기간·수량 칸에 숫자가 아닌 값이 있으면 빈 값으로 두고, 원문은 비고에 「원본 값: {원문}」으로 남긴다.
- **예외**: 기대 결과는 부록 A.1(Cisco 기준 샘플 36행), A.2(Dell 기준 샘플 44행), A.3(Cisco 가격형 샘플 22행)이다. PRD REQ-005의 「기대 결과표와 100% 일치」 조건은 이 표들을 기준으로 판정한다.
- **검증 의사코드**:

  ```js
  const REQ_FOR = /Requested For\s*:\s*([\d.]+)\s*Months/i, MONTHS = /(\d+(?:\.\d+)?)\s*개월/g;
  function ciscoDuration(it) {
    const own = numOrNull(it.serviceDuration);            // "-" → null
    if (own != null) return round2(own);
    const m = REQ_FOR.exec(it.subscriptionInfo ?? "") ?? REQ_FOR.exec(it.parent?.subscriptionInfo ?? "");
    return m ? round2(D(m[1])) : null;
  }
  function dellDuration(optionName) {
    const all = [...optionName.matchAll(MONTHS)];
    return all.length ? round2(D(all.at(-1)[1])) : null;
  }
  function dellLineNo(it) {
    if (it.rowType === "상위 품목") return `${it.groupId}-${it.topSeq}`;
    if (it.rowType === "하위 제품") return `${it.top.lineNo}.S${it.subSeq}`;
    return `${it.top.lineNo}.${it.optSeq}`;
  }
  ```

- **관련 요구사항**: REQ-005
- **관련 화면**: SCR-005
- **관련 테스트**: TC-040, TC-041, TC-042, TC-043, TC-044, TC-045, TC-065

### POL-018 구분 판정

- **규칙** (한 문장): 각 품목 행의 구분은 `PRODUCT` / `SERVICE` / `SOFTWARE`(구독) / `미분류` 중 하나다. 아래 순서대로 처음 맞는 규칙을 적용한다.

| 형식 | 판정 순서 |
|---|---|
| Cisco 가격형 | `Category` 값(앞뒤 공백 제거·대문자): `PRODUCT` → PRODUCT, `SERVICE` → SERVICE, `SUBSCRIPTION` → SOFTWARE, 그 밖의 값이나 빈 값 → **미분류** |
| Cisco 구성형 | ① 자기 행 또는 상위 품목에 구독 정보가 있음 → SOFTWARE ② SKU가 `CON-` 또는 `CX-`로 시작 → SERVICE ③ 그 밖 → PRODUCT |
| Dell 상위 품목·하위 제품 | PRODUCT |
| Dell 구성품 | ① `모듈 이름` 또는 `옵션 이름`에 `구독`·`subscription`(대소문자 무시) → SOFTWARE ② `모듈 이름`에 `서비스`·`보증`·`svcs`·`service`(대소문자 무시) → SERVICE ③ 그 밖 → PRODUCT |
| 직접 추가한 행 | 사용자가 고른 값. 고르지 않으면 빈 값(R1 오류) |

- **근거**: Cisco 구성형 규칙을 가격형 3개 파일(EY한영·무디스·인터터치, 79행)에 적용하면 `Category`와 79행 모두 일치한다. Term 라이선스(`C9300-DNA-A-48-3Y` 등)는 CCW에서도 PRODUCT다. 그래서 `Service Duration` 값이 있다는 것만으로는 SERVICE로 보지 않는다.
- **Dell SERVICE로 판정되는 샘플 모듈**: Dell 서비스: 하드웨어 지원 / Dell 서비스: 연장 서비스 / 연장 서비스 / 지원 서비스 / 베이스 제한보증 / 하드 드라이브 보호 서비스 엔터프라이즈 서비스 용 / ProDeploy Field 디플로이먼트 서비스 / 인프라스트럭처 디플로이먼트 서비스 / 맞춤 배송 서비스 / Sftwr Svcs - Perpetual (VP) / 소프트웨어 서비스 - 영구 (VP). `배송`·`배송 제품`·`고객 알림` 모듈은 PRODUCT다.
- **적용 시점**: 변환(POL-017). 편집에서 SKU·모듈명을 바꿔도 구분은 다시 판정하지 않는다(사용자가 구분을 직접 고친다).
- **위반/실패 시 처리**: 미분류 행은 변환을 막지 않는다. 변환 요약에 개수를 표시하고(POL-016), 검증에서 R7 경고로 판정한다(POL-028).
- **예외**: Cisco 구성형과 Dell은 규칙 ③이 있어 미분류가 생기지 않는다. 미분류는 가격형 `Category`의 알 수 없는 값에서만 생긴다.
- **검증 의사코드**:

  ```js
  function category(fmt, it) {
    if (fmt === "CISCO_PRICED")
      return {PRODUCT: "PRODUCT", SERVICE: "SERVICE", SUBSCRIPTION: "SOFTWARE"}[str(it.category).toUpperCase()] ?? "미분류";
    if (fmt === "CISCO_CONFIG") {
      if (it.subscriptionInfo || it.parent?.subscriptionInfo) return "SOFTWARE";
      if (/^(CON|CX)-/.test(it.sku)) return "SERVICE";
      return "PRODUCT";
    }
    if (it.rowType !== "구성품") return "PRODUCT"; // DELL
    if (/구독|subscription/i.test(`${it.module} ${it.name}`)) return "SOFTWARE";
    if (/서비스|보증|svcs|service/i.test(it.module)) return "SERVICE";
    return "PRODUCT";
  }
  ```

- **관련 요구사항**: REQ-005
- **관련 화면**: SCR-005
- **관련 테스트**: TC-041, TC-042, TC-064, TC-086

### POL-019 가격 정보 매핑

- **규칙** (한 문장): 가격 정보는 아래 표대로 옮긴다. **List 금액은 저장값**이다. 수량이나 List 단가를 편집하면 `List 금액 = List 단가 × 수량`으로 다시 계산한다.

| 필드 | Cisco 가격형 | Cisco 구성형 | Dell 상위 품목·하위 제품 | Dell 구성품 |
|---|---|---|---|---|
| 통화 | 머리글 위 `Currency:` 값 | 같음 | `KRW` | `KRW` |
| List 단가 | `Unit List Price (With Duration)`. 이 컬럼이 없거나 값이 비면 `Unit List Price` | 빈 값 | List 금액 ÷ 수량 | List 금액 ÷ 수량 |
| List 금액 | List 단가 × 수량 | 빈 값 | `확장된 가격(표시)` | `옵션 표시 가격` 그대로 (수량 전체의 총 가격, D-22) |
| 할인율(DC율, %) | `Discount %` | 빈 값 | 빈 값 | 빈 값 |
| 벤더 Net 금액 (참고, 편집 불가) | `Extended Net Price` | 빈 값 | 빈 값 | 빈 값 |

- **근거**: CCW 구독 행의 `Unit List Price`는 월 단가다. 인터터치 샘플에서 `Extended List Price`와 맞는 값은 `Unit List Price (With Duration) × Quantity`다(10.2 LIC-CW-A: 1,904,460 × 252 = 479,923,920). 하드웨어 행은 두 컬럼 값이 같다.
- **값 정리**: `0`은 값이다(빈 값이 아님). `-`·`--`·빈 셀은 빈 값이다. 쉼표는 제거하고 Decimal로 읽는다. Dell List 단가는 나누어떨어지지 않으면 Decimal 그대로 둔다(표시할 때만 원 단위 버림).
- **적용 시점**: 변환(POL-017), 편집 저장(POL-020)
- **위반/실패 시 처리**: Dell 파일의 `솔루션 표시 가격`이 `₩`로 시작하지 않으면 변환을 중단한다. 문구: 「Dell 파일의 통화가 원화(₩)가 아닙니다. 지원하지 않는 통화입니다.」 CCW `Currency:` 값이 없으면 통화를 빈 값으로 두고, 견적을 만들 때 통화를 고르게 한다(POL-033).
- **예외**: 가격 정보는 작성자만 본다(POL-009). 견적 화면에서 입력한 단가·DC율은 견적에만 저장하고, 가격 정보는 바꾸지 않는다(REQ-016).
- **검증 의사코드**:

  ```js
  function ciscoPriced(c) {
    const withDur = numOrNull(c["Unit List Price (With Duration)"]);
    const unit = withDur ?? numOrNull(c["Unit List Price"]);
    const qty = numOrNull(c["Quantity"]);
    return {listUnitPrice: unit, listAmount: unit != null && qty != null ? unit.mul(qty) : null,
            discountRate: numOrNull(c["Discount %"]), vendorNetAmount: numOrNull(c["Extended Net Price"])};
  }
  function dellPrice(it, c) {
    const amt = numOrNull(it.rowType === "구성품" ? c["옵션 표시 가격"] : c["확장된 가격(표시)"]);
    const qty = numOrNull(it.rowType === "구성품" ? c["수량"] : c["제품 수량"]);
    return {currency: "KRW", listAmount: amt, listUnitPrice: amt != null && qty && !qty.isZero() ? amt.div(qty) : null, discountRate: null};
  }
  function onEdit(row, field, value) {
    row[field] = value;
    if ((field === "qty" || field === "listUnitPrice") && row.listUnitPrice != null && row.qty != null)
      row.listAmount = row.listUnitPrice.mul(row.qty);
  }
  ```

- **관련 요구사항**: REQ-005, REQ-016
- **관련 화면**: SCR-005, SCR-009
- **관련 테스트**: TC-042, TC-043, TC-044, TC-062, TC-070, TC-121, TC-124, TC-128

### POL-020 표준 BoM 편집

- **규칙** (한 문장): 작성자는 작성중 버전에서 편집 가능 필드를 셀 단위로 고칠 수 있고, 행을 추가·삭제할 수 있다. 내용을 바꿔 저장하면 검증 상태가 「재검증 필요」가 된다.
- **필드별 편집 가능 여부**
  - 편집 불가: 행 번호, 원본 라인 번호, 원본 파일명, 원본 행 번호, 행 유형, EOS 상태(검증 결과), 벤더 Net 금액(참고값)
  - 직접 추가한 행에서만 편집 가능: 벤더
  - 편집 가능: 상위 행 번호, 구분, 모듈명, SKU, 옵션 ID, 품명, 수량, 서비스·구독 기간, 구독 정보, 비고, 통화, List 단가, 할인율
- **입력 형식**(셀 단위 즉시 검사): 수량·List 단가·할인율·기간은 숫자만 받는다. 소수 자릿수는 수량 제한 없음, 기간 둘째 자리, List 단가 둘째 자리, 할인율 둘째 자리까지다. 범위(정수 여부, 음수, 0~100%)는 저장을 막지 않고 검증에서 판정한다(R2·R4).
- **상위 행 번호**: 빈 값이거나 상위 품목·하위 제품 행 번호여야 한다. 빈 값이면 행 유형이 상위 품목, 값이 있으면 구성품이 된다. 하위 제품 행은 직접 만들 수 없다.
- **행 추가**: 선택한 행 바로 아래에 빈 행을 만든다. 원본 파일명은 「직접 입력」이고, 원본 라인 번호·원본 행 번호는 빈 값이다.
- **행 삭제**: 상위 품목이나 하위 제품을 지우면 그 아래 행도 함께 지운다. 삭제 전에 확인 대화상자를 띄운다.
- **수정 표시**: 변환 값과 다른 셀은 배경색과 「수정됨」 표시로 구분한다. 셀에 마우스를 올리면 「원본 값: {값}」을 보여준다(원본이 빈 값이면 「원본 값: (빈 값)」).
- **적용 시점**: 표준 BoM 표 편집·저장 `PUT /api/versions/{id}/rows`(POL-005의 수정 번호 검사 포함)
- **위반/실패 시 처리**
  - 숫자 칸에 숫자가 아닌 값: 입력을 차단하고 셀 아래에 「숫자만 입력할 수 있습니다.」
  - 잘못된 상위 행 번호: 저장을 차단하고 「상위 행 번호는 상위 품목 또는 하위 제품의 행 번호여야 합니다.」
  - 상위 품목 삭제 확인: 「이 상위 품목과 구성품 {n}개가 함께 삭제됩니다. 삭제하시겠습니까?」 [삭제] [취소] — 하위 제품이면 「이 하위 제품과 구성품 {n}개가 함께 삭제됩니다. 삭제하시겠습니까?」
  - 확정 버전·비작성자: 편집 기능을 표시하지 않고, API는 POL-004·POL-008에 따라 차단한다.
- **예외**: 행 번호는 추가·삭제 후 표시 순서대로 다시 매긴다. 검증 결과는 행마다 바뀌지 않는 내부 행 ID를 기준으로 한다(POL-021). 내용을 바꾸지 않고 저장하면 검증 상태를 바꾸지 않는다.
- **검증 의사코드**:

  ```js
  const LOCKED = ["rowNo", "originLineNo", "originFile", "originRow", "rowType", "eosStatus", "vendorNetAmount"];
  const NUMERIC = {qty: null, durationMonths: 2, listUnitPrice: 2, discountRate: 2}; // 허용 소수 자릿수
  function checkCellEdit(row, field, value) {
    if (LOCKED.includes(field)) return block("FORBIDDEN_FIELD");
    if (field === "vendor" && row.originFile !== "직접 입력") return block("FORBIDDEN_FIELD");
    if (field in NUMERIC && value !== "") {
      if (!/^-?\d+(\.\d+)?$/.test(value)) return block("MSG_NUMERIC_ONLY");
      const dp = (value.split(".")[1] ?? "").length;
      if (NUMERIC[field] != null && dp > NUMERIC[field]) return block("MSG_NUMERIC_ONLY");
    }
    return ok();
  }
  function checkParent(rows, parentRowNo) {
    if (parentRowNo == null) return ok({rowType: "상위 품목"});
    const p = rows.find(r => r.rowNo === parentRowNo);
    return p && ["상위 품목", "하위 제품"].includes(p.rowType) ? ok({rowType: "구성품"}) : block("MSG_BAD_PARENT");
  }
  ```

- **관련 요구사항**: REQ-006
- **관련 화면**: SCR-005
- **관련 테스트**: TC-067, TC-068, TC-069, TC-070, TC-071, TC-072, TC-073, TC-077

## 9. 검증 정책

### POL-021 검증 실행·판정 공통

- **규칙** (한 문장): 작성자가 작성중 버전에서 [검증]을 누르면 그 시점의 내용(수정 번호)을 기준으로 ① 고정 규칙 R1 ~ R7·R9 → ② EOS 조회 R8 → ③ AI 검토 권고 순서로 실행한다. 판정은 한 건마다 규칙 ID·등급·대상 행·대상 필드·문구를 갖는다.
- **등급**: `오류`(확정 차단) / `경고`(「확인함」 후 확정 가능) / `검토 권고`(AI, 「확인함」 후 확정 가능)
- **진행 표시**: 「고정 규칙 검사 중」 → 「EOS 조회 중 ({완료}/{전체})」 → 「AI 검토 중」. 단계별 시간 한도는 NFR-003을 따른다. EOS 120초·AI 90초를 넘기면 각 정책의 실패 처리를 따른다(POL-029, POL-031).
- **결과 기록**: 검증 ID, 대상 버전, 대상 수정 번호, 시작·완료 일시, 판정 목록, AI 단계 상태(성공/실패)
- **정렬**: 등급(오류 → 경고 → 검토 권고) → 행 번호 → 규칙 ID. 화면 목록과 xlsx 리포트는 같은 순서다(REQ-010).
- **최신성**: 검증이 끝났을 때 버전의 수정 번호가 검증 시작 때와 같으면 `검증 완료`다. 다르면(검증 중에 저장됨) `재검증 필요`다. 검증 뒤에 저장하면 `재검증 필요`가 된다(POL-005).
- **「확인함」 이월**: 재검증하면 고정 규칙·EOS 판정 중 **규칙 ID + 내부 행 ID + 대상 필드 + 문구**가 직전 검증과 모두 같은 판정은 「확인함」을 이어받는다. 이어받은 판정에는 처음 체크한 사람·일시가 남는다. AI 검토 권고는 이어받지 않는다(검증마다 새로 만든다).
- **적용 시점**: [검증] `POST /api/versions/{id}/validations`, 검증 결과 조회
- **위반/실패 시 처리**
  - 품목 행이 0개면 실행하지 않는다: 「검증할 품목이 없습니다. 벤더 BoM 파일을 올리거나 행을 추가해 주세요.」
  - 같은 버전의 검증이 진행 중이면 새로 실행하지 않는다: 「검증이 이미 진행 중입니다.」
  - `재검증 필요` 상태에서 결과를 열면 상단에 「BoM이 수정되어 이 결과는 최신이 아닙니다」를 표시한다.
- **예외**: 고정 규칙(R1 ~ R7·R9)은 같은 내용이면 항상 같은 판정이다. EOS·AI는 외부 응답에 따라 달라질 수 있다. 노하우 룰(REQ-022, P1)은 도입되면 R9 뒤에 적용한다.
- **검증 의사코드**:

  ```js
  async function runValidation(version) {
    if (version.rows.length === 0) return block("MSG_NO_ROWS_TO_VALIDATE");
    if (version.validationRunning) return block("MSG_VALIDATION_RUNNING");
    const rev = version.revision, prev = version.latestValidation;
    const findings = [...fixedRules(version.rows)];                  // R1~R7, R9
    findings.push(...await eosRule(version.rows, {timeoutSec: 120})); // R8
    const ai = await aiReview(version.rows, {timeoutSec: 90});        // {ok, recommendations}
    for (const f of findings) {
      const same = prev?.findings.find(p => p.rule === f.rule && p.rowId === f.rowId && p.field === f.field && p.message === f.message);
      if (same?.ackBy) Object.assign(f, {ackBy: same.ackBy, ackAt: same.ackAt});
    }
    const state = version.revision === rev ? "검증 완료" : "재검증 필요";
    return save({versionId: version.id, revision: rev, findings, ai, state});
  }
  const ORDER = {"오류": 0, "경고": 1, "검토 권고": 2};
  const sortFindings = fs => fs.sort((a, b) => ORDER[a.grade] - ORDER[b.grade] || a.rowNo - b.rowNo || a.rule.localeCompare(b.rule));
  ```

- **관련 요구사항**: REQ-007, REQ-010
- **관련 화면**: SCR-005, SCR-007
- **관련 테스트**: TC-067, TC-078, TC-083, TC-088, TC-089, TC-090, TC-091, TC-092, TC-093, TC-153

### POL-022 R1 필수 필드

- **규칙** (한 문장): 모든 품목 행에 품명·수량·구분이, 상위 품목(Dell 제외)·구성품에 SKU가, 구분이 SERVICE·SOFTWARE인 행에 서비스·구독 기간이 있어야 한다. 없으면 **오류**다.
- **SKU 검사 제외**: Dell 상위 품목·Dell 하위 제품. 원본에 SKU가 없는 묶음 행이다.
- **기간 검사 제외(일회성 서비스, D-27)**: 모듈명 또는 품명에 `디플로이먼트`·`deployment`·`prodeploy`·`배송`·`설치`·`install`(대소문자 무시)이 들어 있는 행. 샘플에서는 ProDeploy Field 디플로이먼트 서비스, 인프라스트럭처 디플로이먼트 서비스, 맞춤 배송 서비스가 해당한다. 기간이 없는 유지보수 행은 그대로 오류다.
- **적용 시점**: 검증 ① 고정 규칙 단계
- **위반/실패 시 처리**: 오류. 비어 있는 필드마다 판정 1건을 만든다.
  - SKU·품명·수량·구분: 「{필드명} 값이 비어 있습니다.」
  - 기간: 「SERVICE·SOFTWARE 행은 서비스·구독 기간(개월)이 필요합니다.」
- **예외**: 위 두 가지 제외만 있다. 가격 필드는 필수가 아니다(REQ-007, D-14).
- **검증 의사코드**:

  ```js
  const ONE_TIME = /디플로이먼트|deployment|prodeploy|배송|설치|install/i;
  function r1(row) {
    const out = [], container = row.vendor === "Dell" && ["상위 품목", "하위 제품"].includes(row.rowType);
    for (const [f, label] of [["sku", "SKU"], ["name", "품명"], ["qty", "수량"], ["category", "구분"]]) {
      if (f === "sku" && container) continue;
      if (row[f] == null || row[f] === "") out.push(finding("R1", "오류", row, label, "MSG_R1_EMPTY", {field: label}));
    }
    if (["SERVICE", "SOFTWARE"].includes(row.category) && row.durationMonths == null && !ONE_TIME.test(`${row.module} ${row.name}`))
      out.push(finding("R1", "오류", row, "서비스·구독 기간", "MSG_R1_DURATION"));
    return out;
  }
  ```

- **관련 요구사항**: REQ-007
- **관련 화면**: SCR-007
- **관련 테스트**: TC-080, TC-081

### POL-023 R2 수량

- **규칙** (한 문장): 수량은 1 이상의 정수여야 한다. 아니면 **오류**다.
- **적용 시점**: 검증 ① 고정 규칙 단계. 수량이 빈 값인 행은 R1이 판정하고 R2는 건너뛴다.
- **위반/실패 시 처리**: 오류. 문구: 「수량은 1 이상의 정수여야 합니다. (현재 값: {값})」
- **예외**: 없다. Dell 하위 제품·상위 품목도 검사한다. 원본의 `2.0` 같은 표기는 변환 때 `2`가 되므로 위반이 아니다.
- **검증 의사코드**:

  ```js
  function r2(row) {
    if (row.qty == null) return [];
    const q = D(row.qty);
    return q.gte(1) && q.isInteger() ? [] : [finding("R2", "오류", row, "수량", "MSG_R2", {value: row.qty})];
  }
  ```

- **관련 요구사항**: REQ-007
- **관련 화면**: SCR-007
- **관련 테스트**: TC-082

### POL-024 R3 SKU 형식

- **규칙** (한 문장): SKU는 벤더별 형식에 맞아야 한다. 아니면 **오류**다. Dell은 쉼표로 나눈 SKU 각각을 검사한다.

| 벤더 | 형식 (정규식) | 샘플 근거 |
|---|---|---|
| Cisco | `^[A-Z0-9][A-Z0-9./=+-]{1,39}$` — 대문자·숫자로 시작하는 2~40자, 대문자·숫자·`.` `/` `=` `+` `-`만 | CCW 5개 파일의 SKU 전부 일치 (최장 18자, 예: `SFP-10/25G-LR-S=`, `PWR-C1-1100WAC-P/2`, `DNA-SW-2.3.7`) |
| Dell | `^\d{3}-[A-Z0-9]{4,5}$` — 숫자 3자리, `-`, 대문자·숫자 4~5자리 | Dell 6개 파일의 개별 SKU 176종 전부 일치 (예: `210-BPMK`, `883-17743`) |

- 형식은 샘플에서 끌어낸 값이다(D-35 확정). 새 형식이 나오면 이 표만 고친다.
- **적용 시점**: 검증 ① 고정 규칙 단계. SKU가 빈 값인 행은 R1이 판정하고 R3는 건너뛴다.
- **위반/실패 시 처리**: 오류. 문구: 「SKU 형식이 {벤더} 규칙에 맞지 않습니다: {SKU}」 — Dell 목록이면 맞지 않는 SKU만 쉼표로 이어 표시한다.
- **예외**: 소문자는 형식 위반이다(CCW·Dell 내보내기는 대문자). Dell 목록 안의 공백은 SKU를 나눌 때 앞뒤에서 뺀다.
- **검증 의사코드**:

  ```js
  const SKU_RE = {Cisco: /^[A-Z0-9][A-Z0-9./=+-]{1,39}$/, Dell: /^\d{3}-[A-Z0-9]{4,5}$/};
  function r3(row) {
    if (!row.sku) return [];
    const toks = row.vendor === "Dell" ? row.sku.split(",").map(s => s.trim()) : [row.sku];
    const bad = toks.filter(t => !SKU_RE[row.vendor].test(t));
    return bad.length ? [finding("R3", "오류", row, "SKU", "MSG_R3", {vendor: row.vendor, sku: bad.join(", ")})] : [];
  }
  ```

- **관련 요구사항**: REQ-007
- **관련 화면**: SCR-007, SCR-011
- **관련 테스트**: TC-083, TC-144

### POL-025 R4 가격 값 범위

- **규칙** (한 문장): 가격 값이 있는 행에서 List 단가가 음수이거나 할인율이 0~100%를 벗어나면 **오류**다.
- **적용 시점**: 검증 ① 고정 규칙 단계. List 단가·할인율이 모두 빈 값인 행은 검사하지 않는다.
- **위반/실패 시 처리**: 오류. 판정 문구에는 **금액을 넣지 않는다**. 검증 결과는 엔지니어도 보기 때문이다(POL-009).
  - 「List 단가가 음수입니다.」
  - 「할인율이 0~100% 범위를 벗어났습니다.」
  - 작성자에게만 판정 상세에 「현재 값: {값}」을 추가로 보여준다.
- **예외**: List 단가 0은 위반이 아니다(CCW 번들 포함 품목은 0원).
- **검증 의사코드**:

  ```js
  function r4(row) {
    const out = [];
    if (row.listUnitPrice != null && D(row.listUnitPrice).lt(0))
      out.push(finding("R4", "오류", row, "List 단가", "MSG_R4_PRICE", {}, {authorOnly: {value: row.listUnitPrice}}));
    if (row.discountRate != null && (D(row.discountRate).lt(0) || D(row.discountRate).gt(100)))
      out.push(finding("R4", "오류", row, "할인율", "MSG_R4_DISC", {}, {authorOnly: {value: row.discountRate}}));
    return out;
  }
  ```

- **관련 요구사항**: REQ-007
- **관련 화면**: SCR-007
- **관련 테스트**: TC-017, TC-084

### POL-026 R5 중복 SKU

- **규칙** (한 문장): **구성품** 중 직계 상위 행·모듈명·SKU가 모두 같은 행이 2개 이상이면 그 행들을 모두 **경고**로 판정한다.
- **범위**: 직계 상위는 Cisco에서 `N.0` 상위 품목이고, Dell에서는 하위 제품이 있으면 하위 제품, 없으면 상위 품목이다. SKU는 공백을 없애고 대문자로 바꿔 비교한다(Dell은 목록 문자열 전체). Cisco는 모듈명이 없으므로 직계 상위와 SKU만 비교하는 셈이다.
- **대상이 아닌 것**: 서로 다른 상위 품목 아래의 같은 SKU(기준 샘플 1.10·2.6 `C9K-ACC-RBFT`), 상위 품목끼리 같은 SKU(EY한영 4.0·5.0 `CAB-C15-CBN-KOR=`), Dell의 서로 다른 하위 제품 아래 같은 SKU(CASE1_Storage `883-BBFN`).
- **적용 시점**: 검증 ① 고정 규칙 단계
- **위반/실패 시 처리**: 경고. 중복된 행마다 판정 1건. 문구: 「같은 상위 품목·모듈 안에 같은 SKU가 {n}행 있습니다: {SKU} (행 {행 번호 목록})」
- **예외**: 없다. CCW에서 시작일이 다른 구독 라인이 같은 SKU로 여러 줄 나오는 경우(인터터치 10.x `LIC-CW-A`)도 경고가 붙는다. 의도한 구성이면 「확인함」으로 넘긴다.
- **검증 의사코드**:

  ```js
  function r5(rows) {
    const g = new Map();
    for (const r of rows.filter(r => r.rowType === "구성품" && r.sku)) {
      const key = [r.parentRowId, r.module ?? "", r.sku.replace(/\s+/g, "").toUpperCase()].join("|");
      g.set(key, [...(g.get(key) ?? []), r]);
    }
    return [...g.values()].filter(l => l.length >= 2)
      .flatMap(l => l.map(r => finding("R5", "경고", r, "SKU", "MSG_R5", {n: l.length, sku: r.sku, rows: l.map(x => x.rowNo).join(", ")})));
  }
  ```

- **관련 요구사항**: REQ-007
- **관련 화면**: SCR-007
- **관련 테스트**: TC-079, TC-091

### POL-027 R6 서비스·구독 기간 불일치

- **규칙** (한 문장): 구분이 SERVICE·SOFTWARE이고 기간이 있는 행들의 기간 값이 2종 이상이면, **최빈값**(동률이면 가장 긴 기간)을 기준으로 삼고 기준과 다른 행을 **경고**로 판정한다.
- **적용 시점**: 검증 ① 고정 규칙 단계
- **위반/실패 시 처리**: 경고. 문구: 「서비스·구독 기간이 다른 행과 다릅니다: {값}개월 (기준 {기준}개월)」
- **예외**: 기간이 빈 행은 비교에서 빼고 R1이 판정한다. PRODUCT 행의 기간(예: Term 라이선스 `C9300-DNA-E-24-3Y` 36개월)은 비교하지 않는다. 값은 숫자로 비교한다(`12.00` = `12`).
- **샘플 기대 결과**: Cisco 기준 샘플은 SERVICE·SOFTWARE 6행이 {36개월 5행, 12개월 1행}이다. 따라서 행 19 `CON-SNT-C9200L4X`(12개월) 1건만 경고다(부록 A.1).
- **검증 의사코드**:

  ```js
  function r6(rows) {
    const t = rows.filter(r => ["SERVICE", "SOFTWARE"].includes(r.category) && r.durationMonths != null);
    const cnt = new Map();
    for (const r of t) { const k = D(r.durationMonths).toString(); cnt.set(k, (cnt.get(k) ?? 0) + 1); }
    if (cnt.size < 2) return [];
    const base = [...cnt].sort((a, b) => b[1] - a[1] || D(b[0]).cmp(D(a[0])))[0][0];
    return t.filter(r => D(r.durationMonths).toString() !== base)
      .map(r => finding("R6", "경고", r, "서비스·구독 기간", "MSG_R6", {value: fmt(r.durationMonths), base: fmt(base)}));
  }
  ```

- **관련 요구사항**: REQ-007
- **관련 화면**: SCR-007
- **관련 테스트**: TC-078, TC-085, TC-091

### POL-028 R7 미분류

- **규칙** (한 문장): 구분이 「미분류」인 행은 **경고**다.
- **적용 시점**: 검증 ① 고정 규칙 단계
- **위반/실패 시 처리**: 경고. 문구: 「구분을 판정하지 못했습니다(미분류). 구분을 선택해 주세요.」
- **예외**: 구분이 빈 값이면(직접 추가한 행) R7이 아니라 R1 오류다.
- **검증 의사코드**:

  ```js
  const r7 = row => row.category === "미분류" ? [finding("R7", "경고", row, "구분", "MSG_R7")] : [];
  ```

- **관련 요구사항**: REQ-007
- **관련 화면**: SCR-007
- **관련 테스트**: TC-086

### POL-029 R8 EOS 조회·판정

- **규칙** (한 문장): 검증할 때 표준 BoM의 개별 SKU마다 EOS를 조회해 상태를 붙인다. MVP의 조회 방식은 **Cisco·Dell 모두 AI 웹 검색**이고(D-19, D-38), 판정 등급은 아래 표를 따른다.

| EOS 상태 | 조건 | 판정 (Cisco·Dell 공통) |
|---|---|---|
| 판매중 | 유효한 출처가 있고 EoS 공지가 없음 | 없음 |
| EoS 예정 | End-of-Sale 일자 > 검증일 | 경고 |
| 판매 종료 | End-of-Sale 일자 ≤ 검증일 | 경고 (D-21, D-38 — AI 결과만으로 확정을 막지 않음) |
| 확인 불가 | AI 검색 실패·시간 초과, 결과에 유효한 출처 없음, AI가 SKU를 찾지 못함 | 경고 |

- **P1 (REQ-029)**: Cisco EoX API를 연동하면 Cisco만 API로 조회한다. 그때 Cisco 「판매 종료」는 **오류**이고, API가 정상 응답했는데 레코드가 없으면 「판매중」이다(D-28). 레코드 없음과 잘못된 PID의 구분은 API 계정을 확보한 뒤 정한다.
- **조회 단위**: 개별 SKU다. Dell 쉼표 목록은 나누어 조회하고, 중복 SKU는 한 번만 조회한다. SKU가 없는 행(Dell 상위 품목·하위 제품)은 조회하지 않는다. 행의 EOS 상태는 그 행 SKU들 중 가장 나쁜 상태다. 나쁜 순서: 판매 종료 > EoS 예정 > 확인 불가 > 판매중.
- **검증일**: 검증을 시작한 시각의 KST 날짜
- **AI 검색 결과 형식** (LLM 응답 JSON, 입력 필드는 POL-012): `{status: "ON_SALE"|"EOS_ANNOUNCED"|"END_OF_SALE"|"NOT_FOUND", eosAnnounceDate, endOfSaleDate, ldosDate, replacementSku, sourceUrls: []}`
  - **유효한 출처**: `https://`로 시작하고 호스트가 그 벤더의 공식 도메인이거나 그 하위 도메인인 URL. Cisco는 `cisco.com`, Dell은 `dell.com`·`delltechnologies.com`이다(D-35, D-38). 유효한 출처가 없으면 결과와 상관없이 「확인 불가」다.
  - 날짜가 있으면 날짜로 상태를 정한다(`status`와 날짜가 어긋나면 날짜가 우선).
- **캐시**: 키는 (벤더, 대문자 SKU)이고, 유효 기간은 **7일**이다. 「확인 불가」 결과는 캐시하지 않는다. 단건 검색(REQ-019)의 [다시 조회]는 캐시를 쓰지 않고 새로 조회한 뒤 캐시를 갱신한다.
- **표시 문구** (판정·단건 검색 공통, Cisco·Dell 공통)
  - 판매중: 「판매중 (AI 검색 결과 — 틀릴 수 있습니다, 출처: {URL})」
  - EoS 예정: 「EoS 예정 — End-of-Sale {날짜}, LDoS {날짜} (출처: {URL})」
  - 판매 종료: 「판매 종료로 보입니다 (AI 검색 결과 — 틀릴 수 있습니다) — End-of-Sale {날짜}, LDoS {날짜} (출처: {URL})」
  - 확인 불가: 「EOS 정보를 확인하지 못했습니다 — {사유}」. 사유는 「AI 검색 응답 없음」·「조회 시간 초과」·「AI 검색 결과에 출처가 없음」·「SKU를 찾지 못함」 중 하나다.
  - 대체 SKU가 있으면 끝에 「 · 대체 제품: {SKU}」를 붙인다. 모든 결과에 조회 일시와 「AI 검색 결과」 표시를 함께 보여준다. 값이 없는 날짜는 그 항목을 빼고 표시한다. 출처 URL이 여러 개면 첫 번째 유효한 URL을 쓴다.
- **적용 시점**: 검증 ② 단계(REQ-008), SKU EOS 단건 검색 `GET /api/eos?vendor=&sku=`(REQ-019)
- **위반/실패 시 처리**
  - 검증: 표의 등급으로 판정한다. 120초 안에 끝나지 않은 SKU는 「확인 불가(조회 시간 초과)」로 판정하고, 나머지 검증은 끝까지 진행한다.
  - 단건 검색 입력 오류: 벤더를 고르지 않으면 「벤더를 선택해 주세요.」, SKU가 비었거나 쉼표가 있으면 「SKU를 하나만 입력해 주세요.」, 형식이 R3와 맞지 않으면 「{벤더} SKU 형식이 아닙니다.」
  - 단건 검색 실패(AI 검색 실패·시간 초과·출처 없음): 「EOS 정보를 가져오지 못했습니다」 [다시 시도]
  - 단건 검색에서 AI가 `NOT_FOUND`로 답하면: 「{벤더} 자료에서 찾을 수 없는 SKU입니다 (AI 검색 결과 — 틀릴 수 있습니다)」
- **예외**: Cisco 부속·자리표시 SKU(-NONE, -BLANK, 케이블 등)는 EoS 공지가 없어 AI가 출처를 내지 못하면 「확인 불가」 경고가 된다(PRD 리스크 3). P1에서 EoX API로 바꾸면 이 경고는 「판매중」이 된다(D-28).
- **검증 의사코드**:

  ```js
  const WORST = ["판매 종료", "EoS 예정", "확인 불가", "판매중"];
  const HOSTS = {Cisco: ["cisco.com"], Dell: ["dell.com", "delltechnologies.com"]}; // D-35, D-38
  const validSource = (vendor, u) => { try { const x = new URL(u); return x.protocol === "https:" && HOSTS[vendor].some(h => x.hostname === h || x.hostname.endsWith("." + h)); } catch { return false; } };
  function statusByDates(r, today) {
    if (r.endOfSaleDate) return r.endOfSaleDate <= today ? "판매 종료" : "EoS 예정";
    return "판매중";
  }
  function eosOfSku(vendor, sku, today, res) {           // res: AI 검색 응답 (캐시 포함)
    if (res.timeout) return {status: "확인 불가", reason: "조회 시간 초과"};
    if (res.error) return {status: "확인 불가", reason: "AI 검색 응답 없음"};
    const src = (res.sourceUrls ?? []).filter(u => validSource(vendor, u));
    if (src.length === 0) return {status: "확인 불가", reason: "AI 검색 결과에 출처가 없음"};
    if (res.status === "NOT_FOUND") return {status: "확인 불가", reason: "SKU를 찾지 못함"};
    return {status: statusByDates(res, today), ...res, sourceUrls: src};
  }
  function r8(row, perSku) {
    if (!row.sku) return [];
    const list = (row.vendor === "Dell" ? row.sku.split(",") : [row.sku]).map(s => perSku[s.trim().toUpperCase()]);
    const worst = list.sort((a, b) => WORST.indexOf(a.status) - WORST.indexOf(b.status))[0];
    row.eosStatus = worst.status;
    if (worst.status === "판매중") return [];
    return [finding("R8", "경고", row, "EOS 상태", eosMessageCode(worst), worst)]; // MVP는 모두 경고 (D-38). P1 EoX API: Cisco 판매 종료 = 오류
  }
  ```

- **관련 요구사항**: REQ-008, REQ-019
- **관련 화면**: SCR-005, SCR-007, SCR-011
- **관련 테스트**: TC-094, TC-095, TC-096, TC-097, TC-142, TC-143, TC-144, TC-145, TC-146, TC-157

### POL-030 R9 벤더 파일 합계 불일치

- **규칙** (한 문장): 벤더 파일에 있던 합계 관계가 맞지 않으면 **경고**다. Dell은 상위 품목마다 「그 아래 모든 구성품의 List 금액 합 ≠ 상위 품목 List 금액」인지 보고, Cisco 가격형은 파일마다 「벤더 Net 금액 합 ≠ `Quote Total`」인지 본다.
- **대상**
  - Dell: 상위 품목의 모든 자손 구성품(하위 제품 아래 구성품 포함)의 List 금액 합과, 상위 품목의 List 금액(`확장된 가격(표시)`)을 비교한다. 하위 제품 행의 금액은 합에 넣지 않는다. 판정은 상위 품목 행에 붙인다.
  - Cisco 가격형: 같은 원본 파일에서 온 행들의 벤더 Net 금액 합과, 그 파일의 `Quote Total`을 비교한다. 판정은 그 파일의 첫 품목 행에 붙이고, 대상 필드는 「벤더 Net 금액」이다.
- **적용 시점**: 검증 ① 고정 규칙 단계. 가격 값이 없는 BoM(CCW 구성형)은 건너뛴다.
- **위반/실패 시 처리**: 경고. 문구에는 금액을 넣지 않는다(POL-009).
  - Dell: 「구성품 옵션 가격의 합계가 상위 품목 확장 가격과 다릅니다.」
  - Cisco: 「Extended Net Price 합계가 Quote Total과 다릅니다.」
  - 작성자에게만 상세를 보여준다: 「차이: {차이}원 (합계 {합계} / 기준 {기준})」
- **예외**: 비교 대상 값이 하나라도 빈 값이면 판정하지 않는다. Cisco에서 직접 추가한 행은 벤더 Net 금액이 없으므로 합에 영향이 없다.
- **샘플 기대 결과**: `CASE2_Storage_BoM.xlsx`는 합계 762,457,283 / 기준 762,457,282로 경고다. `CASE3_Storage_BoM.xlsx`는 3,006,552,133 / 3,006,552,132로 경고다. 나머지 9개 파일은 판정이 없다(부록 A.4).
- **검증 의사코드**:

  ```js
  function r9(rows, files) {
    const out = [];
    for (const top of rows.filter(r => r.vendor === "Dell" && r.rowType === "상위 품목")) {
      const kids = descendants(rows, top).filter(r => r.rowType === "구성품");
      if (!kids.length || top.listAmount == null || kids.some(k => k.listAmount == null)) continue;
      const sum = kids.reduce((s, k) => s.add(k.listAmount), D(0));
      if (!sum.eq(top.listAmount)) out.push(finding("R9", "경고", top, "List 금액", "MSG_R9_DELL", {}, {authorOnly: {sum, base: top.listAmount}}));
    }
    for (const f of files.filter(f => f.format === "CISCO_PRICED" && f.quoteTotal != null)) {
      const own = rows.filter(r => r.originFile === f.name && r.vendorNetAmount != null);
      const sum = own.reduce((s, r) => s.add(r.vendorNetAmount), D(0));
      if (own.length && !sum.eq(f.quoteTotal)) out.push(finding("R9", "경고", own[0], "벤더 Net 금액", "MSG_R9_CISCO", {}, {authorOnly: {sum, base: f.quoteTotal}}));
    }
    return out;
  }
  ```

- **관련 요구사항**: REQ-007
- **관련 화면**: SCR-007
- **관련 테스트**: TC-017, TC-087

### POL-031 AI 검토 권고

- **규칙** (한 문장): 검증 ③ 단계에서 LLM이 표준 BoM을 검토해 **호환성 / 필수 액세서리 누락 / 고객에게 불필요한 항목** 3가지 분류로 「검토 권고」를 낸다. 권고는 확정을 막지 않지만, 작성자가 권고마다 「확인함」을 체크해야 확정할 수 있다.
- **LLM 응답 형식**: `[{category, rows: [행 번호…], message, evidence}]` JSON 배열
- **응답 정제** (저장 전)
  - JSON으로 읽을 수 없으면 AI 단계 실패로 처리한다.
  - `category`가 3가지가 아니거나, `message`가 비었거나, `rows`에 없는 행 번호가 들어 있는 권고는 버리고 로그만 남긴다.
  - 권고는 앞에서부터 최대 50건만 남긴다.
  - `rows`가 빈 배열이면 대상 행을 「BoM 전체」로 표시한다.
- **표시**: 권고마다 분류, 대상 행 번호, 지적 내용(`message`), 근거(`evidence`)를 표시한다. 권고 영역 위에는 항상 「AI가 생성한 권고이며 틀릴 수 있습니다」를 표시한다.
- **적용 시점**: 검증 ③ 단계, AI 단계 [다시 시도]
- **위반/실패 시 처리**
  - LLM 호출 실패, 90초 초과, JSON 오류, 전송 필드 위반(POL-012)이면 AI 단계를 실패로 기록한다. 「AI 검토를 완료하지 못했습니다」와 [다시 시도]를 표시하고, 고정 규칙·EOS 결과는 그대로 둔다.
  - [다시 시도]는 AI 단계만 다시 실행한다. 버전의 수정 번호가 검증 때와 다르면 실행하지 않고 「BoM이 수정되었습니다. 다시 검증해 주세요.」를 표시한다.
  - AI 단계가 실패한 상태의 확정은 POL-032를 따른다(D-30).
- **예외**: AI 권고는 검증할 때마다 새로 만들고 「확인함」을 이어받지 않는다(POL-021). 「고객에게 불필요한 항목」 권고의 대상 행은 견적서 일괄 제외에 쓴다(POL-037).
- **검증 의사코드**:

  ```js
  const CATS = ["호환성", "필수 액세서리 누락", "고객에게 불필요한 항목"], MAX_RECS = 50; // D-35
  function sanitizeAi(raw, rows) {
    let arr; try { arr = JSON.parse(raw); } catch { return {ok: false}; }
    if (!Array.isArray(arr)) return {ok: false};
    const nos = new Set(rows.map(r => r.rowNo)), kept = [];
    for (const x of arr) {
      const valid = CATS.includes(x.category) && typeof x.message === "string" && x.message.trim()
        && Array.isArray(x.rows) && x.rows.every(n => nos.has(n));
      if (!valid) { log("AI_REC_DROPPED", x); continue; }
      if (kept.length < MAX_RECS) kept.push({...x, grade: "검토 권고", target: x.rows.length ? x.rows : "BoM 전체"});
    }
    return {ok: true, recommendations: kept};
  }
  ```

- **관련 요구사항**: REQ-009
- **관련 화면**: SCR-007, SCR-009
- **관련 테스트**: TC-090, TC-098, TC-099, TC-100, TC-101, TC-132

### POL-032 BoM 확정 조건

- **규칙** (한 문장): 작성자는 작성중 버전의 최신 검증이 현재 내용 기준(`검증 완료`)이고, 오류가 0건이고, 모든 경고·검토 권고에 「확인함」이 체크되어 있을 때 확정할 수 있다. AI 단계가 실패했으면 「AI 검토 없이 확정합니다」에도 체크해야 한다(D-30).
- **적용 시점**: [확정] 버튼 활성 여부, 확정 확인 대화상자, `POST /api/versions/{id}/confirm`
- **위반/실패 시 처리**: 조건을 만족하지 않으면 [확정]이 비활성이다. 버튼에 마우스를 올리면 처음 걸린 사유를 보여준다. API로 호출해도 HTTP 409와 같은 문구로 거부한다.

| 순서 | 사유 | 문구 |
|---|---|---|
| 1 | 검증 진행 중 | 「검증이 진행 중입니다.」 |
| 2 | 미검증 | 「검증을 실행해야 확정할 수 있습니다.」 |
| 3 | 재검증 필요 | 「BoM이 수정되었습니다. 다시 검증해 주세요.」 |
| 4 | 오류 1건 이상 | 「오류 {n}건을 해결해야 확정할 수 있습니다.」 |
| 5 | 미확인 경고·권고 | 「확인하지 않은 경고·검토 권고가 {n}건 있습니다.」 |
| 6 | AI 실패 + 체크 없음 | 「AI 검토가 완료되지 않았습니다. 다시 시도하거나 'AI 검토 없이 확정합니다'를 선택해 주세요.」 |

  - 조건을 만족하면 확인 대화상자를 띄운다: 「v{n}을 확정합니다. 확정한 버전은 수정할 수 없습니다. 확정하시겠습니까?」 [확정] [취소]
  - 확정하면 확정 일시·확정자를 기록하고, 상태를 「확정」으로 바꾼다. 「확인함」 체크(체크한 사람·일시)와 「AI 검토 없이 확정」 여부를 이력에 남긴다(POL-011).
- **예외**: 가격 정보가 비어 있어도 확정할 수 있다(D-14). 확정 취소 기능은 없다. 「확인함」은 작성자만 체크·해제할 수 있다.
- **검증 의사코드**:

  ```js
  function canConfirm(version, user, {skipAi = false} = {}) {
    if (version.status !== "작성중") return block("MSG_CONFIRMED_LOCKED");
    if (version.authorId !== user.id || user.role !== "영업") return block("FORBIDDEN", {status: 403});
    const v = version.latestValidation;
    if (version.validationRunning) return block("MSG_VALIDATION_RUNNING");
    if (!v) return block("MSG_NEED_VALIDATION");
    if (v.revision !== version.revision) return block("MSG_REVALIDATE");
    const errors = v.findings.filter(f => f.grade === "오류").length;
    if (errors) return block("MSG_HAS_ERRORS", {n: errors});
    const pending = [...v.findings.filter(f => f.grade === "경고"), ...(v.ai.recommendations ?? [])].filter(f => !f.ackBy).length;
    if (pending) return block("MSG_UNACKED", {n: pending});
    if (!v.ai.ok && !skipAi) return block("MSG_AI_INCOMPLETE");
    return ok();
  }
  ```

- **관련 요구사항**: REQ-011
- **관련 화면**: SCR-007
- **관련 테스트**: TC-080, TC-088, TC-098, TC-104, TC-105, TC-106, TC-107, TC-153

## 10. 견적·출력 정책

### POL-033 견적 생성·저장 조건

- **규칙** (한 문장): 견적은 **확정 버전 하나**를 기준으로 작성자(역할 영업)만 만든다. 한 확정 버전으로 여러 견적을 만들 수 있다. 아래 저장 조건을 모두 만족해야 견적을 저장하고 다운로드할 수 있다.
- **저장 조건**: ① 금액 합산 대상 행(POL-034) 중 List 금액이 빈 행이 0개(번들 포함 구성품 제외) ② BoM에 있는 KRW 외 통화마다 환율이 입력됨 ③ 통화가 빈 행이 있으면 그 행의 통화가 선택됨 ④ 기본 마진율이 입력됨
- **번들 포함 구성품**: Cisco 구성품 중 List 금액이 비어 있고, 상위 품목의 List 금액은 비어 있지 않은 행이다. CCW 하단 주석의 「child line 값은 bundle 가격에 포함」 규칙을 따르며, 0원으로 계산한다.
- **단가 입력**: 견적 화면에서 List 금액이 빈 행에 단가를 넣을 수 있다. 값은 0 이상이고 소수점 둘째 자리까지다. 이 값은 그 견적에만 저장한다(`List 금액 = 입력 단가 × 수량`). 규칙을 벗어나면 입력칸 아래에 「단가는 0 이상 숫자여야 합니다. (소수점 둘째 자리까지)」를 표시하고 저장을 차단한다.
- **견적 기록**: 견적 ID, 기준 BoM 버전, 환율, DC율·마진율, 입력 단가, 작성 일시·최종 수정 일시
- **적용 시점**: [견적 만들기] `POST /api/versions/{id}/quotes`, 견적 저장 `PUT /api/quotes/{id}`, 견적서·원가분석표 다운로드 직전
- **위반/실패 시 처리**: 차단(저장·다운로드 불가).
  - 작성중 버전: [견적 만들기]를 표시하지 않는다. API는 「확정된 버전으로만 견적을 만들 수 있습니다.」로 거부한다.
  - ①: 「단가가 없는 행이 {n}개 있습니다」와 해당 행 목록(행 번호·SKU·품명)을 표시한다.
  - ②: 「환율을 입력해 주세요: {통화}」
  - ③: 「통화를 선택해 주세요: 행 {행 번호 목록}」
  - ④: 「기본 마진율을 입력해 주세요.」
- **예외**: 견적은 확정 뒤에도 계속 고칠 수 있다(잠금 없음). 다운로드는 그 시점의 값으로 만든다. 새 버전을 만들어도 이전 버전의 견적은 새 버전으로 복사하지 않는다.
- **검증 의사코드**:

  ```js
  function isBundleIncluded(row, rows) {
    const p = rows.find(r => r.id === row.parentRowId);
    return row.vendor === "Cisco" && row.rowType === "구성품" && row.listAmount == null && p?.listAmount != null;
  }
  function checkPol033(version, quote) {
    if (version.status !== "확정") return block("MSG_QUOTE_NEEDS_CONFIRMED");
    const rows = summableRows(version.rows);                               // POL-034
    const missing = rows.filter(r => quoteListAmount(quote, r) == null && !isBundleIncluded(r, version.rows));
    if (missing.length) return block("MSG_MISSING_PRICE", {n: missing.length, rows: missing});
    const noCur = rows.filter(r => !(quote.currencyOverride[r.id] ?? r.currency));
    if (noCur.length) return block("MSG_PICK_CURRENCY", {rows: noCur.map(r => r.rowNo)});
    for (const c of new Set(rows.map(r => quote.currencyOverride[r.id] ?? r.currency)))
      if (c !== "KRW" && quote.fx[c] == null) return block("MSG_FX_REQUIRED", {currency: c});
    if (quote.baseMargin == null) return block("MSG_BASE_MARGIN_REQUIRED");
    return ok();
  }
  ```

- **관련 요구사항**: REQ-016
- **관련 화면**: SCR-009, SCR-010
- **관련 테스트**: TC-108, TC-117, TC-118, TC-120, TC-122, TC-123, TC-124, TC-129, TC-130, TC-139, TC-155

### POL-034 원가 계산

- **규칙** (한 문장): 원가는 **금액 합산 대상 행**마다 `원가(원화) = floor(List 금액 × (1 − DC율 ÷ 100) × 환율)`로 계산한다. 합계 원가는 행별 원가(원화)의 합이다. 계산은 모두 Decimal로 한다(NFR-012).
- **금액 합산 대상 행**
  - Cisco: 모든 품목 행. 상위 품목(번들) 가격과 구성품 가격은 별개다. 번들 포함 구성품은 0원이다(POL-033).
  - Dell: 구성품 행, 그리고 구성품이 하나도 없는 상위 품목 행. 구성품이 있는 상위 품목과 하위 제품은 구성품 금액의 합이므로 **제외**한다(이중 계산 방지).
- **List 금액**: 가격 정보의 저장값(POL-019). 견적에서 입력한 단가가 있으면 `입력 단가 × 수량`
- **환율**: 통화가 KRW면 1. 그 밖에는 견적에 입력한 값
- **적용 시점**: 견적 화면에서 값을 입력하거나 바꿀 때(즉시 재계산), 견적 저장, 견적서·원가분석표 생성. 화면 계산과 서버 계산은 같은 함수를 쓴다.
- **위반/실패 시 처리**: 계산할 수 없는 행이 있으면 저장 조건(POL-033)에서 차단한다. 계산 자체는 실패하지 않는다.
- **예외**: 원 미만 절사는 행 단위로만 한다. 합계는 절사된 행 값을 더한다(합계를 다시 절사하지 않음).
- **샘플 기대 결과** (PRD REQ-016 인수 조건과 같음)
  - EY한영 C9300-48T-M: 20,051,583 × 2 × (1 − 0.70) × 1 = 12,030,949.8 → **12,030,949원**
  - Dell 기준 샘플 메모리 행: 276,496,000 × (1 − 0) × 1 → **276,496,000원**
  - USD 1,000 × 3 × (1 − 0.40) × 1,385.50 → **2,493,900원**
- **검증 의사코드**:

  ```js
  function summableRows(rows) {
    return rows.filter(r => r.vendor === "Cisco"
      || r.rowType === "구성품"
      || (r.rowType === "상위 품목" && !rows.some(c => c.parentRowId === r.id)));
  }
  function costKrw(row, quote, rows) {
    const amt = isBundleIncluded(row, rows) ? D(0) : quoteListAmount(quote, row); // 입력 단가 × 수량 또는 저장 List 금액
    const dc = D(quote.dcRate[row.id] ?? row.discountRate ?? 0);
    const cur = quote.currencyOverride[row.id] ?? row.currency;
    const fx = cur === "KRW" ? D(1) : D(quote.fx[cur]);
    return amt.mul(D(1).sub(dc.div(100))).mul(fx).floor();
  }
  const totalCost = (rows, q) => summableRows(rows).reduce((s, r) => s.add(costKrw(r, q, rows)), D(0));
  ```

- **관련 요구사항**: REQ-016, NFR-012
- **관련 화면**: SCR-009
- **관련 테스트**: TC-118, TC-119, TC-120, TC-121, TC-122, TC-130

### POL-035 환율·DC율 입력

- **규칙** (한 문장): 환율은 0보다 크고 **100,000 이하**인 숫자로 소수점 둘째 자리까지 입력한다. DC율은 **0.00~100.00%**로 소수점 둘째 자리까지 입력한다(CCW 샘플에 93.95% 있음).
- **DC율 기본값**: 행의 가격 정보 할인율. 빈 값이면 0%
- **구분별 일괄 입력**: 견적 화면에서 PRODUCT / SERVICE / SOFTWARE별로 DC율을 넣고 [적용]을 누르면, 그 구분의 합산 대상 행 모두에 값이 들어간다. 그 뒤 행별로 다시 바꿀 수 있다. 「미분류」 행에는 일괄 입력이 없어 행별로만 넣는다.
- **적용 시점**: 견적 화면 환율 입력칸·DC율 입력칸(구분별·행별), 견적 저장 API
- **위반/실패 시 처리**
  - 범위·형식을 벗어나면 입력칸 아래에 문구를 표시하고, 견적 저장을 차단한다.
    - 환율: 「환율은 0보다 크고 100,000 이하인 숫자여야 합니다. (소수점 둘째 자리까지)」
    - DC율: 「DC율은 0~100 사이 숫자여야 합니다. (소수점 둘째 자리까지)」
  - 구분별 [적용] 때 행별로 다른 값이 이미 들어 있으면 확인 대화상자를 띄운다: 「{구분} 행 {n}개의 DC율을 {값}%로 바꿉니다. 행별로 입력한 값도 바뀝니다.」 [바꾸기] [취소]
- **예외**: 견적에서 바꾼 DC율은 견적에만 저장하고, 표준 BoM 가격 정보는 바꾸지 않는다(REQ-016). 환율 자동 조회는 하지 않는다(D-07).
- **검증 의사코드**:

  ```js
  const FX_MAX = D(100000); // D-35
  const dp2 = s => /^\d+(\.\d{1,2})?$/.test(String(s));
  function checkFx(v) { return dp2(v) && D(v).gt(0) && D(v).lte(FX_MAX) ? ok() : block("MSG_FX_RANGE"); }
  function checkDc(v) { return dp2(v) && D(v).gte(0) && D(v).lte(100) ? ok() : block("MSG_DC_RANGE"); }
  function applyCategoryDc(quote, rows, category, value) {
    const targets = summableRows(rows).filter(r => r.category === category);
    const differs = targets.filter(r => quote.dcRate[r.id] != null && !D(quote.dcRate[r.id]).eq(value)).length;
    if (differs && !confirm("MSG_DC_OVERWRITE", {category, n: targets.length, value})) return;
    targets.forEach(r => quote.dcRate[r.id] = value);
  }
  ```

- **관련 요구사항**: REQ-016
- **관련 화면**: SCR-009
- **관련 테스트**: TC-120, TC-125, TC-126, TC-127, TC-128

### POL-036 견적가·마진율

- **규칙** (한 문장): 마진율은 **0.0~100.0%**(D-31)로 소수점 첫째 자리까지 입력한다. 행별 견적가는 `floor(원가(원화) × (1 + 마진율 ÷ 100))`, 견적 단가는 `floor(견적가 ÷ 수량)`이다(D-29).
- **적용 방식**: 기본 마진율 하나를 견적 전체에 적용하고, 행별 마진율로 덮어쓸 수 있다. 값을 바꾸면 그 영향을 받는 행과 합계를 즉시 다시 계산한다.
- **합계 견적가**: 행별 견적가의 합. 견적서 합계는 여기서 「견적서 제외」 행을 뺀 값이다(POL-037).
- **적용 시점**: 견적 화면 마진율 입력(기본·행별), 견적 저장, 견적서·원가분석표 생성
- **위반/실패 시 처리**: 범위·형식을 벗어나면 입력칸 아래에 「마진율은 0.0~100.0 사이 숫자여야 합니다. (소수점 첫째 자리까지)」를 표시하고 저장을 차단한다.
- **예외**: 이 공식은 기존 원가분석표 관행(할인단가 ÷ (1 − 마진율), 천원 단위 올림)과 다르다(D-15, PRD 리스크 12). 견적 단가 × 수량이 견적가와 몇 원 다를 수 있는데, 견적서에는 견적가를 공급가로 쓴다(D-29).
- **샘플 기대 결과**: 원가 12,030,949원 × 1.20 = 14,437,138.8 → **14,437,138원** / 원가 2,493,900원 × 1.15 → **2,867,985원** / 견적가 1,000원·수량 3 → 견적 단가 **333원**
- **검증 의사코드**:

  ```js
  const dp1 = s => /^\d+(\.\d)?$/.test(String(s));
  function checkMargin(v) { return dp1(v) && D(v).gte(0) && D(v).lte(100) ? ok() : block("MSG_MARGIN_RANGE"); }
  function quotePrice(row, quote, rows) {
    const m = D(quote.rowMargin[row.id] ?? quote.baseMargin);
    const price = costKrw(row, quote, rows).mul(D(1).add(m.div(100))).floor();
    return {price, unitPrice: price.div(row.qty).floor()};
  }
  ```

- **관련 요구사항**: REQ-017
- **관련 화면**: SCR-009, SCR-010
- **관련 테스트**: TC-118, TC-119, TC-129, TC-130, TC-134

### POL-037 고객 견적서

- **규칙** (한 문장): 고객 견적서는 견적마다 **단일 표형** 또는 **Summary + 세부 시트형**을 골라 xlsx 또는 PDF로 만든다. 어느 셀에도 원가·DC율·환율·마진율이 없어야 하고, 합계는 「견적서 제외」 행을 뺀 합계 견적가와 원 단위까지 같아야 한다.
- **견적서 제외**
  - 견적 화면에서 합산 대상 행마다 「견적서 제외」를 체크할 수 있다. Dell 상위 품목·하위 제품을 체크하면 그 아래 행이 모두 제외된다.
  - [AI 권고 불필요 항목 일괄 제외]를 누르면, 기준 버전의 최신 검증에서 「고객에게 불필요한 항목」 권고를 받은 행에 한 번에 체크한다.
  - 제외는 견적에만 저장하고, 표준 BoM에서는 행을 지우지 않는다.
- **입력 항목** (견적마다 저장, D-33)

| 항목 | 규칙 | 기본값 |
|---|---|---|
| 견적일자 | 날짜 | 오늘 |
| 견적명(프로젝트명) | 1~100자 | BoM 건명 |
| 수신 / 참조 | 각 0~50자 | 빈 값 |
| 유효기간 | 1~90일 정수 | 14일 |
| 결제조건 | 0~100자 | 「계산서 발행 후 60일 이내」 |
| 무상유지보수 (Summary형) | 0~50자 | 구분 SERVICE 행 기간의 최빈값. 12의 배수면 「{n}년」, 아니면 「{n}개월」. SERVICE 행이 없으면 빈 값 |
| 상세 내역 (Summary형, 상위 품목마다) | 0~500자 | 상위 품목 품명 |
| 담당자 | 자동 | 작성자 이름·메일 |

- **공통 머리**: 인성정보 사업자 정보를 고정 문구로 넣는다(사업자번호 215-81-58985, 상호 ㈜ 인성정보, 주소 서울특별시 강남구 테헤란로 301 9층, 대표자 조승필 — DC사업부 샘플 기준). 문서번호는 `IS-{견적일자 YYYYMMDD}-{견적 ID}`다. 유효기간 문구: 「본 견적서의 유효기간은 견적일로부터 {n}일 입니다.」 단위 표기: 「(단위: 원, VAT별도)」
- **단일 표형**: 품목 표의 열은 제품번호(SKU) / 제품설명(품명) / 수량 / 소비자가 / 공급단가 / 공급가 합 / 비고다.
  - 소비자가 = `floor(List 단가 × 환율)`, 단가를 입력한 행은 `floor(입력 단가 × 환율)`이다(D-24).
  - 공급단가 = 견적 단가, 공급가 합 = 견적가(D-29). 비고는 빈칸이다.
  - Dell 상위 품목·하위 제품은 금액 칸이 빈 묶음 제목 행으로 넣는다.
  - 표 아래 합계 1줄: 「합계 (VAT 별도)」
- **Summary + 세부 시트형**
  - Summary 시트: 상위 품목 1개당 1행이다. 열은 NO / 구분(상위 품목 품명) / 상세 내역 / 수량(상위 품목 수량) / 제안 단가 = `floor(제안가합 ÷ 수량)` / 제안가합 / 비고다. 제안가합은 그 상위 품목과 모든 자손 행 중 합산 대상이면서 제외되지 않은 행의 견적가 합이다.
  - 합계 2줄: 「제안 공급가 합계 (V.A.T 별도)」, 「제안 공급가 합계 (V.A.T 포함)」 = 별도 합계 + `floor(별도 합계 × 0.1)`. 이어서 결제조건·무상유지보수·담당자를 적는다.
  - 세부 시트: 상위 품목마다 1개다. 시트 이름은 「{NO}. {품명}」에서 `[ ] : * ? / \`를 뺀 앞 31자다. 열은 모듈명(Cisco는 SKU) / 상세 내역(품명) / 수량이고 금액은 없다. 제외 행은 뺀다.
- **PDF**: A4 세로, 한글 글꼴 내장, 품목 표 머리글을 페이지마다 반복한다. Summary형은 Summary 다음에 세부 내역을 상위 품목 순서대로 잇는다. 품목·수량·금액은 같은 견적의 xlsx와 같다.
- **적용 시점**: [견적서 다운로드] → 양식 선택 → 형식 선택, `GET /api/quotes/{id}/document?form=single|summary&type=xlsx|pdf`
- **위반/실패 시 처리**
  - 저장 조건(POL-033)을 만족하지 않으면 다운로드를 차단하고 해당 문구를 표시한다.
  - 입력 항목이 규칙을 벗어나면 저장을 차단하고 입력칸 아래에 문구를 표시한다: 「{항목}은(는) {최대}자 이내로 입력해 주세요.」 / 「유효기간은 1~90일 사이 정수여야 합니다.」 / 견적명이 비면 「견적명을 입력해 주세요.」
  - 견적서 제외를 반영한 뒤 품목이 0행이면 다운로드를 차단한다: 「견적서에 넣을 품목이 없습니다. 견적서 제외를 해제해 주세요.」
  - 제외 행 중 견적가가 0원이 아닌 행이 있으면 경고(차단 아님)를 표시한다: 「견적서에서 제외한 행 중 금액이 있는 행이 {n}개 있습니다. 이 금액은 견적서 합계에서 빠집니다.」
  - 생성한 파일에서 금지 값이 발견되면(아래 의사코드) 파일을 내보내지 않는다. 문구: 「견적서를 만들지 못했습니다. 관리자에게 문의해 주세요.」 서버 오류로 기록한다.
  - 다운로드마다 일시·견적 ID·양식·형식을 기록한다(POL-011).
- **예외**: VAT 표기는 「VAT 별도」이고, Summary형은 VAT 포함 합계를 함께 적는다(D-35, OI-07 해결). 파일명은 POL-007을 따른다.
- **검증 의사코드**:

  ```js
  function lines(quote, rows) {
    return summableRows(rows).filter(r => !isExcluded(quote, r, rows)).map(r => ({row: r, ...quotePrice(r, quote, rows)}));
  }
  function docTotal(quote, rows) { return lines(quote, rows).reduce((s, l) => s.add(l.price), D(0)); }
  function summaryRow(top, quote, rows) {
    const ls = lines(quote, rows).filter(l => l.row.id === top.id || isDescendant(rows, l.row, top));
    const sum = ls.reduce((s, l) => s.add(l.price), D(0));
    return {qty: top.qty, sum, unit: sum.div(top.qty).floor()};
  }
  const vatIncluded = total => total.add(total.mul("0.1").floor());
  const FORBIDDEN_HEADERS = ["원가", "DC율", "할인율", "마진율", "환율"];
  function assertNoForbidden(doc, quote, rows) {
    // 금지 열이 없고, 숨김 시트·숨김 행/열·이름 정의·메모가 없고, 합계가 docTotal과 같아야 한다
    if (doc.headers.some(h => FORBIDDEN_HEADERS.some(f => h.includes(f)))) return block("MSG_DOC_BUILD_FAILED");
    if (doc.hiddenSheets.length || doc.hiddenRanges.length || doc.definedNames.length || doc.comments.length) return block("MSG_DOC_BUILD_FAILED");
    if (!D(doc.totalCell).eq(docTotal(quote, rows))) return block("MSG_DOC_BUILD_FAILED");
    return ok();
  }
  ```

- **관련 요구사항**: REQ-018, REQ-009
- **관련 화면**: SCR-009, SCR-010
- **관련 테스트**: TC-132, TC-133, TC-134, TC-135, TC-136, TC-137, TC-138, TC-139, TC-156

### POL-038 원가분석표

- **규칙** (한 문장): 원가분석표는 견적의 합산 대상 행 전부(견적서 제외 행 포함)를 구분별로 묶어 행별 원가·견적가·마진을 담은 xlsx다. 행 값은 견적 화면 값과 원 단위까지 같다. 작성자만 내려받는다.
- **머리**: 고객사명(End user), 건명(Project Name), 작성자(Account Manager), 기준 BoM 버전, 견적 작성일, **매출합** = 견적서 합계(제외 행 뺌), **매입합** = 합산 대상 행 전부의 원가 합(제외 행 포함 — 제외해도 벤더에서 사는 품목이다), **이익** = 매출합 − 매입합, **GP율** = 이익 ÷ 매출합(소수 넷째 자리 반올림, 백분율로 표시. 예: 0.1667 → 16.67%). 매출합이 0이면 GP율은 「-」로 표시한다.
- **구분별 DC율 표**: PRODUCT / SERVICE / SOFTWARE 각각의 DC율이다. 구분 안의 행별 값이 다르면 「행별 상이」로 표시한다.
- **품목 표**: 구분 / SKU(Item Name) / 품명(Description) / 수량(Q'ty) / List 단가 / List 금액 / DC율 / 원가(원화) / 마진율 / 견적 단가 / 견적가 / 비고. 구분 순서는 PRODUCT → SERVICE → SOFTWARE → 미분류이고, 구분 안에서는 행 번호 순이다. 견적서 제외 행의 비고에는 「견적서 제외」를 적는다.
- **적용 시점**: 견적 화면 [원가분석표 다운로드], `GET /api/quotes/{id}/cost-analysis.xlsx`
- **위반/실패 시 처리**: 저장 조건(POL-033)을 만족하지 않으면 차단한다. 비작성자는 HTTP 403(POL-008). 다운로드마다 일시·견적 ID를 기록한다(POL-011).
- **예외**: BAS(구축 투입)·영업(공헌)이익 항목은 넣지 않는다(OI-17, MVP 제외).
- **검증 의사코드**:

  ```js
  function costAnalysisHeader(quote, rows) {
    const sales = docTotal(quote, rows);
    const purchase = summableRows(rows).reduce((s, r) => s.add(costKrw(r, quote, rows)), D(0));
    const profit = sales.sub(purchase);
    return {sales, purchase, profit, gp: sales.isZero() ? "-" : profit.div(sales).toDecimalPlaces(4, ROUND_HALF_UP)};
  }
  function dcByCategory(quote, rows, cat) {
    const vals = new Set(summableRows(rows).filter(r => r.category === cat).map(r => D(quote.dcRate[r.id] ?? r.discountRate ?? 0).toString()));
    return vals.size === 0 ? "" : vals.size === 1 ? [...vals][0] : "행별 상이";
  }
  ```

- **관련 요구사항**: REQ-028
- **관련 화면**: SCR-009
- **관련 테스트**: TC-139, TC-140, TC-141

### POL-039 표준 BoM·검증 리포트 xlsx

- **규칙** (한 문장): 표준 BoM xlsx와 검증 리포트 xlsx에는 **가격 정보를 넣지 않는다**. 누가 내려받아도 같은 버전·같은 검증이면 내용이 같다.
- **표준 BoM xlsx** (REQ-013)
  - 시트 1개(`BoM`)다.
  - 상단에 고객사명, 건명, 버전, 상태, 확정 일시, 작성자를 적는다. 작성중 버전이면 상태 칸에 「미확정」을 적는다.
  - 열 순서: 행 번호 / 벤더 / 원본 라인 번호 / 상위 행 번호 / 행 유형 / 구분 / 모듈명 / SKU / 옵션 ID / 품명 / 수량 / 서비스·구독 기간(개월) / 구독 정보 / EOS 상태 / 원본 파일명 / 원본 행 번호 / 비고
  - 계층은 품명 셀의 들여쓰기(Excel 들여쓰기 수준)로 나타낸다: 상위 품목 0, 하위 제품 1, 상위 품목 바로 아래 구성품 1, 하위 제품 아래 구성품 2.
  - EOS 상태는 그 버전 최신 검증의 값이다. 미검증이면 빈칸이다.
- **검증 리포트 xlsx** (REQ-010)
  - 상단에 고객사명, 건명, 버전, 검증 일시, 등급별 건수(오류·경고·검토 권고)를 적는다. `재검증 필요`면 「BoM이 수정되어 이 결과는 최신이 아닙니다」를 적는다. AI 단계가 실패했으면 「AI 검토를 완료하지 못했습니다」를 적는다.
  - 열: 등급 / 규칙 ID 또는 분류 / 행 번호 / SKU / 대상 필드 / 안내 문구 / 근거(AI) / 확인함(체크한 사람·일시)
  - 행 순서는 화면 목록과 같다(POL-021 정렬).
  - 등급 칸은 텍스트(「오류」「경고」「검토 권고」)와 배경색을 함께 쓴다(NFR-009).
  - R4·R9 판정은 규칙 ID와 문구만 넣고 금액 상세는 넣지 않는다.
- **적용 시점**: [BoM 다운로드] `GET /api/versions/{id}/bom.xlsx`, [리포트 다운로드] `GET /api/validations/{id}/report.xlsx`
- **위반/실패 시 처리**: 생성한 파일에 가격 필드(통화·List 단가·List 금액·할인율·벤더 Net 금액) 열이나 R4·R9 금액 상세가 있으면 내보내지 않는다. 문구: 「파일을 만들지 못했습니다. 관리자에게 문의해 주세요.」 다운로드마다 사용자·일시·버전(또는 검증 ID)을 기록한다(POL-011).
- **예외**: 파일명은 POL-007을 따른다. xlsx는 Excel 2016 이상에서 경고 없이 열려야 한다(NFR-011).
- **검증 의사코드**:

  ```js
  const BOM_COLUMNS = ["행 번호", "벤더", "원본 라인 번호", "상위 행 번호", "행 유형", "구분", "모듈명", "SKU", "옵션 ID", "품명",
    "수량", "서비스·구독 기간(개월)", "구독 정보", "EOS 상태", "원본 파일명", "원본 행 번호", "비고"];
  const PRICE_HEADERS = ["통화", "List 단가", "List 금액", "할인율", "벤더 Net 금액"];
  function indentLevel(row, rows) {
    if (row.rowType === "상위 품목") return 0;
    const p = rows.find(r => r.id === row.parentRowId);
    return row.rowType === "하위 제품" || p?.rowType === "상위 품목" ? 1 : 2;
  }
  function assertNoPrice(sheet) {
    const headers = sheet.headerRow.map(String);
    return headers.some(h => PRICE_HEADERS.includes(h)) ? block("MSG_FILE_BUILD_FAILED") : ok();
  }
  ```

- **관련 요구사항**: REQ-013, REQ-010
- **관련 화면**: SCR-005, SCR-007, SCR-008
- **관련 테스트**: TC-093, TC-113, TC-114

## 부록 A. 샘플 기대 결과표

POL-017 ~ POL-019의 규칙으로 변환한 결과다. PRD REQ-005 인수 조건 「기대 결과표와 모든 필드 값 100% 일치」는 이 표를 기준으로 판정한다. 가격 정보가 없는 필드(구성형), 빈 값인 필드(비고, EOS 상태)는 표에서 뺐다. 벤더 열은 A.1·A.3이 모두 `Cisco`, A.2가 모두 `Dell`이다. 원본 파일명은 표 제목의 파일이다.

### A.1 Cisco 기준 샘플 — `(대웅제약 마곡C&D 센터 구축)Quote_4793379459_BOM.xls` (CCW 구성형)

- 파일 정보: 형식 CCW 구성형, 시트 `QUOTE`, 머리글 31행, 통화 KRW. 가격 정보는 모두 빈 값이다.
- 합계: 품목 행 36개 (상위 품목 5, 구성품 31), 미분류 0. 구분별 행 수: PRODUCT 30, SERVICE 2, SOFTWARE 4.

| 행 | 원본 라인 번호 | 상위 행 | 행 유형 | 구분 | 모듈명 | SKU | 옵션 ID | 품명 | 수량 | 기간 | 원본 행 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1.0 |  | 상위 품목 | PRODUCT |  | C9300X-24HX-E |  | Catalyst 9300 24-port mGig UPoE+, Network Essentials | 2 |  | 32 |
| 2 | 1.0.1 | 1 | 구성품 | SERVICE |  | CON-SNT-C9300X2E |  | SNTC-8X5XNBD Catalyst 9300 24-port mGig UPoE, Networ | 2 | 36 | 33 |
| 3 | 1.1 | 1 | 구성품 | PRODUCT |  | C9300-DNA-E-24 |  | C9300 DNA Essentials, 24-Port Term Licenses | 2 |  | 34 |
| 4 | 1.1.1 | 1 | 구성품 | PRODUCT |  | C9300-DNA-E-24-3Y |  | C9300 DNA Essentials, 24-Port, 3 Year Term License | 2 | 36 | 35 |
| 5 | 1.2 | 1 | 구성품 | PRODUCT |  | C9300-NW-E-24 |  | C9300 Network Essentials, 24-port license | 2 |  | 36 |
| 6 | 1.3 | 1 | 구성품 | PRODUCT |  | SC9300UK9-1712 |  | Cisco Catalyst 9300 XE 17.12 UNIVERSAL | 2 |  | 37 |
| 7 | 1.4 | 1 | 구성품 | PRODUCT |  | PWR-C1-1100WAC-P |  | 1100W AC 80+ platinum Config 1 Power Supply | 2 |  | 38 |
| 8 | 1.5 | 1 | 구성품 | PRODUCT |  | PWR-C1-1100WAC-P/2 |  | 1100W AC 80+ platinum Config 1 Secondary Power Supply | 2 |  | 39 |
| 9 | 1.6 | 1 | 구성품 | PRODUCT |  | CAB-AC-C15-KOR |  | AC Power Cord, Korea, C15 | 4 |  | 40 |
| 10 | 1.7 | 1 | 구성품 | PRODUCT |  | C9300-SSD-NONE |  | No SSD Card Selected | 2 |  | 41 |
| 11 | 1.8 | 1 | 구성품 | PRODUCT |  | C9300-STACK-NONE |  | No Stack Cable Selected | 2 |  | 42 |
| 12 | 1.9 | 1 | 구성품 | PRODUCT |  | C9300-SPWR-NONE |  | No Stack Power Cable Selected | 2 |  | 43 |
| 13 | 1.10 | 1 | 구성품 | PRODUCT |  | C9K-ACC-RBFT |  | RUBBER FEET FOR TABLE TOP SETUP 9200 and 93xx | 2 |  | 44 |
| 14 | 1.11 | 1 | 구성품 | PRODUCT |  | C9K-ACC-SCR-4 |  | 12-24 and 10-32 SCREWS FOR RACK INSTALLATION, QTY 4 | 2 |  | 45 |
| 15 | 1.12 | 1 | 구성품 | PRODUCT |  | CAB-GUIDE-1RU |  | 1RU CABLE MANAGEMENT GUIDES 9200 and 9300 | 2 |  | 46 |
| 16 | 1.13 | 1 | 구성품 | PRODUCT |  | C9300X-NM-8Y |  | Catalyst 9300 8 x 10G/25G Network Module SFP+/SFP28 | 2 |  | 47 |
| 17 | 1.14 | 1 | 구성품 | PRODUCT |  | NETWORK-PNP-LIC |  | Network Plug-n-Play Connect for zero-touch device deployment | 2 |  | 48 |
| 18 | 2.0 |  | 상위 품목 | PRODUCT |  | C9200L-48P-4X-E |  | Catalyst 9200L 48-port PoE+, 4 x 10G, Network Essentials | 6 |  | 49 |
| 19 | 2.0.1 | 18 | 구성품 | SERVICE |  | CON-SNT-C9200L4X |  | SNTC-8X5XNBD Catalyst 9200L 48-port PoE+, 4 x 10G, Ne | 6 | 12 | 50 |
| 20 | 2.1 | 18 | 구성품 | PRODUCT |  | C9200L-DNA-E-48 |  | C9200L Cisco DNA Essentials, 48-port Term license | 6 |  | 51 |
| 21 | 2.1.1 | 18 | 구성품 | PRODUCT |  | C9200L-DNA-E-48-3Y |  | C9200L Cisco DNA Essentials, 48-port, 3 Year Term license | 6 | 36 | 52 |
| 22 | 2.2 | 18 | 구성품 | PRODUCT |  | C9200L-NW-E-48 |  | C9200L Network Essentials, 48-port license | 6 |  | 53 |
| 23 | 2.3 | 18 | 구성품 | PRODUCT |  | CAB-TA-EU |  | Europe AC Type A Power Cable | 6 |  | 54 |
| 24 | 2.4 | 18 | 구성품 | PRODUCT |  | PWR-C5-BLANK |  | Config 5 Power Supply Blank | 6 |  | 55 |
| 25 | 2.5 | 18 | 구성품 | PRODUCT |  | C9200-STACK-BLANK |  | Catalyst 9200 Blank Stack Module | 12 |  | 56 |
| 26 | 2.6 | 18 | 구성품 | PRODUCT |  | C9K-ACC-RBFT |  | RUBBER FEET FOR TABLE TOP SETUP 9200 and 93xx | 6 |  | 57 |
| 27 | 2.7 | 18 | 구성품 | PRODUCT |  | C9K-ACC-SCR-4 |  | 12-24 and 10-32 SCREWS FOR RACK INSTALLATION, QTY 4 | 6 |  | 58 |
| 28 | 2.8 | 18 | 구성품 | PRODUCT |  | CAB-GUIDE-1RU |  | 1RU CABLE MANAGEMENT GUIDES 9200 and 9300 | 6 |  | 59 |
| 29 | 2.9 | 18 | 구성품 | PRODUCT |  | NETWORK-PNP-LIC |  | Network Plug-n-Play Connect for zero-touch device deployment | 6 |  | 60 |
| 30 | 3.0 |  | 상위 품목 | PRODUCT |  | CW9179F |  | Cisco Wireless 9179F (W7,4 radio,3 band 4x4),Global | 3 |  | 61 |
| 31 | 4.0 |  | 상위 품목 | SOFTWARE |  | CISCO-NETWORK-SUB |  | Cisco Networking Subscription | 1 | 36 | 62 |
| 32 | 4.1 | 31 | 구성품 | SOFTWARE |  | LIC-CW-E |  | Cisco Wireless License - Essentials | 3 | 36 | 64 |
| 33 | 4.2 | 31 | 구성품 | SOFTWARE |  | LIC-SPACES-ESS |  | Cisco Spaces Essentials for Cisco Wireless Essentials | 3 | 36 | 66 |
| 34 | 4.3 | 31 | 구성품 | SOFTWARE |  | SVS-L0SPT-CN |  | Cisco Network Product Support | 1 | 36 | 68 |
| 35 | 5.0 |  | 상위 품목 | PRODUCT |  | C9K-PWR-650WACL-R= |  | 650W AC Power Supply | 1 |  | 69 |
| 36 | 5.1 | 35 | 구성품 | PRODUCT |  | CAB-9K10A-EU |  | Power Cord, 250VAC 10A CEE 7/7 Plug, EU | 1 |  | 70 |

**구독 정보** (나머지 행은 빈 값)

- 행 31 (4.0 CISCO-NETWORK-SUB) 구독 정보: `Requested Start Date : 06-May-2026| Requested For : 36.00 Months From 06-May-2026 to 05-May-2029| Automatically Renews For : 12.0 Months On 06-May-2029| Billing Frequency : Prepaid Term`
- 행 32 (4.1 LIC-CW-E) 구독 정보: `Requested Start Date : 06-May-2026| Requested For : 36.00 Months From 06-May-2026 to 05-May-2029`
- 행 33 (4.2 LIC-SPACES-ESS) 구독 정보: `Requested Start Date : 06-May-2026| Requested For : 36.00 Months From 06-May-2026 to 05-May-2029`

### A.2 Dell 기준 샘플 — `DC사업부\SERVER\CASE1_Server_BoM.xlsx`

- 파일 정보: 형식 Dell Solutions Configurator, 시트 `국방부_해군 지능데이터센터_1`, 머리글 7행, 통화 KRW. 솔루션 ID `5656370.1`, 솔루션 이름 `국방부_해군 지능데이터센터`, 솔루션 표시 가격 `₩877,910,278.00`.
- 합계: 품목 행 44개 (상위 품목 1, 구성품 43), 미분류 0. 구분별 행 수: PRODUCT 39, SERVICE 5. 구독 정보는 모든 행이 빈 값이다.

| 행 | 원본 라인 번호 | 상위 행 | 행 유형 | 구분 | 모듈명 | SKU | 옵션 ID | 품명 | 수량 | 기간 | 원본 행 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 5656370.1.1-1 |  | 상위 품목 | PRODUCT |  |  |  | 4. GPU 서버 / PowerEdge XE7740 | 1 |  | 8 |
| 2 | 5656370.1.1-1.1 | 1 | 구성품 | PRODUCT | 베이스 | 210-BPMK | G9ZLCRN | PowerEdge XE7740 | 1 |  | 9 |
| 3 | 5656370.1.1-1.2 | 1 | 구성품 | PRODUCT | 섀시 구성 | 321-BLXN, 412-BCFN, 470-BCZG | GM8H4F6 | XE7740 4U 섀시, 8 x E3. S NVMe | 1 |  | 10 |
| 4 | 5656370.1.1-1.3 | 1 | 구성품 | PRODUCT | 프로세서 | 338-CTBB | G6KHOXL | 인텔® 제온® 6 성능 6737P 2.9G, 32C/64T, 24GT/s, 144M 캐시, Turbo, (270W) DDR5-6400 | 1 |  | 11 |
| 5 | 5656370.1.1-1.4 | 1 | 구성품 | PRODUCT | 추가 프로세서 | 338-CTBB, 379-BDCO | G6O2TH5 | 인텔® 제온® 6 성능 6737P 2.9G, 32C/64T, 24GT/s, 144M 캐시, Turbo, (270W) DDR5-6400 | 1 |  | 12 |
| 6 | 5656370.1.1-1.5 | 1 | 구성품 | PRODUCT | PCIe 라이저 | 330-BDHY | GZHWC6O | 라이저 구성 0-4, 라이저 없음, 2x/6x GPUs, NVLINK Bridge 없음, XE7740 | 1 |  | 13 |
| 7 | 5656370.1.1-1.6 | 1 | 구성품 | PRODUCT | 프로세서 Thermal 구성 | 412-BCCN | GKAJVI7 | 히트싱크 2 CPU 구성 용 | 1 |  | 14 |
| 8 | 5656370.1.1-1.7 | 1 | 구성품 | PRODUCT | 메모리 구성 Type | 370-AAIP | GH9QBEI | 성능 최적화 | 1 |  | 15 |
| 9 | 5656370.1.1-1.8 | 1 | 구성품 | PRODUCT | 메모리 DIMM Type 및 스피드 | 370-BCCX | GL7EXYA | 6400MT/s RDIMMs | 1 |  | 16 |
| 10 | 5656370.1.1-1.9 | 1 | 구성품 | PRODUCT | 메모리 용량 | 370-BCCZ | G9S8BKC | 64GB RDIMM, 6400MT/s, 듀얼 랭크 | 16 |  | 17 |
| 11 | 5656370.1.1-1.10 | 1 | 구성품 | PRODUCT | RAID 구성 | 780-BCDO | GF5RC29 | C30, RAID 없음 NVME 섀시 용 | 1 |  | 18 |
| 12 | 5656370.1.1-1.11 | 1 | 구성품 | PRODUCT | RAID/내부 스토리지 컨트롤러 | 405-AACD | GLTBAZ3 | 컨트롤러 없음 | 1 |  | 19 |
| 13 | 5656370.1.1-1.12 | 1 | 구성품 | PRODUCT | 하드 드라이브 | 400-ABHL | GZ4G6T3 | 하드 드라이브 없음 | 1 |  | 20 |
| 14 | 5656370.1.1-1.13 | 1 | 구성품 | PRODUCT | 하드 드라이브 (PCIe SSD/Flex Bay) | 345-BMTV | G6IE1T4 | 1.92TB 데이터 센터 NVMe Read Intensive AG 드라이브 SED E3s Gen5 캐리어 포함 | 1 |  | 21 |
| 15 | 5656370.1.1-1.14 | 1 | 구성품 | PRODUCT | 하드 드라이브 (PCIe SSD/Flex Bay) | 345-BMWN | GET4UY5 | 7.68TB 데이터 센터 NVMe Read Intensive AG 드라이브 SED E3s Gen5 캐리어 포함 | 1 |  | 22 |
| 16 | 5656370.1.1-1.15 | 1 | 구성품 | PRODUCT | 전원 관리 BIOS 설정 | 384-BBBL | GJO594B | 성능 BIOS 설정 | 1 |  | 23 |
| 17 | 5656370.1.1-1.16 | 1 | 구성품 | PRODUCT | 고급 시스템 구성 | 800-BBDM | GSFTG4Y | UEFI BIOS Boot 모드 GPT 파티션 포함 | 1 |  | 24 |
| 18 | 5656370.1.1-1.17 | 1 | 구성품 | PRODUCT | Fans | 384-BDXS | GCKOJ8V | PowerEdge 1U 고성능 플래티넘 팬 | 1 |  | 25 |
| 19 | 5656370.1.1-1.18 | 1 | 구성품 | PRODUCT | 전원 공급 장치 | 450-BDWV | GDG457H | Octa, 중복(4+4), 핫플러그 MHS 전원 공급 장치, 3200W MM HLAC (200-240Vac), Titanium | 1 |  | 26 |
| 20 | 5656370.1.1-1.19 | 1 | 구성품 | PRODUCT | 전원 코드 | 450-AFEQ | G9501VT | 점퍼 코드 - C19/C20, 3.6M, 250V, 16A (한국) | 8 |  | 27 |
| 21 | 5656370.1.1-1.20 | 1 | 구성품 | PRODUCT | 마더보드 | 631-BCHH | G4H9J0B | XE7740 시스템 마더보드 | 1 |  | 28 |
| 22 | 5656370.1.1-1.21 | 1 | 구성품 | PRODUCT | 베젤 | 325-BGCM, 350-BDDP | GCE6IPT | PowerEdge 4U 표준 베젤 | 1 |  | 29 |
| 23 | 5656370.1.1-1.22 | 1 | 구성품 | PRODUCT | GPU 가속 카드 | 490-BKPN | G87GZYP | NVIDIA H200 NVL, PCIe, 450W R-시리즈용, 600W XE 서버용, 141GB 패시브, DW 전체 높이 GPU | 2 |  | 30 |
| 24 | 5656370.1.1-1.23 | 1 | 구성품 | PRODUCT | GPU/FPGA/Acceleration 케이블 | 470-BFHJ, 470-BFWB, 490-BJLH, 490-BJLH, 490-BJLH, 490-BJLH, 490-BJLH, 490-BJLH, 490-BLDK | GIUTP5J | GPU 출하 시 설치 CEM 케이블 for DW 2 GPUs 600W H200 | 1 |  | 31 |
| 25 | 5656370.1.1-1.24 | 1 | 구성품 | PRODUCT | OCP 3.0 네트워크 어댑터 | 540-BFPP | G0X1RVQ | Broadcom 5719 쿼드 포트 1GbE Base-T 어댑터, OCP 3.0 NIC +Sec | 1 |  | 32 |
| 26 | 5656370.1.1-1.25 | 1 | 구성품 | PRODUCT | Boot 최적화 스토리지 카드 | 470-BCXM | GH0VFZ4 | BOSS 카드 없음, Front 블랭크 | 1 |  | 33 |
| 27 | 5656370.1.1-1.26 | 1 | 구성품 | PRODUCT | OCP 3.0 액세서리 | 780-BCZQ | GN1I836 | 1 OCP - 케이블 없음 | 1 |  | 34 |
| 28 | 5656370.1.1-1.27 | 1 | 구성품 | PRODUCT | 운영 체제 | 611-BBBG | G863QL5 | OS 없음, 유틸리티 파티션 없음 | 1 |  | 35 |
| 29 | 5656370.1.1-1.28 | 1 | 구성품 | PRODUCT | OS 미디어 키트 | 605-BBFN | GKH7AZI | 미디어 불필요 | 1 |  | 36 |
| 30 | 5656370.1.1-1.29 | 1 | 구성품 | PRODUCT | 임베디드 시스템 관리 | 634-CSHS, 634-CSHT, 634-CSHV | GO51DJW | iDRAC10, 데이터 센터 17G | 1 |  | 37 |
| 31 | 5656370.1.1-1.30 | 1 | 구성품 | PRODUCT | 임베디드 시스템 관리 | 379-BFXS, 634-CZRP | GCO4WN5 | Dell Connectivity 클라이언트 - Enabled 17G | 1 |  | 38 |
| 32 | 5656370.1.1-1.31 | 1 | 구성품 | PRODUCT | KVM | 269-BBBH | GTM1GVD | 블랭크 Left Ear 모듈, XE774X | 1 |  | 39 |
| 33 | 5656370.1.1-1.32 | 1 | 구성품 | PRODUCT | BMC 비밀번호 | 379-BETG | G5HZBFJ | iDRAC Random 비밀번호 OCP 포함 LOM 없음 OMM QRL 포함 | 1 |  | 40 |
| 34 | 5656370.1.1-1.33 | 1 | 구성품 | PRODUCT | 랙 레일 | 770-BFPG | GD3XA8F | XE774x 슬라이딩 Ready 레일 | 1 |  | 41 |
| 35 | 5656370.1.1-1.34 | 1 | 구성품 | PRODUCT | 배송 | 340-DRWQ, 340-DTWP | GSJY2B9 | PowerEdge XE7740 배송, APCC, CCC4 | 1 |  | 42 |
| 36 | 5656370.1.1-1.35 | 1 | 구성품 | PRODUCT | 규정 | 389-FHJB | GOC6PGW | PowerEdge CCC, CE 레이블 마크 없음 | 1 |  | 43 |
| 37 | 5656370.1.1-1.36 | 1 | 구성품 | PRODUCT | 배송 제품 | 340-DSGQ | GG0TX5Z | XE774x 배송 제품 | 1 |  | 44 |
| 38 | 5656370.1.1-1.37 | 1 | 구성품 | PRODUCT | Engineering/정보 | 379-BFBP | GTM7WQZ | 특수 GPU를 선택하실 경우, 이 옵션을 확인하십시오。 | 1 |  | 45 |
| 39 | 5656370.1.1-1.38 | 1 | 구성품 | PRODUCT | 고객 알림 | 883-17743 | GP0W9BG | 무거운 장치에는 방문 서비스를 위해 리프트 보조 카트가 필요합니다. 그렇지 않으면 지연 또는 추가 요금이 부과될 수 있습니다. | 1 |  | 46 |
| 40 | 5656370.1.1-1.39 | 1 | 구성품 | SERVICE | Dell 서비스: 하드웨어 지원 | 709-BFTT | G074Y2Z | 기본 익일(영업일 기준) 36 개월, 36 개월 | 1 | 36 | 47 |
| 41 | 5656370.1.1-1.40 | 1 | 구성품 | SERVICE | Dell 서비스: 연장 서비스 | 199-BONO | GRONX2S | ProSupport 4-시간 방문 서비스 포함, 36 개월 | 1 | 36 | 48 |
| 42 | 5656370.1.1-1.41 | 1 | 구성품 | SERVICE | 하드 드라이브 보호 서비스 엔터프라이즈 서비스 용 | 711-BCXN | G18U23Q | 하드 드라이브 보호 서비스 엔터프라이즈 용, 36 개월 | 1 | 36 | 49 |
| 43 | 5656370.1.1-1.42 | 1 | 구성품 | SERVICE | ProDeploy Field 디플로이먼트 서비스 | 883-BBLF | G1QD3ST | 맞춤형 랙 통합 Dell SOW 필요 | 1 |  | 50 |
| 44 | 5656370.1.1-1.43 | 1 | 구성품 | SERVICE | 맞춤 배송 서비스 | 379-BDZC, 990-28177 | G9XDR7L | APJ Dell White Gloves Services | 1 |  | 51 |

**가격 정보** (통화는 모든 행 KRW)

| 행 | SKU | List 단가 | List 금액 | 할인율(%) | 벤더 Net 금액 |
|---|---|---|---|---|---|
| 1 | (상위 품목) | 877,910,278 | 877,910,278 |  |  |
| 2 | 210-BPMK | 34,728,000 | 34,728,000 |  |  |
| 3 | 321-BLXN, 412-BCFN, 470-BCZG | 51,126,000 | 51,126,000 |  |  |
| 4 | 338-CTBB | 17,781,000 | 17,781,000 |  |  |
| 5 | 338-CTBB, 379-BDCO | 17,781,000 | 17,781,000 |  |  |
| 6 | 330-BDHY | 0 | 0 |  |  |
| 7 | 412-BCCN | 497,000 | 497,000 |  |  |
| 8 | 370-AAIP | 0 | 0 |  |  |
| 9 | 370-BCCX | 0 | 0 |  |  |
| 10 | 370-BCCZ | 17,281,000 | 276,496,000 |  |  |
| 11 | 780-BCDO | 0 | 0 |  |  |
| 12 | 405-AACD | 37,000 | 37,000 |  |  |
| 13 | 400-ABHL | 0 | 0 |  |  |
| 14 | 345-BMTV | 21,056,000 | 21,056,000 |  |  |
| 15 | 345-BMWN | 63,976,000 | 63,976,000 |  |  |
| 16 | 384-BBBL | 0 | 0 |  |  |
| 17 | 800-BBDM | 0 | 0 |  |  |
| 18 | 384-BDXS | 980,000 | 980,000 |  |  |
| 19 | 450-BDWV | 15,755,000 | 15,755,000 |  |  |
| 20 | 450-AFEQ | 26,000 | 208,000 |  |  |
| 21 | 631-BCHH | 0 | 0 |  |  |
| 22 | 325-BGCM, 350-BDDP | 125,000 | 125,000 |  |  |
| 23 | 490-BKPN | 159,837,000 | 319,674,000 |  |  |
| 24 | 470-BFHJ, 470-BFWB, 490-BJLH, 490-BJLH, 490-BJLH, 490-BJLH, 490-BJLH, 490-BJLH, 490-BLDK | 300,000 | 300,000 |  |  |
| 25 | 540-BFPP | 273,000 | 273,000 |  |  |
| 26 | 470-BCXM | 0 | 0 |  |  |
| 27 | 780-BCZQ | 0 | 0 |  |  |
| 28 | 611-BBBG | 0 | 0 |  |  |
| 29 | 605-BBFN | 0 | 0 |  |  |
| 30 | 634-CSHS, 634-CSHT, 634-CSHV | 1,630,000 | 1,630,000 |  |  |
| 31 | 379-BFXS, 634-CZRP | 0 | 0 |  |  |
| 32 | 269-BBBH | 50,000 | 50,000 |  |  |
| 33 | 379-BETG | 0 | 0 |  |  |
| 34 | 770-BFPG | 497,000 | 497,000 |  |  |
| 35 | 340-DRWQ, 340-DTWP | 0 | 0 |  |  |
| 36 | 389-FHJB | 0 | 0 |  |  |
| 37 | 340-DSGQ | 744,000 | 744,000 |  |  |
| 38 | 379-BFBP | 0 | 0 |  |  |
| 39 | 883-17743 | 0 | 0 |  |  |
| 40 | 709-BFTT | 0 | 0 |  |  |
| 41 | 199-BONO | 51,159,270 | 51,159,270 |  |  |
| 42 | 711-BCXN | 1,495,008 | 1,495,008 |  |  |
| 43 | 883-BBLF | 0 | 0 |  |  |
| 44 | 379-BDZC, 990-28177 | 1,542,000 | 1,542,000 |  |  |

### A.3 Cisco 가격형 샘플 — `기업사업부\무디스 스위치 교체 건\무디스_BOM_Quote_4801311680.xls`

- 파일 정보: 형식 CCW 가격형, 시트 `QUOTE`, 머리글 31행, 통화 KRW, Quote Total 154,966,952.
- 합계: 품목 행 22개 (상위 품목 1, 구성품 21), 미분류 0. 구분별 행 수: PRODUCT 21, SERVICE 1. 구독 정보는 모든 행이 빈 값이다.

| 행 | 원본 라인 번호 | 상위 행 | 행 유형 | 구분 | 모듈명 | SKU | 옵션 ID | 품명 | 수량 | 기간 | 원본 행 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1.0 |  | 상위 품목 | PRODUCT |  | C9300-48UXM-A |  | Catalyst 9300 48-port(12 mGig, 36 2.5Gbps) Network Advantage | 8 |  | 32 |
| 2 | 1.0.1 | 1 | 구성품 | SERVICE |  | CON-SNT-C93A048M |  | SNTC-8X5XNBD Catalyst 9300 48-port(12 mGig36 2.5Gbps | 8 | 12 | 33 |
| 3 | 1.1 | 1 | 구성품 | PRODUCT |  | C9300-DNA-A-48 |  | C9300 DNA Advantage, 48-Port Term Licenses | 8 |  | 34 |
| 4 | 1.1.1 | 1 | 구성품 | PRODUCT |  | C9300-DNA-A-48-3Y |  | C9300 DNA Advantage, 48-Port, 3 Year Term License | 8 | 36 | 35 |
| 5 | 1.2 | 1 | 구성품 | PRODUCT |  | D-DNAS-EXT-S-T |  | Cisco DNA Spaces Extend Term License for Catalyst Switches | 8 |  | 36 |
| 6 | 1.2.1 | 1 | 구성품 | PRODUCT |  | D-DNAS-EXT-S-3Y |  | Cisco DNA Spaces Extend for Catalyst Switching - 3Year | 8 | 36 | 37 |
| 7 | 1.3 | 1 | 구성품 | PRODUCT |  | TE-EMBEDDED-T |  | Cisco ThousandEyes Enterprise Agent IBN Embedded | 8 |  | 38 |
| 8 | 1.3.1 | 1 | 구성품 | PRODUCT |  | TE-EMBEDDED-T-3Y |  | ThousandEyes - Enterprise Agents | 8 | 36 | 39 |
| 9 | 1.4 | 1 | 구성품 | PRODUCT |  | C9300-NW-A-48 |  | C9300 Network Advantage, 48-port license | 8 |  | 40 |
| 10 | 1.5 | 1 | 구성품 | PRODUCT |  | SC9300UK9-1718 |  | CAT9300/9400/9500/9600 UNIVERSAL | 8 |  | 41 |
| 11 | 1.6 | 1 | 구성품 | PRODUCT |  | PWR-C1-1100WAC-P |  | 1100W AC 80+ platinum Config 1 Power Supply | 8 |  | 42 |
| 12 | 1.7 | 1 | 구성품 | PRODUCT |  | PWR-C1-1100WAC-P/2 |  | 1100W AC 80+ platinum Config 1 Secondary Power Supply | 8 |  | 43 |
| 13 | 1.8 | 1 | 구성품 | PRODUCT |  | CAB-TA-EU |  | Europe AC Type A Power Cable | 16 |  | 44 |
| 14 | 1.9 | 1 | 구성품 | PRODUCT |  | TE-C9K-SW |  | TE agent for IOSXE on C9K | 8 |  | 45 |
| 15 | 1.10 | 1 | 구성품 | PRODUCT |  | C9K-ACC-RBFT |  | RUBBER FEET FOR TABLE TOP SETUP 9200 and 93xx | 8 |  | 46 |
| 16 | 1.11 | 1 | 구성품 | PRODUCT |  | C9K-ACC-SCR-4 |  | 12-24 and 10-32 SCREWS FOR RACK INSTALLATION, QTY 4 | 8 |  | 47 |
| 17 | 1.12 | 1 | 구성품 | PRODUCT |  | CAB-GUIDE-1RU |  | 1RU CABLE MANAGEMENT GUIDES 9200 and 9300 | 8 |  | 48 |
| 18 | 1.13 | 1 | 구성품 | PRODUCT |  | NETWORK-PNP-LIC |  | Network Plug-n-Play Connect for zero-touch device deployment | 8 |  | 49 |
| 19 | 1.14 | 1 | 구성품 | PRODUCT |  | C9300-SSD-NONE |  | No SSD Card Selected | 8 |  | 50 |
| 20 | 1.15 | 1 | 구성품 | PRODUCT |  | C9300-SPWR-NONE |  | No Stack Power Cable Selected | 8 |  | 51 |
| 21 | 1.16 | 1 | 구성품 | PRODUCT |  | C9300-STACK-NONE |  | No Stack Cable Selected | 8 |  | 52 |
| 22 | 1.17 | 1 | 구성품 | PRODUCT |  | C9300-NM-8X |  | Catalyst 9300 8 x 10GE Network Module | 8 |  | 53 |

**가격 정보** (통화는 모든 행 KRW. List 단가는 `Unit List Price (With Duration)` 값)

| 행 | SKU | List 단가 | List 금액 | 할인율(%) | 벤더 Net 금액 |
|---|---|---|---|---|---|
| 1 | C9300-48UXM-A | 31,842,966 | 254,743,728 | 60 | 101,897,488 |
| 2 | CON-SNT-C93A048M | 2,956,362 | 23,650,896 | 62 | 8,987,344 |
| 3 | C9300-DNA-A-48 | 0 | 0 | 60 | 0 |
| 4 | C9300-DNA-A-48-3Y | 6,981,293 | 55,850,344 | 65 | 19,547,624 |
| 5 | D-DNAS-EXT-S-T | 0 | 0 | 58 | 0 |
| 6 | D-DNAS-EXT-S-3Y | 0 | 0 | 58 | 0 |
| 7 | TE-EMBEDDED-T | 0 | 0 | 58 | 0 |
| 8 | TE-EMBEDDED-T-3Y | 0 | 0 | 58 | 0 |
| 9 | C9300-NW-A-48 | 0 | 0 | 60 | 0 |
| 10 | SC9300UK9-1718 | 0 | 0 | 58 | 0 |
| 11 | PWR-C1-1100WAC-P | 0 | 0 | 60 | 0 |
| 12 | PWR-C1-1100WAC-P/2 | 3,758,103 | 30,064,824 | 60 | 12,025,928 |
| 13 | CAB-TA-EU | 0 | 0 | 58 | 0 |
| 14 | TE-C9K-SW | 0 | 0 | 58 | 0 |
| 15 | C9K-ACC-RBFT | 0 | 0 | 60 | 0 |
| 16 | C9K-ACC-SCR-4 | 0 | 0 | 60 | 0 |
| 17 | CAB-GUIDE-1RU | 0 | 0 | 60 | 0 |
| 18 | NETWORK-PNP-LIC | 0 | 0 | 58 | 0 |
| 19 | C9300-SSD-NONE | 0 | 0 | 60 | 0 |
| 20 | C9300-SPWR-NONE | 0 | 0 | 60 | 0 |
| 21 | C9300-STACK-NONE | 0 | 0 | 60 | 0 |
| 22 | C9300-NM-8X | 5,043,776 | 40,350,208 | 69 | 12,508,568 |

### A.4 샘플 11개 변환·고정 규칙 검증 요약

EOS(R8)와 AI 검토 권고는 외부 응답에 따라 결과가 달라지므로 이 표에서 뺐다.

| 파일 | 판별 형식 | 머리글 행 | 품목 행 (상위 / 하위 제품 / 구성품) | 고정 규칙 판정 |
|---|---|---|---|---|
| `매니지드서비스사업부\(대웅제약 마곡C&D 센터 구축)Quote_4793379459_BOM.xls` (Cisco 기준) | CCW 구성형 | 31 | 36 (5 / 0 / 31) | R6 경고 1 — 행 19 CON-SNT-C9200L4X (12 ≠ 36개월) |
| `매니지드서비스사업부\(대웅제약 마곡C&D 센터 구축)Quote_4744902766_BOM.xls` | CCW 구성형 | 40 | 162 (18 / 0 / 144) | R6 경고 9 — 12개월 행(CON-SNT 3, TE-SUB 계열 5, CX-PDIC-NW-CSM 1) ≠ 36개월 · R5 경고 6 — C9400-LC-48U(행 28·29), LIC-CW-E(151·154), LIC-SPACES-ESS(152·155) |
| `매니지드서비스사업부\(인터터치.은평힐튼)Quote_4802077195.xls` | CCW 가격형 | 40 | 44 (13 / 0 / 31) | R6 경고 5 — 58.10·59.74·59.81개월 ≠ 60개월 · R5 경고 18 — 10.0 아래 LIC-CW-A 8행, LIC-SPACES-ADV 8행, LIC-MS-300-M-A 2행 · R9 없음 (Quote Total 281,021,250 일치) |
| `기업사업부\무디스 스위치 교체 건\무디스_BOM_Quote_4801311680.xls` (Cisco 가격형 기준) | CCW 가격형 | 31 | 22 (1 / 0 / 21) | 없음 (Quote Total 154,966,952 일치) |
| `기업사업부\EY한영 스위치 교체 건\EY한영_Quote_4802631464.xls` | CCW 가격형 | 31 | 13 (5 / 0 / 8) | 없음 (Quote Total 22,462,210 일치) |
| `DC사업부\SERVER\CASE1_Server_BoM.xlsx` (Dell 기준) | Dell | 7 | 44 (1 / 0 / 43) | 없음 |
| `DC사업부\SERVER\CASE2_Server_BoM.xlsx` | Dell | 7 | 212 (5 / 5 / 202) | 없음 — 상위 품목 라인 `5623942.2.1-1` ~ `-5`, 하위 제품 `5623942.2.1-5.S1` ~ `.S5` |
| `DC사업부\STORAGE\SERVER\CASE1_Storage_BoM.xlsx` | Dell | 7 | 26 (1 / 4 / 21) | 없음 |
| `DC사업부\STORAGE\SERVER\CASE2_Storage_BoM.xlsx` | Dell | 7 | 23 (1 / 2 / 20) | R9 경고 1 — 행 1 (합계 762,457,283 / 기준 762,457,282) |
| `DC사업부\STORAGE\SERVER\CASE3_Storage_BoM.xlsx` | Dell | 7 | 24 (1 / 2 / 21) | R9 경고 1 — 행 1 (합계 3,006,552,133 / 기준 3,006,552,132) |
| `DC사업부\STORAGE\SERVER\CASE4_Storage_BoM.xlsx` | Dell | 7 | 33 (1 / 5 / 27) | 없음 |

- 샘플 11개 전체에서 R1·R2·R3·R4·R7 판정은 0건이다. 일회성 서비스 제외(D-27)가 없으면 Dell 6개 파일에서 ProDeploy·배송·디플로이먼트 행이 R1 오류가 된다.

## 변경 이력

| 버전 | 일자 | 변경 내용 | 관련 CR |
|---|---|---|---|
| v0.1 | 2026-09-30 | 최초 작성. PRD v0.3 REQ-001 ~ REQ-020·REQ-028과 NFR에서 POL-001 ~ POL-039 도출. 샘플 벤더 BoM 11개 전수 분석, 결정 D-26 ~ D-33 반영, 부록 A 기대 결과표 작성 | - |
| v0.2 | 2026-09-30 | POL-012 LLM 전송 범위(구성 필드만) 승인 — D-34, 상태 검토중 → 확정 | - |
| v0.3 | 2026-09-30 | `/wireframe` 반영: 모든 POL의 관련 화면(SCR-001 ~ SCR-013) 채움. POL-004 행 계보 ID(버전 비교 기준), POL-033 견적 단가 입력 규칙·문구, POL-037 견적명 빈 값·제외 후 품목 0행 차단 문구 추가 | - |
| v0.4 | 2026-10-01 | `/qa-tc` 반영: 정책 목록·각 POL의 관련 테스트에 TC ID 역참조(05-qa-tc.md v0.1, TC-001 ~ TC-162). 규칙 변경 없음 | - |
| v0.5 | 2026-10-01 | 기획 확정 검토 결정 반영: 제안값 10건 확정, 검토중 → 확정(D-35). POL-029 MVP는 Cisco도 AI 웹 검색·판매 종료 경고·출처 도메인 벤더별(D-38), EoX API는 P1(REQ-029). POL-004 발생 조건 없는 문구 삭제(D-39). POL-011·013 보관 기간 미확정 유지·삭제 없이 보관(D-36). POL-012 OI-13 해결 반영·EOS 전송 필드 공통화(D-37) | - |
| v1.0 | 2026-10-01 | 최초 승인(POL-001 ~ POL-039 — 확정 37, 미확정 2: POL-011·013 보관 기간). 이후 변경은 CR 절차(/change)로 반영 | - |
