# 정책서 — BoM 자동 작성·검증 서비스 (bom-auto)

| 항목 | 내용 |
|---|---|
| 문서 버전 | v1.2 |
| 상태 | 승인 |
| 작성일 | 2026-09-30 |
| 최종 수정일 | 2026-10-02 |
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
- **관련 TC는 [05-qa-tc.md](05-qa-tc.md) v1.0 기준으로 채웠다(v1.2에서 CR-002·003·004 반영분 TC-164 ~ TC-187을 더했다).** 정책마다 그 정책을 참조하는 모든 TC를 적었고, 위반 케이스 TC(유형 예외·경계)는 05-qa-tc.md 커버리지 표 2에 따로 모았다. 관련 화면(SCR)은 [03-ia.md](03-ia.md) v0.1 기준으로 채웠다.
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
| 전체 | 50건 | POL-001 ~ POL-050 |
| 확정 | 47건 | 아래 목록에서 상태가 「확정」인 것. 제안값 10건은 2026-10-01에 그대로 확정(D-35). POL-040 ~ POL-050은 CR-002·CR-004로 추가 |
| 검토중 | 0건 | — |
| 미확정 | 2건 | POL-011, POL-013 — 보관 기간 미정(OI-12). MVP는 삭제 없이 보관(D-36) |
| 폐지 | 1건 | POL-038 원가분석표 — CR-003, DEC-58. 번호는 비워 두지 않고 내용을 남긴다 |

## 정책 목록

| ID | 분류 | 정책명 | 관련 REQ | 관련 TC | 상태 |
|---|---|---|---|---|---|
| POL-001 | 회원/인증 | Naver Works SSO 로그인·세션 | REQ-001, NFR-004 | TC-001, TC-002, TC-003, TC-004, TC-005, TC-006, TC-147 | 확정 |
| POL-002 | 회원/인증 | 최초 로그인 등록·역할 대기 | REQ-001, REQ-002, REQ-020, REQ-037 | TC-007, TC-008, TC-009, TC-021, TC-148, TC-180 | 확정 |
| POL-003 | 콘텐츠/데이터 | BoM 건 입력값 | REQ-003 | TC-023, TC-024, TC-025, TC-026, TC-027, TC-150 | 확정 |
| POL-004 | 콘텐츠/데이터 | 버전 상태 전이·삭제 | REQ-011, REQ-012 | TC-023, TC-066, TC-076, TC-108, TC-109, TC-110, TC-111, TC-112, TC-154 | 확정 |
| POL-005 | 콘텐츠/데이터 | 동시 편집 충돌 방지 | REQ-006 | TC-066, TC-067, TC-074, TC-075, TC-131, TC-155 | 확정 |
| POL-006 | 콘텐츠/데이터 | BoM 목록·검색 | REQ-014 | TC-028, TC-029, TC-030, TC-031, TC-032, TC-033, TC-034, TC-035, TC-046, TC-108, TC-149 | 확정 |
| POL-007 | 콘텐츠/데이터 | 다운로드 파일명 | REQ-013, REQ-018 | TC-016, TC-048, TC-093, TC-113, TC-115, TC-134, TC-135 | 확정 |
| POL-008 | 권한/등급 | 역할별 기능 권한 | REQ-002, NFR-005, REQ-030, REQ-034, REQ-035 | TC-011, TC-012, TC-013, TC-014, TC-016, TC-048, TC-076, TC-107, TC-112, TC-151, TC-159, TC-164, TC-176, TC-177, TC-181, TC-182 | 확정 |
| POL-009 | 권한/등급 | 작성자 전용 정보(가격·견적) | REQ-015, NFR-005 | TC-013, TC-015, TC-016, TC-017, TC-028, TC-084, TC-087, TC-111, TC-116, TC-159, TC-181, TC-182 | 확정 |
| POL-010 | 권한/등급 | 역할 변경 | REQ-020 | TC-014, TC-019, TC-020, TC-021, TC-022, TC-158, TC-180 | 확정 |
| POL-011 | 운영 | 감사 로그 | NFR-008, REQ-034 | TC-003, TC-006, TC-019, TC-023, TC-036, TC-048, TC-093, TC-104, TC-106, TC-107, TC-108, TC-112, TC-113, TC-116, TC-118, TC-134, TC-156, TC-163, TC-165, TC-166, TC-168, TC-174, TC-175, TC-176, TC-180, TC-182, TC-184 | 미확정 |
| POL-012 | 법/개인정보 | LLM 전송 범위·기록 | REQ-009, REQ-008, NFR-007, REQ-031 | TC-094, TC-095, TC-098, TC-102, TC-103, TC-143, TC-168, TC-171 | 확정 |
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
| POL-029 | 검증 | R8 EOS 조회·판정 | REQ-008, REQ-019, REQ-033 | TC-094, TC-095, TC-096, TC-097, TC-142, TC-143, TC-144, TC-145, TC-146, TC-157, TC-167, TC-174, TC-175, TC-184 | 확정 |
| POL-030 | 검증 | R9 벤더 파일 합계 불일치 | REQ-007 | TC-017, TC-087 | 확정 |
| POL-031 | 검증 | AI 검토 권고 | REQ-009 | TC-090, TC-098, TC-099, TC-100, TC-101, TC-132, TC-167 | 확정 |
| POL-032 | 검증 | BoM 확정 조건 | REQ-011 | TC-080, TC-088, TC-098, TC-104, TC-105, TC-106, TC-107, TC-153, TC-163 | 확정 |
| POL-033 | 견적·출력 | 견적 생성·저장 조건 | REQ-016 | TC-108, TC-117, TC-118, TC-120, TC-122, TC-123, TC-124, TC-129, TC-130, TC-139, TC-155, TC-166, TC-183 | 확정 |
| POL-034 | 견적·출력 | 소비자가·원가 계산 | REQ-016, NFR-012 | TC-118, TC-119, TC-120, TC-121, TC-122, TC-130 | 확정 |
| POL-035 | 견적·출력 | 환율·할인율·GP율 입력 | REQ-016 | TC-120, TC-125, TC-126, TC-128 | 확정 |
| POL-036 | 견적·출력 | 공급단가·GP | REQ-017 | TC-118, TC-119, TC-129, TC-130, TC-134 | 확정 |
| POL-037 | 견적·출력 | 고객 견적서 | REQ-018, REQ-009, REQ-030, REQ-032 | TC-132, TC-133, TC-134, TC-135, TC-136, TC-137, TC-138, TC-139, TC-156, TC-165, TC-166, TC-173, TC-185 | 확정 |
| POL-038 | 견적·출력 | 원가분석표 — **폐지(CR-003, DEC-58)** | REQ-028(폐지) | TC-139, TC-140(삭제), TC-141 | 폐지 |
| POL-039 | 견적·출력 | 표준 BoM·검증 리포트 xlsx | REQ-013, REQ-010 | TC-093, TC-113, TC-114 | 확정 |
| POL-040 | 운영 | 환경설정 (관리자) | REQ-030, REQ-018, REQ-008, REQ-009, REQ-019 | TC-164, TC-165, TC-166, TC-167, TC-168, TC-169, TC-170 | 확정 |
| POL-041 | 운영 | AI 사용량 집계·월 예산 | REQ-031, REQ-008, REQ-009 | TC-171, TC-172 | 확정 |
| POL-042 | 견적·출력 | 내 견적서 기본값 | REQ-032, REQ-018 | TC-173 | 확정 |
| POL-043 | 검증 | EOS 관리자 등록·캐시 관리 | REQ-033, REQ-008, REQ-019 | TC-174, TC-175 | 확정 |
| POL-044 | 운영 | 감사 로그 조회·내보내기 | REQ-034, NFR-008 | TC-176, TC-186 | 확정 |
| POL-045 | 운영 | 운영 통계·AI 권고 품질 지표 | REQ-035 | TC-177, TC-178, TC-187 | 확정 |
| POL-046 | 운영 | 공지·점검 배너 | REQ-036 | TC-179 | 확정 |
| POL-047 | 권한/등급 | 사용자 비활성화 | REQ-037, REQ-020 | TC-180 | 확정 |
| POL-048 | 콘텐츠/데이터 | BoM 건 복제 | REQ-038 | TC-182 | 확정 |
| POL-049 | 견적·출력 | 이전 버전 견적 가져오기 | REQ-039 | TC-183 | 확정 |
| POL-050 | 검증 | EOS 여러 SKU 검색 | REQ-040, REQ-019 | TC-184 | 확정 |

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
  - 비활성화된 사용자(POL-047)는 역할과 상관없이 로그인할 수 없다. 세션을 만들지 않고 로그인 화면에 「사용이 중지된 계정입니다. 관리자(CSD)에게 문의해 주세요.」를 표시하며, 로그인 실패로 기록한다(POL-011, CR-004).
- **예외**: 배포 설정 `BOOTSTRAP_ADMIN_ACCOUNTS`에 적힌 Naver Works 계정은 처음 로그인할 때 「관리자」로 등록한다. 관리자가 한 명도 없으면 아무도 역할을 지정할 수 없기 때문이다. 이름·부서는 로그인할 때마다 Naver Works 값으로 갱신하되, 역할은 바꾸지 않는다. 역할 미지정 사용자도 공지·점검 배너(`GET /api/notice`, POL-046)는 본다.
- **검증 의사코드**:

  ```js
  function onSsoCallback(nw, config) {
    let u = users.findByNwId(nw.id);
    if (u?.disabledAt) return loginFail("disabled");           // POL-047 — ACCOUNT_DISABLED
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
    if (req.isApi && !["/auth/logout", "/api/notice"].includes(req.path)) return block("ROLE_PENDING", {status: 403});
    return req.isApi ? ok() : showScreen("역할 대기");
  }
  ```

- **관련 요구사항**: REQ-001, REQ-002, REQ-020, REQ-037
- **관련 화면**: SCR-001, SCR-002, SCR-012
- **관련 테스트**: TC-007, TC-008, TC-009, TC-021, TC-148, TC-180

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
  - 검색 조건 없이 목록이 0건이면: 「등록된 BoM이 없습니다.」 BoM 건을 만들 수 있는 역할(영업·관리자, POL-008)에게는 [새 BoM] 버튼을 함께 표시한다.
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

- **규칙** (한 문장): 시스템이 만드는 파일의 이름은 `{고객사명}_{건명}_{종류}_v{버전}.{확장자}`다. 종류는 `BoM` / `검증리포트` / `견적서` 중 하나다(`원가분석표`는 폐지 — CR-003, DEC-58).
- **정제 규칙**: ① `\ / : * ? " < > |`와 제어 문자는 `_`로 바꾼다. ② 연속 공백은 한 칸으로 줄인다. ③ 고객사명·건명은 각각 앞뒤 공백과 끝의 마침표를 뺀 뒤 **최대 40자**로 자른다.
- **적용 시점**: 표준 BoM·검증 리포트·고객 견적서 다운로드 응답의 `Content-Disposition` 헤더. 한글이 깨지지 않도록 `filename*=UTF-8''…` 형식으로 보낸다.
- **위반/실패 시 처리**: 차단하지 않는다. 쓸 수 없는 문자는 규칙대로 바꾸며, 문구는 없다. 예: 고객사명 「A/S 센터」, 건명 「1:1 교체」, v2 → `A_S 센터_1_1 교체_BoM_v2.xlsx`
- **예외**: 원본 벤더 파일은 업로드할 때의 파일명 그대로 내려준다. 한 버전에 견적이 여러 개여도 견적서 파일명은 같다(구분은 감사 로그의 견적 ID로 한다). Summary형 견적서도 종류는 `견적서`다. BoM 건에 속하지 않는 파일 — 감사 로그 CSV `감사로그_{YYYY-MM-DD}.csv`(POL-044), EOS 여러 SKU 검색 결과 `EOS검색_{벤더}_{YYYY-MM-DD}.xlsx`(POL-050) — 은 이 형식을 따르지 않는다(날짜는 KST 오늘).
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

- **관련 요구사항**: REQ-013, REQ-018
- **관련 화면**: SCR-005, SCR-007, SCR-008, SCR-009, SCR-010
- **관련 테스트**: TC-016, TC-048, TC-093, TC-113, TC-115, TC-134, TC-135

## 3. 결제/과금 정책

해당 없음 — 이 서비스에는 결제·과금 기능이 없다. 원가·공급단가 계산은 [10장](#10-견적출력-정책)에서 정한다.

## 4. 알림 정책

해당 없음 — PRD에 알림(메일·메신저·푸시) 요구사항이 없다. 검증 리포트 공유는 사용자가 xlsx를 직접 전달한다(REQ-010).

## 5. 권한/등급 정책

| 역할 | 설명 | 주요 권한 |
|---|---|---|
| 역할 미지정 | 처음 로그인한 사용자. 관리자가 역할을 지정하기 전 | 역할 대기 화면, 로그아웃 |
| 영업 | BoM 건의 작성자 (40명) | 본인 BoM 건 생성·복제·업로드·편집·검증·확정·새 버전, 본인 건의 가격·견적·견적서. 전사 BoM 조회, EOS 검색 |
| 엔지니어 | 공유된 BoM의 조회자 (150명) | 전사 BoM 조회(가격 제외), 검증 리포트 조회·다운로드, 표준 BoM 다운로드, EOS 검색 |
| 관리자 | CSD 담당자 | 엔지니어 권한 + 사용자 역할 관리·비활성화, 환경설정, 감사 로그, 통계. 자기가 만든 BoM 건은 영업 작성자와 같은 권한이다(DEC-62, CR-004). 남의 BoM 건의 가격·견적은 볼 수 없다 |

### POL-008 역할별 기능 권한

- **규칙** (한 문장): 각 기능은 아래 표에서 ○인 역할만 쓸 수 있다. 권한은 화면이 아니라 **서버 API에서** 요청마다 검사한다(NFR-005).

| 기능 | 대표 API | 영업 | 엔지니어 | 관리자 |
|---|---|---|---|---|
| BoM 목록·상세·버전 비교 조회 (가격 제외) | `GET /api/boms`, `GET /api/boms/{id}` | ○ | ○ | ○ |
| 검증 리포트 조회·xlsx 다운로드 | `GET /api/validations/{id}` | ○ | ○ | ○ |
| 표준 BoM xlsx 다운로드 | `GET /api/versions/{id}/bom.xlsx` | ○ | ○ | ○ |
| SKU EOS 단건·여러 SKU 검색 (POL-050) | `GET /api/eos?vendor=&sku=`, `POST /api/eos/bulk.xlsx` | ○ | ○ | ○ |
| 공지·점검 배너 조회 (POL-046) | `GET /api/notice` | ○ | ○ | ○ |
| BoM 건 생성·복제 (POL-048) | `POST /api/boms`, `POST /api/boms/{id}/clone` | ○ | × | ○ |
| 업로드·편집·검증 실행·확인함·확정·새 버전·BoM 건 삭제 | `POST/PUT/DELETE /api/boms/{id}/…` | 작성자만 | × | 작성자만 |
| 원본 벤더 파일 다운로드 | `GET /api/files/{id}` | 작성자만 | × | 작성자만 |
| 가격 정보·견적·견적서 | `/api/quotes/…`, `/api/versions/{id}/quotes` | 작성자만 | × | 작성자만 |
| 사용자 역할 관리·비활성화 (POL-010, POL-047) | `/api/users/…` | × | × | ○ |
| 환경설정 — 견적서 회사 정보·CI, 견적 기본값·문구, AI·EOS, AI 사용량·월 예산, EOS 관리, 공지·점검 (POL-040 ~ 043, 046) | `/api/settings/…` | × | × | ○ |
| 감사 로그 조회·CSV (POL-044) | `GET /api/audit`, `GET /api/audit.csv` | × | × | ○ |
| 통계 (POL-045) | `GET /api/stats` | × | × | ○ |

- 「작성자만」은 **작성자 역할(영업·관리자)이고** BoM 건의 작성자일 때다(DEC-62, CR-004). 작성자의 역할이 엔지니어·역할 미지정으로 바뀌면 그 사용자는 자기 건의 가격·견적도 볼 수 없다.
- **적용 시점**: 모든 API 요청(서버 미들웨어), 화면 렌더링(메뉴·버튼 표시 여부)
- **위반/실패 시 처리**
  - 권한이 없는 기능의 메뉴·버튼은 화면에 표시하지 않는다.
  - 권한 없이 API를 호출하면 차단한다. HTTP 403 `{"code":"FORBIDDEN","message":"이 기능을 사용할 권한이 없습니다."}`
  - 권한 없는 화면 URL로 직접 들어오면 「이 기능을 사용할 권한이 없습니다.」와 [BoM 목록으로]를 표시한다.
- **예외**: 없다. 관리자도 남이 만든 BoM 건은 편집할 수 없고 가격·견적을 볼 수 없다. 환경설정·감사 로그·통계 화면은 가격·견적 값을 보여주지 않는다. 역할 미지정 사용자는 POL-002를, 비활성화된 사용자는 POL-047을 따른다.
- **검증 의사코드**:

  ```js
  const AUTHOR_ROLES = ["영업", "관리자"];          // DEC-62 — 관리자도 자기가 만든 BoM 은 작성자
  const MATRIX = {
    READ_BOM: ["영업", "엔지니어", "관리자"], READ_VALIDATION: ["영업", "엔지니어", "관리자"],
    DOWNLOAD_BOM: ["영업", "엔지니어", "관리자"], EOS_SEARCH: ["영업", "엔지니어", "관리자"],
    CREATE_BOM: AUTHOR_ROLES, EDIT_BOM: ["작성자"], DOWNLOAD_ORIGINAL: ["작성자"], QUOTE: ["작성자"],
    MANAGE_USERS: ["관리자"], MANAGE_SETTINGS: ["관리자"], VIEW_AUDIT: ["관리자"], VIEW_STATS: ["관리자"],
  }; // "작성자" = 작성자 역할(영업·관리자)이면서 그 BoM 건의 작성자
  function authorize(user, action, bom) {
    const role = users.get(user.id).role;             // 매 요청 DB 조회 (POL-010)
    const allowed = MATRIX[action];
    if (allowed.includes(role)) return ok();
    if (allowed.includes("작성자") && AUTHOR_ROLES.includes(role) && bom?.authorId === user.id) return ok();
    return block("FORBIDDEN", {status: 403});
  }
  ```

- **관련 요구사항**: REQ-002, NFR-005, REQ-030, REQ-034, REQ-035
- **관련 화면**: SCR-003, SCR-005, SCR-007, SCR-009, SCR-012, SCR-013, SCR-014, SCR-015, SCR-016 (메뉴·버튼 표시는 전 화면 GNB)
- **관련 테스트**: TC-011, TC-012, TC-013, TC-014, TC-016, TC-048, TC-076, TC-107, TC-112, TC-151, TC-159, TC-164, TC-176, TC-177, TC-181, TC-182

### POL-009 작성자 전용 정보(가격·견적)

- **규칙** (한 문장): 가격 정보(통화·List 단가·List 금액·할인율·벤더 Net 금액)와 견적 정보(환율·할인율·매입 DC율·목표 GP율·판매단가·매입단가·소비자가·원가·공급단가·GP·견적서)는 BoM 건 작성자(작성자 역할 영업·관리자, POL-008)에게만 보낸다. 그 밖의 사용자에게는 가려진 값이 아니라 **필드 자체를 빼고** 응답한다.
- **적용 시점**: BoM 상세·행 목록·버전 비교·검증 결과 조회 API의 응답 직렬화, 견적 API, 원본 벤더 파일 다운로드(가격형 CCW·Dell 원본에는 가격이 들어 있다)
- **위반/실패 시 처리**
  - 작성자가 아니면 가격 필드를 응답에서 제거한다. 값이 `null`인 키로도 보내지 않는다. 화면에는 가격 열과 견적 탭이 없다.
  - 견적·견적서·원본 파일 API는 차단한다. HTTP 403 「이 기능을 사용할 권한이 없습니다.」
  - R4·R9 판정의 금액 상세(POL-025, POL-030)도 작성자에게만 보낸다.
- **예외**: 없다(남의 BoM 건이면 관리자 포함). 표준 BoM xlsx와 검증 리포트 xlsx에는 작성자가 받더라도 가격이 들어가지 않는다(POL-039). 감사 로그에도 금액을 쓰지 않는다(POL-011). BoM 건 복제는 원본 작성자가 아니면 가격 정보·원본 파일을 복사하지 않는다(POL-048).
- **검증 의사코드**:

  ```js
  const PRICE_FIELDS = ["currency", "listUnitPrice", "listAmount", "discountRate", "vendorNetAmount"];
  function serializeRow(row, viewer, bom) {
    const out = {...row};
    if (!(AUTHOR_ROLES.includes(viewer.role) && bom.authorId === viewer.id)) for (const f of PRICE_FIELDS) delete out[f]; // POL-008
    return out;
  }
  // 테스트 기준: 비작성자 응답 JSON에서 PRICE_FIELDS 중 어떤 키도 존재하지 않아야 한다 (!("listAmount" in row))
  ```

- **관련 요구사항**: REQ-015, NFR-005
- **관련 화면**: SCR-005, SCR-007, SCR-008, SCR-009, SCR-013
- **관련 테스트**: TC-013, TC-015, TC-016, TC-017, TC-028, TC-084, TC-087, TC-111, TC-116, TC-159, TC-181, TC-182

### POL-010 역할 변경

- **규칙** (한 문장): 관리자는 사용자를 1명 이상 골라 역할(영업·엔지니어·관리자·역할 미지정) 하나를 한 번에 지정할 수 있다. 자기 자신의 관리자 역할은 바꿀 수 없다. 바뀐 역할은 해당 사용자의 다음 요청부터 적용된다.
- **적용 시점**: 사용자 역할 관리 화면의 [역할 지정], `PATCH /api/users/roles` `{userIds: [...], role}`
- **위반/실패 시 처리**
  - 선택한 사용자가 0명이면 [역할 지정] 버튼이 비활성이다.
  - 선택에 자기 자신이 들어 있고 새 역할이 관리자가 아니면, 요청 전체를 차단한다(일부만 반영하지 않음). 문구: 「자신의 관리자 역할은 해제할 수 없습니다. 선택 목록에서 본인을 빼 주세요.」
  - 성공하면: 「{n}명의 역할을 변경했습니다: {role}」
  - 역할이 바뀐 사용자마다 변경자·일시·이전 역할·새 역할을 기록한다(POL-011).
- **예외**: 이전 역할과 새 역할이 같은 사용자는 기록하지 않고 {n}에서도 뺀다. 역할은 세션에 캐시하지 않고 요청마다 DB에서 읽는다. 역할이 바뀌어도 그 사용자가 작성한 BoM 건은 그대로 남는다(OI-10). 비활성화(POL-047)는 역할 변경과 별개다 — 비활성화해도 역할은 그대로이고, 다시 활성화하면 그 역할로 쓴다.
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
- **관련 테스트**: TC-014, TC-019, TC-020, TC-021, TC-022, TC-158, TC-180

## 6. 운영/어뷰징 정책

신고·제재·금칙어는 해당 없음 — 사내 인증 사용자 전용 서비스이며, 사용자끼리 주고받는 게시물이 없다.

### POL-011 감사 로그 [미확정]

- **규칙** (한 문장): 아래 사건은 발생할 때마다 일시·사용자 ID·사건 종류·대상 ID·결과(성공/실패)를 감사 로그에 한 줄씩 남긴다. 감사 로그는 누구도 수정·삭제할 수 없다.

| 사건 | 대상 ID |
|---|---|
| 로그인 성공·실패(실패 사유 포함 — 비활성 계정 등), 로그아웃 | 사용자 |
| 역할 변경 (이전·새 역할 포함) | 사용자 |
| 사용자 비활성화·다시 활성화 (POL-047) | 사용자 |
| BoM 건 생성·삭제, 파일 업로드. 복제로 만든 건(POL-048)은 생성 기록에 원본 BoM 건·버전·가격 복사 여부를 함께 남긴다 | BoM 건, 파일 |
| 새 버전 생성, 확정, 「확인함」 체크·해제, 「AI 검토 없이 확정」 | 버전, 검증 결과 |
| 견적 생성·저장. 이전 버전 견적에서 만든 견적(POL-049)은 원본 견적 ID·옮긴 행 수·못 옮긴 행 수를 함께 남긴다 | 견적 |
| 모든 다운로드 — 표준 BoM, 검증 리포트, 고객 견적서(양식·형식 포함), 원본 벤더 파일, 감사 로그 CSV(거른 조건·건수, POL-044), EOS 여러 SKU 검색 결과 xlsx(벤더·건수, POL-050). 원가분석표는 폐지(CR-003) | 버전·검증 결과·견적·파일 |
| 환경설정 변경(바뀐 항목 이름만, 값은 남기지 않음) — 견적서 회사 정보, CI 올리기·되돌리기, 견적 기본값·문구, AI·EOS, AI 월 예산, 공지·점검, EOS 캐시 비우기(범위·지운 건수), EOS 관리자 등록·수정·삭제(벤더·키) (POL-040 ~ 043, 046) | 설정 키 |

- 「확인함」 일괄 체크·해제(POL-032)는 **상태가 바뀐 항목마다** 낱건 체크와 같은 형식으로 한 줄씩 남기고, 일괄 여부(`bulk`)를 함께 기록한다. 거부된 일괄 요청은 실패 1줄(대상 건수 포함)을 남긴다(CR-001).

- **적용 시점**: 표의 사건을 처리하는 API가 끝나는 시점(성공과 실패 모두)
- **위반/실패 시 처리**: 다운로드 요청에서 감사 로그를 쓰지 못하면 다운로드도 차단한다. HTTP 500과 문구 「요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.」 나머지 사건은 처리를 끝내고 기록 실패를 서버 오류 로그에 남긴다.
- **예외**: 목록·상세 조회는 기록하지 않는다(감사 로그·AI 사용량·통계 조회 포함). 로그에는 금액·가격 값을 쓰지 않는다(POL-009). **보관 기간은 미정이다(OI-12)** — MVP는 삭제 기능 없이 모두 보관하고, 2차 착수 전에 정한다(D-36). 관리자는 감사 로그 화면(SCR-015)에서 조회하고 CSV로 내보낼 수 있다(POL-044, CR-004).
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

- **관련 요구사항**: NFR-008, REQ-034
- **관련 화면**: SCR-015
- **관련 테스트**: TC-003, TC-006, TC-019, TC-023, TC-036, TC-048, TC-093, TC-104, TC-106, TC-107, TC-108, TC-112, TC-113, TC-116, TC-118, TC-134, TC-156, TC-163, TC-165, TC-166, TC-168, TC-174, TC-175, TC-176, TC-180, TC-182, TC-184

## 7. 법적/개인정보 정책

### POL-012 LLM 전송 범위·기록

- **규칙** (한 문장): LLM은 사내 승인 클라우드 LLM(기업 계약, 학습 미사용)만 호출한다. LLM 입력에는 **구성 필드만** 넣는다. 가격 정보·견적 정보·고객사명·건명·사용자 개인정보는 넣지 않는다.
- **전송 필드**
  - AI 검토 권고(REQ-009): 행 번호, 벤더, 행 유형, 상위 행 번호, 구분, 모듈명, SKU, 품명, 수량, 서비스·구독 기간, 구독 정보
  - EOS AI 검색(REQ-008·019, Cisco·Dell 공통 — D-38): SKU, 품명, 모듈명. 검증의 Dell 조회는 제품 품명만(DEC-56, POL-029). 단건·여러 SKU 검색(REQ-019·040)은 입력한 SKU만
- **근거**: D-11은 전송 범위를 제한하지 않는다. 다만 호환성·누락·불필요 항목 판단에 가격과 고객사명은 필요 없다. 그래서 이 범위로 좁혔고(D-34), 구성 정보 전송은 허용으로 확정했다(D-37, OI-13 해결).
- **적용 시점**: LLM API를 호출하기 직전(서버의 LLM 클라이언트 한 곳에서 검사)
- **위반/실패 시 처리**: 입력에 허용 목록 밖의 필드가 있으면 호출하지 않고 차단한다. 서버 오류 로그에 기록하고, 해당 단계는 실패로 처리한다. 사용자에게는 AI 검토 실패 문구(POL-031) 또는 EOS 「확인 불가」(POL-029)가 표시된다.
- **기록**: LLM 요청·응답 원문을 검증 결과 ID와 함께 저장한다. 보관 기간은 해당 검증 결과와 같다(BoM 건을 삭제하면 함께 삭제). 화면에서는 조회할 수 없고, 사후 추적용으로 DB에만 남긴다. 사용량 집계(토큰·횟수·모델·사용자, 원문 없음)는 BoM 건을 지워도 보관한다(POL-041, CR-002).
- **예외**: 사내 보안 정책이 바뀌어 전송 범위가 달라지면 이 정책의 전송 필드만 고친다. 환경설정의 [연결 테스트](POL-040)는 고정 예시 품목 1건(Cisco `C9300-48UXM-A`)만 보내고 고객 데이터를 보내지 않으며, 같은 전송 필드 검사를 거친다. 호출 기록은 검증 결과 없이 남긴다.
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

- **관련 요구사항**: REQ-009, REQ-008, NFR-007, REQ-031
- **관련 화면**: 해당 없음
- **관련 테스트**: TC-094, TC-095, TC-098, TC-102, TC-103, TC-143, TC-168, TC-171

### POL-013 사용자 정보 수집·보관 [미확정]

- **규칙** (한 문장): 사용자 정보는 Naver Works가 주는 이름·계정(메일)·부서와, 시스템이 기록하는 최초·최근 로그인 일시·비활성화 일시(POL-047, DEC-63)와, 작성자가 견적서 다운로드 창에서 직접 저장한 **내 견적서 기본값**(담당자 연락처 — 본인 전화번호, 부 담당자 이름·전화번호·메일 — 와 하자 보증기간·납기·결제조건, POL-042)만 저장한다. 그 밖의 개인정보는 수집하지 않는다. 내 기본값은 본인만 보고 바꾼다.
- **적용 시점**: SSO 콜백(POL-002), 사용자 목록 화면
- **위반/실패 시 처리**: Naver Works 응답에 계정 ID·이름·메일 중 하나라도 없으면 로그인을 실패로 처리하고 세션을 만들지 않는다. 문구: 「Naver Works 계정 정보를 받지 못했습니다. 관리자에게 문의해 주세요.」
- **예외**: 부서가 없으면 빈 값으로 저장한다. Naver Works 계정이 비활성화된 사용자(퇴사자 등)는 로그인할 수 없지만, BoM 작성자 표시를 위해 사용자 정보는 남긴다. **보관·파기 기간은 미정이다(OI-12)** — MVP는 삭제하지 않고 보관하며, 2차 착수 전에 정한다(D-36).
- **검증 의사코드**:

  ```js
  const USER_FIELDS = ["nwId", "name", "email", "dept", "role", "firstLoginAt", "lastLoginAt", "disabledAt", "docDefaults"];
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
- **진행 표시**: 「고정 규칙 검사 중」 → 「EOS 조회 중 ({완료}/{전체})」 → 「AI 검토 중」. 단계별 시간 한도는 NFR-003을 따른다. EOS·AI 시간 한도(기본 120초·90초, 관리자 설정 — POL-040)를 넘기면 각 정책의 실패 처리를 따른다(POL-029, POL-031).
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
    const cfg = readSetting("llm", envDefaults(), checkLlm);          // 시작할 때 한 번 (POL-040)
    const findings = [...fixedRules(version.rows)];                  // R1~R7, R9
    findings.push(...await eosRule(version.rows, {timeoutSec: cfg.eosTimeoutSec})); // R8 (기본 120)
    const ai = await aiReview(version.rows, {timeoutSec: cfg.aiTimeoutSec});        // {ok, recommendations} (기본 90)
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

- **규칙** (한 문장): 검증할 때 표준 BoM의 조회 단위(Cisco는 개별 SKU, Dell은 제품 품명 — DEC-56)마다 EOS를 조회해 상태를 붙인다. MVP의 조회 방식은 **Cisco·Dell 모두 AI 웹 검색**이고(D-19, D-38), 관리자 등록값(POL-043)이 있으면 그것을 캐시·AI 검색보다 먼저 쓴다. 판정 등급은 아래 표를 따른다.

| EOS 상태 | 조건 | 판정 (Cisco·Dell 공통) |
|---|---|---|
| 판매중 | 유효한 출처가 있고 EoS 공지가 없음 | 없음 |
| EoS 예정 | End-of-Sale 일자 > 검증일 | 경고 |
| 판매 종료 | End-of-Sale 일자 ≤ 검증일 | 경고 (D-21, D-38 — AI 결과만으로 확정을 막지 않음) |
| 확인 불가 | AI 검색 실패·시간 초과, 결과에 유효한 출처 없음, AI가 SKU를 찾지 못함 | 경고 |

- **P1 (REQ-029)**: Cisco EoX API를 연동하면 Cisco만 API로 조회한다. 그때 Cisco 「판매 종료」는 **오류**이고, API가 정상 응답했는데 레코드가 없으면 「판매중」이다(D-28). 레코드 없음과 잘못된 PID의 구분은 API 계정을 확보한 뒤 정한다.
- **조회 단위** (DEC-56, CR-003)
  - Cisco: 개별 SKU다. 중복 SKU는 한 번만 조회한다. 행의 EOS 상태는 그 행 SKU들 중 가장 나쁜 상태다. 나쁜 순서: 판매 종료 > EoS 예정 > 확인 불가 > 판매중.
  - Dell: 구성품 SKU는 조회하지 않고 **제품 품명**으로 조회한다. 하위 제품이 있으면 하위 제품 품명, 없으면(서버) 상위 품목 품명의 「/」 뒤 제품명이다(예: `4. GPU 서버 / PowerEdge XE7740` → `PowerEdge XE7740`). 하위 제품이 있는 상위 품목은 조회하지 않는다. 같은 품명은 한 번만 조회한다.
  - Dell 구성품 행은 소속 제품(가장 가까운 하위 제품, 없으면 상위 품목)의 EOS 상태를 이어받고, R8 판정은 **제품 행에만 1건** 붙는다.
  - 단건·여러 SKU 검색(REQ-019·040)은 Cisco·Dell 모두 입력한 SKU로 조회한다.
- **검증일**: 검증을 시작한 시각의 KST 날짜
- **AI 검색 결과 형식** (LLM 응답 JSON, 입력 필드는 POL-012): `{status: "ON_SALE"|"EOS_ANNOUNCED"|"END_OF_SALE"|"NOT_FOUND", eosAnnounceDate, endOfSaleDate, ldosDate, replacementSku, sourceUrls: []}`
  - **AI 검색 호출**: SKU(품명)당 웹 검색 횟수는 기본 3회이고, 시간 한도·모델·생각 강도와 함께 관리자가 바꿀 수 있다(POL-040). 설정은 검증·단건 검색을 시작할 때 한 번 읽는다.
  - **유효한 출처** (DEC-57, CR-003): `https://`로 시작하고 호스트가 그 벤더의 공식 도메인 또는 참고 사이트이거나 그 하위 도메인인 URL. 공식 도메인은 Cisco `cisco.com`, Dell `dell.com`·`delltechnologies.com`이고(D-35, D-38), 참고 사이트는 `router-switch.com`(EOL/EOSL 자료)이다. 같은 목록을 웹 검색 허용 도메인으로도 쓰며, AI에는 공식 사이트를 먼저 보게 한다. 유효한 출처가 없으면 결과와 상관없이 「확인 불가」다. 관리자 등록값(POL-043)은 관리자가 확인한 근거이므로 도메인을 검사하지 않는다.
  - 날짜가 있으면 날짜로 상태를 정한다(`status`와 날짜가 어긋나면 날짜가 우선).
- **조회 순서**: 관리자 등록값(POL-043, 만료 없음) → 캐시 → AI 검색.
- **캐시**: 키는 (벤더, 대문자 SKU)이고, Dell 품명 조회는 (벤더, `PRODUCT:` + 대문자 품명)이다. 유효 기간은 **7일**이다. 「확인 불가」 결과는 캐시하지 않는다 — 단 「확인 불가(SKU를 찾지 못함)」은 7일 캐시한다(DEC-37: 찾지 못한 SKU 를 재검증마다 다시 찾느라 드는 토큰을 막는다). 호출 실패·시간 초과·출처 없음은 캐시하지 않는다. 단건 검색(REQ-019)의 [다시 조회]는 캐시를 쓰지 않고 새로 조회한 뒤 캐시를 갱신한다(관리자 등록값이 있으면 그대로 쓰고 AI를 부르지 않는다). 관리자가 SCR-014에서 전체·벤더·고른 항목 단위로 비울 수 있고, 비워도 관리자 등록값은 남는다(POL-040, POL-043).
- **표시 문구** (판정·단건 검색 공통, Cisco·Dell 공통)
  - 판매중: 「판매중 (AI 검색 결과 — 틀릴 수 있습니다, 출처: {url})」
  - EoS 예정: 「EoS 예정 — {dates} (출처: {url})」
  - 판매 종료: 「판매 종료로 보입니다 (AI 검색 결과 — 틀릴 수 있습니다) — {dates} (출처: {url})」
  - `{dates}`는 「End-of-Sale {date}」와 「LDoS {date}」를 「, 」로 이은 것이다. 값이 없는 날짜는 그 항목을 뺀다.
  - 관리자 등록값(POL-043): 「판매중 (관리자 등록, 출처: {url})」 / 「EoS 예정 — {dates} (관리자 등록, 출처: {url})」 / 「판매 종료 — {dates} (관리자 등록, 출처: {url})」
  - 확인 불가: 「EOS 정보를 확인하지 못했습니다 — {reason}」. 사유는 「AI 검색 응답 없음」·「조회 시간 초과」·「AI 검색 결과에 출처가 없음」·「SKU를 찾지 못함」 중 하나다.
  - 대체 SKU가 있으면 끝에 「 · 대체 제품: {sku}」를 붙인다. 모든 결과에 조회 일시와 「AI 검색 결과」 표시(관리자 등록값은 「관리자 등록」)를 함께 보여준다. 출처 URL이 여러 개면 첫 번째 유효한 URL을 쓴다.
- **적용 시점**: 검증 ② 단계(REQ-008), SKU EOS 단건 검색 `GET /api/eos?vendor=&sku=`(REQ-019), 여러 SKU 검색(REQ-040, POL-050)
- **위반/실패 시 처리**
  - 검증: 표의 등급으로 판정한다. 시간 한도(기본 120초, POL-040) 안에 끝나지 않은 SKU(품명)는 「확인 불가(조회 시간 초과)」로 판정하고, 나머지 검증은 끝까지 진행한다. 관리자가 AI 호출을 껐거나 서버 설정이 꺼 두었으면 관리자 등록값·캐시가 없는 조회는 「확인 불가」다(POL-040).
  - 단건 검색 입력 오류: 벤더를 고르지 않으면 「벤더를 선택해 주세요.」, SKU가 비었거나 쉼표가 있으면 「SKU를 하나만 입력해 주세요.」, 형식이 R3와 맞지 않으면 「{vendor} SKU 형식이 아닙니다.」
  - 단건 검색 실패(AI 검색 실패·시간 초과·출처 없음): 「EOS 정보를 가져오지 못했습니다」 [다시 시도]
  - 단건 검색에서 AI가 `NOT_FOUND`로 답하면: 「{vendor} 자료에서 찾을 수 없는 SKU입니다 (AI 검색 결과 — 틀릴 수 있습니다)」
- **예외**: Cisco 부속·자리표시 SKU(-NONE, -BLANK, 케이블 등)는 EoS 공지가 없어 AI가 출처를 내지 못하면 「확인 불가」 경고가 된다(PRD 리스크 3). P1에서 EoX API로 바꾸면 이 경고는 「판매중」이 된다(D-28).
- **검증 의사코드**:

  ```js
  const WORST = ["판매 종료", "EoS 예정", "확인 불가", "판매중"];
  const OFFICIAL = {Cisco: ["cisco.com"], Dell: ["dell.com", "delltechnologies.com"]}; // D-35, D-38
  const REFERENCE = ["router-switch.com"];                                          // DEC-57
  const hosts = vendor => [...OFFICIAL[vendor], ...REFERENCE];   // 웹 검색 허용 도메인 = 출처 검사 목록
  const validSource = (vendor, u) => { try { const x = new URL(u); return x.protocol === "https:" && hosts(vendor).some(h => x.hostname === h || x.hostname.endsWith("." + h)); } catch { return false; } };
  function statusByDates(r, today) {
    if (r.endOfSaleDate) return r.endOfSaleDate <= today ? "판매 종료" : "EoS 예정";
    return "판매중";
  }
  function lookup(key) {                                 // 조회 순서: 관리자 등록 → 캐시(7일) → AI 검색
    return overrides.get(key) ?? cache.get(key) ?? aiSearch(key, cfg);   // cfg: POL-040 시간 한도·웹 검색 횟수
  }
  function eosOf(vendor, today, res) {                   // res = lookup() 결과
    if (res.timeout) return {status: "확인 불가", reason: "조회 시간 초과"};
    if (res.error) return {status: "확인 불가", reason: "AI 검색 응답 없음"};
    const src = res.manual ? res.sourceUrls : (res.sourceUrls ?? []).filter(u => validSource(vendor, u));
    if (src.length === 0) return {status: "확인 불가", reason: "AI 검색 결과에 출처가 없음"};
    if (res.status === "NOT_FOUND") return {status: "확인 불가", reason: "SKU를 찾지 못함"};
    return {status: statusByDates(res, today), ...res, sourceUrls: src};
  }
  // 조회 단위 (DEC-56)
  function productOf(row, rows) {                        // Dell: 가장 가까운 하위 제품, 없으면 상위 품목
    for (let r = row; r; r = rows.byId(r.parentRowId)) {
      if (r.rowType === "하위 제품") return r;
      if (r.rowType === "상위 품목") return rows.some(c => c.parentRowId === r.id && c.rowType === "하위 제품") ? null : r;
    }
    return null;
  }
  const productName = p => (p.rowType === "상위 품목" && p.name.includes("/") ? p.name.split("/").at(-1) : p.name).trim();
  function eosKeys(row, rows) {
    if (row.vendor === "Dell") { const p = productOf(row, rows); return p ? [["Dell", "PRODUCT:" + productName(p).toUpperCase()]] : []; }
    return (row.sku ?? "").split(",").map(s => s.trim()).filter(Boolean).map(s => ["Cisco", s.toUpperCase()]);
  }
  function r8(row, rows, perKey) {
    const list = eosKeys(row, rows).map(k => perKey[k]);
    if (!list.length) return [];
    const worst = list.sort((a, b) => WORST.indexOf(a.status) - WORST.indexOf(b.status))[0];
    row.eosStatus = worst.status;                                      // Dell 구성품은 제품 상태를 이어받는다
    if (row.vendor === "Dell" && productOf(row, rows)?.id !== row.id) return [];  // R8 판정은 제품 행에만
    if (worst.status === "판매중") return [];
    return [finding("R8", "경고", row, "EOS 상태", eosMessageCode(worst), worst)]; // MVP는 모두 경고 (D-38). P1 EoX API: Cisco 판매 종료 = 오류
  }
  ```

- **관련 요구사항**: REQ-008, REQ-019, REQ-033
- **관련 화면**: SCR-005, SCR-007, SCR-011, SCR-014
- **관련 테스트**: TC-094, TC-095, TC-096, TC-097, TC-142, TC-143, TC-144, TC-145, TC-146, TC-157, TC-167, TC-174, TC-175, TC-184

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
  - LLM 호출 실패, 시간 한도(기본 90초, POL-040) 초과, JSON 오류, 전송 필드 위반(POL-012)이면 AI 단계를 실패로 기록한다. 관리자가 AI 호출을 껐거나 서버 설정이 꺼 두었을 때도 같다(POL-040). 「AI 검토를 완료하지 못했습니다」와 [다시 시도]를 표시하고, 고정 규칙·EOS 결과는 그대로 둔다.
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
- **관련 테스트**: TC-090, TC-098, TC-099, TC-100, TC-101, TC-132, TC-167

### POL-032 BoM 확정 조건

- **규칙** (한 문장): 작성자는 작성중 버전의 최신 검증이 현재 내용 기준(`검증 완료`)이고, 오류가 0건이고, 모든 경고·검토 권고에 「확인함」이 체크되어 있을 때 확정할 수 있다. AI 단계가 실패했으면 「AI 검토 없이 확정합니다」에도 체크해야 한다(D-30).
- **적용 시점**: [확정] 버튼 활성 여부, 확정 확인 대화상자, `POST /api/versions/{id}/confirm`, 「확인함」 일괄 체크·해제 `PUT /api/validations/{id}/ack`
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
  - **일괄 체크·해제(CR-001)**: 작성자는 판정 표·권고 표마다 화면에 보이는(필터를 거친) 체크 가능 항목(경고·검토 권고)을 한 번에 체크·해제할 수 있다. 이미 체크된 항목의 체크한 사람·일시는 바꾸지 않는다.
  - 한 요청의 항목 중 하나라도 체크할 수 없으면(오류 판정 포함, 다른 검증 결과의 항목, 확정 버전, 재검증 필요) **아무것도 바꾸지 않는다**. 거부 문구는 낱건과 같다: 오류 판정 → HTTP 409 「확인함은 경고·검토 권고에만 체크할 수 있습니다.」, 재검증 필요 → HTTP 409 「BoM이 수정되었습니다. 다시 검증해 주세요.」, 없는 항목 → HTTP 404.
  - 체크할 때는 확인 대화상자 「표시된 {n}건을 모두 「확인함」으로 체크합니다.」 [체크] [취소]를 띄운다({n} = 아직 체크하지 않은 대상 수). 해제는 대화상자 없이 바로 한다.
  - 완료 토스트: 체크 「{n}건을 「확인함」으로 체크했습니다.」 / 해제 「{n}건의 「확인함」을 해제했습니다.」({n} = 실제로 상태가 바뀐 항목 수)
- **검증 의사코드**:

  ```js
  function canConfirm(version, user, {skipAi = false} = {}) {
    if (version.status !== "작성중") return block("MSG_CONFIRMED_LOCKED");
    if (version.authorId !== user.id || !AUTHOR_ROLES.includes(user.role)) return block("FORBIDDEN", {status: 403}); // POL-008
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

  // 「확인함」 일괄 체크·해제 (CR-001) — 전부 되거나 전부 안 된다
  function bulkAck(validation, user, findingIds, recommendationIds, acked) {
    assertAuthor(user, validation.bom);                                  // 아니면 403 FORBIDDEN
    const items = [...findingIds.map(findingOf), ...recommendationIds.map(recOf)];
    if (items.some(i => !i || i.validationId !== validation.id)) return reject(404);
    guardAckable(validation);                                            // 확정 버전 / MSG_REVALIDATE → 409
    if (items.some(i => i.kind === "판정" && i.grade !== "경고")) return reject(409, "MSG_ACK_NOT_ALLOWED");
    const changed = items.filter(i => (acked ? !i.ackBy : !!i.ackBy));   // 이미 같은 상태면 건드리지 않는다
    for (const i of changed) Object.assign(i, acked ? {ackBy: user.id, ackAt: now()} : {ackBy: null, ackAt: null});
    commit();                                                            // 한 트랜잭션
    for (const i of changed) audit("확인함 체크·해제", {item: i, acked, bulk: true});   // POL-011
    return {changed: changed.length};
  }
  ```

- **관련 요구사항**: REQ-011
- **관련 화면**: SCR-007
- **관련 테스트**: TC-080, TC-088, TC-098, TC-104, TC-105, TC-106, TC-107, TC-153, TC-163

## 10. 견적·출력 정책

### POL-033 견적 생성·저장 조건

> **v1.2 변경(CR-003, DEC-58)**: 견적 계산을 인성정보 견적서 표준양식(VER1) 방식으로 바꿨다. 저장 조건에서 「기본 마진율」이 빠지고, ①은 「공급단가를 정할 수 없는 행」으로 바뀌었다.

- **규칙** (한 문장): 견적은 **확정 버전 하나**를 기준으로 그 BoM 건의 작성자(작성자 역할 영업·관리자, POL-008)만 만든다. 한 확정 버전으로 여러 견적을 만들 수 있다. 아래 저장 조건을 모두 만족해야 견적을 저장하고 견적서를 내려받을 수 있다.
- **저장 조건** (DEC-58, 검사 순서 DEC-13)
  - ① 견적서에 넣는 금액 합산 대상 행(POL-034, 「견적서 제외」 행은 뺀다) 중 **공급단가를 정할 수 없는 행**이 0개. 판매단가 직접입력도 없고 소비자가(List 단가 또는 견적에서 입력한 소비자가)도 없는 행이다. 가격은 있는데 통화·환율만 빈 행은 ①이 아니라 ②·③으로 알린다. 번들 포함 구성품은 ①에 넣지 않는다.
  - ② 통화가 빈 합산 대상 행(번들 포함 구성품 제외)이 있으면 그 행의 통화가 선택됨
  - ③ 합산 대상 행에 있는 KRW 외 통화마다 환율이 입력됨
  - ②·③은 「견적서 제외」 행도 검사한다(제외 행도 원가 계산에 들어간다 — POL-036).
  - 「기본 마진율이 입력됨」 조건은 폐지했다(DEC-58).
- **번들 포함 구성품**: Cisco 구성품 중 List 금액이 비어 있고, 상위 품목의 List 금액은 비어 있지 않은 행이다. CCW 하단 주석의 「child line 값은 bundle 가격에 포함」 규칙을 따르며, 소비자가·원가·공급단가 모두 0원으로 계산한다(화면 표시 「번들 포함」).
- **소비자가 입력**: List 단가가 없는 합산 대상 행(번들 포함 구성품 제외)에는 견적 화면에서 소비자가 단가(행 통화)를 넣을 수 있다. 값은 0 이상이고 소수점 둘째 자리까지다. 이 값은 그 견적에만 저장한다. 형식은 POL-035를 따른다.
- **새 견적의 처음 값**: 행 매입 DC율 = 그 행 가격 정보의 할인율(빈 값이면 빈 값), 전체 설정의 단가 단위·최소 GP율 = 관리자 견적 기본값(POL-040, 기본 1,000원·10%), 그 밖의 전체 설정·행별 입력·환율은 빈 값이다. 이전 버전 견적에서 만들면 POL-049를 따른다.
- **견적 기록**: 견적 ID, 기준 BoM 버전, 환율, 전체 설정(전체 DC율·기본 매입 DC율·전체 목표 GP율·단가 단위·최소 GP율), 행별 입력(할인율·목표 GP율·판매단가 직접입력·매입 DC율·매입단가 직접입력·소비자가 입력·통화·견적서 제외), 견적서 머리(POL-037), 수정 번호, 작성 일시·최종 수정 일시
- **적용 시점**: [견적 만들기] `POST /api/versions/{id}/quotes`, 즉시 재계산 `POST /api/quotes/{id}/calculate`(저장하지 않음), 견적 저장 `PUT /api/quotes/{id}`, 견적서 다운로드 직전(저장된 값으로 다시 검사)
- **위반/실패 시 처리**: 차단(저장·다운로드 불가). HTTP 409와 첫 사유의 문구, 사유 전체 목록을 반환한다. 화면 배너에는 사유를 모두 나열한다.
  - 작성중 버전: [견적 만들기]를 표시하지 않는다. API는 「확정된 버전으로만 견적을 만들 수 있습니다.」로 거부한다.
  - ①: 「단가가 없는 행이 {n}개 있습니다」와 해당 행 목록(행 번호·SKU·품명)을 표시한다.
  - ②: 「통화를 선택해 주세요: 행 {rows}」
  - ③: 「환율을 입력해 주세요: {currency}」
- **예외**: 견적은 확정 뒤에도 계속 고칠 수 있다(잠금 없음). 다운로드는 그 시점에 저장된 값으로 만든다. 새 버전을 만들어도 이전 버전의 견적은 새 버전으로 복사하지 않는다(필요하면 POL-049로 가져온다). 화면은 계산하지 않고 서버 계산 결과만 표시한다.
- **검증 의사코드**:

  ```js
  function isBundleIncluded(row, rows) {
    const p = rows.find(r => r.id === row.parentRowId);
    return row.vendor === "Cisco" && row.rowType === "구성품" && row.listAmount == null && p?.listAmount != null;
  }
  function checkPol033(version, quote, calc) {          // calc: POL-034 ~ 036 계산 (서버 한 곳)
    if (version.status !== "확정") return block("QUOTE_NEEDS_CONFIRMED");
    const rows = calc.summableRows(), out = [];
    const missing = rows.filter(r => !calc.isExcluded(r) && calc.unitPrice(r) == null
      && !(calc.baseUnit(r) != null && calc.fx(calc.currency(r)) == null));   // 통화·환율만 빈 행은 ②·③
    if (missing.length) out.push(blocker("MISSING_PRICE", {n: missing.length}, missing));
    const noCur = rows.filter(r => !calc.currency(r) && !isBundleIncluded(r, version.rows));
    if (noCur.length) out.push(blocker("PICK_CURRENCY", {rows: noCur.map(r => r.rowNo).join(", ")}));
    for (const c of calc.foreignCurrencies()) if (quote.fx[c] == null) out.push(blocker("FX_REQUIRED", {currency: c}));
    return out;                                          // 비어 있으면 저장 가능. API 409 문구 = out[0]
  }
  ```

- **관련 요구사항**: REQ-016
- **관련 화면**: SCR-009, SCR-010
- **관련 테스트**: TC-108, TC-117, TC-118, TC-120, TC-122, TC-123, TC-124, TC-129, TC-130, TC-139, TC-155, TC-166, TC-183

### POL-034 소비자가·원가 계산

> **v1.2 변경(CR-003, DEC-58)**: 정책명 「원가 계산」 → 「소비자가·원가 계산」. `원가 = floor(List 금액 × (1 − DC율) × 환율)`을 표준양식 「견적서」 시트 L ~ X열 방식(소비자가 → 매입 DC → 원가 단가, 원 단위 반올림)으로 바꿨다.

- **규칙** (한 문장): 금액 합산 대상 행마다 원화 **소비자가 단가(LP)** = `ROUND(List 단가 × 환율)`, **원가 단가** = 매입단가 직접입력이 있으면 그 값, 없으면 `ROUND(LP × (1 − 매입 DC율 ÷ 100))`로 계산하고, 원가 합 = 원가 단가 × 수량이다. 계산은 인성정보 견적서 표준양식(VER1) 「견적서」 시트 L ~ X열 수식과 같고, 모두 Decimal로 한다(NFR-012).
- **금액 합산 대상 행**
  - Cisco: 모든 품목 행. 상위 품목(번들) 가격과 구성품 가격은 별개다. 번들 포함 구성품은 0원이다(POL-033).
  - Dell: 구성품 행, 그리고 구성품이 하나도 없는 상위 품목 행. 구성품이 있는 상위 품목과 하위 제품은 구성품 금액의 합이므로 **제외**한다(이중 계산 방지).
- **List 단가**: 가격 정보의 List 단가(POL-019). 없으면 List 금액 ÷ 수량. 둘 다 없으면 견적에서 입력한 소비자가(POL-033).
- **환율**: 행 통화(견적에서 고른 통화 > 가격 정보의 통화)가 KRW면 1, 그 밖에는 견적에 입력한 값
- **매입 DC율**: 행 값 > 전체 기본 매입 DC율. 행 값의 처음 값은 BoM 가격 정보의 할인율이다(POL-033). 매입 DC율도 매입단가 직접입력도 없으면 그 행은 원가가 없고 GP 계산에서 빠진다(POL-036).
- **ROUND**: 원 단위 반올림(0.5 올림, 표준양식 `ROUND`와 같음)
- **적용 시점**: 견적 화면에서 값을 입력하거나 바꿀 때(서버 `POST /api/quotes/{id}/calculate`로 즉시 재계산 — 화면은 계산하지 않는다), 견적 저장, 견적서 생성. 미리보기·저장·견적서가 모두 같은 계산 하나를 쓴다.
- **위반/실패 시 처리**: 계산할 수 없는 행이 있으면 저장 조건(POL-033)에서 차단한다. 원가만 없는 행은 차단하지 않고 경고한다(POL-036). 계산 자체는 실패하지 않는다.
- **예외**: 반올림은 행 단가에서만 한다. 금액 합과 합계는 반올림된 단가 × 수량을 더한다(합계를 다시 반올림하지 않음). 견적에서 바꾼 값은 표준 BoM 가격 정보를 바꾸지 않는다.
- **샘플 기대 결과** (표준양식 「예시_견적서A」 — 기본 매입 DC 80%)
  - List 단가 2,219,393원, 매입 DC 80% → 원가 단가 ROUND(443,878.6) = **443,879원**
  - List 단가 1,904,460원, 행 매입 DC 86% → 원가 단가 ROUND(266,624.4) = **266,624원**
  - List 단가 62,975,530원, 매입 DC 80% → 원가 단가 **12,595,106원**
  - USD 1,000 × 환율 1,385.50 → 소비자가 단가 **1,385,500원** (수량 3 → 소비자가 합 4,156,500원)
- **검증 의사코드**:

  ```js
  const ROUND = d => d.toDecimalPlaces(0, ROUND_HALF_UP);
  function summableRows(rows) {
    return rows.filter(r => r.vendor === "Cisco"
      || r.rowType === "구성품"
      || (r.rowType === "상위 품목" && !rows.some(c => c.parentRowId === r.id)));
  }
  function baseUnit(row, quote) {                         // 행 통화 기준 단가
    if (row.listUnitPrice != null) return D(row.listUnitPrice);
    if (row.listAmount != null && row.qty) return D(row.listAmount).div(row.qty);
    return quote.rows[row.id]?.listPrice ?? null;          // 견적에서 입력한 소비자가
  }
  function lp(row, quote) {
    const cur = quote.rows[row.id]?.currency ?? row.currency;
    const fx = cur === "KRW" ? D(1) : quote.fx[cur];
    const base = baseUnit(row, quote);
    return base != null && fx != null ? ROUND(base.mul(fx)) : null;
  }
  function costUnit(row, quote) {
    const q = quote.rows[row.id] ?? {};
    if (q.costPrice != null) return D(q.costPrice);                       // 매입단가 직접입력
    const pdc = q.purchaseDc ?? quote.settings.purchaseDc;                // 행 매입 DC > 기본 매입 DC
    const l = lp(row, quote);
    return l != null && pdc != null ? ROUND(l.mul(D(1).sub(D(pdc).div(100)))) : null;
  }
  // 번들 포함 구성품: lp = null, costUnit = 0, unitPrice = 0 (POL-033)
  ```

- **관련 요구사항**: REQ-016, NFR-012
- **관련 화면**: SCR-009
- **관련 테스트**: TC-118, TC-119, TC-120, TC-121, TC-122, TC-130

### POL-035 환율·할인율·GP율 입력

> **v1.2 변경(CR-003, DEC-58)**: 정책명 「환율·DC율 입력」 → 「환율·할인율·GP율 입력」. 행별 할인율·목표 GP율·판매단가·매입 DC율·매입단가와 전체 설정을 더했고, **구분별 DC율 일괄 입력([적용])은 폐지**했다(행별 입력과 전체 설정으로 대체, DEC-55 대체).

- **규칙** (한 문장): 견적 입력값은 아래 표의 범위·형식을 따른다. 모두 소수점 둘째 자리까지이며, 형식을 벗어난 값은 저장하지 않는다.

| 입력 | 어디에 | 범위 | 위반 문구 |
|---|---|---|---|
| 환율 | 통화마다 | 0 초과 **100,000 이하** | 「환율은 0보다 크고 100,000 이하인 숫자여야 합니다. (소수점 둘째 자리까지)」 |
| 할인율 DC · 매입 DC율 | 행별, 전체(전체 DC율·기본 매입 DC율) | **0.00 ~ 100.00%** (CCW 샘플에 93.95% 있음) | 「DC율은 0~100 사이 숫자여야 합니다. (소수점 둘째 자리까지)」 |
| 목표 GP율 · 최소 GP율 | 행별(목표 GP율), 전체(전체 목표 GP율·최소 GP율) | **0 이상 100 미만 %** (`원가 ÷ (1 − GP율)`이 정의되어야 한다) | 「GP율은 0 이상 100 미만 숫자여야 합니다. (소수점 둘째 자리까지)」 |
| 판매단가 직접입력 · 매입단가 직접입력 · 소비자가 입력 | 행별 | 0 이상 (원. 소비자가 입력은 행 통화) | 「단가는 0 이상 숫자여야 합니다. (소수점 둘째 자리까지)」 |
| 단가 단위 | 전체 | 1 · 10 · 100 · 1,000 · 10,000원 중 하나, 또는 비움(원 단위) | 「입력값을 확인해 주세요.」 (화면은 선택 상자) |

- **처음 값**: POL-033 「새 견적의 처음 값」. 빈 칸은 「값 없음」이고, 공급단가·원가는 다음 우선순위로 넘어간다(POL-034, POL-036).
- **적용 시점**: 견적 화면 입력칸(전체 설정·행별·환율), `POST /api/quotes/{id}/calculate`, 견적 저장 `PUT /api/quotes/{id}`
- **위반/실패 시 처리**: 범위·형식을 벗어나면 입력칸 아래에 문구를 표시하고, 그 값은 계산에서 빈 값으로 본다. 견적 저장은 차단한다(HTTP 400, 첫 오류 문구 + 칸별 오류 목록).
- **예외**: 견적에서 바꾼 값은 견적에만 저장하고, 표준 BoM 가격 정보는 바꾸지 않는다(REQ-016). 환율 자동 조회는 하지 않는다(D-07). 모든 행이 KRW이면 환율 칸 대신 「모든 행이 KRW입니다. 환율을 입력하지 않아도 됩니다.」를 표시한다.
- **검증 의사코드**:

  ```js
  const FX_MAX = D(100000); // D-35
  const ROUND_UNITS = [1, 10, 100, 1000, 10000];
  const dp2 = s => /^\d+(\.\d{1,2})?$/.test(String(s).replace(/,/g, ""));
  const parse = (v, ok, code) => v == null || String(v).trim() === "" ? null   // 빈 값 = 값 없음
    : dp2(v) && ok(D(v)) ? D(v) : block(code);
  const checkFx    = v => parse(v, d => d.gt(0) && d.lte(FX_MAX), "FX_RANGE");
  const checkDc    = v => parse(v, d => d.gte(0) && d.lte(100), "DC_RANGE");      // 할인율·매입 DC율
  const checkGp    = v => parse(v, d => d.gte(0) && d.lt(100), "GP_RANGE");       // 목표 GP율·최소 GP율
  const checkPrice = v => parse(v, d => d.gte(0), "UNIT_PRICE_RANGE");            // 판매단가·매입단가·소비자가
  const checkUnit  = v => v == null || v === "" || ROUND_UNITS.includes(Number(v)) ? ok() : block("VALIDATION_FAILED");
  ```

- **관련 요구사항**: REQ-016
- **관련 화면**: SCR-009
- **관련 테스트**: TC-120, TC-125, TC-126, TC-128 (TC-127 구분별 일괄 적용은 삭제 — CR-003)

### POL-036 공급단가·GP

> **v1.2 변경(CR-003, DEC-58)**: 정책명 「견적가·마진율」 → 「공급단가·GP」. 마진율(`floor(원가 × (1 + 마진율))`, D-29·D-31)을 폐지하고 표준양식의 할인율·목표 GP 방식으로 바꿨다. 문구 「마진율은 0.0~100.0 사이 숫자여야 합니다. (소수점 첫째 자리까지)」도 폐지했다.

- **규칙** (한 문장): 행별 공급단가는 **판매단가 직접입력 > 행 목표 GP율 > 행 할인율 > 전체 목표 GP율 > 전체 할인율 > 소비자가** 순서에서 처음으로 정해지는 값이다. GP율로 정하면 `원가 단가 ÷ (1 − GP율 ÷ 100)`, 할인율로 정하면 `LP × (1 − 할인율 ÷ 100)`이고, 이 산출값은 단가 단위로 반올림한다. 공급가 합 = 공급단가 × 수량이다.

| 순서 | 적용 방식 (화면 표시) | 조건 | 공급단가 |
|---|---|---|---|
| 1 | 직접입력 | 판매단가 직접입력이 있음 | 입력값 그대로 |
| 2 | 행 GP | 행 목표 GP율이 있고 원가 단가가 있음 | `반올림(원가 단가 ÷ (1 − 행 GP율))` |
| 3 | 행 DC | 행 할인율이 있고 LP가 있음 | `반올림(LP × (1 − 행 할인율))` |
| 4 | 전체 GP | 전체 목표 GP율이 있고 원가 단가가 있음 | `반올림(원가 단가 ÷ (1 − 전체 GP율))` |
| 5 | 전체 DC | 전체 DC율이 있고 LP가 있음 | `반올림(LP × (1 − 전체 DC율))` |
| 6 | 소비자가 | LP가 있음 | LP |
| — | 번들 | 번들 포함 구성품(POL-033) | 0 |

- **단가 단위 반올림**: `ROUND(x ÷ 단위) × 단위`(0.5 올림). 단가 단위가 비어 있으면 원 단위 반올림이다. 직접입력·소비자가는 반올림하지 않는다.
- **행 지표**: GP = 공급가 합 − 원가 합, GP율 = GP ÷ 공급가 합, 실 DC율 = 1 − 공급단가 ÷ LP. 원가가 없으면 GP·GP율이 없다.
- **최소 GP율**: GP율이 최소 GP율(전체 설정, 처음 값 POL-040)보다 낮은 행은 화면에 표시하고 경고한다(차단하지 않음).
- **손익 요약** (견적 화면, 고객 견적서에는 넣지 않는다)
  - 소비자가 합계 = 견적서에 넣는 행의 LP × 수량 합
  - **공급가액** = 견적서에 넣는 행의 공급가 합의 합 = 견적서 합계(VAT 별도, POL-037)
  - 원가 = 합산 대상 행 **전부**의 원가 합(견적서 제외 행 포함 — 제외해도 벤더에서 사는 품목이다)
  - GP = 원가가 있는 견적서 행의 GP 합 − 견적서 제외 행의 원가 합, GP율 = GP ÷ 원가가 있는 견적서 행의 공급가 합
  - 평균 DC = 1 − (LP가 있는 견적서 행의 공급가 합 ÷ 소비자가 합계)
  - 부가세 = `floor(공급가액 × 0.1)`, 합계금액 = 공급가액 + 부가세
  - 표시: 「소비자가 합계 {lp} · 공급가액 {supply} · 원가 {cost} · GP {gp} ({gpRate}) · 평균 DC {avgDc}」, 「합계금액(VAT 포함) {total}원」
- **적용 시점**: 견적 화면 전체 설정·행별 입력(즉시 재계산 `POST /api/quotes/{id}/calculate`), 견적 저장, 견적서 생성
- **위반/실패 시 처리**: 입력 형식은 POL-035, 저장 조건은 POL-033에서 차단한다. 아래는 경고(차단 아님)다.
  - 원가가 없는 견적서 행: 「원가를 알 수 없는 행이 {n}개 있습니다. 이 행은 GP 계산에서 빠집니다.」
  - 최소 GP율 미달 행: 「GP율이 최소 GP율({min}%)보다 낮은 행이 {n}개 있습니다.」
  - 화면 안내: 「행에 입력한 값이 전체 값보다 먼저 쓰입니다. 공급단가 = 판매단가 직접입력 > 행 목표 GP > 행 할인율 > 전체 목표 GP > 전체 할인율 > 소비자가」
- **예외**: 공급가 합은 공급단가 × 수량이므로 견적서의 단가 × 수량과 금액이 항상 같다(D-29의 「몇 원 차이」는 더 이상 생기지 않는다). 이 방식은 기존 원가분석표 관행(D-15, PRD 리스크 12)을 표준양식 그대로 옮긴 것이다(DEC-58).
- **샘플 기대 결과** (표준양식 「예시_견적서A」 — 전체 DC 77%, 기본 매입 DC 80%, 단가 단위 1,000원, 최소 GP 10%)
  - List 단가 2,219,393원 × 252, 행 입력 없음 → 전체 DC: 반올림(510,460.39) = **510,000원**, 공급가 합 **128,520,000원**
  - List 단가 1,904,460원 × 252, 행 할인율 84%·행 매입 DC 86% → 행 DC: 반올림(304,713.6) = **305,000원**, 공급가 합 **76,860,000원** (원가 단가 266,624원)
  - List 단가 62,975,530원 × 1, 행 목표 GP 15% → 행 GP: 반올림(12,595,106 ÷ 0.85) = **14,818,000원**, GP **2,222,894원**(15.00%), 실 DC 76.47%
  - 같은 행에 목표 GP 5% → 최소 GP율 10% 미달 경고 1행
- **검증 의사코드**:

  ```js
  const roundUnit = (d, unit) => unit ? ROUND(d.div(unit)).mul(unit) : ROUND(d);
  function unitPrice(row, quote) {                        // → {price, method}
    const q = quote.rows[row.id] ?? {}, s = quote.settings, unit = s.roundUnit;
    if (isBundleIncluded(row, quote.bomRows)) return {price: D(0), method: "BUNDLE"};
    const l = lp(row, quote), c = costUnit(row, quote);
    if (q.salePrice != null) return {price: D(q.salePrice), method: "DIRECT"};
    if (q.targetGp != null && c != null) return {price: roundUnit(c.div(D(1).sub(D(q.targetGp).div(100))), unit), method: "ROW_GP"};
    if (q.saleDc != null && l != null) return {price: roundUnit(l.mul(D(1).sub(D(q.saleDc).div(100))), unit), method: "ROW_DC"};
    if (s.targetGp != null && c != null) return {price: roundUnit(c.div(D(1).sub(D(s.targetGp).div(100))), unit), method: "ALL_GP"};
    if (s.saleDc != null && l != null) return {price: roundUnit(l.mul(D(1).sub(D(s.saleDc).div(100))), unit), method: "ALL_DC"};
    if (l != null) return {price: l, method: "LIST"};
    return {price: null, method: null};                   // 저장 조건 ① (POL-033)
  }
  function line(row, quote) {
    const {price, method} = unitPrice(row, quote), c = costUnit(row, quote), qty = D(row.qty ?? 0);
    const amount = price?.mul(qty), cost = c?.mul(qty);
    const gp = amount != null && cost != null ? amount.sub(cost) : null;
    const gpRate = gp != null && !amount.isZero() ? gp.div(amount) : null;
    const belowMin = gpRate != null && quote.settings.minGp != null && gpRate.lt(D(quote.settings.minGp).div(100));
    return {price, method, amount, cost, gp, gpRate, belowMin};
  }
  ```

- **관련 요구사항**: REQ-017
- **관련 화면**: SCR-009, SCR-010
- **관련 테스트**: TC-118, TC-119, TC-129, TC-130, TC-134

### POL-037 고객 견적서

> **v1.2 변경(CR-003 DEC-59·60·61, CR-002, CR-004)**: 배치를 인성정보 견적서 표준양식(VER1) 「견적서」·「Summary」 시트로 바꿨다. 문서번호 형식, 거래 조건 6항목, 견적 담당(정·부), 구매 확인란, 공급자 회사 정보·CI(관리자 설정), Summary형 뒤 상세 견적서, EOS × 유효기간 표시를 더했다. 소비자가 열과 Summary형 세부 시트, 「무상유지보수」 입력은 없앴다.

- **규칙** (한 문장): 고객 견적서는 견적마다 **견적서(단일 표형)** 또는 **Summary(견적 요약 + 견적서 상세)**를 골라 xlsx 또는 PDF로 만든다. 배치는 인성정보 견적서 표준양식(VER1) 「견적서」·「Summary」 시트를 따른다(DEC-59). 어느 머리글에도 원가·DC율·할인율·마진율·환율·GP가 없어야 하고, 합계는 「견적서 제외」 행을 뺀 공급가액(POL-036)과 원 단위까지 같아야 한다.
- **견적서 제외**
  - 견적 화면에서 합산 대상 행마다 「견적서 제외」를 체크할 수 있다. Dell 상위 품목·하위 제품을 체크하면 그 아래 행이 모두 제외된다.
  - [AI 권고 불필요 항목 일괄 제외]를 누르면, 기준 버전의 최신 검증에서 「고객에게 불필요한 항목」 권고를 받은 행에 한 번에 체크한다.
  - 제외는 견적에만 저장하고, 표준 BoM에서는 행을 지우지 않는다.
- **입력 항목** (견적마다 저장, D-33 — 견적서 다운로드 창)

| 항목 | 규칙 | 처음 값 |
|---|---|---|
| 견적일자 | 날짜 | 오늘 |
| 견적명 | 1~100자 | BoM 건명 |
| 수신 / 참조 | 각 0~50자 | 빈 값. 입력 예시 「예) ABC 주식회사 귀중」 / 「예) 홍길동 상무님」 |
| 견적 유효기간 | 1~90일 정수 | 관리자 설정(POL-040, 기본 14일) |
| 하자 보증기간 | 0~50자, 선택지 또는 직접 입력 | 내 견적서 기본값(POL-042) > 「{n} Months」(구분 SERVICE 행 기간의 최빈값, 같으면 긴 기간) > 관리자 설정(기본 「제조사 정책에 따름」) |
| 장비 설치지원 | 0~50자, 선택지 또는 직접 입력 | 관리자 설정(기본 「별도 협의」) |
| 납기 / 장소 | 0~100자, 선택지 또는 직접 입력 | 내 견적서 기본값 > 관리자 설정(기본 「발주 후 4주 이내 / 귀사 지정 장소」) |
| 대금 결제조건 | 0~100자, 선택지 또는 직접 입력 | 내 견적서 기본값 > 관리자 설정(기본 「계산서 발행 후 60일 이내」) |
| 특기사항 | 0~200자 | 빈 값 |
| 담당자 HP / 담당자(부) / 담당자(부) HP / 담당자(부) E-mail | 0~30 / 30 / 30 / 100자 | 내 견적서 기본값(없으면 빈 값) |
| 상세 내역 (Summary형, 상위 품목마다) | 0~500자 | 상위 품목 품명 |
| 견적 담당(정) 이름·메일 | 자동 | 작성자 이름·메일 |
| 양식 · 형식 | 견적서 / Summary, xlsx / PDF | 그 견적에서 마지막으로 고른 값 |

  - 거래 조건 4종(하자 보증기간·장비 설치지원·납기/장소·대금 결제조건)의 선택지와 처음 값은 관리자 설정(SCR-014, POL-040)이다. 견적에 저장한 머리가 있으면 처음 값 대신 그 값을 쓴다.
  - [다운로드] 때 머리를 견적에 저장한다(`PUT /api/quotes/{id}/doc-header`, 견적 수정 번호 검사 — POL-005). 입력이 규칙을 벗어나면 저장도 다운로드도 하지 않는다.
- **공통 머리** (두 양식)
  - 제목: 견적서 `QUOTATION`·`견   적   서`, Summary `SUMMARY`·`견   적   요   약`
  - 문서번호: `{접두어}{YY}-{MMDD}-Q{견적 ID 4자리}` — 날짜는 견적일자, 접두어는 관리자 설정(POL-040, 기본 `ISI`). 예: `ISI26-1006-Q0012`
  - 견적일자, 수신(TO), 참조(ATTN), 견적명, 견적 담당(이름 · ⓜ 담당자 HP · ⓔ 메일)
  - 공급자: 관리자가 설정한 회사 정보·CI(POL-040, 기본값 = 표준양식 「기준정보」) — 영문 회사명·영문 주소·전화/팩스 머리글과 CI 2종, 사업자번호·상호·대표자·주소·업태·종목. 직인 이미지는 넣지 않는다.
  - 견적금액 합계(VAT 포함)와 한글 금액 `일금 {한글 금액}원정`(Excel `NUMBERSTRING(n, 1)` 방식. 예: 358,224,900 → 삼억오천팔백이십이만사천구백)
- **품목 표 열** (두 양식 공통): NO / 구분(Category) / 모델명 / Part No. / 상세 내역(Product Description) / 수량(Q'ty) / 공급단가(Unit Price) / 공급가 합(Total Price) / 비고(Remarks)
  - 구분 = PRODUCT·SERVICE·SOFTWARE·미분류, 모델명 = SKU, 상세 내역 = 품명, 공급단가·공급가 합 = POL-036. **소비자가 열은 넣지 않는다.**
  - 비고: 구분 SERVICE·SOFTWARE 행은 기간 `{n}개월`, 그 밖에는 빈칸
  - Dell 상위 품목(구성품 있음)·하위 제품은 금액 칸이 빈 묶음 제목 행으로 넣는다.
  - 표 위에 `(단위 : 원)`, 머리글 행은 페이지마다 반복한다.
- **합계 3행**: 공급가액(VAT 별도) / 부가가치세(VAT 10%) = `floor(공급가액 × 0.1)` / 합계금액(VAT 포함)
- **거래 조건·견적 담당 표**: 하자 보증기간 · 장비 설치지원 · 납기 / 장소 · 대금 결제조건 · 견적 유효기간(`견적일로부터 {n}일`) · 특기사항, 그리고 담당자(정)·HP·E-mail·담당자(부)·HP·E-mail
- **견적서 (단일 표형, 시트 「견적서」)**: 공통 머리 → 품목 표(합산 대상 행에 NO 1부터) → 합계 3행 → 거래 조건·견적 담당 → 구매 확인란(하단 발주 문구 — 관리자 설정 POL-040, 발주처·서명(인)·담당자/연락처 빈칸)
- **Summary (시트 「Summary」 + 「견적서」)** (DEC-59, DEC-61)
  - 「Summary」 시트: 공통 머리 → 거래 조건·견적 담당 → 품목 표 → 합계 3행. 품목 표는 상위 품목마다 블록이다: 블록 머리 행(NO `n`, 구분 `견적 n`, 모델명 = Cisco 상위 품목 SKU(Dell은 빈칸), 상세 내역 = 입력한 상세 내역(빈 값이면 상위 품목 품명)) → 그 상위 품목과 자손 중 합산 대상이면서 제외되지 않은 행(NO `n-k`, Dell 하위 제품은 묶음 제목 행) → `소계`. 넣을 행이 없는 상위 품목은 블록을 만들지 않는다.
  - 뒤에 「견적서」 시트를 붙인다 — 단일 표형과 같은 내용이며 상세 내역 입력은 쓰지 않는다. PDF는 Summary 페이지 뒤에 새 페이지로 견적서를 잇는다.
  - 소계의 합 = 품목 공급가 합의 합 = 공급가액이어야 한다.
- **PDF**: A4 세로, 한글 글꼴 내장, 품목 표 머리글을 페이지마다 반복한다. 품목·수량·금액은 같은 견적의 xlsx와 같다.
- **EOS × 견적 유효기간 표시** (DEC-60, CR-003)
  - 견적 화면과 견적서 다운로드 창에만 표시한다. **견적서 파일에는 넣지 않고, 저장·다운로드를 막지 않는다.**
  - 기준은 기준 버전 최신 검증의 행 End-of-Sale 일자다(POL-029 — Dell 구성품은 소속 제품의 값). 미검증이면 표시하지 않는다.
  - End-of-Sale < 견적일 → 행 EOS 열에 「판매 종료」, 견적일 ≤ End-of-Sale ≤ 견적일 + 유효기간 → 「유효기간 내 판매 종료」
  - 경고 배너: 「견적일 이전에 판매가 끝난 품목이 {n}개 있습니다: {items}」 / 「견적 유효기간({until}까지) 안에 판매가 끝나는 품목이 {n}개 있습니다: {items}」. 배너는 견적서 제외 행을 빼고, Dell 구성품은 빼고 제품 행으로 한 번만 센다. `{items}`는 SKU(없으면 품명) 목록이다.
  - 견적 화면은 저장된 견적일·유효기간, 다운로드 창은 입력 중인 값으로 비교한다.
- **적용 시점**: [견적서 다운로드] → 다운로드 창(양식·형식·머리 입력), `PUT /api/quotes/{id}/doc-header`, `GET /api/quotes/{id}/document?form=single|summary&type=xlsx|pdf`
- **위반/실패 시 처리**
  - 저장 조건(POL-033)을 만족하지 않으면 다운로드를 차단하고(HTTP 409) 해당 문구를 표시한다.
  - 입력 항목이 규칙을 벗어나면 저장을 차단하고 입력칸 아래에 문구를 표시한다(HTTP 400): 「{field}은(는) {max}자 이내로 입력해 주세요.」({field} = 견적명·수신·참조·하자 보증기간·장비 설치지원·납기 / 장소·결제조건·특기사항·담당자 HP·담당자(부)·담당자(부) HP·담당자(부) E-mail·상세 내역) / 「유효기간은 1~90일 사이 정수여야 합니다.」 / 견적명이 비면 「견적명을 입력해 주세요.」
  - 견적서 제외를 반영한 뒤 품목이 0행이면 다운로드를 차단한다: 「견적서에 넣을 품목이 없습니다. 견적서 제외를 해제해 주세요.」
  - 제외 행 중 공급가 합이 0원이 아닌 행이 있으면 경고(차단 아님)를 표시한다: 「견적서에서 제외한 행 중 금액이 있는 행이 {n}개 있습니다. 이 금액은 견적서 합계에서 빠집니다.」
  - 생성한 파일에서 금지 값이 발견되면(아래 의사코드) 파일을 내보내지 않는다. 문구: 「견적서를 만들지 못했습니다. 관리자에게 문의해 주세요.」 서버 오류로 기록한다. Summary형은 Summary와 상세 견적서 모두 검사한다.
  - 성공하면 「견적서를 내려받았습니다.」 다운로드마다 일시·견적 ID·양식·형식·버전을 기록한다(POL-011).
- **예외**: VAT는 합계 3행으로 별도·포함을 모두 적는다(D-35, OI-07 해결). 파일명은 POL-007을 따른다(Summary형도 `견적서`). 회사 정보·CI·발주 문구·문서번호 접두어·거래 조건 선택지는 다운로드 시점의 관리자 설정을 쓰고, 이미 받은 파일은 바뀌지 않는다(POL-040). xlsx는 수식 없이 값으로 만든다.
- **검증 의사코드**:

  ```js
  function lines(quote, rows) {
    return summableRows(rows).filter(r => !isExcluded(quote, r, rows)).map(r => ({row: r, ...line(r, quote)}));  // POL-036
  }
  function docTotal(quote, rows) { return lines(quote, rows).reduce((s, l) => s.add(l.amount), D(0)); }  // = 공급가액
  function docNumber(dateIso, quoteId, prefix = "ISI") {                // prefix: POL-040
    const [y, m, d] = dateIso.split("-");
    return `${prefix}${y.slice(2)}-${m}${d}-Q${String(quoteId).padStart(4, "0")}`;
  }
  function summaryBlocks(quote, rows) {                  // 상위 품목마다 `견적 n` 블록
    return topRows(rows).map(top => lines(quote, rows).filter(l => l.row.id === top.id || isDescendant(rows, l.row, top)))
      .filter(ls => ls.length)
      .map((ls, i) => ({no: i + 1, items: ls, subtotal: ls.reduce((s, l) => s.add(l.amount), D(0))}));
  }
  const vat = supply => supply.mul("0.1").floor();
  const FORBIDDEN_HEADERS = ["원가", "DC율", "할인율", "마진율", "환율", "GP"];
  function assertNoForbidden(doc, quote, rows) {          // Summary형은 Summary·상세 견적서 모두
    // 금지 머리글이 없고, 숨김 시트·숨김 행/열·이름 정의·메모가 없고, 합계가 docTotal과 같아야 한다
    if (doc.headers.some(h => FORBIDDEN_HEADERS.some(f => h.includes(f)))) return block("DOC_BUILD_FAILED");
    if (doc.hiddenSheets.length || doc.hiddenRanges.length || doc.definedNames.length || doc.comments.length) return block("DOC_BUILD_FAILED");
    if (!D(doc.totalCell).eq(docTotal(quote, rows))) return block("DOC_BUILD_FAILED");
    if (doc.form === "summary" && !sum(doc.subtotals).eq(docTotal(quote, rows))) return block("DOC_BUILD_FAILED");
    return ok();
  }
  // EOS × 유효기간 (DEC-60) — 화면·다운로드 창만
  function eosFlag(endOfSale, quoteDate, validDays) {
    if (!endOfSale) return null;
    if (endOfSale < quoteDate) return "판매 종료";
    return endOfSale <= addDays(quoteDate, validDays) ? "유효기간 내 판매 종료" : null;
  }
  ```

- **관련 요구사항**: REQ-018, REQ-009, REQ-030, REQ-032
- **관련 화면**: SCR-009, SCR-010
- **관련 테스트**: TC-132, TC-133, TC-134, TC-135, TC-136, TC-137, TC-138, TC-139, TC-156, TC-165, TC-166, TC-173, TC-185

### POL-038 원가분석표 [폐지]

> **폐지(CR-003, DEC-58)** — 2026-10-02. 원가분석표 xlsx(REQ-028)와 `GET /api/quotes/{id}/cost-analysis.xlsx`, 견적 화면 [원가분석표 다운로드]를 없앴다. 품목별 원가·매입 DC·GP·GP율과 손익 요약(매출·원가·GP)은 **견적 화면**에서 본다(POL-034 ~ POL-036). 고객 견적서에는 이 값들을 넣지 않는다(POL-037). 아래는 v1.1 승인 내용으로, 이력 확인용으로만 남긴다.

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

- **관련 요구사항**: REQ-028(폐지)
- **관련 화면**: SCR-009 ([원가분석표 다운로드] 삭제)
- **관련 테스트**: TC-139, TC-140(삭제 — CR-003), TC-141

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

## 11. 관리자 운영·편의 기능 정책 (CR-002 · CR-004)

v1.2에서 추가했다. 정책 분류는 정책 목록 표를 따른다(운영 · 권한/등급 · 콘텐츠/데이터 · 검증 · 견적·출력). 화면 문구의 `{field}`는 칸 이름(환경설정은 화면의 항목 이름)으로 바뀐다.

### POL-040 환경설정 (관리자)

- **규칙** (한 문장): 관리자는 SCR-014에서 아래 표의 값을 바꿀 수 있고, 저장한 값이 없는 항목은 기본값(이 기능 이전의 고정값·서버 env)으로 동작한다.

| 묶음 | 항목 | 기본값 | 규칙 | 반영 시점 |
|---|---|---|---|---|
| 견적서 회사 정보 | 사업자번호 · 상호 · 대표자 · 주소 · 업태 · 종목 · 영문 회사명 · 영문 주소 · 전화·팩스(머리글) | 표준양식 「기준정보」 시트 값 | 모두 필수. 최대 12 · 100 · 50 · 200 · 100 · 100 · 100 · 200 · 100자. 줄바꿈·제어 문자 금지. 사업자번호 `000-00-00000` | 이후 다운로드하는 견적서 |
| 견적서 회사 정보 | CI — 견적서 머리(xlsx·PDF), 회사 정보 옆(xlsx) | 기본 CI 이미지 | PNG·JPG(파일 머리 바이트로 판별), 2MB 이하, 가로·세로 각 4,000px 이하, 열리는 이미지. 원래 CI 자리 안에 비율을 지켜 맞춘다 | 이후 다운로드하는 견적서 |
| 견적 기본값 | 최소 GP율 · 단가 단위 | 10% · 1,000원 | GP율 0 이상 100 미만(소수 둘째 자리) · 1 / 10 / 100 / 1,000 / 10,000원 | **새로 만드는 견적부터** |
| 견적 기본값 | 견적 유효기간 처음 값 | 14일 | 1 ~ 90일 | 견적서 다운로드 창(저장 안 한 견적) |
| 견적서 거래 조건 | 하자 보증기간 · 장비 설치지원 · 납기/장소 · 대금 결제조건 — 선택지와 처음 값 | 표준양식 「기준정보」 목록 · 「제조사 정책에 따름」·「별도 협의」·「발주 후 4주 이내 / 귀사 지정 장소」·「계산서 발행 후 60일 이내」 | 선택지 1 ~ 10개(빈 줄·중복 제거), 항목마다 견적서 머리 입력의 최대 글자 수(50 · 50 · 100 · 100자). 처음 값 필수. 보증기간은 서비스 행 기간이 있으면 「{n} Months」가 먼저다(내 견적서 기본값이 있으면 그것이 더 먼저 — POL-042) | 견적서 다운로드 창 |
| 견적서 문구 | 하단 발주 문구 · 문서번호 접두어 | 「당사는 이 견적서 상의 가격 및 조건들을 수용하고, 본 견적서를 귀사에 대한 공식 발주서로 대신하고자 합니다.」 · `ISI` | 1 ~ 300자, 제어 문자 금지 · 영문 대문자·숫자 1 ~ 8자 | 이후 다운로드하는 견적서 |
| AI·EOS | AI 호출 켜기 | 켬 | 끄면 이후 검증은 「AI 검토 실패」·「EOS 확인 불가」 경로(POL-029·031·032) | 이후 시작하는 검증·EOS 검색 |
| AI·EOS | EOS 검색 모델 · AI 검토 모델 | 서버 env `LLM_MODEL`(Claude Sonnet 5.5) | 검증한 모델 목록(Claude Sonnet 5.5, Claude Opus 5.5)과 서버 env 값만 | 〃 |
| AI·EOS | EOS · AI 검토 시간 한도 | 서버 env(120초 · 90초) | 30 ~ 300초 정수(서버 env 값은 범위 밖이어도 허용) | 〃 |
| AI·EOS | EOS · AI 검토 생각 강도 | 낮음 · 보통 | 낮음 / 보통 / 높음 | 〃 |
| AI·EOS | EOS · AI 검토 최대 출력 토큰 | 4,000 · 16,000 | 1,000 ~ 16,000 · 2,000 ~ 32,000 | 〃 |
| AI·EOS | SKU(품명)당 웹 검색 횟수 | 3 | 1 ~ 10 | 〃 |

- 같은 화면의 [AI 사용량]·[EOS 관리]·[공지·점검] 탭은 POL-041·POL-043·POL-046을 따른다(CR-002 2차, CR-004).
- **적용 시점**: SCR-014 저장, `GET·PUT /api/settings/company`, `GET·PUT·DELETE /api/settings/company/logos/{en|ko}`, `GET·PUT /api/settings/quote`, `GET·PUT /api/settings/llm`, `POST /api/settings/llm/test`, `POST /api/settings/eos-cache/clear`. 읽는 쪽: 견적 생성·견적 조회(거래 조건)·견적서 다운로드, 검증 시작·AI 다시 시도·EOS 단건 검색
- **위반/실패 시 처리**: 저장하지 않고 입력칸 아래에 문구를 표시한다(HTTP 400, 첫 오류 문구 + 전체 목록).

| 경우 | 문구 |
|---|---|
| 필수 항목 비어 있음 | 「{field}을(를) 입력해 주세요.」 |
| 길이 초과 | 「{field}은(는) {max}자 이내로 입력해 주세요.」 |
| 줄바꿈·제어 문자 | 「줄바꿈과 제어 문자는 입력할 수 없습니다.」 |
| 사업자번호 형식 | 「사업자번호는 000-00-00000 형식으로 입력해 주세요.」 |
| 목록 밖 값(모델·생각 강도·단가 단위) | 「{field} 값을 목록에서 골라 주세요.」 |
| 정수 범위 밖 | 「{field}은(는) {min} ~ {max} 사이 정수로 입력해 주세요.」 |
| 선택지 개수 | 「{field} 선택지는 1 ~ {max}개로 입력해 주세요.」 |
| 최소 GP율 | 「GP율은 0 이상 100 미만 숫자여야 합니다. (소수점 둘째 자리까지)」 |
| 유효기간 | 「유효기간은 1~90일 사이 정수여야 합니다.」 |
| 문서번호 접두어 | 「문서번호 접두어는 영문 대문자·숫자 1 ~ 8자로 입력해 주세요.」 |
| CI 2MB 초과 / 형식 / 열리지 않음·4,000px 초과 | 「이미지는 2MB 이하만 올릴 수 있습니다.」 / 「PNG 또는 JPG 이미지만 올릴 수 있습니다.」 / 「이미지 파일을 읽을 수 없습니다.」 |
| 서버 설정이 AI 호출을 꺼 둔 상태에서 [연결 테스트] | HTTP 409 「서버 설정(LLM_ENABLED·API 키)에서 AI 호출이 꺼져 있습니다. 관리자 화면에서 켤 수 없습니다.」 |

- 성공 토스트: 「저장했습니다.」, CI 「CI 이미지를 바꿨습니다.」·「기본 CI 이미지로 되돌렸습니다.」, 캐시 「EOS 캐시 {n}건을 지웠습니다.」. 캐시 비우기 확인 대화상자: 「EOS 결과 캐시 {n}건을 모두 지웁니다. 이후 검증·검색은 AI 로 새로 조회합니다(비용이 듭니다).」 [비우기] [취소]
- **예외**
  - 서버 env `LLM_ENABLED=false` 또는 API 키 없음이면 관리자 「켜기」와 상관없이 AI를 호출하지 않는다(env가 하드 스위치). 화면에 「서버 설정에서 AI 호출이 꺼져 있어, 여기서 켜도 검증은 「AI 검토 실패」·「EOS 확인 불가」로 끝납니다.」를 표시한다.
  - 저장된 값 중 지금 규칙에 맞지 않는 항목은 기본값으로 읽는다(AI·EOS는 항목별, 견적 기본값·문구는 묶음 전체). 설정 오류로 견적서·검증이 멈추지 않게 한다.
  - [연결 테스트]는 「끄기」 상태에서도 실행한다. 보내는 데이터는 고정 예시 품목 1건(Cisco `C9300-48UXM-A`)뿐이고, 호출 기록은 `llm_calls`에 남긴다(POL-012).
  - 진행 중인 검증은 시작할 때 읽은 설정으로 끝난다. 이미 받은 견적서 파일과 이미 만든 견적의 단가 단위·최소 GP율은 바뀌지 않는다.
  - EOS 캐시 기간(7일)·EOS 동시 조회 수·출처 도메인·AI 프롬프트·권고 분류·검증 규칙은 이 설정 대상이 아니다(코드·정책서로만 바꾼다).
- **검증 의사코드**:

  ```js
  function readSetting(key, defaults, check) {          // 견적서·검증·EOS 검색이 쓰는 값
    const saved = db.appSettings[key]?.value;
    if (!saved) return defaults;                        // 저장값 없음 = 이전과 같다
    const {value, errors} = check({...defaults, ...saved}, defaults);
    return errors.length ? defaults : value;            // 규칙에 맞지 않으면 기본값 (AI·EOS 는 항목별)
  }
  function saveSetting(user, key, input, defaults, check) {
    if (user.role !== "관리자") return reject(403, "FORBIDDEN");
    const {value, errors} = check(input, defaults);
    if (errors.length) return reject(400, errors);      // 칸별 문구
    const changed = diffKeys(readSetting(key, defaults, check), value);
    if (changed.length) { db.appSettings[key] = {value, updatedAt: now(), updatedBy: user.id};
                          audit("환경설정 변경", {target: key, fields: changed}); }   // 값은 기록하지 않는다
    return value;
  }
  function llmFor(run) {                                 // 검증·단건 검색 시작 때 한 번
    const cfg = readSetting("llm", envDefaults(), checkLlm);
    return (!cfg.enabled || !env.LLM_ENABLED || !env.API_KEY) ? disabledLlm() : claude(cfg);
  }
  ```

- **관련 요구사항**: REQ-030, REQ-018, REQ-008, REQ-009, REQ-019
- **관련 화면**: SCR-014, SCR-010
- **관련 테스트**: TC-164, TC-165, TC-166, TC-167, TC-168, TC-169, TC-170

### POL-041 AI 사용량 집계·월 예산

- **규칙** (한 문장): AI(Claude) 호출은 1건마다 사용량 기록(용도·모델·결과·입력/출력 토큰·웹 검색 횟수·사용자·BoM 건, 원문 없음)을 남기고, 관리자는 SCR-014 [AI 사용량]에서 기간별 집계와 정가 기준 추정 비용을 본다. 월 예산을 정하면 이번 달 추정 비용이 경고 비율·예산에 닿을 때 관리자에게 알리지만 **AI 호출은 막지 않는다**.
- **용도** (4종)

| 용도 | 무엇 | 사용자 | BoM 건 |
|---|---|---|---|
| 검증 — EOS 조회 | 검증 ② 단계의 EOS AI 검색(POL-029) | 검증을 시작한 사람 | 기록 |
| 검증 — AI 검토 | 검증 ③ 단계·AI [다시 시도](POL-031) | 검증을 시작한 사람 | 기록 |
| EOS 단건 검색 | SCR-011 단건·여러 SKU 검색의 AI 검색(POL-050) | 검색한 사람 | 없음 |
| 연결 테스트 | SCR-014 [연결 테스트](POL-040) | 테스트한 관리자 | 없음 |

- **추정 비용** (Anthropic 정가, 2026-09 기준, USD): Claude Sonnet 5.5 입력 $2·출력 $10, Claude Opus 5.5 입력 $4·출력 $20(1M 토큰당), 웹 검색 $10 / 1,000회. `비용 = 입력 토큰 × 입력 단가 ÷ 1M + 출력 토큰 × 출력 단가 ÷ 1M + 웹 검색 × 0.01`. 토큰·웹 검색이 모두 0인 호출(호출 전 차단 등)은 0이다. 단가표에 없는 모델은 비용에서 빼고 건수로 따로 센다.
- **집계**: 합계(호출·실패·입력 토큰·출력 토큰·웹 검색·추정 비용), 용도별, 모델별, 사용자별, 일별, 월별, BoM 건별(검증 호출만, 비용·호출이 많은 순 20건). 실패 = 결과가 성공이 아닌 호출(오류·시간 초과·거부·전송 필드 차단).
- **조회 기간**: 이번 달(기본) / 지난 달 / 직접 지정. KST 날짜, 양 끝 포함, 최대 366일.
- **월 예산**: 월 예산(USD) — 비우면 예산을 쓰지 않는다(경고 없음). 0 초과 1,000,000 이하, 소수 둘째 자리까지. 경고 비율 — 1 ~ 100 정수(%), 기본 80.
- **예산 판정**: 이번 달(1일 ~ 오늘, KST) 추정 비용이 예산 이상이면 「초과」, 예산 × 경고 비율 이상이면 「경고」다. 관리자에게만 모든 화면 맨 위에 배너로 보이고 [사용량 보기]로 [AI 사용량] 탭을 연다.
- **적용 시점**: 모든 LLM 호출 직후(기록), `GET /api/settings/llm/usage?from=&to=`, `PUT /api/settings/llm/budget`, `GET /api/notice`(예산 경고 — 관리자 응답에만)
- **위반/실패 시 처리**
  - 시작일이 종료일보다 늦으면: 「시작일이 종료일보다 늦습니다.」 / 366일을 넘으면: 「조회 기간은 1년(366일) 이내로 골라 주세요.」 (HTTP 400)
  - 기간에 호출이 없으면: 「{from} ~ {to} 기간에 AI 호출이 없습니다.」
  - 단가를 모르는 모델이 섞이면: 「단가를 모르는 모델 {n}건은 비용에서 뺐습니다」
  - 월 예산 형식 위반: 「월 예산은 0보다 크고 1,000,000 이하인 금액(소수 둘째 자리까지)으로 입력해 주세요.」 / 경고 비율: 「{field}은(는) {min} ~ {max} 사이 정수로 입력해 주세요.」
  - 경고 배너: 「이번 달 AI 추정 비용이 월 예산의 {pct}%입니다. (${cost} / ${budget})」 / 초과 배너: 「이번 달 AI 추정 비용이 월 예산을 넘었습니다. ({pct}%, ${cost} / ${budget}) 호출은 막지 않습니다.」
  - 예산 변경은 감사 로그에 남긴다(환경설정 변경, 바뀐 항목 이름만 — POL-011). 사용량 조회는 기록하지 않는다.
- **예외**: 추정 비용은 정가 기준이라 계약 단가·할인과 다를 수 있다(화면에 단가와 함께 안내). 사용량 기록은 BoM 건을 지워도 남는다 — LLM 요청·응답 원문(`llm_calls`)은 POL-012대로 BoM 건과 함께 지운다. 이 기능 이전의 호출은 기존 원문 기록에서 옮겨 담았고, 그중 검증 밖 EOS 호출은 「EOS 단건 검색」으로 센다(연결 테스트의 EOS 1건과 구분하지 못함).
- **검증 의사코드**:

  ```js
  const PRICES = {"claude-sonnet-5-5": [2, 10], "claude-opus-5-5": [4, 20]}, WEB_PER_1K = 10;   // USD, 2026-09 정가
  function estimateCost(r) {
    if (!r.inputTokens && !r.outputTokens && !r.webSearches) return D(0);
    const p = PRICES[r.model]; if (!p) return null;                      // 단가 없음 → 비용에서 뺀다
    return D(r.inputTokens).mul(p[0]).div(1e6).add(D(r.outputTokens).mul(p[1]).div(1e6)).add(D(r.webSearches).mul(WEB_PER_1K).div(1000));
  }
  function checkRange(from, to) {
    if (from > to) return block("SEARCH_DATE_ORDER");
    if (daysBetween(from, to) >= 366) return block("USAGE_RANGE_TOO_LONG");
    return ok();
  }
  function budgetStatus(budget, monthCost) {               // monthCost = 이번 달 1일 ~ 오늘 추정 비용
    if (budget.monthlyUsd == null) return null;
    const level = monthCost.gte(budget.monthlyUsd) ? "over"
      : monthCost.mul(100).gte(D(budget.monthlyUsd).mul(budget.warnPct)) ? "warn" : "ok";
    return {level, pct: monthCost.div(budget.monthlyUsd).mul(100).toDecimalPlaces(0, ROUND_HALF_UP)};
  }
  // 배너: user.role === "관리자" && level !== "ok" 일 때만
  ```

- **관련 요구사항**: REQ-031, REQ-008, REQ-009
- **관련 화면**: SCR-014 (예산 경고 배너는 관리자의 전 화면 상단)
- **관련 테스트**: TC-171, TC-172

### POL-042 내 견적서 기본값

- **규칙** (한 문장): 작성자는 견적서 다운로드 창에서 7칸(담당자 HP · 담당자(부) · 담당자(부) HP · 담당자(부) E-mail · 하자 보증기간 · 납기 / 장소 · 대금 결제조건)을 「내 기본값」으로 저장할 수 있고, 저장한 칸은 그 뒤 머리를 아직 저장하지 않은 견적의 처음 값이 된다. 빈 칸은 관리자 설정(POL-040)을 쓴다.

| 칸 | 최대 | 처음 값 우선순위 (머리를 저장하지 않은 견적) |
|---|---|---|
| 담당자 HP · 담당자(부) · 담당자(부) HP | 30자 | 내 기본값 > 빈 값 |
| 담당자(부) E-mail | 100자 | 내 기본값 > 빈 값 |
| 하자 보증기간 | 50자 | 내 기본값 > 「{n} Months」(SERVICE 행 기간) > 관리자 설정 |
| 납기 / 장소 · 대금 결제조건 | 100자 | 내 기본값 > 관리자 설정 |

- **저장 방법**: 다운로드 창 담당자 칸 아래 체크박스 「담당자 연락처·하자 보증기간·납기·결제조건을 내 기본값으로 저장 — 다음에 만드는 견적에 자동으로 채워집니다」. 내 기본값이 하나도 없으면 체크된 채로, 있으면 해제된 채로 연다. 체크하고 [다운로드]하면 견적서 머리 저장과 함께 7칸을 지금 입력값으로 덮어쓴다(빈 칸은 빈 값으로 저장 → 다음 견적에서 관리자 설정을 쓴다).
- **적용 시점**: 견적서 다운로드 창 [다운로드] `PUT /api/quotes/{id}/doc-header {…, saveMyDefaults: true}`, 견적 조회(처음 값 계산)
- **위반/실패 시 처리**: 길이 검사는 견적서 머리(POL-037)와 같다. 위반이면 머리와 내 기본값 **둘 다** 저장하지 않고 입력칸 아래에 「{field}은(는) {max}자 이내로 입력해 주세요.」를 표시한다.
- **예외**: 이미 머리를 저장한 견적은 내 기본값이 바뀌어도 그대로다. 저장된 값 중 규칙(문자열·최대 글자 수)에 맞지 않는 칸은 빈 칸으로 읽는다. 장비 설치지원·특기사항·수신·참조는 내 기본값 대상이 아니다. 내 기본값은 본인 견적에서만 쓰고, 사용자 목록·감사 로그에는 내보내지 않으며 감사 사건도 아니다.
- **검증 의사코드**:

  ```js
  const MY_DOC_FIELDS = ["ownerPhone", "subName", "subPhone", "subEmail", "warrantyTerm", "delivery", "paymentTerms"];
  function myDocDefaults(saved) {                       // 규칙에 맞는 칸만
    return Object.fromEntries(MY_DOC_FIELDS.map(k => {
      const v = typeof saved?.[k] === "string" ? saved[k].trim() : "";
      return [k, [...v].length <= DOC_LIMITS[k] ? v : ""];
    }));
  }
  function docHeaderDefaults(quote, bom, rows, cfg, author) {          // cfg: POL-040 견적 설정
    const months = warrantyMonths(rows);                               // SERVICE 행 기간 최빈값
    const base = {validDays: cfg.validDays, install: cfg.termDefaults.install, delivery: cfg.termDefaults.delivery,
      paymentTerms: cfg.termDefaults.paymentTerms, warrantyTerm: months != null ? `${months} Months` : cfg.termDefaults.warrantyTerm,
      ownerPhone: "", subName: "", subPhone: "", subEmail: ""};
    const mine = Object.fromEntries(Object.entries(myDocDefaults(author.docDefaults)).filter(([, v]) => v));
    return {...base, ...mine, ...(quote.docHeader ?? {})};             // 저장된 머리 > 내 기본값 > 기본
  }
  function saveDocHeader(quote, header, saveMine, user) {
    const errors = checkDocHeader(header);
    if (errors.length) return reject(400, errors);                     // 둘 다 저장 안 함
    tx(() => { quote.docHeader = header; if (saveMine) user.docDefaults = pick(header, MY_DOC_FIELDS); });
  }
  ```

- **관련 요구사항**: REQ-032, REQ-018
- **관련 화면**: SCR-010
- **관련 테스트**: TC-173

### POL-043 EOS 관리자 등록·캐시 관리

- **규칙** (한 문장): 관리자는 SCR-014 [EOS 관리]에서 (벤더, SKU 또는 Dell 제품 품명)마다 EOS를 출처와 함께 등록·수정·삭제할 수 있고, 등록값은 캐시·AI 검색보다 먼저 쓰이며 지울 때까지 만료되지 않는다. EOS 결과 캐시는 전체·벤더·고른 항목 단위로 비울 수 있고, 비워도 등록값은 남는다(DEC-64).
- **등록 입력**

| 칸 | 규칙 |
|---|---|
| 벤더 | Cisco / Dell — 필수 |
| 조회 단위 | SKU / 제품 품명(Dell만 — 검증의 Dell 조회 단위, POL-029) |
| SKU·제품 품명 | 필수, 247자 이내. 키는 (벤더, 대문자 SKU) 또는 (벤더, `PRODUCT:` + 대문자 품명). 같은 키가 있으면 고친다 |
| 판매 상태 | 판매중 / EoS 예정 / 판매 종료 — 필수 |
| EoS 공지일 · End-of-Sale 일자 · LDoS 일자 | `YYYY-MM-DD`. EoS 예정·판매 종료는 End-of-Sale 일자 필수. 판매중이면 날짜를 지운다 |
| 대체 제품 | 64자 이내 |
| 출처 | 필수. `https://`로 시작하는 주소 1개, 500자 이내. 도메인 제한 없음(관리자가 확인한 근거) |
| 메모 | 200자 이내 |

- **판정**: 등록값도 같은 판정 함수(POL-029)를 쓴다 — 상태는 End-of-Sale 일자로 다시 정해진다(예: 「EoS 예정」으로 등록했어도 End-of-Sale ≤ 오늘이면 「판매 종료」). 출처 도메인은 검사하지 않는다. 표시 문구는 POL-029의 관리자 등록 문구(「(관리자 등록, 출처: …)」가 붙는 3종)이고, 「AI 검색 결과」 대신 「관리자 등록」으로 표시한다(검증 R8·단건·여러 SKU 검색 공통).
- **캐시 목록**: 최근 조회 순 50건씩, 벤더·SKU/품명(부분 일치)으로 찾는다. 항목마다 오늘 기준으로 다시 판정한 상태, End-of-Sale, 대체 제품, 출처, 조회 일시, 만료 일시(조회 + 7일), 관리자 등록 여부를 보여준다.
- **캐시 비우기**: 고른 항목 / 벤더(Cisco·Dell) / 전체. 비우기 전에 확인 대화상자를 띄운다: 「고른 {n}건의 캐시를 지웁니다. 다음 검증·검색은 AI로 새로 조회합니다(비용이 듭니다).」 / 「{vendor} 캐시를 모두 지웁니다. 다음 검증·검색은 AI로 새로 조회합니다(비용이 듭니다).」 / 「EOS 캐시를 모두 지웁니다. 다음 검증·검색은 AI로 새로 조회합니다(비용이 듭니다).」 관리자 등록을 지울 때는 「{vendor} {sku} 관리자 등록을 지웁니다. 그 뒤로는 캐시·AI 검색 결과를 씁니다.」 완료 토스트 「EOS 캐시 {n}건을 지웠습니다.」. 관리자 등록값은 지우지 않는다.
- **적용 시점**: `GET /api/settings/eos/cache?vendor=&q=&page=`, `GET /api/settings/eos/overrides`, `PUT /api/settings/eos/overrides`, `DELETE /api/settings/eos/overrides?vendor=&key=`, `POST /api/settings/eos-cache/clear {vendor?, keys?}`. 등록·삭제는 그 뒤 시작하는 검증·EOS 검색부터 쓴다(진행 중인 검증은 그대로).
- **위반/실패 시 처리**: 저장하지 않고 칸 아래에 문구를 표시한다(HTTP 400, 첫 오류 + 목록).
  - 벤더 없음: 「벤더를 선택해 주세요.」 / 필수 칸: 「{field}을(를) 입력해 주세요.」 / 길이: 「{field}은(는) {max}자 이내로 입력해 주세요.」 / 목록 밖(조회 단위·판매 상태): 「{field} 값을 목록에서 골라 주세요.」 / 날짜 형식: 「{field}은(는) YYYY-MM-DD 형식으로 입력해 주세요.」
  - End-of-Sale 누락: 「EoS 예정·판매 종료는 End-of-Sale 일자를 입력해 주세요.」 / 출처: 「출처는 https:// 로 시작하는 주소(500자 이내)로 입력해 주세요.」
  - 없는 등록값 삭제: HTTP 404
  - 성공: 「EOS 를 등록했습니다.」 / 삭제 「관리자 등록을 지웠습니다. 이제 캐시·AI 검색 결과를 씁니다.」. 등록값이 없으면 「관리자가 등록한 EOS 가 없습니다.」, 캐시가 없으면 「저장된 EOS 캐시가 없습니다.」
  - 등록·수정·삭제(벤더·키)와 캐시 비우기(범위·건수)는 감사 로그에 남긴다(환경설정 변경 — POL-011).
- **예외**: 단건 검색 [다시 조회]도 등록값이 있으면 AI를 부르지 않는다. 등록값은 캐시 기간(7일)과 무관하다. 등록을 지우면 다음 조회부터 캐시·AI 검색 결과를 쓴다.
- **검증 의사코드**:

  ```js
  function checkOverride(v) {
    const errs = [];
    if (!["Cisco", "Dell"].includes(v.vendor)) errs.push(["vendor", "EOS_VENDOR_REQUIRED"]);
    if (!["sku", "product"].includes(v.kind) || (v.kind === "product" && v.vendor !== "Dell")) errs.push(["kind", "SET_CHOICE"]);
    if (!v.value?.trim()) errs.push(["value", "SET_REQUIRED"]); else if ([...v.value.trim()].length > 247) errs.push(["value", "SET_TOO_LONG"]);
    if (!["ON_SALE", "EOS_ANNOUNCED", "END_OF_SALE"].includes(v.status)) errs.push(["status", "SET_CHOICE"]);
    if (v.status !== "ON_SALE" && !v.endOfSaleDate) errs.push(["endOfSaleDate", "EOS_EOS_DATE_REQUIRED"]);
    if (!/^https:\/\/[^/]+/.test(v.sourceUrl ?? "") || v.sourceUrl.length > 500) errs.push(["sourceUrl", "EOS_SOURCE_URL"]);
    return errs;
  }
  const overrideKey = v => [v.vendor, v.kind === "product" ? "PRODUCT:" + normalize(v.value).toUpperCase() : v.value.trim().toUpperCase()];
  function clearCache({vendor, keys}) {                   // 관리자 등록값(overrides)은 건드리지 않는다
    const n = cache.delete(e => (!vendor || e.vendor === vendor) && (!keys || keys.some(k => k.vendor === e.vendor && k.key === e.key)));
    audit("환경설정 변경", {target: "eos_cache", scope: keys ? "keys" : vendor ? "vendor" : "all", count: n});
    return n;
  }
  ```

- **관련 요구사항**: REQ-033, REQ-008, REQ-019
- **관련 화면**: SCR-014, SCR-007, SCR-011
- **관련 테스트**: TC-174, TC-175

### POL-044 감사 로그 조회·내보내기

- **규칙** (한 문장): 관리자는 SCR-015에서 감사 로그(POL-011)를 사건·사용자·결과·기간으로 걸러 최신순 **50건씩** 보고, 거른 조건 그대로 CSV(최대 **100,000건**)로 내려받는다. 내려받은 사실도 감사 로그에 남는다. 감사 로그는 조회만 하고 고칠 수 없다.

| 조건 | 규칙 |
|---|---|
| 사건 | POL-011 사건 중 하나(화면은 사건 이름 목록) |
| 사용자 | 사용자 하나(이름 목록) |
| 결과 | 성공 / 실패 |
| 기간 | 시작일 00:00:00 ~ 종료일 23:59:59 (KST), 양 끝 포함, 한쪽만 넣어도 된다 |

- **목록 열**: 일시(KST, 초까지) · 사건 · 사용자 · 대상 ID · 결과 · 상세. 정렬은 일시 내림차순, 같으면 기록 ID 내림차순
- **CSV**: UTF-8 BOM(Excel에서 바로 열림), 열 `일시(KST)` · `사건` · `사건 코드` · `사용자` · `사용자 ID` · `대상 ID` · `결과` · `상세`(JSON). 파일명 `감사로그_{YYYY-MM-DD}.csv`(KST 오늘, POL-007 예외)
- **적용 시점**: `GET /api/audit?event=&userId=&result=&from=&to=&page=`, `GET /api/audit.csv?event=&userId=&result=&from=&to=`
- **위반/실패 시 처리**
  - 시작일이 종료일보다 늦으면: 「시작일이 종료일보다 늦습니다.」 / 목록에 없는 사건 코드: HTTP 400 「입력값을 확인해 주세요.」
  - 결과가 0건이면: 「조건에 맞는 기록이 없습니다.」
  - CSV 대상이 100,000건을 넘으면 내보내지 않는다: 「내보낼 기록이 {n}건을 넘습니다. 기간이나 조건을 좁혀 주세요.」({n} = 100,000)
  - CSV 내보내기는 감사 로그 「감사 로그 내보내기」(거른 조건·건수)를 먼저 쓰고, 쓰지 못하면 내려주지 않는다(HTTP 500, POL-011 다운로드 규칙).
- **예외**: 조회는 기록하지 않는다. 감사 로그에는 금액이 없으므로(POL-009·011) 내보내기에도 금액이 없다. 화면 안내: 「로그인·역할 변경·확정·다운로드·환경설정 변경 등의 기록입니다. 금액은 남기지 않습니다. CSV 는 지금 거른 조건 그대로(최대 10만 건) 내려받고, 내려받은 사실도 기록됩니다.」
- **검증 의사코드**:

  ```js
  const PAGE = 50, CSV_MAX = 100000;
  function filtered(q) {
    if (q.event && !AUDIT_EVENTS.includes(q.event)) return block("VALIDATION_FAILED", {status: 400});
    if (q.from && q.to && q.from > q.to) return block("SEARCH_DATE_ORDER");
    return auditLog.where(e => (!q.event || e.event === q.event) && (q.userId == null || e.userId === q.userId)
      && (!q.result || e.result === q.result) && (!q.from || e.at >= startOfDayKST(q.from)) && (!q.to || e.at <= endOfDayKST(q.to)))
      .orderBy(["at desc", "id desc"]);
  }
  function exportCsv(admin, q) {
    const rows = filtered(q);
    if (rows.length > CSV_MAX) return block("AUDIT_TOO_MANY", {n: CSV_MAX});
    return sendFile(utf8Bom(csv(rows)), {audit: {event: "AUDIT_EXPORT", extra: {...q, count: rows.length}, mandatory: true}});
  }
  ```

- **관련 요구사항**: REQ-034, NFR-008
- **관련 화면**: SCR-015
- **관련 테스트**: TC-176, TC-186

### POL-045 운영 통계·AI 권고 품질 지표

- **규칙** (한 문장): 관리자는 SCR-016에서 기간(기본 최근 6개월 — 5개월 전 1일 ~ 오늘, 최대 366일)의 활동 건수·벤더별 새 BoM·판정·AI 권고 품질 지표를 본다. 활동 건수는 감사 로그(성공)로 세어 BoM 건을 지워도 남는다(DEC-65).
- **활동 지표** (합계·월별·사용자별 — 사용자는 건수 많은 순)

| 지표 | 세는 것 |
|---|---|
| 새 BoM | 「BoM 건 생성」 성공(복제 포함) |
| 검증 | 기간 안에 시작한 검증 실행(검증 기록 기준 — BoM 건을 지우면 함께 빠진다) |
| 확정 | 「확정」 성공(「AI 검토 없이 확정」 포함, 확정 1건 = 1) |
| 견적 | 「견적 만들기」 성공 |
| 견적서 | 「견적서 다운로드」 성공 |
| BoM 다운로드 | 「표준 BoM 다운로드」 성공 |

- **벤더별 새 BoM**: 기간 안에 만든, 지금 남아 있는 BoM 건 중 어느 버전에든 그 벤더 행이 있는 건수(Cisco·Dell·행 없음). 두 벤더가 섞인 건은 양쪽에 센다.
- **판정**: 기간 안에 시작해 끝난 검증의 판정을 등급별·규칙별(많은 순)로 센다.
- **AI 권고 품질** (PRD 리스크 5 지표, 기간 안에 시작해 끝난 검증의 권고 기준)

| 지표 | 정의 |
|---|---|
| 권고 수 · 검증당 권고 | 권고 건수, 권고 ÷ 검증 |
| 확인함 비율 | 「확인함」이 체크된 권고 ÷ 권고 |
| 일괄 확인 비율 | 기간 안 「확인함」 체크(감사 로그, 판정·권고 모두) 중 일괄 체크(`bulk`, CR-001)인 것 ÷ 체크 전체 |
| 재검증에서 사라진 권고 | 같은 BoM 건의 **바로 다음 완료 검증**(기간 밖 포함)에 같은 분류이면서 대상 행 계보 ID가 하나라도 겹치는 권고(「BoM 전체」 권고끼리는 같다고 본다)가 없는 권고 ÷ 다음 완료 검증이 있는 권고. 대상 행 계보를 저장하기 시작한 뒤의 권고만 잰다 |
| AI 검토 실패율 | AI 단계가 실패한 검증 ÷ AI 단계가 끝난(성공·실패) 검증 |
| 분류별 권고 | 분류별 건수(많은 순) |

  - 비율은 백분율 소수 첫째 자리까지다. 분모가 0이면 값을 표시하지 않는다.
- **적용 시점**: `GET /api/stats?from=&to=`
- **위반/실패 시 처리**
  - 기간 오류: 「시작일이 종료일보다 늦습니다.」 / 「조회 기간은 1년(366일) 이내로 골라 주세요.」 (HTTP 400)
  - 기간에 활동이 없으면: 「{from} ~ {to} 기간에 활동이 없습니다.」
  - 화면 안내: 「활동 건수는 감사 로그로 셉니다 — BoM 건을 지워도 남습니다. 벤더별 새 BoM 은 남아 있는 BoM 기준입니다.」, 「「재검증에서 사라진 권고」는 같은 BoM 의 다음 검증에서 같은 분류·같은 대상 행의 권고가 나오지 않은 비율로, 권고를 반영해 고쳤는지 추정한 값입니다. 다음 검증이 있는 권고만 셉니다.」
- **예외**: 통계 조회는 기록하지 않는다. 금액·가격은 다루지 않는다. 「재검증에서 사라진 권고」는 수정 반영을 추정한 값이다(권고를 무시하고 다시 검증해도 AI가 같은 권고를 내지 않으면 해소로 센다).
- **검증 의사코드**:

  ```js
  const AUDIT_METRIC = {BOM_CREATE: "새 BoM", CONFIRM: "확정", QUOTE_CREATE: "견적", DOWNLOAD_QUOTE: "견적서", DOWNLOAD_BOM: "BoM 다운로드"};
  const same = (a, b) => a.category === b.category && a.lineages && b.lineages
    && ((!a.lineages.length && !b.lineages.length) || a.lineages.some(x => b.lineages.includes(x)));
  function aiQuality(periodVals, allValsOfSameBoms, recsOf, acks) {
    const recs = periodVals.flatMap(v => recsOf(v.id));
    let measurable = 0, resolved = 0;
    for (const v of periodVals) {
      const next = nextDoneValidation(allValsOfSameBoms, v);           // 같은 BoM, 시작 순 바로 다음
      if (!next) continue;
      for (const r of recsOf(v.id).filter(r => r.lineages != null)) { measurable++; if (!recsOf(next.id).some(x => same(r, x))) resolved++; }
    }
    const checks = acks.filter(a => a.acked), aiDone = periodVals.filter(v => ["OK", "FAILED"].includes(v.aiStatus));
    const rate = (n, d) => d ? round1(n / d * 100) : null;
    return {ackedRate: rate(recs.filter(r => r.ackBy).length, recs.length), bulkAckRate: rate(checks.filter(a => a.bulk).length, checks.length),
            resolvedRate: rate(resolved, measurable), aiFailureRate: rate(aiDone.filter(v => v.aiStatus === "FAILED").length, aiDone.length)};
  }
  ```

- **관련 요구사항**: REQ-035
- **관련 화면**: SCR-016
- **관련 테스트**: TC-177, TC-178, TC-187

### POL-046 공지·점검 배너

- **규칙** (한 문장): 관리자가 공지를 켜 두면 표시 기간 동안 로그인한 모든 사용자(역할 미지정 포함)의 화면 맨 위에 종류(안내·점검)와 문구를 띄운다. 사용자가 [닫기]하면 같은 문구는 그 브라우저 탭에서 다시 띄우지 않는다.

| 칸 | 규칙 | 기본값 |
|---|---|---|
| 공지 표시 | 켬 / 끔 | 끔 |
| 공지 종류 | 안내 / 점검 | 안내 |
| 공지 문구 | 켜면 필수, 200자 이내, 줄바꿈·제어 문자 금지 | 빈 값 |
| 표시 시작 · 표시 종료 | 날짜와 시각(분, KST). 비우면 제한 없음. 시작 ≤ 종료 | 빈 값 |

- **표시 조건**: 켜져 있고 문구가 있으며, 지금(KST, 분 단위)이 표시 시작 이후이고 표시 종료 이전(양 끝 포함)일 때. 화면은 5분마다 다시 확인한다.
- **닫기**: 닫은 문구를 그 브라우저 탭에만 기억한다. 문구가 바뀌거나 새 탭을 열면 다시 보인다.
- **적용 시점**: SCR-014 [공지·점검] 저장 `GET·PUT /api/settings/notice`(관리자), 모든 화면 상단 `GET /api/notice`(로그인한 모든 사용자)
- **위반/실패 시 처리**: 저장하지 않고 칸 아래에 문구를 표시한다(HTTP 400).
  - 켰는데 문구가 비면: 「{field}을(를) 입력해 주세요.」 / 200자 초과: 「{field}은(는) {max}자 이내로 입력해 주세요.」 / 줄바꿈·제어 문자: 「줄바꿈과 제어 문자는 입력할 수 없습니다.」
  - 날짜·시각 중 하나만 넣으면: 「{field}은(는) 날짜와 시각을 모두 입력해 주세요.」 / 종료가 시작보다 빠르면: 「표시 종료가 표시 시작보다 빠릅니다.」 / 종류가 목록 밖: 「{field} 값을 목록에서 골라 주세요.」
  - 저장하면 「저장했습니다.」, 바뀐 항목 이름을 감사 로그에 남긴다(환경설정 변경 — POL-011).
  - 화면 안내: 「켜 두면 로그인한 모든 사용자 화면 맨 위에 보입니다. 표시 기간을 비우면 끌 때까지 계속 보입니다.」
- **예외**: 공지는 서비스 사용을 막지 않는다(「점검」도 표시만 한다). 저장된 값이 규칙에 맞지 않으면 공지를 끈 것으로 본다. 관리자에게는 AI 월 예산 경고(POL-041)가 같은 자리에 함께 보인다.
- **검증 의사코드**:

  ```js
  function checkNotice(v) {
    const errs = [], text = (v.text ?? "").trim();
    if (!["info", "maintenance"].includes(v.level)) errs.push(["level", "SET_CHOICE"]);
    if (v.enabled && !text) errs.push(["text", "SET_REQUIRED"]);
    else if ([...text].length > 200) errs.push(["text", "SET_TOO_LONG"]);
    else if (/[\u0000-\u001F\u007F]/.test(text)) errs.push(["text", "BOM_CONTROL_CHAR"]);
    const s = parseDateTime(v.startAt), e = parseDateTime(v.endAt);          // "" → null, 형식 오류 → SET_DATETIME
    if (s && e && s > e) errs.push(["endAt", "NOTICE_RANGE_ORDER"]);
    return errs;
  }
  function noticeActive(n, nowKst) {
    if (!(n.enabled && n.text)) return false;
    const now = truncateToMinute(nowKst);
    return (!n.start || now >= n.start) && (!n.end || now <= n.end);
  }
  // 화면: closedText(sessionStorage) === n.text 이면 띄우지 않는다
  ```

- **관련 요구사항**: REQ-036
- **관련 화면**: SCR-014, SCR-002, 전 화면 상단(GNB 위)
- **관련 테스트**: TC-179

### POL-047 사용자 비활성화

- **규칙** (한 문장): 관리자는 SCR-012에서 사용자를 1명 이상 골라 비활성화·다시 활성화할 수 있다. 비활성화하면 그 사용자의 로그인 세션을 **즉시** 지우고, 다시 활성화할 때까지 로그인할 수 없다. 역할과 작성한 BoM 건은 그대로이며, 본인은 비활성화할 수 없다(DEC-63).
- **상태**: 활성 / 비활성(비활성화 일시를 사용자에 기록). 사용자 목록에 상태 열과 상태 필터(전체·활성·비활성)가 있다.
- **적용 시점**: [비활성화]·[다시 활성화] `PATCH /api/users/status {userIds, disabled}`, SSO 콜백(POL-002), 모든 API 요청(세션 확인)
- **위반/실패 시 처리**
  - 선택한 사용자가 0명이면 버튼이 비활성이다. API는 HTTP 400 「입력값을 확인해 주세요.」
  - 비활성화 선택에 자기 자신이 들어 있으면 요청 전체를 차단한다(일부만 반영하지 않음): 「자신의 계정은 비활성화할 수 없습니다. 선택 목록에서 본인을 빼 주세요.」 다시 활성화는 본인이 섞여도 된다.
  - 비활성화 확인 대화상자: 「{n}명을 비활성화합니다. 로그인한 상태라면 바로 끊기고, 다시 활성화할 때까지 로그인할 수 없습니다. 비활성화하시겠습니까?」
  - 다시 활성화 확인 대화상자: 「{n}명을 다시 활성화합니다. 이전 역할 그대로 다시 로그인할 수 있습니다. 다시 활성화하시겠습니까?」
  - 성공: 「{n}명을 비활성화했습니다. 로그인이 바로 끊깁니다.」 / 「{n}명을 다시 활성화했습니다.」 ({n} = 실제로 상태가 바뀐 사용자 수)
  - 비활성 사용자가 로그인하면 세션을 만들지 않는다: 로그인 화면 「사용이 중지된 계정입니다. 관리자(CSD)에게 문의해 주세요.」(로그인 실패로 기록 — POL-011)
  - 비활성화 전에 만든 세션으로 요청하면 그 세션을 지우고 HTTP 401 `ACCOUNT_DISABLED` 「사용이 중지된 계정입니다. 관리자(CSD)에게 문의해 주세요.」
  - 상태가 바뀐 사용자마다 「사용자 비활성화」·「사용자 다시 활성화」를 감사 로그에 남긴다(POL-011).
- **예외**: 이미 같은 상태인 사용자는 기록하지 않고 {n}에서도 뺀다. 비활성화해도 역할·작성한 BoM 건·작성자 표시는 그대로이고(POL-010, POL-013), 다시 활성화하면 이전 역할로 쓴다. 역할 미지정 사용자도 비활성화할 수 있다.
- **검증 의사코드**:

  ```js
  function changeStatus(admin, userIds, disabled) {
    if (userIds.length === 0) return block("VALIDATION_FAILED", {status: 400});
    if (disabled && userIds.includes(admin.id)) return block("SELF_DISABLE", {status: 400});
    const changed = userIds.map(users.get).filter(u => !!u.disabledAt !== disabled);
    tx(() => {
      changed.forEach(u => u.disabledAt = disabled ? now() : null);
      if (disabled) sessions.deleteWhere(s => changed.some(u => u.id === s.userId));   // 즉시 끊는다
    });
    changed.forEach(u => audit(disabled ? "USER_DISABLE" : "USER_ENABLE", {by: admin.id, target: u.id}));
    return ok({message: msg(disabled ? "USERS_DISABLED" : "USERS_ENABLED", {n: changed.length})});
  }
  function onRequest(session) {                           // POL-001 세션 확인 뒤
    if (users.get(session.userId).disabledAt) { destroy(session); return block("ACCOUNT_DISABLED", {status: 401}); }
    return ok();
  }
  ```

- **관련 요구사항**: REQ-037, REQ-020
- **관련 화면**: SCR-012, SCR-001
- **관련 테스트**: TC-180

### POL-048 BoM 건 복제

- **규칙** (한 문장): 작성자 역할(영업·관리자)은 BoM 건의 **확정 버전** 하나를 골라 새 BoM 건(v1 작성중·미검증)으로 복제할 수 있다. 행 구성은 그대로 옮기고 계보 ID는 새로 만든다. 원본 BoM 건의 작성자(POL-009)면 가격 정보·원본 파일까지, 그 밖의 사람은 **구성만** 복사한다(DEC-66).

| 복사하는 것 | 원본 작성자 | 그 밖의 사람 |
|---|---|---|
| 행 — 행 번호·벤더·원본 라인 번호·상위 행·행 유형·구분·모듈명·SKU·옵션 ID·품명·수량·서비스·구독 기간·구독 정보·원본 파일명·원본 행 번호·비고 | ○ | ○ |
| 가격 정보 — 통화·List 단가·List 금액·할인율·벤더 Net 금액 | ○ | × |
| 원본 벤더 파일(그 버전 행이 쓰는 파일만, 파일 자체를 복사) · 벤더 파일 합계(R9 기준값) | ○ | × |
| 계보 ID | 새로 만든다 | 새로 만든다 |
| 검증 결과·「확인함」·견적·다른 버전 | × | × |

- **입력**: 새 고객사명·건명(POL-003과 같은 규칙·문구 — 처음 값은 원본 고객사명, 원본 건명 뒤에 (복제)), 복제할 버전 번호. 새 건의 작성자는 복제한 사람이다.
- **적용 시점**: SCR-005 [BoM 건 복제] → 복제 모달, `POST /api/boms/{id}/clone {customer, title, versionNo}`
- **위반/실패 시 처리**
  - 확정되지 않은 버전: HTTP 409 「확정된 버전에서만 복제할 수 있습니다.」 (화면은 확정 버전에서만 버튼을 보인다)
  - 엔지니어·역할 미지정: HTTP 403(POL-008). 없는 버전: HTTP 404
  - 고객사명·건명 위반: POL-003 문구
  - 모달 안내: 원본 작성자 「가격 정보와 원본 파일까지 복사합니다. 새 건은 v1 작성중·미검증으로 시작합니다.」 / 그 밖 「다른 사람의 BoM 건이라 가격 정보와 원본 파일은 복사하지 않고 구성만 가져옵니다.」
  - 성공하면 새 BoM 건의 v1 화면으로 이동한다.
  - 감사 로그: 「BoM 건 생성」에 원본 BoM 건 ID·버전 번호·가격 복사 여부(POL-011)
- **예외**: 원본 BoM 건은 바뀌지 않는다. 계보 ID가 새것이므로 원본 건과 버전 비교·견적 가져오기(POL-049)는 이어지지 않는다. 가격을 복사하지 않은 건은 CCW 구성형처럼 가격이 빈 상태로 시작한다.
- **검증 의사코드**:

  ```js
  function cloneBom(user, src, versionNo, input) {
    if (!AUTHOR_ROLES.includes(user.role)) return block("FORBIDDEN", {status: 403});
    const v = src.versions.find(x => x.no === versionNo); if (!v) return block("NOT_FOUND", {status: 404});
    if (v.status !== "확정") return block("CLONE_NEEDS_CONFIRMED", {status: 409});
    const err = checkPol003(input); if (err) return err;
    const withPrice = AUTHOR_ROLES.includes(user.role) && src.authorId === user.id;      // POL-009
    const bom = boms.create({...input, authorId: user.id, solutionMeta: withPrice ? src.solutionMeta : null});
    const v1 = bom.addVersion({no: 1, status: "작성중", validationState: "미검증"});
    const files = withPrice ? copyFiles(src, v) : {};
    for (const r of v.rows) v1.addRow({...structureOf(r), lineageId: uuid(), fileId: files[r.fileId] ?? null,
                                       price: withPrice ? r.price : undefined});
    audit("BOM_CREATE", {target: bom.id, cloneOf: src.id, versionNo, withPrices: withPrice});
    return bom;
  }
  ```

- **관련 요구사항**: REQ-038
- **관련 화면**: SCR-005
- **관련 테스트**: TC-182

### POL-049 이전 버전 견적 가져오기

- **규칙** (한 문장): 작성자는 새 견적을 만들 때 **같은 BoM 건의 다른 버전** 견적 하나를 골라, 그 견적의 전체 설정·환율·견적서 머리(견적일·상세 내역 뺌)와 행별 입력을 계보 ID가 같은 행으로 옮길 수 있다(DEC-66).

| 옮기는 값 | 규칙 |
|---|---|
| 전체 설정 — 전체 DC율·기본 매입 DC율·전체 목표 GP율·단가 단위·최소 GP율 | 원본 견적 값 그대로(관리자 견적 기본값보다 먼저) |
| 환율 | 그대로 |
| 견적서 머리 — 양식·형식·견적명·수신·참조·유효기간·거래 조건·특기사항·담당자 연락처 | 그대로. 견적일자는 오늘, Summary 상세 내역은 처음 값(상위 품목 품명) |
| 행별 입력 — 할인율·목표 GP율·판매단가·매입 DC율·매입단가·소비자가 입력·통화·견적서 제외 | 계보 ID가 같은 행으로 옮긴다 |
| 이번 버전에만 있는 행 | 새 견적 처음 값(POL-033) |
| 원본 견적에만 있는 행 | 옮기지 못한다 — 건수를 알린다 |

- **고를 수 있는 견적**: 같은 BoM 건의 다른 버전(앞·뒤 버전 모두)의 견적. 최근 버전·최근 수정 순으로 보여준다.
- **적용 시점**: SCR-009 [이전 버전 견적에서 만들기], `GET /api/versions/{id}/quote-sources`, `POST /api/versions/{id}/quotes {fromQuoteId}`
- **위반/실패 시 처리**
  - 다른 BoM 건의 견적·같은 버전의 견적·없는 견적: HTTP 400 「가져올 견적을 찾을 수 없습니다. 같은 BoM 건의 다른 버전 견적만 고를 수 있습니다.」
  - 기준 버전이 확정되지 않음: 「확정된 버전으로만 견적을 만들 수 있습니다.」(POL-033)
  - 성공 토스트: 「이전 버전 견적에서 {copied}행의 설정을 가져왔습니다.」 + 못 옮긴 행이 있으면 「이번 버전에 없는 {missing}행은 가져오지 않았습니다.」
  - 감사 로그: 「견적 만들기」에 원본 견적 ID·옮긴 행 수·못 옮긴 행 수(POL-011)
- **예외**: 원본 견적은 바뀌지 않는다. 가져온 값이 이번 버전에서 저장 조건(POL-033)을 만족하는지는 저장·다운로드할 때 검사한다(만들 때는 막지 않는다). 다른 BoM 건(복제한 건 포함)의 견적은 가져올 수 없다.
- **검증 의사코드**:

  ```js
  function createQuoteFrom(user, version, sourceId) {
    const sources = quotes.where(q => q.version.bomId === version.bomId && q.versionId !== version.id);
    const src = sources.find(q => q.id === sourceId);
    if (!src) return block("QUOTE_SOURCE_INVALID", {status: 400});
    const q = createQuote(version, user);                               // POL-033 처음 값
    const target = new Map(version.rows.map(r => [r.lineageId, r.id]));
    let copied = 0, missing = 0;
    for (const sr of src.rows) {
      const rid = target.get(lineageOf(sr.rowId));
      if (rid == null) { missing++; continue; }
      Object.assign(q.rows[rid], pick(sr, ROW_INPUTS)); copied++;
    }
    Object.assign(q, {fx: {...src.fx}, settings: {...src.settings}});
    if (src.docHeader) q.docHeader = omit(src.docHeader, ["date", "details"]);
    audit("QUOTE_CREATE", {target: q.id, fromQuoteId: src.id, copiedRows: copied, missingRows: missing});
    return {id: q.id, copied, missing};
  }
  ```

- **관련 요구사항**: REQ-039
- **관련 화면**: SCR-009
- **관련 테스트**: TC-183

### POL-050 EOS 여러 SKU 검색

- **규칙** (한 문장): 사용자는 SCR-011 [여러 SKU]에서 한 벤더의 SKU를 **최대 100개** 붙여 넣어 한 번에 조회하고 결과를 표와 xlsx로 받는다. 조회는 SKU마다 단건 검색(POL-029)과 같은 규칙으로 **4개씩 동시에** 하고, xlsx는 AI를 다시 부르지 않고 캐시·관리자 등록값만 읽는다.
- **입력**: 벤더 1개 + SKU 목록. 줄바꿈·쉼표·세미콜론·공백·탭으로 나눈다. 대소문자를 무시한 중복은 처음 것만 남긴다. 화면 안내: 「SKU를 한 줄에 하나씩(또는 쉼표로 나눠) 붙여 넣으세요. 최대 100개, 중복은 한 번만 조회합니다.」
- **조회**: 형식(R3, POL-024)에 맞는 SKU만 `GET /api/eos?vendor=&sku=`로 조회한다(관리자 등록값 → 캐시 → AI 검색). 행마다 단건 검색과 같은 결과 문구·출처·조회 일시·「AI 검색 결과」/「관리자 등록」 표시를 보여준다.
- **xlsx**: 열 `벤더` · `SKU` · `상태` · `End-of-Sale` · `LDoS` · `EoS 공지일` · `대체 제품` · `결과 구분` · `출처` · `조회 일시`. 형식 오류 SKU는 빼고 보낸다. 서버는 관리자 등록값·캐시(7일)만 읽고, 없는 SKU는 상태 「조회 안 됨」이다. 가격 정보는 없다. 파일명 `EOS검색_{벤더}_{YYYY-MM-DD}.xlsx`(POL-007 예외).
- **적용 시점**: SCR-011 [여러 SKU] 탭 [조회]·[멈추기]·[xlsx 다운로드], `GET /api/eos`(SKU마다), `POST /api/eos/bulk.xlsx {vendor, skus}`
- **위반/실패 시 처리**
  - 벤더 없음: 「벤더를 선택해 주세요.」 / SKU 0개 또는 100개 초과: 「SKU를 1 ~ {max}개 입력해 주세요.」 — 조회하지 않는다(API는 HTTP 400)
  - 형식이 맞지 않는 SKU는 조회하지 않고 그 행에 「{vendor} SKU 형식이 아닙니다.」
  - 행별 조회 실패: 「EOS 정보를 가져오지 못했습니다」 / AI가 찾지 못함: 「{vendor} 자료에서 찾을 수 없는 SKU입니다 (AI 검색 결과 — 틀릴 수 있습니다)」
  - 끝나면: 「{n}개 조회를 마쳤습니다. (실패 {failed}개)」
  - xlsx 다운로드는 감사 로그 「EOS 검색 결과 다운로드」(벤더·건수)를 먼저 쓰고, 쓰지 못하면 내려주지 않는다(POL-011).
- **예외**: 개별 조회는 단건 검색이므로 AI 호출은 사용량의 「EOS 단건 검색」으로 센다(POL-041). 조회 중 [멈추기]를 누르면 남은 SKU는 조회하지 않는다. 모든 역할(영업·엔지니어·관리자)이 쓸 수 있다(POL-008).
- **검증 의사코드**:

  ```js
  const BULK_MAX = 100, CONCURRENCY = 4;
  function parseSkuList(text) {
    const seen = new Set(), out = [];
    for (const t of text.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean))
      if (!seen.has(t.toUpperCase())) { seen.add(t.toUpperCase()); out.push(t); }
    return out;
  }
  async function bulkSearch(vendor, text) {
    if (!["Cisco", "Dell"].includes(vendor)) return block("EOS_VENDOR_REQUIRED");
    const skus = parseSkuList(text);
    if (skus.length === 0 || skus.length > BULK_MAX) return block("EOS_BULK_COUNT", {max: BULK_MAX});
    const jobs = skus.map(s => singleQueryError(vendor, s) ? {sku: s, invalid: true} : {sku: s});
    await pool(jobs.filter(j => !j.invalid), CONCURRENCY, j => j.result = eosSearch(vendor, j.sku));   // POL-029 단건 검색
    return jobs;
  }
  function bulkXlsx(vendor, skus) {                       // AI 를 부르지 않는다
    return skus.map(s => { const hit = overrides.get(key(vendor, s)) ?? cache.get(key(vendor, s));
                           return hit ? judge(vendor, hit) : {sku: s, status: "조회 안 됨"}; });
  }
  ```

- **관련 요구사항**: REQ-040, REQ-019
- **관련 화면**: SCR-011
- **관련 테스트**: TC-184

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
| v1.1 | 2026-10-01 | POL-032 「확인함」 일괄 체크·해제(예외·적용 시점·문구·의사코드), POL-011 일괄 체크 기록 단위. 관련 테스트에 TC-163 추가 | CR-001 |
| v1.2 | 2026-10-02 | CR-002·003·004 반영. 신설 POL-040 ~ POL-050(환경설정, AI 사용량·월 예산, 내 견적서 기본값, EOS 관리자 등록·캐시 관리, 감사 로그 조회·CSV, 통계·AI 권고 품질 지표, 공지·점검 배너, 사용자 비활성화, BoM 건 복제, 이전 버전 견적 가져오기, EOS 여러 SKU 검색). 변경: POL-033 ~ 036 견적 계산을 표준양식 VER1 방식으로(DEC-58), POL-037 견적서 배치·EOS × 유효기간·Summary 상세·관리자 설정값(DEC-59·60·61), POL-038 원가분석표 폐지, POL-029 Dell 품명 조회·router-switch 출처·관리자 등록 우선·캐시 범위 비우기·설정값·「SKU를 찾지 못함」 7일 캐시(DEC-37·56·57·64), POL-013 저장 항목에 비활성화 일시·내 견적서 기본값, POL-031·021 시간 한도 설정값, POL-008·009·032 관리자 = 작성자 역할(DEC-62)·환경설정·감사 로그·통계 권한, POL-002·010 비활성 상태(DEC-63), POL-011 조회 화면·새 사건, POL-012 사용량 집계 보관·연결 테스트, POL-006·007 연쇄 정리. 관련 테스트에 TC-164 ~ TC-187 추가, TC-127·TC-140 삭제 표시 | CR-002, CR-003, CR-004 |
