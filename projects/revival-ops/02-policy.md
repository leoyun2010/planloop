# 정책서 — 전도집회 운영 시스템 (revival-ops)

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.3 |
| 상태 | 초안 |
| 작성일 | 2026-09-02 |
| 최종 수정일 | 2026-09-04 |
| 원본 근거 | 운영 정책 기준서 v1.0 (2026-09-01, 권진영) — P-01 ~ P-36 |
| 근거 회의록 | [minutes/2026-09-04-기획검토-개발착수.md](minutes/2026-09-04-기획검토-개발착수.md) — POL-050·051·052 신규, POL-048 개정 |
| 근거 검토 | [minutes/2026-09-03-기획산출물-검토결과.md](minutes/2026-09-03-기획산출물-검토결과.md) — REQ 역참조 보강 (정책 신규 없음) |
| 관련 문서 | [01-prd.md](01-prd.md), [00-brief.md](00-brief.md), [03-ia.md](03-ia.md), [05-qa-tc.md](05-qa-tc.md) |

> 정책서는 "시스템이 어떤 규칙으로 검증하는가"를 정의한다.
> 설명이 아니라 **검증 가능한 규칙**으로 쓴다. 정책 문서 자체가 스펙이자 테스트 기준이 되어,
> 개발자·QA(사람이든 Claude든)가 이 문서만 보고 되묻지 않고 판단할 수 있어야 한다.
> 각 정책은 6요소를 갖춘다: 규칙 / 적용 시점 / 위반 시 처리(문구 그대로) / 예외 / 검증 의사코드 / 관련 TC

## 0. 원본 기준서와의 관계

- **POL-001 ~ POL-036은 원본 『운영 정책 기준서 v1.0』의 P-01 ~ P-36과 1:1로 대응한다.** 번호를 그대로 승계했다(`POL-007` = `P-07`).
- **POL-037 ~ POL-049는 이 문서에서 새로 만든 정책이다.** PRD 작성 중 인수 조건을 쓰다가 기준이 없어 드러난 지점, 그리고 NFR에서 파생된 규칙이다. 원본 기준서에는 없다.
- 원본에는 **위반 시 사용자에게 보여줄 문구와 검증 의사코드가 없었다.** 이 두 가지는 이 문서에서 새로 작성했으며, 문구는 확정 대상이다.
- 원본의 `배경·근거`는 **왜 그렇게 정했는지**를 담고 있어 그대로 옮겼다. 기준을 바꿀지 판단할 때 이 부분을 본다.
- 정책이 바뀌면 이 문서를 먼저 고치고, 그 POL ID로 [01-prd.md](01-prd.md)를 검색해 영향받는 REQ를 함께 검토한다.
- 섹션 1~7은 PlanLoop 템플릿 구조, 섹션 8~13은 원본 기준서의 도메인 구분을 따른다.

### 현재 상태

| 구분 | 건수 | 비고 |
|---|---|---|
| 전체 정책 | 49건 | 원본 승계 36건 + 신규 13건 |
| 확정 | 42건 | 그대로 적용 |
| 검토중 | 2건 | POL-004, POL-034 — 방향은 정해졌으나 세부안 결정이 남음 |
| 미확정 | 5건 | POL-006, POL-020, POL-022, POL-023, POL-043 — 외부 조건이 정해져야 확정 |

## 정책 목록

| ID | 분류 | 정책명 | 관련 REQ | 관련 TC | 상태 | 원본 |
|---|---|---|---|---|---|---|
| POL-001 | 접수 | 온라인 접수 마감 | REQ-001 | TBD | 확정 | P-01 |
| POL-002 | 접수 | 정원·현장 버퍼 | REQ-002, REQ-070 | TBD | 확정 | P-02 |
| POL-003 | 접수 | 현장 접수 방침 | REQ-021, REQ-023 | TBD | 확정 | P-03 |
| POL-004 | 취소·환불 | 취소 권한 | REQ-014 | TBD | 검토중 | P-04 |
| POL-005 | 취소·환불 | 관리 버튼 노출 기준 | REQ-025, REQ-026, REQ-027 | TBD | 확정 | P-05 |
| POL-006 | 취소·환불 | 환불 수취인 | REQ-007, REQ-028 | TBD | 미확정 | P-06 |
| POL-007 | 입금 | 입금 확인 소요 | REQ-011, REQ-013 | TBD | 확정 | P-07 |
| POL-008 | 입금 | 매칭 단위 | REQ-031, REQ-032 | TBD | 확정 | P-08 |
| POL-009 | 입금 | 상태 용어·표시 | REQ-030, REQ-033 | TBD | 확정 | P-09 |
| POL-010 | 숙소 | 배정 룰 — 1순위 | REQ-043 | TBD | 확정 | P-10 |
| POL-011 | 숙소 | 배정 룰 — 필수 반영 | REQ-009, REQ-042 | TBD | 확정 | P-11 |
| POL-012 | 숙소 | 배정 룰 — 참고 | REQ-038, REQ-045 | TBD | 확정 | P-12 |
| POL-013 | 숙소 | 보류 좌석 | REQ-044, REQ-045 | TBD | 확정 | P-13 |
| POL-014 | 숙소 | 배정 시점 — 일반 | REQ-013, REQ-045 | TBD | 확정 | P-14 |
| POL-015 | 숙소 | 배정 시점 — 예외 | REQ-040 | TBD | 확정 | P-15 |
| POL-016 | 숙소 | 배정 시점 — 현장 | REQ-044 | TBD | 확정 | P-16 |
| POL-017 | 숙소 | 미사용자 제외 | REQ-009, REQ-041 | TBD | 확정 | P-17 |
| POL-018 | 숙소 | 현장 대응 우선순위 | REQ-046 | TBD | 확정 | P-18 |
| POL-019 | 명찰 | 출력 시점·방식 | REQ-035, REQ-036 | TBD | 확정 | P-19 |
| POL-020 | 명찰 | 용지 규격 | REQ-037 | TBD | 미확정 | P-20 |
| POL-021 | 상담 | 접수 경로 | REQ-019, REQ-048 | TBD | 확정 | P-21 |
| POL-022 | 상담 | 운영 시간대 | REQ-054 | TBD | 미확정 | P-22 |
| POL-023 | 상담 | 결과 수집 | REQ-056 | TBD | 미확정 | P-23 |
| POL-024 | 상담 | 결과 활용 | REQ-055, REQ-056 | TBD | 확정 | P-24 |
| POL-025 | 셔틀 | 방향 분리 | REQ-017, REQ-057 | TBD | 확정 | P-25 |
| POL-026 | 셔틀 | 정렬 기준 | REQ-057, REQ-059 | TBD | 확정 | P-26 |
| POL-027 | 셔틀 | 조작 권한 | REQ-058, REQ-059, REQ-061 | TBD | 확정 | P-27 |
| POL-028 | 셔틀 | 대상 범위 | REQ-017, REQ-058 | TBD | 확정 | P-28 |
| POL-029 | 권한 | 로그인 단위 | REQ-012, REQ-065 | TBD | 확정 | P-29 |
| POL-030 | 권한 | 계정 발급 | REQ-066 | TBD | 확정 | P-30 |
| POL-031 | 권한 | 기본 권한 | REQ-066, REQ-067 | TBD | 확정 | P-31 |
| POL-032 | 권한 | 계정 미발급 대상 | REQ-061, REQ-066 | TBD | 확정 | P-32 |
| POL-033 | 이력 | 기록 대상 | REQ-068, REQ-069 | TBD | 확정 | P-33 |
| POL-034 | 알림 | 문자 발송 | REQ-064 | TBD | 검토중 | P-34 |
| POL-035 | 상담 | 진행 상태 기록 | REQ-050, REQ-051, REQ-052 | TBD | 확정 | P-35 |
| POL-036 | 상담 | 화면 역할 분리 | REQ-049, REQ-053, REQ-055 | TBD | 확정 | P-36 |
| POL-037 | 회원/인증 | 동일 휴대폰 중복 신청 | REQ-004, REQ-012 | TBD | 확정 | 신규 |
| POL-038 | 데이터 | 등록번호 채번 | REQ-034 | TBD | 확정 | 신규 |
| POL-039 | 법/개인정보 | 개인정보 보관기간·파기 | REQ-010 | TBD | 확정 | 신규 |
| POL-040 | 회원/인증 | 본인 확인 시도 제한 | REQ-012 | TBD | 확정 | 신규 |
| POL-041 | 법/개인정보 | 개인정보·민감정보 암호화 | REQ-008, REQ-010 | TBD | 확정 | 신규 |
| POL-042 | 데이터 | 입력값 형식·길이 | REQ-004, REQ-006, REQ-023 | TBD | 확정 | 신규 |
| POL-043 | 접수 | 동행자 인원 상한 | REQ-006 | TBD | 미확정 | 신규 |
| POL-044 | 접수 | 정원 차단 후 재개 | REQ-002 | TBD | 확정 | 신규 |
| POL-045 | 법/개인정보 | 필수 동의 2종 | REQ-010 | TBD | 확정 | 신규 |
| POL-046 | 데이터 | 공지·안내문 노출 규칙 | REQ-015, REQ-016, REQ-062, REQ-063 | TBD | 확정 | 신규 |
| POL-047 | 입금 | 입금내역 중복 적재 방지 | REQ-029, REQ-030 | TBD | 확정 | 신규 |
| POL-048 | 숙소 | 좌석 수 정합성 | REQ-038, REQ-039, REQ-045 | TBD | 확정 | 신규 |
| POL-049 | 셔틀 | 셔틀 탑승 확정 마감 | REQ-018, REQ-059 | TBD | 확정 | 신규 |

> 관련 화면(SCR-###)은 03-ia.md가 아직 없어 각 정책의 적용 시점에 **원본 화면ID**(U1~U12, A1~A13)로 적어 두었다. `/wireframe` 실행 시 SCR 번호로 치환한다.

## 1. 회원/인증 정책

### POL-029 로그인 단위

- **규칙**: 관리자는 개인 단위 아이디/비밀번호로 로그인한다. 회(단위) 공용 계정은 만들지 않는다. 참가자는 회원가입·비밀번호 없이 휴대폰 번호 + 이름 조합으로 본인을 확인한다.
- **적용 시점**: 관리자 로그인(원본 A12), 참가자 본인 확인(원본 U7), 모든 관리자 화면 진입 시 세션 검사
- **위반/실패 시 처리**:
  - 관리자 로그인 실패 → 차단. 문구 「아이디 또는 비밀번호가 일치하지 않습니다.」
  - 미로그인 상태로 관리자 URL 접근 → 로그인 화면으로 이동. 문구 「로그인이 필요합니다.」
  - 참가자 본인 확인 실패 → 차단. 문구 「입력하신 정보와 일치하는 신청 내역이 없습니다. 본부 접수처(연락처)로 문의해 주세요.」
- **예외**: 없음. 참가자 화면 중 공지·일정·안내문·상담 안내는 본인 확인 없이 열람할 수 있다.
- **배경·근거** (원본): 누가 등록했는지, 누가 숙소를 바꿨는지 추적하려면 개인 계정이 전제다. 참가자는 어르신 사용을 고려해 로그인을 두지 않는다.
- **검증 의사코드**:

  ```js
  // 관리자: 개인 계정만 허용. 공용 계정 생성 자체를 막는다.
  function checkPol029Admin(account) {
    if (!account.ownerName || account.isShared) return fail("MSG_NO_SHARED_ACCOUNT");
    return pass();
  }

  // 참가자: 휴대폰 + 이름이 모두 일치해야 한다. 한쪽만으로는 조회되지 않는다.
  function checkPol029Participant(phoneInput, nameInput, participants) {
    const phone = normalizePhone(phoneInput);          // 하이픈·공백 제거
    const name = nameInput.trim();
    const hit = participants.find(p => normalizePhone(p.phone) === phone && p.name === name);
    return hit ? pass(hit) : fail("MSG_NO_MATCHING_APPLICATION");
  }
  ```

- **관련 요구사항**: REQ-012, REQ-065
- **관련 화면**: TBD (원본 U7, A12)
- **관련 테스트**: TBD

### POL-037 동일 휴대폰 중복 신청 [신규]

- **규칙**: 이미 신청 내역이 있는 휴대폰 번호로 다시 신청하면 **차단하지 않고 안내 후 진행을 허용한다.** 이름과 번호가 모두 같아도 마찬가지다.
- **적용 시점**: 접수폼 1단계 기본 정보 입력 후 다음 단계로 넘어갈 때(원본 U2), 관리자 현장 수동 접수 저장 시(원본 A3)
- **위반/실패 시 처리**: 경고(진행 가능). 문구 「이 번호로 접수된 신청이 이미 있습니다. 새로 신청하시려면 그대로 진행하시고, 신청 내역을 확인하시려면 [내 신청 확인하기]를 눌러 주세요.」 — 확인 버튼 2개(「계속 신청」 / 「내 신청 확인하기」)를 함께 노출한다.
- **예외**: 관리자 현장 수동 접수에서는 경고만 표시하고 즉시 저장할 수 있다(현장에서 확인 절차를 밟을 시간이 없다).
- **배경·근거**: 어르신 참가자가 가족의 휴대폰 번호를 공유해 신청하는 사례가 있어 번호 기준 차단은 실제 신청을 막는다. 대신 중복 접수 가능성을 신청자에게 알려 스스로 판단하게 한다. 중복 여부는 관리자 명단(원본 A3)에서 사후 확인·정리한다.
- **검증 의사코드**:

  ```js
  // 차단이 아니라 경고다. 반환값이 warn이어도 저장은 진행할 수 있다.
  function checkPol037(phoneInput, nameInput, existingParticipants) {
    const phone = normalizePhone(phoneInput);
    const dup = existingParticipants.filter(p => normalizePhone(p.phone) === phone);
    if (dup.length === 0) return pass();
    const sameName = dup.some(p => p.name === nameInput.trim());
    return warn("MSG_DUPLICATE_PHONE", { count: dup.length, sameName });
  }
  ```

- **관련 요구사항**: REQ-004, REQ-012
- **관련 화면**: TBD (원본 U2, A3)
- **관련 테스트**: TBD

### POL-040 본인 확인 시도 제한 [신규]

- **규칙**: 본인 확인(휴대폰 + 이름) 조회는 **동일 IP 기준 10분간 10회까지** 허용한다. 초과하면 10분간 차단한다.
- **적용 시점**: 참가자 본인 확인 조회 요청 시(원본 U7)
- **위반/실패 시 처리**: 차단. 문구 「조회 시도가 너무 많습니다. 10분 후에 다시 시도해 주세요. 급하시면 본부 접수처(연락처)로 문의해 주세요.」 차단 발생을 서버 로그에 기록한다.
- **예외**: 관리자 화면의 명단 검색(원본 A3)에는 적용하지 않는다. 로그인한 담당자의 업무 조회이기 때문이다.
- **배경·근거**: 본인 확인이 휴대폰 번호와 이름만으로 이루어지므로, 제한이 없으면 번호를 바꿔가며 타인의 신청 정보를 조회할 수 있다. NFR-006에서 파생된 정책이다.
- **검증 의사코드**:

  ```js
  const POL040_WINDOW_MS = 10 * 60 * 1000;
  const POL040_MAX_ATTEMPTS = 10;

  function checkPol040(ip, now, attemptLog) {
    const recent = attemptLog.filter(a => a.ip === ip && now - a.at < POL040_WINDOW_MS);
    if (recent.length >= POL040_MAX_ATTEMPTS) {
      logBlocked(ip, now);
      return fail("MSG_TOO_MANY_ATTEMPTS");
    }
    return pass();
  }
  ```

- **관련 요구사항**: REQ-012 (NFR-006)
- **관련 화면**: TBD (원본 U7)
- **관련 테스트**: TBD

## 2. 콘텐츠/데이터 정책

### POL-038 등록번호 채번 [신규]

- **규칙**: 등록번호는 **`집회시작일(YYYYMMDD)-순번 4자리`** 형식으로, 입금 매칭이 완료된 순서대로 `0001`부터 1씩 증가시켜 부여한다. 예: `20260619-0021`
- **적용 시점**: 입금 매칭이 매칭 완료로 전이되는 시점(원본 A4). 접수 시점이 아니다.
- **위반/실패 시 처리**:
  - 발급 전 표시 → 사용자·관리자 화면 모두에서 문구 「미발급」으로 표시한다.
  - 채번 충돌(동시 발급) → 차단하고 재시도한다. 담당자에게는 문구 「등록번호 발급에 실패했습니다. 다시 시도해 주세요.」
- **예외**: 환불 처리된 건의 등록번호는 회수하지 않고 결번으로 남긴다. 재사용하지 않는다.
- **배경·근거**: 등록번호는 명찰 출력(원본 A5)과 명단 검색(원본 A3)의 키로 쓰인다. 입금 확인 후 발급이라는 순서는 P-07·P-19에서 이미 정해졌고, 형식은 원본 데이터항목 시트의 예시값을 따랐다.
- **검증 의사코드**:

  ```js
  function issuePol038RegNo(conference, lastSeq) {
    const datePart = formatDate(conference.startDate, "YYYYMMDD");
    const seq = String(lastSeq + 1).padStart(4, "0");   // 0001 부터
    return `${datePart}-${seq}`;
  }

  function checkPol038(participant) {
    if (participant.paymentStatus !== "매칭") {
      return participant.regNo == null ? pass("미발급") : fail("MSG_REGNO_BEFORE_PAYMENT");
    }
    return /^\d{8}-\d{4}$/.test(participant.regNo) ? pass() : fail("MSG_REGNO_FORMAT");
  }
  ```

- **관련 요구사항**: REQ-034, REQ-074 (해제 시 등록번호 처리 미정 — OI-22)
- **관련 화면**: TBD (원본 U6, U8, A3, A4, A5)
- **관련 테스트**: TBD

### POL-042 입력값 형식·길이 [신규]

- **규칙**: 접수 입력 항목의 형식과 길이는 아래 표를 따른다.

  | 항목 | 필수 | 형식·길이 |
  |---|---|---|
  | 이름 | 필수 | 2~20자. 앞뒤 공백은 제거해 저장 |
  | 휴대폰 | 필수 | 숫자만 10~11자리. 하이픈·공백은 제거해 저장 |
  | 지역 | 필수 | 1~20자 |
  | 성별 | 필수 | 남 / 여 중 하나 |
  | 참가 구분 | 필수 | 참여자 / 인도자 중 하나 |
  | 구원 여부 | 필수 | 해결 / 재확인 / 미해결 중 하나 |
  | 몸 상태 | 필수 | 불편함 / 양호 중 하나 |
  | 알러지 | 필수 | 있음 / 없음 중 하나 |
  | 숙소 사용 여부 | 필수 | 숙소 사용 / 숙소 필요 없음 중 하나 |
  | 마음 상태 | 선택 | 최대 500자 |
  | 건강 상세 | 선택 | 최대 500자 |
  | 숙소 특이사항 | 선택 | 최대 500자 |

- **적용 시점**: 접수폼 각 단계의 다음 단계 이동 시(원본 U2, U3, U4), 관리자 현장 수동 접수 저장 시(원본 A3), 참가자 정보 수정 저장 시(원본 A3)
- **위반/실패 시 처리**: 차단. 해당 입력 항목 아래에 사유를 표시한다.
  - 이름 미입력 → 「이름을 입력해 주세요.」
  - 이름 길이 위반 → 「이름은 2자 이상 20자 이하로 입력해 주세요.」
  - 휴대폰 미입력 → 「휴대폰 번호를 입력해 주세요.」
  - 휴대폰 형식 위반 → 「휴대폰 번호는 숫자 10~11자리로 입력해 주세요.」
  - 선택형 미선택 → 「{항목명}을(를) 선택해 주세요.」
  - 서술형 길이 초과 → 「500자 이내로 입력해 주세요.」
- **예외**: 관리자 현장 수동 접수에서도 같은 규칙을 적용한다. 현장이라고 완화하지 않는다 — 완화하면 명단 품질이 경로에 따라 달라진다.
- **배경·근거**: 원본 기능정의서 U2-04는 "이름·휴대폰은 필수이며 휴대폰은 숫자 형식을 검증한다"까지만 정하고 길이 기준이 없었다. 검증 가능한 스펙으로 만들기 위해 값을 명시한다. 서술형 500자는 숙소 특이사항·건강 상세가 배정 판단에 쓰이는 짧은 메모라는 점을 반영했다.
- **검증 의사코드**:

  ```js
  const POL042_ENUM = {
    성별: ["남", "여"],
    참가구분: ["참여자", "인도자"],
    구원여부: ["해결", "재확인", "미해결"],
    몸상태: ["불편함", "양호"],
    알러지: ["있음", "없음"],
    숙소사용여부: ["숙소 사용", "숙소 필요 없음"],
  };

  function checkPol042(input) {
    const name = (input.name ?? "").trim();
    if (!name) return fail("MSG_NAME_REQUIRED");
    if (name.length < 2 || name.length > 20) return fail("MSG_NAME_LENGTH");

    const phone = normalizePhone(input.phone);         // 숫자 외 제거
    if (!phone) return fail("MSG_PHONE_REQUIRED");
    if (!/^\d{10,11}$/.test(phone)) return fail("MSG_PHONE_FORMAT");

    const region = (input.region ?? "").trim();
    if (region.length < 1 || region.length > 20) return fail("MSG_REGION_LENGTH");

    for (const [field, allowed] of Object.entries(POL042_ENUM)) {
      if (!allowed.includes(input[field])) return fail("MSG_SELECT_REQUIRED", { field });
    }
    for (const field of ["마음상태", "건강상세", "숙소특이사항"]) {
      if ((input[field] ?? "").length > 500) return fail("MSG_TEXT_TOO_LONG", { field });
    }
    return pass({ name, phone, region });
  }
  ```

- **관련 요구사항**: REQ-004, REQ-005, REQ-006, REQ-008, REQ-009, REQ-023, REQ-024
- **관련 화면**: TBD (원본 U2, U3, U4, A3)
- **관련 테스트**: TBD

### POL-046 공지·안내문 노출 규칙 [신규]

- **규칙**: 공지·일정·안내문은 **관리자가 게시(표시)로 설정한 항목만** 사용자 화면에 노출한다. 사용자는 **열람만** 가능하며 작성·수정·삭제할 수 없다. 게시 상태를 바꾸면 사용자 화면에 **즉시** 반영된다.

  | 대상 | 노출 조건 | 정렬 |
  |---|---|---|
  | 공지 | 게시 여부 = 게시 | 최신순 |
  | 일정 | 해당 날짜에 등록된 항목 | 시간 오름차순 |
  | 안내문 항목 | 표시 여부 = 표시 | 관리자가 지정한 순서 |

- **적용 시점**: 사용자 공지·일정 화면과 안내문 보관함 렌더 시(원본 U9, U12), 관리자 공지·안내문 저장 시(원본 A11)
- **위반/실패 시 처리**:
  - 비게시 항목이 사용자 화면에 노출되면 정책 위반으로 본다.
  - 노출 대상이 하나도 없을 때 빈 화면을 두지 않는다. 문구 「아직 등록된 공지가 없습니다.」 / 「오늘 등록된 일정이 없습니다.」 / 「아직 등록된 안내문이 없습니다.」
  - 사용자 화면에서 수정·삭제 요청이 들어오면 차단한다.
  - 안내문의 참가비·계좌 내용이 집회 설정값과 다르면 관리자에게 경고. 문구 「안내문에 적힌 참가비·계좌가 집회 설정과 다릅니다. 확인해 주세요.」
- **예외**: 접수가 마감된 뒤에도 공지·일정·안내문은 계속 열람할 수 있다. 마감은 신규 신청만 차단한다(POL-001).
- **배경·근거**: 원본 기능정의서 U9-01은 "사용자는 열람만 가능하다", A11-01은 "게시 상태를 관리한다"까지 정했으나 정책으로 정리되어 있지 않았다. 참가비·계좌가 두 곳(집회 설정, 안내문)에 적혀 어긋날 수 있어 대조 규칙을 함께 둔다.
- **검증 의사코드**:

  ```js
  function pol046VisibleNotices(notices) {
    return notices.filter(n => n.published).sort((a, b) => b.createdAt - a.createdAt);
  }

  function pol046VisibleSchedules(schedules, date) {
    return schedules.filter(s => sameDay(s.date, date)).sort((a, b) => a.time - b.time);
  }

  function checkPol046Empty(list, kind) {
    return list.length > 0 ? pass() : pass(emptyMessage(kind));    // 빈 화면 금지
  }

  function checkPol046UserAction(actor, action) {
    const readOnly = ["create", "update", "delete", "publish"];
    if (actor.role === "participant" && readOnly.includes(action)) return fail("MSG_READ_ONLY");
    return pass();
  }

  function checkPol046FeeConsistency(guide, conference) {
    if (!guide.mentionsFee) return pass();
    return guide.fee === conference.fee && guide.account === conference.account
      ? pass()
      : warn("MSG_GUIDE_FEE_MISMATCH");
  }
  ```

- **관련 요구사항**: REQ-015, REQ-016, REQ-062, REQ-063, REQ-073
- **관련 화면**: TBD (원본 U9, U12, A11)
- **관련 테스트**: TBD

## 3. 결제/과금 정책

온라인 결제는 범위에서 제외했다(PRD 1.3절). 참가비는 계좌이체로 받고 은행 입금 내역과 대조해 확인한다. 이 장은 그 확인·취소·환불 기준이다.

### POL-007 입금 확인 소요

- **규칙**: 입금 확인까지 2~3일이 소요될 수 있음을 마이페이지와 접수 완료 화면에 상시 안내한다.
- **적용 시점**: 접수 완료 화면 진입 시(원본 U6), 마이페이지 진입 시 입금 상태 영역 바로 아래(원본 U8)
- **위반/실패 시 처리**: 차단 아님(상시 노출 규칙). 문구 「입금 확인까지 2~3일 정도 걸릴 수 있습니다. 입금하셨다면 조금만 기다려 주세요.」 이 문구가 노출되지 않으면 정책 위반으로 본다.
- **예외**: 없음. 입금이 이미 확인된 참가자에게도 노출 위치는 유지하되, 문구는 확인 완료 표시로 대체한다.
- **배경·근거** (원본): 은행 내역을 모아서 확인하는 방식이라 즉시 반영되지 않는다. 「방금 입금했는데 왜 신청 완료가 안 돼 있냐」는 문의가 매우 많아 담당자 전화 응대량을 줄이려는 목적이다.
- **검증 의사코드**:

  ```js
  // 노출 규칙이므로 화면 렌더 결과를 검사한다.
  function checkPol007(screen) {
    if (!["U6", "U8"].includes(screen.id)) return pass();
    const anchor = screen.find("paymentStatusBlock");
    return anchor.nextSibling?.text?.includes("2~3일")
      ? pass()
      : fail("MSG_MISSING_PAYMENT_DELAY_NOTICE");
  }
  ```

- **관련 요구사항**: REQ-011, REQ-013
- **관련 화면**: TBD (원본 U6, U8)
- **관련 테스트**: TBD

### POL-008 매칭 단위

- **규칙**: 입금 매칭 상태는 **신청서 단위가 아니라 사람 한 명 단위로** 관리한다. 인원 집계는 매칭된 사람 수만 센다.
- **적용 시점**: 입금 자동 매칭 실행 시, 수동·분할 매칭 저장 시, 대시보드 인원 지표 계산 시(원본 A4, A1)
- **위반/실패 시 처리**:
  - 분할 매칭 시 배분 금액 합계가 입금액과 다르면 차단. 문구 「배분 금액의 합({배분합}원)이 입금액({입금액}원)과 다릅니다. 차액 {차액}원을 확인해 주세요.」
  - 대시보드 인원과 개인 단위 매칭 인원이 불일치하면 집계를 표시하지 않고 오류로 기록한다.
- **예외**: 없음. 한 사람이 여러 신청서에 들어가는 경우는 없다(신청서-참가자는 1:N).
- **배경·근거** (원본): 수양회 때 한 신청서에 여러 명이 있는데 각각 따로 입금해서, 부분 매칭은 되지만 대시보드 인원수가 어긋나는 오류가 있었다. 추적에 시간이 오래 걸렸다.
- **검증 의사코드**:

  ```js
  // 신청서 상태는 개인 상태에서 파생된다. 그 반대가 아니다.
  function derivePol008ApplicationStatus(application) {
    const people = application.participants;
    const matched = people.filter(p => p.paymentStatus === "매칭").length;
    if (matched === 0) return "미매칭";
    if (matched === people.length) return "매칭";
    return "부분 매칭";
  }

  function countPol008ConfirmedPersons(participants) {
    // 부분 매칭 신청서에서도 입금한 사람만 센다. 환불 완료는 제외한다.
    return participants.filter(p => p.paymentStatus === "매칭" && p.registrationStatus !== "환불").length;
  }

  function checkPol008Split(deposit, allocations) {
    const sum = allocations.reduce((acc, a) => acc + a.amount, 0);
    return sum === deposit.amount
      ? pass()
      : fail("MSG_SPLIT_AMOUNT_MISMATCH", { sum, amount: deposit.amount, diff: deposit.amount - sum });
  }
  ```

- **관련 요구사항**: REQ-031, REQ-032, REQ-070, REQ-074
- **관련 화면**: TBD (원본 A4, A1)
- **관련 테스트**: TBD

### POL-009 상태 용어·표시

- **규칙**: 입금 매칭 상태 표기는 **매칭 / 부분 매칭 / 미매칭 3가지만** 사용한다. 가수금 등 회계 용어를 쓰지 않는다. 미매칭은 빨간색 칩과 행 배경으로 강조하고, 확인된 건은 「확인」으로만 표기한다.
- **적용 시점**: 입금 매칭 화면 목록·탭(원본 A4), 접수 관리 명단(원본 A3), 대시보드 조치 필요 목록(원본 A1)
- **위반/실패 시 처리**: 차단 아님(표기 규칙). 허용 목록 밖의 상태 용어가 화면에 나타나면 정책 위반으로 본다. QA는 화면 문구를 허용 목록과 대조해 검사한다.
- **예외**: 없음.
- **배경·근거** (원본): 프로그램을 다루는 담당자가 매번 바뀔 수 있어 어려운 단어는 빼는 게 낫다는 의견이 있었다. 문제가 있는 건만 눈에 띄어야 한다.
- **검증 의사코드**:

  ```js
  const POL009_ALLOWED = ["매칭", "부분 매칭", "미매칭", "확인"];
  const POL009_FORBIDDEN = ["가수금", "미수금", "선수금", "대사", "정산"];

  function checkPol009(screenTexts) {
    for (const t of screenTexts) {
      if (POL009_FORBIDDEN.some(w => t.includes(w))) return fail("MSG_FORBIDDEN_TERM", { text: t });
    }
    return pass();
  }

  function checkPol009RowStyle(row) {
    if (row.paymentStatus !== "미매칭") return pass();
    return row.chipColor === "red" && row.rowHighlighted ? pass() : fail("MSG_UNMATCHED_NOT_HIGHLIGHTED");
  }
  ```

- **관련 요구사항**: REQ-030, REQ-033, REQ-071
- **관련 화면**: TBD (원본 A3, A4, A1)
- **관련 테스트**: TBD

### POL-047 입금내역 중복 적재 방지 [신규]

- **규칙**: 업로드한 은행 입금 내역은 **입금일시 + 입금자명 + 금액 + 은행** 4개 값이 모두 같으면 **같은 건으로 보고 다시 적재하지 않는다.** 같은 파일을 다시 올려도 건수가 늘지 않는다.
- **적용 시점**: 은행 입금내역 엑셀 업로드 처리 시(원본 A4)
- **위반/실패 시 처리**:
  - 중복 건은 건너뛰고 결과를 요약해 표시한다. 문구 「{총건수}건 중 {신규}건을 등록했습니다. {중복}건은 이미 등록된 내역이라 건너뛰었습니다.」
  - 형식이 맞지 않는 파일 → 차단. 문구 「입금 내역 파일 형식을 읽을 수 없습니다. 은행에서 내려받은 엑셀 파일인지 확인해 주세요.」
  - 업로드 일시·업로더·총건수·신규·중복 건수를 이력에 기록한다(POL-033).
- **예외**: 같은 사람이 같은 날 같은 금액을 두 번 입금한 실제 사례는 입금일시(분 단위)로 구분된다. 분 단위까지 완전히 같은 두 건은 은행 거래고유번호가 있으면 그 값을 우선 사용한다.
- **배경·근거**: 담당자가 며칠치를 나눠 받다 보면 기간이 겹치는 파일을 올리게 된다. 중복 적재되면 매칭 후보가 두 배로 늘어 매칭 판단이 어려워지고 순 입금액 집계가 어긋난다. 은행별 컬럼 구성은 아직 확보되지 않았다 — 오픈 이슈 OI-5.
- **검증 의사코드**:

  ```js
  function pol047Key(row) {
    return row.txId
      ? `tx:${row.txId}`                                          // 은행 거래고유번호가 있으면 우선
      : `${row.depositAt}|${row.depositorName}|${row.amount}|${row.bank}`;
  }

  function importPol047(rows, existing) {
    const seen = new Set(existing.map(pol047Key));
    const added = [], skipped = [];
    for (const r of rows) {
      const k = pol047Key(r);
      if (seen.has(k)) { skipped.push(r); continue; }
      seen.add(k); added.push(r);
    }
    return { total: rows.length, added: added.length, skipped: skipped.length };
  }
  ```

- **관련 요구사항**: REQ-029, REQ-030
- **관련 화면**: TBD (원본 A4)
- **관련 테스트**: TBD

### POL-004 취소 권한 [검토중]

- **규칙**: 입금 확인 **전**에는 참가자가 직접 취소할 수 있다. 입금 확인 **후**에는 본인 취소를 막고 관리자 연락처를 표시한다.
- **적용 시점**: 마이페이지의 취소 영역 렌더 시와 취소 실행 시(원본 U8), 관리자 접수·환불 관리(원본 A3)
- **위반/실패 시 처리**:
  - 입금 확인 후 본인 취소 시도 → 차단. 문구 「입금이 확인된 신청은 본인이 취소할 수 없습니다. 본부 접수처(연락처)로 연락해 주세요.」
  - 본인 취소 실행 시 확인 절차 → 문구 「신청을 취소하시겠습니까? 취소하시면 되돌릴 수 없고 다시 신청하셔야 합니다.」
- **예외**: 관리자는 모든 상태에서 취소·환불을 처리할 수 있다(POL-005를 따른다).
- **상태 사유**: **검토중.** 회의에서 방향만 정해졌고 이 프로세스가 실무에 맞는지 검토가 남아 있다 — 오픈 이슈 OI-2(담당: 박채림, 기한: 착수 +2주). 동행 신청에서 동행자 1명만 취소하는 경우의 처리도 함께 확정해야 한다.
- **검증 의사코드**:

  ```js
  function checkPol004(actor, participant) {
    if (actor.role !== "participant") return pass();          // 관리자는 POL-005를 따른다
    return participant.paymentStatus === "매칭"
      ? fail("MSG_SELF_CANCEL_BLOCKED")
      : pass();
  }
  ```

- **관련 요구사항**: REQ-014
- **관련 화면**: TBD (원본 U8, A3)
- **관련 테스트**: TBD

### POL-005 관리 버튼 노출 기준

- **규칙**: 관리자 명단에서 **수정 버튼은 모든 상태에서 항상 노출**한다. 두 번째 버튼만 입금 상태로 분기한다.

  | 개인 입금 상태 | 두 번째 버튼 |
  |---|---|
  | 미입금 · 미매칭 | [접수 취소] |
  | 부분 매칭 | 그 사람의 개인 입금 여부로 판단 — 입금했으면 [환불], 안 했으면 [접수 취소] |
  | 입금 확인(매칭) | [환불] |
  | 환불 완료 | [이력] 만 |

- **적용 시점**: 접수·환불 관리 명단의 각 행 렌더 시(원본 A3)
- **위반/실패 시 처리**: 차단. 상태에 맞지 않는 버튼을 눌러 요청이 들어오면 처리하지 않는다.
  - 미입금 건에 환불 요청 → 문구 「입금 내역이 없는 신청입니다. 접수 취소로 처리해 주세요.」
  - 환불 완료 건에 재처리 요청 → 문구 「이미 환불 처리된 신청입니다. 이력만 조회할 수 있습니다.」
- **예외**: 없음. 판단 기준은 **개인 단위 입금 여부** 하나다(POL-008과 같은 단위).
- **배경·근거** (원본): 같은 확인 상태인데 어떤 행에는 환불 버튼이 있고 어떤 행에는 없어 기준이 불명확하다는 지적이 있었다. 돌려줄 돈이 없는 건은 환불이 아니라 접수 취소다.
- **검증 의사코드**:

  ```js
  function resolvePol005Buttons(participant) {
    const buttons = ["수정"];                         // 항상 노출
    switch (participant.registrationStatus) {
      case "환불":
        buttons.push("이력");
        break;
      default:
        buttons.push(participant.paymentStatus === "매칭" ? "환불" : "접수 취소");
    }
    return buttons;
  }

  function checkPol005Action(participant, action) {
    const allowed = resolvePol005Buttons(participant);
    if (allowed.includes(action)) return pass();
    if (action === "환불") return fail("MSG_REFUND_WITHOUT_PAYMENT");
    if (participant.registrationStatus === "환불") return fail("MSG_ALREADY_REFUNDED");
    return fail("MSG_ACTION_NOT_ALLOWED");
  }
  ```

- **관련 요구사항**: REQ-025, REQ-026, REQ-027, REQ-070
- **관련 화면**: TBD (원본 A3, A1)
- **관련 테스트**: TBD

### POL-006 환불 수취인 [미확정]

- **규칙**: 돈은 **실제 입금자에게** 돌려준다. 인도자가 여러 명분을 일괄 입금한 경우 환불 계좌 기본값은 인도자로 채우고, 금액은 취소 인원분만 계산한다(취소 인원 수 × 참가비).
- **적용 시점**: 환불 팝업 진입 시 계좌 기본값 채우기, 환불 금액 계산 시(원본 A3)
- **위반/실패 시 처리**:
  - 기본값 계좌를 변경하는 경우 → 경고(진행 가능). 문구 「입금하신 분과 다른 계좌로 환불합니다. 계좌와 예금주를 다시 확인해 주세요.」
  - 계좌·예금주·사유 미입력 → 차단. 문구 「환불 계좌, 예금주, 환불 사유를 모두 입력해 주세요.」
- **예외**: 본인이 직접 입금한 건은 수취인이 본인이므로 분기가 없다.
- **상태 사유**: **미확정.** 환불 대상은 개인이지만 돈을 낸 사람은 인도자인 경우가 있다. 실무에서 취소한 본인 계좌로 처리했는지 확인이 필요하다 — 오픈 이슈 OI-3(담당: 박채림, 기한: 착수 +2주). 기준이 뒤집히면 기본값 계좌가 인도자에서 본인으로 바뀐다.
- **검증 의사코드**:

  ```js
  function resolvePol006Payee(application, cancelTargets) {
    const payer = application.depositor ?? application.leader;   // 실제 입금자 우선
    const amount = cancelTargets.length * application.conference.fee;
    return { defaultAccountHolder: payer, amount, editable: true };
  }

  function checkPol006(refundInput) {
    if (!refundInput.bank || !refundInput.accountNo || !refundInput.holder || !refundInput.reason) {
      return fail("MSG_REFUND_FIELDS_REQUIRED");
    }
    if (refundInput.holder !== refundInput.defaultAccountHolder) return warn("MSG_REFUND_PAYEE_CHANGED");
    return pass();
  }
  ```

- **관련 요구사항**: REQ-007, REQ-028
- **관련 화면**: TBD (원본 U3, A3)
- **관련 테스트**: TBD

## 4. 알림 정책

### POL-034 문자 발송 [검토중]

- **규칙**: 등록 완료 문자는 사용한다. 입금 확인 완료 문자는 도입을 검토한다. **도입 시 발신번호 사전등록이 선행되어야 하며, 등록되지 않은 상태에서는 발송을 실행하지 않는다.**
- **적용 시점**: 접수 완료 처리 직후(원본 U6), 입금 매칭 완료 직후(원본 A4), 문자 템플릿·발신번호 설정 화면(원본 A11)
- **위반/실패 시 처리**:
  - 발신번호 미등록 상태에서 발송 시도 → 차단. 담당자에게 문구 「발신번호가 등록되지 않아 문자를 보낼 수 없습니다. [계정·설정]에서 발신번호를 먼저 등록해 주세요.」
  - 발송 실패 → 기록. 발송 이력에 실패로 남기고 재발송 대상으로 표시한다. 참가자 화면에는 노출하지 않는다.
- **예외**: 문자를 도입하지 않는 경우에도 접수 완료 화면(POL-007)과 마이페이지 안내만으로 안내가 완결되어야 한다. 문자는 보조 수단이다.
- **상태 사유**: **검토중.** 유료 문자 기능 도입 여부가 결정되지 않았다 — 오픈 이슈 OI-15(담당: 총괄, 기한: D-45). 수양회는 매칭 완료 시 자동 발송을 썼으나 대전도집회 도입은 미정이다. 문자 링크로 본인 확인을 건너뛰는 기능(원본 U7-02)을 쓸 경우 링크 유효기간 정책을 함께 정해야 한다.
- **검증 의사코드**:

  ```js
  function checkPol034(smsConfig, event) {
    if (!smsConfig.enabled) return pass("문자 미사용 — 화면 안내로 대체");
    if (!smsConfig.senderNumberVerified) return fail("MSG_SENDER_NOT_REGISTERED");
    const template = smsConfig.templates[event.type];   // "등록완료" | "입금확인"
    if (!template || !template.inUse) return pass("해당 이벤트 템플릿 미사용");
    return pass(render(template, event));
  }
  ```

- **관련 요구사항**: REQ-064
- **관련 화면**: TBD (원본 U6, U7, A11)
- **관련 테스트**: TBD

## 5. 권한/등급 정책

| 역할 | 설명 | 주요 권한 |
|---|---|---|
| 참가자 (비로그인) | 신청자·동행자 | 접수폼 제출, 본인 확인 후 마이페이지 조회, 셔틀 요청, 공지·안내문 열람. 로그인 계정 없음 |
| 전체 어드민 (총괄) | 계정과 권한을 관리하는 최상위 역할 | 전체 메뉴 + **계정 추가·권한 변경(이 역할만 가능)** |
| 본부 총괄 | 본부 운영 책임자 | 계정 관리를 제외한 전체 메뉴 |
| 본부 팀원 | 접수·입금·숙소·상담을 담당하는 본부 인원 | 계정 관리를 제외한 전체 메뉴(기본값) |
| 셔틀팀 | 외부 팀. 배차와 탑승 확인만 수행 | 셔틀 관리 화면만 |
| 국내선교팀 | 기존 접수 담당. 인수인계 대상 | 접수·명단 관련 메뉴 (범위는 인수인계 시 확정 — OI-16) |
| 집회장 팀장·부팀장 | 시스템 사용 사유 없음 | **계정 발급하지 않음** |

### POL-030 계정 발급

- **규칙**: 전체 어드민(총괄) 역할 계정만 관리자 계정을 추가하고 권한을 변경할 수 있다.
- **적용 시점**: 계정 추가·역할 변경·메뉴 권한 저장 시, 계정 관리 화면 진입 시(원본 A12)
- **위반/실패 시 처리**: 차단. 문구 「계정 추가와 권한 변경은 전체 관리자만 할 수 있습니다.」 시도 사실을 변경 이력에 기록한다.
- **예외**: 없음. 최초 전체 어드민 계정은 시스템 구축 시 1개 생성한다.
- **배경·근거** (원본): 전체 어드민 계정 하나를 만들고 그 계정이 나머지 계정을 추가하는 구조로 정했다.
- **검증 의사코드**:

  ```js
  function checkPol030(actor, action) {
    const restricted = ["createAccount", "changeRole", "changeMenuPermission", "viewAccountPage"];
    if (!restricted.includes(action)) return pass();
    if (actor.role !== "전체 어드민") {
      logAttempt(actor, action);
      return fail("MSG_ADMIN_ONLY");
    }
    return pass();
  }

  // 마지막 전체 어드민을 잃지 않는다.
  function checkPol030LastAdmin(accounts, target, newRole) {
    const admins = accounts.filter(a => a.role === "전체 어드민" && a.active);
    if (admins.length === 1 && admins[0].id === target.id && newRole !== "전체 어드민") {
      return fail("MSG_LAST_ADMIN_PROTECTED");
    }
    return pass();
  }
  ```

- **관련 요구사항**: REQ-066
- **관련 화면**: TBD (원본 A12)
- **관련 테스트**: TBD

### POL-031 기본 권한

- **규칙**: 본부 인원(본부 총괄·본부 팀원)은 **계정 관리를 제외한 전체 메뉴를 개방**하는 것을 기본값으로 한다. 본부가 아닌 외부 팀만 필요한 메뉴로 제한한다.
- **적용 시점**: 계정 생성 시 역할별 기본 권한 적용, 메뉴 렌더 시, 화면 URL 직접 접근 시(원본 A12 및 전 관리자 화면)
- **위반/실패 시 처리**: 차단. 권한 없는 메뉴는 화면에 노출하지 않고, URL로 직접 접근하면 문구 「이 메뉴에 접근할 권한이 없습니다.」와 함께 대시보드로 이동시킨다.
- **예외**: 계정 관리 메뉴는 전체 어드민만(POL-030). 본부 인원의 메뉴를 임의로 좁히지 않는다.
- **배경·근거** (원본): 날짜에 따라 업무가 접수에서 상담으로 이동한다. 첫날·이튿날은 상담 일이 거의 없어 접수를 도와야 하므로 전원이 전체를 알아야 한다는 결론이었다.
- **검증 의사코드**:

  ```js
  const POL031_DEFAULT_MENUS = {
    "전체 어드민": ALL_MENUS,
    "본부 총괄": ALL_MENUS.filter(m => m !== "계정·권한"),
    "본부 팀원": ALL_MENUS.filter(m => m !== "계정·권한"),
    "셔틀팀": ["셔틀 관리"],
    "국내선교팀": ["접수·환불 관리"],            // 인수인계 시 확정 (OI-16)
  };

  function checkPol031(account, menu) {
    const allowed = account.menus ?? POL031_DEFAULT_MENUS[account.role] ?? [];
    return allowed.includes(menu) ? pass() : fail("MSG_MENU_FORBIDDEN");
  }
  ```

- **관련 요구사항**: REQ-066, REQ-067
- **관련 화면**: TBD (원본 A12, 전 관리자 화면)
- **관련 테스트**: TBD

### POL-032 계정 미발급 대상

- **규칙**: 집회장 팀장·부팀장에게는 계정을 발급하지 않는다. 외부 팀 중 계정을 발급하는 대상은 **셔틀팀뿐**이다.
- **적용 시점**: 계정 추가 시 소속·역할 선택(원본 A12)
- **위반/실패 시 처리**: 경고(진행 가능). 문구 「외부 팀 계정은 셔틀팀만 발급하기로 정해져 있습니다. 그래도 발급하시겠습니까?」 발급을 강행하면 변경 이력에 기록한다.
- **예외**: 운영 중 필요가 생기면 전체 어드민 판단으로 발급할 수 있다. 다만 기록을 남긴다.
- **배경·근거** (원본): 실제로 본부에 있는 인원이 거의 다 쓰고, 외부에서 쓸 만한 메뉴는 셔틀밖에 없었다.
- **검증 의사코드**:

  ```js
  const POL032_EXTERNAL_ALLOWED = ["셔틀팀"];

  function checkPol032(newAccount) {
    if (!newAccount.isExternal) return pass();
    if (POL032_EXTERNAL_ALLOWED.includes(newAccount.role)) return pass();
    return warn("MSG_EXTERNAL_ACCOUNT_UNUSUAL", { role: newAccount.role });
  }
  ```

- **관련 요구사항**: REQ-061, REQ-066
- **관련 화면**: TBD (원본 A12)
- **관련 테스트**: TBD

### POL-027 셔틀 조작 권한

- **규칙**: 본부 접수처와 셔틀 운행팀 **양쪽에서** 셔틀 요청을 조회하고 배차할 수 있다. 배차 확정 시 차량번호와 운전자를 함께 표시한다.
- **적용 시점**: 셔틀 관리 화면 진입·배차 확정·탑승 확인 시(원본 A10)
- **위반/실패 시 처리**:
  - 차량번호·운전자 미입력 상태로 배차 확정 → 차단. 문구 「차량번호와 운전자를 입력해 주세요.」
  - 권한 없는 계정의 접근 → POL-031을 따른다.
- **예외**: 셔틀팀 계정은 셔틀 관리 외 메뉴에 접근할 수 없다(POL-031).
- **배경·근거** (원본): 본부가 전화 요청을 대신 입력해도 셔틀팀이 탑승자 명단·인원·성함을 알아야 누락자나 안 온 인원을 바로 파악할 수 있다.
- **검증 의사코드**:

  ```js
  const POL027_ROLES = ["전체 어드민", "본부 총괄", "본부 팀원", "셔틀팀"];

  function checkPol027(actor) {
    return POL027_ROLES.includes(actor.role) ? pass() : fail("MSG_MENU_FORBIDDEN");
  }

  function checkPol027Dispatch(dispatch) {
    if (!dispatch.vehicleNo || !dispatch.driver) return fail("MSG_VEHICLE_INFO_REQUIRED");
    return pass();
  }
  ```

- **관련 요구사항**: REQ-058, REQ-059, REQ-061
- **관련 화면**: TBD (원본 A10)
- **관련 테스트**: TBD

## 6. 운영/어뷰징 정책

**해당 없음.** 이 시스템은 불특정 다수가 콘텐츠를 올리는 서비스가 아니다. 참가자가 입력하는 값은 자기 신청 정보뿐이고 게시·댓글·신고 기능이 없어 어뷰징·금칙어·제재 기준이 필요하지 않다.

다만 본인 확인이 휴대폰 번호와 이름만으로 이루어지므로 조회 남용에 대한 제한은 필요하며, 이는 **POL-040(본인 확인 시도 제한)**으로 1장에 두었다.

## 7. 법적/개인정보 정책

### POL-045 필수 동의 2종 [신규]

- **규칙**: 접수 완료 전에 **개인정보 수집·이용 동의**와 **민감정보 수집·이용 동의**를 각각 별도로 받는다. 둘 다 필수이며, 한 항목이라도 동의하지 않으면 신청을 완료하지 않는다. 각 동의의 동의 여부와 동의 일시를 개별로 기록한다.

  | 동의 항목 | 수집 항목 | 이용 목적 |
  |---|---|---|
  | 개인정보 수집·이용 (필수) | 이름, 휴대폰 번호, 지역, 성별 | 집회 참가 신청 처리, 입금 확인, 안내 연락 |
  | 민감정보 수집·이용 (필수) | 몸 상태, 알러지, 건강 상세, 구원 여부, 마음 상태 | 숙소 배정, 식단 참고, 상담 배치 |

- **적용 시점**: 접수폼 4단계 동의 화면의 신청 완료 실행 시(원본 U5). 관리자 현장 수동 접수 시에는 담당자가 구두 동의를 확인한 뒤 대리 체크한다.
- **위반/실패 시 처리**: 차단.
  - 미동의 상태로 완료 시도 → 문구 「신청을 완료하려면 개인정보 수집·이용 동의와 민감정보 수집·이용 동의가 모두 필요합니다.」
  - 동의 일시 기록 실패 → 신청을 완료하지 않는다(동의 기록 없는 신청은 만들지 않는다).
- **예외**: 없음. 두 동의를 하나로 합쳐 받지 않는다 — 민감정보는 별도 동의가 필요하다.
- **배경·근거**: 원본 기능정의서 U5-01·U5-02는 두 동의를 분리해 받도록 정했으나 정책으로는 정리되어 있지 않았다. 건강·알러지·구원 여부는 개인정보보호법상 민감정보에 해당해 일반 개인정보와 분리한 동의가 필요하다.
- **검증 의사코드**:

  ```js
  function checkPol045(consent, now) {
    if (!consent.personalInfo?.agreed) return fail("MSG_CONSENT_REQUIRED");
    if (!consent.sensitiveInfo?.agreed) return fail("MSG_CONSENT_REQUIRED");
    if (!consent.personalInfo.agreedAt || !consent.sensitiveInfo.agreedAt) {
      return fail("MSG_CONSENT_TIMESTAMP_MISSING");
    }
    return pass();
  }
  ```

- **관련 요구사항**: REQ-010
- **관련 화면**: TBD (원본 U5, A3)
- **관련 테스트**: TBD

### POL-039 개인정보 보관기간·파기 [신규]

- **규칙**: 수집한 정보는 **집회 종료일 기준 아래 기간이 지나면 파기**한다.

  | 구분 | 항목 | 보관기간 |
  |---|---|---|
  | 민감정보 | 몸 상태, 알러지, 건강 상세, 구원 여부, 마음 상태, 숙소 특이사항, 상담 결과·요약 | 집회 종료 후 **3개월** |
  | 개인정보 | 이름, 휴대폰 번호, 지역, 성별, 등록번호, 입금·환불 기록 | 집회 종료 후 **1년** |

- **적용 시점**: 집회 상태를 종료·보관으로 변경한 시점부터 기간을 계산한다. 파기는 기간 경과 후 배치로 실행한다.
- **위반/실패 시 처리**: 기록.
  - 보관기간이 지난 데이터가 남아 있으면 관리자 대시보드에 문구 「보관기간이 지난 개인정보 {n}건이 있습니다. 파기가 필요합니다.」로 표시한다.
  - 파기 실행 결과(대상 건수·일시·실행자)를 변경 이력에 기록한다.
- **예외**: 다음 회차 안내·통계에 사용하기 위해 개인정보를 1년 보관한다. 민감정보는 다음 회차에 재사용하지 않으므로 3개월로 더 짧게 둔다. **법령상 별도 보존 의무가 있는 항목이 있는지는 개인정보 처리방침 본문 확정 시 함께 확인한다(OI-6).**
- **배경·근거**: 원본 기준서에 보관기간 정책이 없었다. 민감정보를 수집하면서 파기 기준이 없으면 처리방침을 쓸 수 없고, 동의 화면에 보유기간을 명시할 수도 없다. NFR-005에서 파생된 정책이다.
- **검증 의사코드**:

  ```js
  const POL039_RETENTION_DAYS = { sensitive: 90, personal: 365 };

  function pol039ExpiredItems(conference, now) {
    if (conference.status !== "종료·보관") return [];
    const base = conference.endDate;
    const out = [];
    if (daysBetween(base, now) > POL039_RETENTION_DAYS.sensitive) out.push("sensitive");
    if (daysBetween(base, now) > POL039_RETENTION_DAYS.personal) out.push("personal");
    return out;
  }

  function checkPol039(conference, participants, now) {
    const expired = pol039ExpiredItems(conference, now);
    if (expired.length === 0) return pass();
    const remaining = participants.filter(p => expired.some(kind => hasData(p, kind)));
    return remaining.length === 0 ? pass() : warn("MSG_RETENTION_EXPIRED", { count: remaining.length });
  }
  ```

- **관련 요구사항**: REQ-010 (NFR-005)
- **관련 화면**: TBD (원본 U5, A1, A2)
- **관련 테스트**: TBD

### POL-041 개인정보·민감정보 암호화 [신규]

- **규칙**: **휴대폰 번호, 몸 상태, 알러지, 건강 상세, 구원 여부, 마음 상태, 숙소 특이사항, 상담 결과·요약, 환불 계좌번호**는 암호화해 저장한다. 모든 통신 구간은 HTTPS로 전송한다.
- **적용 시점**: 해당 항목의 저장·수정 시, 모든 요청 처리 시
- **위반/실패 시 처리**: 차단.
  - HTTP 요청 → HTTPS로 리다이렉트한다.
  - 암호화 대상 항목이 평문으로 저장되면 저장을 실패 처리하고 오류를 기록한다.
  - 명단 내보내기(엑셀)에는 복호화된 값이 포함되므로, 내보내기 실행을 변경 이력에 기록한다(POL-033).
- **예외**: 검색 대상인 이름과 지역은 암호화하지 않는다. 휴대폰은 검색이 필요하므로 검색용 해시를 별도 컬럼에 둔다.
- **배경·근거**: 원본 기준서에 보안 정책이 없었다. 건강·구원 여부는 민감정보이고, 휴대폰 번호는 본인 확인 키로 쓰여 유출 시 타인의 신청 정보 조회로 이어진다. NFR-004에서 파생된 정책이다.
- **검증 의사코드**:

  ```js
  const POL041_ENCRYPTED_FIELDS = [
    "phone", "bodyCondition", "allergy", "healthDetail",
    "salvationStatus", "mindState", "lodgingNote",
    "counselResult", "counselSummary", "refundAccountNo",
  ];

  function checkPol041OnSave(record) {
    for (const f of POL041_ENCRYPTED_FIELDS) {
      if (record[f] != null && !isEncrypted(record[f])) return fail("MSG_PLAINTEXT_FIELD", { field: f });
    }
    if (record.phone != null && !record.phoneHash) return fail("MSG_PHONE_HASH_MISSING");
    return pass();
  }

  function checkPol041Transport(request) {
    return request.protocol === "https" ? pass() : redirect(toHttps(request.url));
  }
  ```

- **관련 요구사항**: REQ-008, REQ-010, REQ-012, REQ-075(보류 — 내보내기 항목 범위 미정 OI-23) (NFR-004)
- **관련 화면**: TBD (전 화면)
- **관련 테스트**: TBD

## 8. 접수 정책

접수 기간과 정원을 어떻게 잡을지에 대한 기준이다. 이 값이 사용자 화면의 접수 기간 배너와 접수 차단에 그대로 반영된다.

### POL-001 온라인 접수 마감

- **규칙**: 집회 시작 **최소 3일 전**에 온라인 접수를 마감한다. 마감 이후에는 신청 버튼을 비활성화하고 마감 안내를 표시한다.
- **적용 시점**: 접수 홈 배너 렌더 시(원본 U1), 접수폼 진입 시, 신청 완료 제출 시(원본 U2~U6), 집회 설정 저장 시(원본 A2)
- **위반/실패 시 처리**:
  - 마감 후 신청 진입 시도 → 차단(버튼 비활성). 문구 「온라인 접수가 마감되었습니다. (마감: {마감일시})」
  - 마감 후 접수폼 URL 직접 접근 또는 제출 → 차단. 문구 「접수 기간이 종료되어 신청을 완료할 수 없습니다. 본부 접수처(연락처)로 문의해 주세요.」
  - 마감 일시를 집회 시작 3일 전보다 늦게 설정 → 경고(저장 가능). 문구 「접수 마감이 집회 시작 3일 전보다 늦습니다. 숙소 배정과 명찰 출력 시간이 부족할 수 있습니다.」
- **예외**: 관리자 현장 수동 접수(원본 A3)는 마감 이후에도 가능하다. POL-003을 따른다.
- **배경·근거** (원본): 숙소 배정·명찰 출력·돌발 대응에 시간이 필요하다. 3일이라도 주어지면 배정과 명찰 출력, 예상치 못한 일 처리까지 여유가 생긴다는 실무 의견이 있었다.
- **검증 의사코드**:

  ```js
  const POL001_MIN_LEAD_DAYS = 3;

  function checkPol001Setting(conference) {
    const deadline = conference.applyEndAt;
    if (deadline >= conference.startDate) return fail("MSG_DEADLINE_AFTER_START");
    if (daysBetween(deadline, conference.startDate) < POL001_MIN_LEAD_DAYS) {
      return warn("MSG_DEADLINE_TOO_LATE");
    }
    return pass();
  }

  function checkPol001Apply(conference, now, actor) {
    if (actor.role !== "participant") return pass();          // 현장 수동 접수는 예외
    if (now < conference.applyStartAt) return fail("MSG_APPLY_NOT_OPEN");
    if (now > conference.applyEndAt) return fail("MSG_APPLY_CLOSED");
    return pass();
  }
  ```

- **관련 요구사항**: REQ-001, REQ-021
- **관련 화면**: TBD (원본 U1, U2~U6, A2)
- **관련 테스트**: TBD

### POL-002 정원·현장 버퍼

- **규칙**: 총 정원 **1,400명** 중 **80석(약 6%)**을 현장 대응용 버퍼로 남기고, 온라인 접수는 **1,320명**에서 차단한다. 세 값은 모두 집회 설정값이다.
- **적용 시점**: 신청 완료 제출 시 좌석 검사(원본 U2~U6), 대시보드 지표 계산 시(원본 A1), 집회 설정 저장 시(원본 A2)
- **위반/실패 시 처리**:
  - 잔여 좌석 부족 → 차단. 문구 「신청 인원이 남은 자리보다 많습니다. 남은 자리는 {잔여}명입니다. 본부 접수처(연락처)로 문의해 주세요.」
  - 정원 도달 → 차단. 문구 「접수 인원이 모두 찼습니다. 본부 접수처(연락처)로 문의해 주세요.」
  - 버퍼가 총 정원보다 크게 설정 → 차단. 문구 「현장 버퍼 좌석은 총 정원보다 클 수 없습니다.」
- **예외**: 관리자 현장 수동 접수는 버퍼 좌석을 사용하므로 온라인 차단선(1,320명)에 걸리지 않는다. 버퍼까지 소진되면 경고를 표시한다.
- **배경·근거** (원본): 숙소 규모가 전날까지 확정되지 않는 경우가 있어 몇 명까지 받아도 되는지 헷갈리는 시점이 있었다. 정원보다 미리 덜 받아야 한다는 판단이다.
- **검증 의사코드**:

  ```js
  function pol002OnlineCapacity(conference) {
    return conference.totalCapacity - conference.onsiteBuffer;   // 1400 - 80 = 1320
  }

  function checkPol002Setting(conference) {
    if (conference.onsiteBuffer >= conference.totalCapacity) return fail("MSG_BUFFER_TOO_LARGE");
    return pass();
  }

  function checkPol002Apply(conference, activeCount, requestCount, actor) {
    const limit = actor.role === "participant"
      ? pol002OnlineCapacity(conference)
      : conference.totalCapacity;                                // 현장 접수는 버퍼까지 사용
    const remaining = limit - activeCount;                       // activeCount = 접수 − 취소 − 환불
    if (remaining <= 0) return fail("MSG_CAPACITY_FULL");
    if (requestCount > remaining) return fail("MSG_NOT_ENOUGH_SEATS", { remaining });
    return pass();
  }
  ```

- **관련 요구사항**: REQ-002, REQ-023, REQ-070
- **관련 화면**: TBD (원본 U2~U6, A1, A2)
- **관련 테스트**: TBD

### POL-044 정원 차단 후 재개 [신규]

- **규칙**: 온라인 접수가 정원 도달로 차단된 뒤 취소·환불로 인원이 줄어도 **접수를 자동으로 다시 열지 않는다.** 비는 자리는 현장 버퍼와 합쳐 관리자 현장 수동 접수로 사용한다.
- **적용 시점**: 접수 취소·환불 처리 완료 직후 접수 차단 상태 재평가 시(원본 A3), 신청 완료 제출 시(원본 U6)
- **위반/실패 시 처리**: 차단. 정원 도달로 한 번 차단되면 마감 안내를 유지한다. 문구는 POL-002의 「접수 인원이 모두 찼습니다. 본부 접수처(연락처)로 문의해 주세요.」를 그대로 쓴다.
- **예외**: 관리자가 필요하다고 판단하면 집회 설정에서 정원을 조정해 접수를 다시 열 수 있다. 이 경우 변경 이력에 기록된다(POL-033).
- **배경·근거**: 자동 재개는 「어제는 마감이라더니 오늘은 되네」라는 상황을 만들어 안내가 꼬인다. 취소로 생긴 한두 자리를 온라인에서 선착순으로 여는 것보다, 본부가 대기 문의를 받아 현장 버퍼로 배정하는 편이 통제된다. 원본 기준서에 없던 지점이며 PRD 작성 중 드러났다(OI-8).
- **검증 의사코드**:

  ```js
  // 차단은 상태로 고정한다. 인원 감소로 자동 해제되지 않는다.
  function onPol044Cancel(conference, activeCount) {
    return { applyBlocked: conference.applyBlocked };            // 그대로 유지 — 재계산하지 않는다
  }

  function checkPol044(conference, activeCount, actor) {
    if (!conference.applyBlocked) return pass();
    if (actor.role !== "participant") return pass();             // 현장 수동 접수는 계속 가능
    return fail("MSG_CAPACITY_FULL");
  }
  ```

- **관련 요구사항**: REQ-002, REQ-023, REQ-026, REQ-027
- **관련 화면**: TBD (원본 U6, A2, A3)
- **관련 테스트**: TBD

### POL-003 현장 접수 방침

- **규칙**: 사용자 화면과 안내문에 **「현장 접수 없음」**으로 표기한다. 실제로 방문하는 인원은 버퍼 좌석으로 수용하고 관리자가 수동 접수한다.
- **적용 시점**: 접수 홈 배너(원본 U1), 안내문 보관함(원본 U12), 집회 설정의 현장 접수 방침 항목(원본 A2)
- **위반/실패 시 처리**: 차단 아님(표기 규칙). 방침을 켠 상태에서 사용자 화면에 해당 문구가 노출되지 않으면 정책 위반으로 본다. 문구 「현장 접수는 받지 않습니다. 반드시 온라인으로 미리 신청해 주세요.」
- **예외**: 표기와 무관하게 관리자 현장 수동 접수 기능(원본 A3)은 항상 동작한다. 표기는 사전 신청을 유도하기 위한 것이지 기능을 끄는 것이 아니다.
- **배경·근거** (원본): 현장 접수가 예상보다 많았다. 「가면 당연히 있을 것」이라는 인식을 바꾸려면 광고에 명시해야 한다는 의견이 있었다. 그래도 오는 인원이 있으므로 받을 준비는 해 둔다.
- **검증 의사코드**:

  ```js
  function checkPol003(conference, screen) {
    if (!conference.showNoOnsiteNotice) return pass();
    if (!["U1", "U12"].includes(screen.id)) return pass();
    return screen.texts.some(t => t.includes("현장 접수는 받지 않습니다"))
      ? pass()
      : fail("MSG_MISSING_NO_ONSITE_NOTICE");
  }
  ```

- **관련 요구사항**: REQ-021, REQ-023
- **관련 화면**: TBD (원본 U1, U12, A2, A3)
- **관련 테스트**: TBD

### POL-043 동행자 인원 상한 [미확정]

- **규칙**: 한 신청서에 등록할 수 있는 동행자 수의 상한은 **집회 설정값**으로 둔다. 인도자 본인을 포함한 총 인원이 상한을 넘으면 추가할 수 없다.
- **적용 시점**: 동행자 추가 실행 시(원본 U3), 관리자 현장 접수의 동행자 추가 시(원본 A3)
- **위반/실패 시 처리**: 차단. 문구 「한 번에 신청할 수 있는 인원은 최대 {상한}명입니다. 인원이 더 많으시면 나누어 신청해 주세요.」
- **예외**: 관리자 현장 수동 접수에서는 상한을 넘겨 등록할 수 있다. 현장에서 일행을 쪼개 입력하게 하는 것이 더 혼란스럽기 때문이다. 이 경우 경고만 표시한다.
- **상태 사유**: **미확정.** 기본값이 정해지지 않았다 — 오픈 이슈 OI-10(담당: 본부, 기한: 착수 +4주). 원본 기능정의서 U3-02는 "인원 상한은 설정값으로 둔다"까지만 정하고 값을 비워 두었다.
- **검증 의사코드**:

  ```js
  function checkPol043(conference, currentTotal, addCount, actor) {
    const max = conference.maxCompanionsPerApplication;          // 기본값 미정 (OI-10)
    if (max == null) return pass("상한 미설정 — 제한 없음");
    if (currentTotal + addCount <= max) return pass();
    return actor.role === "participant"
      ? fail("MSG_COMPANION_LIMIT", { max })
      : warn("MSG_COMPANION_LIMIT_ADMIN", { max });
  }
  ```

- **관련 요구사항**: REQ-006, REQ-023
- **관련 화면**: TBD (원본 U3, A3)
- **관련 테스트**: TBD

## 9. 숙소 정책

숙소 배정의 룰과 시점에 대한 기준이다. 항목이 가장 많고 현장 대응과 직접 연결된다.
배정 룰은 **1순위(POL-010) → 필수 반영(POL-011) → 참고(POL-012)** 순으로 적용한다. 충돌하면 앞 순위가 이긴다.

### POL-010 배정 룰 — 1순위

- **규칙**: 동행자(인도자-참여자)를 **같은 방에 붙여 배치**한다. 성별이 다르면 불가피하게 분리한다.
- **적용 시점**: 동행 그룹 배정 실행 시, 일괄 랜덤 배치 실행 시(원본 A6)
- **위반/실패 시 처리**:
  - 방의 잔여 좌석이 그룹 인원보다 적음 → 차단. 문구 「이 방에 남은 자리는 {잔여}개입니다. 동행 {인원}명을 모두 배정할 수 없습니다.」
  - 성별이 다른 구성원 포함 → 경고(진행 가능). 문구 「성별이 달라 {이름} 님은 다른 방으로 분리 배정됩니다.」 분리된 인원을 화면에 표시한다.
- **예외**: 성별 분리는 예외가 아니라 규칙의 일부다. 동행자가 아닌 지인의 근접 배치는 확약하지 않는다(POL-012).
- **배경·근거** (원본): 인도자와 참여자가 떨어지면 참여자가 집회 내내 혼자가 된다. 동행 관계는 신청 시점에 이미 데이터로 잡혀 있으므로 배정에서 그대로 쓴다.
- **검증 의사코드**:

  ```js
  function assignPol010(group, room) {
    const bySex = groupBy(group.members, m => m.sex);
    const main = largest(bySex);                                  // 다수 성별을 이 방에
    const separated = group.members.filter(m => !main.includes(m));
    if (room.freeSeats.length < main.length) {
      return fail("MSG_ROOM_NOT_ENOUGH_SEATS", { free: room.freeSeats.length, need: main.length });
    }
    const result = assignSeats(main, room);
    return separated.length > 0
      ? warn("MSG_GROUP_SPLIT_BY_SEX", { separated, result })
      : pass(result);
  }

  function checkPol010(assignments) {
    // 검증: 같은 그룹·같은 성별인데 다른 방에 있으면 위반 후보
    for (const g of groupsOf(assignments)) {
      for (const sex of ["남", "여"]) {
        const rooms = new Set(g.members.filter(m => m.sex === sex).map(m => m.roomId));
        if (rooms.size > 1) return warn("MSG_GROUP_SCATTERED", { groupId: g.id, sex });
      }
    }
    return pass();
  }
  ```

- **관련 요구사항**: REQ-043, REQ-045
- **관련 화면**: TBD (원본 A6)
- **관련 테스트**: TBD

### POL-011 배정 룰 — 필수 반영

- **규칙**: 특이사항에 **거동 불편**이 적힌 인원은 **1층 침대를 우선 배정**한다. 필수 반영 대상이다.
- **적용 시점**: 특이사항 1층 우선 배정 실행 시, 일괄 랜덤 배치 실행 전 선행 배정(원본 A6). 접수폼 상태 입력 화면의 사전 안내(원본 U4)
- **위반/실패 시 처리**:
  - 1층 빈 자리 없음 → 차단. 문구 「1층에 남은 자리가 없습니다. 보류 좌석을 해제하거나 배정된 자리를 조정해 주세요.」
  - 거동 불편 인원이 2층에 배정된 상태 → 경고. 배치도에 표시하고 문구 「거동이 불편한 참가자 {n}명이 2층에 배정되어 있습니다.」
- **예외**: 거동 불편 여부는 자유 서술을 읽고 **담당자가 판단**한다. 시스템이 문장을 자동 판정하지 않는다. 판단 결과를 우선 배정 플래그로 남긴다.
- **배경·근거** (원본): 특이사항 서술에서 거동 불편은 안전 문제라 확약해야 하는 항목이다. 접수 화면에서 「거동 불편 = 1층 우선(필수 반영)」을 미리 안내해 문의와 불만을 줄인다.
- **검증 의사코드**:

  ```js
  function assignPol011(person, layout) {
    if (!person.priorityLower) return pass();                     // 담당자가 지정한 우선 배정 플래그
    const seat = layout.freeSeats.find(s => s.level === 1);
    if (!seat) return fail("MSG_NO_LOWER_BUNK_AVAILABLE");
    return pass(assign(person, seat, { type: "우선 배정" }));
  }

  function checkPol011(assignments) {
    const violated = assignments.filter(a => a.person.priorityLower && a.seat.level !== 1);
    return violated.length === 0 ? pass() : warn("MSG_PRIORITY_ON_UPPER", { count: violated.length });
  }
  ```

- **관련 요구사항**: REQ-009, REQ-042
- **관련 화면**: TBD (원본 U4, A6)
- **관련 테스트**: TBD

### POL-012 배정 룰 — 참고

- **규칙**: 연령이 높은 인원은 1층을 우선하고 젊은 참여자를 2층으로 보낸다. 방마다 고르게 채워 한쪽 쏠림을 막는다. **동행자가 아닌 지인의 근접 배치는 확약하지 않는다.**
- **적용 시점**: 일괄 랜덤 배치 실행 시(원본 A6), 접수폼 상태 입력 화면의 사전 안내(원본 U4)
- **위반/실패 시 처리**:
  - 참고 규칙이므로 배정을 차단하지 않는다.
  - 방별 배정 인원 편차가 크면 경고. 문구 「방별 배정 인원 차이가 큽니다. 배치를 다시 실행하시겠습니까?」
  - 지인 근접 배치 요청 → 사용자 안내 문구 「지인과 가까운 자리는 확약해 드리기 어렵습니다.」를 접수 화면에 미리 노출한다.
- **예외**: POL-010(동행 그룹)과 POL-011(거동 불편)이 우선한다. 연령 기준은 이 둘과 충돌하면 적용하지 않는다.
- **배경·근거** (원본): 연령·쏠림은 있으면 좋은 기준이지 확약할 수 있는 기준이 아니다. 확약 불가를 접수 단계에서 미리 알려야 현장 불만이 줄어든다.
- **검증 의사코드**:

  ```js
  const POL012_ROOM_BALANCE_TOLERANCE = 2;                        // 방별 인원 편차 허용치(명)

  function preferPol012Seat(person, freeSeats) {
    const wantLower = person.age != null && person.age >= 65;     // 연령 기준값은 참고 규칙
    const sorted = [...freeSeats].sort((a, b) =>
      wantLower ? a.level - b.level : b.level - a.level);
    return sorted[0];
  }

  function checkPol012Balance(rooms) {
    const counts = rooms.map(r => r.assignedCount);
    const gap = Math.max(...counts) - Math.min(...counts);
    return gap <= POL012_ROOM_BALANCE_TOLERANCE ? pass() : warn("MSG_ROOM_IMBALANCE", { gap });
  }
  ```

- **관련 요구사항**: REQ-009, REQ-038, REQ-045
- **관련 화면**: TBD (원본 U4, A6)
- **관련 테스트**: TBD

### POL-013 보류 좌석

- **규칙**: **방마다 1층 한 자리**(전체의 약 10%)를 현장 대응용 보류 좌석으로 확보한다. 일괄 랜덤 배치에서 자동 제외한다.
- **적용 시점**: 보류 좌석 지정 시, 일괄 랜덤 배치 실행 시(원본 A6)
- **위반/실패 시 처리**:
  - 일괄 배치가 보류 좌석을 사용하면 차단하고 배치를 중단한다. 문구 「보류 좌석은 일괄 배치에 사용할 수 없습니다.」
  - 보류 좌석이 지정되지 않은 방이 있으면 일괄 배치 전 경고. 문구 「보류 좌석이 지정되지 않은 방이 {n}개 있습니다. 현장 대응 자리가 부족할 수 있습니다.」
- **예외**: 보류 좌석은 관리자가 수동으로 배정하거나 해제할 수 있다(POL-016, POL-018).
- **배경·근거** (원본): 현장에서 예고 없이 오는 인원과 자리 불만 대응에 쓸 여유 자리가 필요하다. 1층에 두는 이유는 거동 불편 인원이 현장에 나타날 수 있기 때문이다.
- **검증 의사코드**:

  ```js
  function checkPol013Reserved(rooms) {
    const missing = rooms.filter(r => !r.seats.some(s => s.status === "보류" && s.level === 1));
    return missing.length === 0 ? pass() : warn("MSG_NO_RESERVED_SEAT", { count: missing.length });
  }

  function pol013EligibleSeats(layout) {
    return layout.seats.filter(s => s.status === "빈 자리");       // 보류·배정 좌석 제외
  }
  ```

- **관련 요구사항**: REQ-044, REQ-045
- **관련 화면**: TBD (원본 A6)
- **관련 테스트**: TBD

### POL-014 배정 시점 — 일반

- **규칙**: 숙소는 **집회 1~2일 전에 일괄 배정**한다. 신청 입력 즉시 배정하지 않는다.
- **적용 시점**: 일괄 랜덤 배치 실행 시(원본 A6), 마이페이지 숙소 상태 안내(원본 U8)
- **위반/실패 시 처리**:
  - 배정 전 조회 → 차단 아님. 마이페이지에 문구 「숙소는 집회 1~2일 전에 일괄 배정됩니다. 배정되면 이 화면에서 확인하실 수 있습니다.」
  - 집회 3일 전 이전에 일괄 배치 실행 → 경고(실행 가능). 문구 「아직 접수가 진행 중입니다. 지금 배치하면 이후 신청자를 다시 배정해야 합니다.」
- **예외**: 게스트하우스·방갈로는 등록·입금 즉시 배정한다(POL-015). 현장 접수자는 보류 좌석에 수동 배치한다(POL-016).
- **배경·근거** (원본): 접수가 끝나기 전에 배정하면 이후 신청자 때문에 반복 작업이 생긴다. 접수 마감(POL-001, 집회 3일 전) 이후에 한 번에 배정하는 흐름이다.
- **검증 의사코드**:

  ```js
  function checkPol014Timing(conference, now) {
    const daysLeft = daysBetween(now, conference.startDate);
    if (daysLeft > 3) return warn("MSG_BULK_ASSIGN_TOO_EARLY", { daysLeft });
    return pass();
  }
  ```

- **관련 요구사항**: REQ-013, REQ-045
- **관련 화면**: TBD (원본 U8, A6)
- **관련 테스트**: TBD

### POL-015 배정 시점 — 예외

- **규칙**: **게스트하우스·방갈로는 등록·입금 즉시 배정**한다. 다 차면 더 받지 않는다.
- **적용 시점**: 해당 구역 배정 시(원본 A6)
- **위반/실패 시 처리**: 차단. 문구 「더 이상 받을 수 없습니다.」 (원본 문구 그대로)
- **예외**: 일반 구역(대강당 등)은 POL-014의 일괄 배정을 따른다.
- **배경·근거** (원본): 도면이 고정된 소규모 구역이라 먼저 확정해도 재작업이 없다. 수량이 적어 조기에 마감된다.
- **검증 의사코드**:

  ```js
  const POL015_IMMEDIATE_ZONES = ["게스트하우스", "방갈로"];

  function checkPol015(zone, person) {
    if (!POL015_IMMEDIATE_ZONES.includes(zone.name)) return pass();
    if (person.paymentStatus !== "매칭") return fail("MSG_IMMEDIATE_ZONE_NEEDS_PAYMENT");
    return zone.freeSeats.length > 0 ? pass() : fail("MSG_ZONE_FULL");
  }
  ```

- **관련 요구사항**: REQ-040, REQ-045
- **관련 화면**: TBD (원본 A6)
- **관련 테스트**: TBD

### POL-016 배정 시점 — 현장

- **규칙**: 현장 접수자는 **보류 좌석에 수동으로 배치**한다.
- **적용 시점**: 현장 수동 접수 후 좌석 배정 시(원본 A3 → A6)
- **위반/실패 시 처리**:
  - 보류 좌석 소진 → 경고(진행 가능). 문구 「보류 좌석이 모두 사용되었습니다. 빈자리 보기로 배정 가능한 자리를 확인해 주세요.」
  - 현장 접수자가 미배정 상태로 남음 → 배치도 상단 카운트와 미배정 명단에 노출한다.
- **예외**: 보류 좌석이 없으면 일반 빈 자리에 배정할 수 있다(POL-018의 현장 대응 우선).
- **배경·근거** (원본): 현장 접수자는 일괄 배정 이후에 들어오므로 미리 비워 둔 자리로 받는 것이 유일한 방법이다.
- **검증 의사코드**:

  ```js
  function assignPol016(person, layout) {
    const reserved = layout.seats.filter(s => s.status === "보류");
    if (reserved.length > 0) return pass(assign(person, reserved[0]));
    const free = layout.seats.filter(s => s.status === "빈 자리");
    return free.length > 0
      ? warn("MSG_RESERVED_EXHAUSTED", assign(person, free[0]))
      : fail("MSG_NO_SEAT_AVAILABLE");
  }
  ```

- **관련 요구사항**: REQ-023, REQ-044, REQ-046
- **관련 화면**: TBD (원본 A3, A6)
- **관련 테스트**: TBD

### POL-017 미사용자 제외

- **규칙**: 숙소 사용 여부에서 **숙소 필요 없음**을 선택한 인원은 배정 대상에서 자동 제외하고 별도 명단으로 관리한다.
- **적용 시점**: 미배정 명단 조회 시, 일괄 랜덤 배치 실행 시(원본 A6). 접수폼 숙소 사용 여부 선택 시(원본 U4)
- **위반/실패 시 처리**:
  - 미사용자에게 좌석을 배정하려 하면 차단. 문구 「이 참가자는 숙소를 사용하지 않는 것으로 신청했습니다. 배정하시려면 신청 정보를 먼저 수정해 주세요.」
  - 미사용자가 일괄 배치 대상에 포함되면 배치를 중단하고 오류를 기록한다.
- **예외**: 참가자가 마음을 바꾼 경우 관리자가 신청 정보를 수정하면(원본 A3) 배정 대상으로 돌아온다.
- **배경·근거** (원본): 말씀만 듣고 귀가하는 인원이 있어 개인별로 받는다. 이 인원을 배정 대상에 넣으면 좌석 수 계산이 어긋난다.
- **검증 의사코드**:

  ```js
  function pol017Assignable(participants) {
    return participants.filter(p => p.lodgingUse === "숙소 사용");
  }

  function checkPol017(person) {
    return person.lodgingUse === "숙소 사용" ? pass() : fail("MSG_LODGING_NOT_USED");
  }
  ```

- **관련 요구사항**: REQ-009, REQ-041, REQ-045
- **관련 화면**: TBD (원본 U4, A6)
- **관련 테스트**: TBD

### POL-018 현장 대응 우선순위

- **규칙**: 자리 불만이 접수됐을 때 **바꿀 수 있는 자리가 즉시 보이고, 클릭 몇 번으로 옮길 수 있어야 한다.** 구체적으로 — 빈자리만 보기 전환 1회, 좌석 클릭 1회, 이동/교환 선택 1회로 이동이 완료된다(총 3회 이내).
- **적용 시점**: 숙소 배치도 화면의 빈자리 조회와 좌석 상세 관리(원본 A6)
- **위반/실패 시 처리**:
  - 이동 대상이 이미 배정된 좌석 → 교환 여부를 묻는다. 문구 「이 자리에는 {이름} 님이 배정되어 있습니다. 두 분의 자리를 서로 바꾸시겠습니까?」
  - 좌석 이동·교환·해제는 사유 없이도 실행할 수 있으나 변경 이력에 담당자와 함께 기록한다(POL-033).
- **예외**: 없음. 보류 좌석으로의 이동도 같은 방식으로 처리한다.
- **배경·근거** (원본): 현장에서 불만이 들어오면 담당자가 종이 배치도를 뒤지느라 시간이 걸렸다. 조작 횟수 자체가 정책 기준이다.
- **검증 의사코드**:

  ```js
  const POL018_MAX_CLICKS = 3;

  function checkPol018Flow(clickTrace) {
    // ["빈자리만 보기", "좌석 클릭", "이동"] 형태의 조작 기록
    return clickTrace.length <= POL018_MAX_CLICKS ? pass() : fail("MSG_TOO_MANY_STEPS", { steps: clickTrace.length });
  }

  function movePol018Seat(person, targetSeat) {
    if (targetSeat.occupantId) return confirm("MSG_CONFIRM_SWAP", { occupant: targetSeat.occupantId });
    return pass(assign(person, targetSeat));
  }
  ```

- **관련 요구사항**: REQ-046
- **관련 화면**: TBD (원본 A6)
- **관련 테스트**: TBD

### POL-048 좌석 수 정합성 [신규]

> 2026-09-04 회의 결정(D-5)으로 좌석 상태에 **사용 불가**가 추가되어 합계 식을 확장했다(POL-051).

- **규칙**: 배치도에서 **배정 + 보류 + 사용 불가 + 빈자리 = 총 좌석 수**가 항상 성립해야 한다. 다섯 값을 배치도 제목 옆에 상시 표시하고, 좌석 상태가 바뀔 때마다 즉시 갱신한다.
- **적용 시점**: 배치도 렌더 시, 좌석 생성·배정·이동·교환·해제·보류 지정 직후(원본 A6)
- **위반/실패 시 처리**:
  - 합이 어긋나면 경고를 표시한다. 문구 「좌석 수가 맞지 않습니다. 총 {총}석인데 배정 {배정} + 보류 {보류} + 사용 불가 {사용불가} + 빈자리 {빈자리} = {합}석입니다. 배치도를 확인해 주세요.」
  - 합이 어긋난 상태에서 일괄 랜덤 배치를 실행하면 차단한다. 문구 「좌석 수가 맞지 않아 일괄 배치를 실행할 수 없습니다.」
  - 좌석 수 0으로는 방을 생성할 수 없다. 문구 「방에는 좌석이 1개 이상 있어야 합니다.」
- **예외**: 없음.
- **배경·근거**: 원본 기능정의서 A6-03은 「좌석 누락이 가장 큰 위험」이라 총 좌석 수를 상시 표시한다고 적었다. 표시만으로는 검사 기준이 되지 않으므로 성립해야 하는 식을 정책으로 못 박는다. 실제 도면과 대조하는 것은 담당자의 육안 확인이고, 시스템은 내부 합계 불일치를 잡는다.
- **검증 의사코드**:

  ```js
  function pol048Counts(layout) {
    const seats = layout.seats;
    return {
      total: seats.length,
      assigned: seats.filter(s => s.status === "우선 배정" || s.status === "일반 배정").length,
      reserved: seats.filter(s => s.status === "보류").length,
      unusable: seats.filter(s => s.status === "사용 불가").length,     // POL-051
      free: seats.filter(s => s.status === "빈 자리").length,
    };
  }

  function checkPol048(layout) {
    const c = pol048Counts(layout);
    const sum = c.assigned + c.reserved + c.unusable + c.free;
    return sum === c.total ? pass(c) : warn("MSG_SEAT_COUNT_MISMATCH", { ...c, sum });
  }

  function checkPol048BeforeBulk(layout) {
    const r = checkPol048(layout);
    return r.ok ? pass() : fail("MSG_BULK_BLOCKED_BY_MISMATCH");
  }

  function checkPol048Room(room) {
    return room.seats.length > 0 ? pass() : fail("MSG_ROOM_NEEDS_SEAT");
  }
  ```

- **관련 요구사항**: REQ-038, REQ-039, REQ-045, REQ-046, REQ-072
- **관련 화면**: SCR-018
- **관련 테스트**: TBD

### POL-051 좌석 사용 불가 지정 [신규]

- **규칙**: 침대가 파손되었거나 구조상 사람이 잘 수 없는 자리를 **사용 불가**로 지정한다. 사용 불가 좌석은 총 좌석 수에는 남아 있지만 **배정 대상에서 제외**되며, 일괄 랜덤 배치·1층 우선 배정·동행 그룹 배정 어디에서도 선택되지 않는다.

  | 좌석 상태 | 배정 대상 | 설명 |
  |---|---|---|
  | 빈 자리 | O | 아직 아무도 배정되지 않은 자리 |
  | 우선 배정 | X | 거동 불편 인원이 배정된 1층 자리(POL-011) |
  | 일반 배정 | X | 일반 인원이 배정된 자리 |
  | 보류 | X | 현장 대응용으로 확보한 자리(POL-013) |
  | **사용 불가** | **X** | **파손·구조상 사용할 수 없는 자리. 사유 메모를 함께 기록한다** |

- **적용 시점**: 좌석 상세 모달에서 [사용 불가 지정] 실행 시, 일괄 랜덤 배치 실행 시, 1층 우선 배정·동행 그룹 배정 실행 시, 좌석 카운터 집계 시(원본 A6 + 2026-09-04 회의 결정)
- **위반/실패 시 처리**:
  - 이미 사람이 배정된 좌석을 사용 불가로 지정 → 차단. 문구 「이 자리에는 {이름} 님이 배정되어 있습니다. 배정을 먼저 해제한 뒤 사용 불가로 지정해 주세요.」
  - 사용 불가 좌석에 배정 시도 → 차단. 문구 「사용할 수 없는 자리입니다. 사유: {사유}」
  - 사유를 입력하지 않고 지정 시도 → 차단. 문구 「사용 불가 사유를 입력해 주세요.」
  - 방의 좌석이 **전부** 사용 불가가 되면 경고(진행 가능). 문구 「{방} 전체가 사용 불가입니다. 배정 가능한 자리가 없습니다.」
- **예외**: 사용 불가는 언제든 해제할 수 있고, 해제하면 **빈 자리**로 돌아간다. 해제 시 사유 메모는 변경 이력에만 남기고 좌석에서는 지운다.
- **배경·근거**: 2026-09-04 회의에서 채린 자매가 "사용 불가 자리 표시 기능이 필요하다"고 요청했고 결정사항으로 확정되었다(D-5). 기존 4종 상태(빈 자리/우선 배정/일반 배정/보류)로는 물리적으로 못 쓰는 자리를 표현할 수 없어, 담당자가 보류로 대체 표시하면 현장 대응 자리 수(POL-013)가 부정확해진다.
- **검증 의사코드**:

  ```js
  function checkPol051Mark(seat, reason) {
    if (seat.assigneeId) return fail("MSG_UNUSABLE_ON_ASSIGNED", { name: seat.assigneeName });
    if (!reason || reason.trim().length === 0) return fail("MSG_UNUSABLE_REASON_REQUIRED");
    return pass();
  }

  function checkPol051Assign(seat) {
    return seat.status === "사용 불가"
      ? fail("MSG_SEAT_UNUSABLE", { reason: seat.unusableReason })
      : pass();
  }

  function pol051Assignable(seats) {
    return seats.filter(s => s.status === "빈 자리");                 // 사용 불가·보류·기배정 전부 제외
  }

  function checkPol051Room(room) {
    return room.seats.every(s => s.status === "사용 불가")
      ? warn("MSG_ROOM_ALL_UNUSABLE", { room: room.name })
      : pass();
  }
  ```

- **관련 요구사항**: REQ-072, REQ-042, REQ-043, REQ-045, REQ-046
- **관련 화면**: SCR-018
- **관련 테스트**: TBD

### POL-052 좌석 번호 체계 [신규]

- **규칙**: 좌석 번호는 방 안에서 **1층은 홀수, 2층은 짝수**로 부여한다. 같은 세로 칸의 1층·2층은 **연속한 두 번호**(n, n+1)를 가진다. 번호는 배치도 생성 시 자동 부여하며 담당자가 임의로 바꾸지 않는다.

  | 세로 칸 | 1층 | 2층 |
  |---|---|---|
  | 1번 칸 | 1 | 2 |
  | 2번 칸 | 3 | 4 |
  | 3번 칸 | 5 | 6 |

  좌석의 전체 표기는 `{구역}-{방}방 {번호}번`으로 한다(예: `A-1방 3번`). 1층·2층은 번호로 구분되므로 표기에 층을 넣지 않아도 된다.

- **적용 시점**: 배치도 생성 시 좌석 번호 자동 부여, 좌석 도면 렌더 시, 명찰·안내문에 좌석을 표기할 때(원본 A6 + 2026-09-04 회의 결정)
- **위반/실패 시 처리**:
  - 1층 좌석에 짝수, 2층 좌석에 홀수가 부여되면 정책 위반으로 본다. 배치도 렌더 전에 검사해 차단하고 문구 「좌석 번호 체계가 맞지 않습니다. 배치도를 다시 생성해 주세요.」를 표시한다.
  - 같은 방 안에 중복 번호가 있으면 차단. 문구 「{방}에 중복된 좌석 번호 {번호}가 있습니다.」
- **예외**: **방당 1층·2층 침대 수가 다른 경우**, 짝이 맞는 칸까지만 연속 번호를 쓰고 남는 좌석은 해당 층의 홀수/짝수 규칙만 지켜 이어서 부여한다. (예: 1층 4개·2층 6개 → 1,3,5,7 / 2,4,6,8,10,12)
- **배경·근거**: 2026-09-04 회의에서 채린 자매가 "1층 홀수·2층 짝수 번호 체계"를 요청했고 결정사항으로 확정되었다(D-5). 기존 산출물에는 좌석 번호 규칙이 정의되어 있지 않아 "A-1방 1층 2번"처럼 층과 번호를 함께 불러야 했고, 현장에서 자리를 안내할 때 층을 빠뜨리면 다른 자리를 가리켰다.
- **검증 의사코드**:

  ```js
  function pol052AssignNumbers(room) {
    // 1층 홀수, 2층 짝수. 짝이 맞는 칸까지는 (n, n+1) 연속.
    room.lowerSeats.forEach((s, i) => { s.seatNo = i * 2 + 1; });
    room.upperSeats.forEach((s, i) => { s.seatNo = i * 2 + 2; });
    return room;
  }

  function checkPol052(room) {
    for (const s of room.lowerSeats) {
      if (s.seatNo % 2 !== 1) return fail("MSG_SEAT_NUMBERING_BROKEN");
    }
    for (const s of room.upperSeats) {
      if (s.seatNo % 2 !== 0) return fail("MSG_SEAT_NUMBERING_BROKEN");
    }
    const nos = [...room.lowerSeats, ...room.upperSeats].map(s => s.seatNo);
    const dup = nos.find((n, i) => nos.indexOf(n) !== i);
    return dup === undefined ? pass() : fail("MSG_SEAT_NO_DUPLICATED", { room: room.name, no: dup });
  }

  function pol052Label(seat) {
    return `${seat.zone}-${seat.room}방 ${seat.seatNo}번`;
  }
  ```

- **관련 요구사항**: REQ-038, REQ-072
- **관련 화면**: SCR-018
- **관련 테스트**: TBD

## 10. 명찰 정책

### POL-019 출력 시점·방식

- **규칙**: 집회 **전날** 대기 목록 전체를 일괄 출력한다. **입금이 확인된 건만** 대기열에 올린다. 개별 출력은 분실 재발급용으로 쓰며, 출력 횟수가 1회 이상이면 재발급으로 표시한다.
- **적용 시점**: 명찰 출력 대기열 조회 시, 일괄·선택·개별 출력 실행 시(원본 A5)
- **위반/실패 시 처리**:
  - 미입금 건 출력 시도 → 차단. 문구 「입금이 확인되지 않은 신청은 명찰을 출력할 수 없습니다.」
  - 이미 출력한 건 재출력 → 경고(진행 가능). 문구 「이미 출력한 명찰입니다. 재발급으로 기록됩니다.」
- **예외**: 현장 접수자는 입금 확인 즉시 개별 출력한다. 전날 일괄 출력에 포함되지 않는다.
- **배경·근거** (원본): 입금 확인 후 등록번호가 발급되므로(POL-038) 미입금 건은 명찰에 넣을 번호가 없다. 재발급 구분이 없으면 중복 출력분을 추적할 수 없다.
- **검증 의사코드**:

  ```js
  function pol019Queue(participants) {
    return participants.filter(p => p.paymentStatus === "매칭" && p.registrationStatus !== "환불");
  }

  function checkPol019Print(participant) {
    if (participant.paymentStatus !== "매칭") return fail("MSG_BADGE_BEFORE_PAYMENT");
    return participant.printCount > 0
      ? warn("MSG_BADGE_REPRINT", { count: participant.printCount })
      : pass();
  }

  function onPol019Printed(participant) {
    participant.printCount += 1;
    participant.isReissued = participant.printCount > 1;
  }
  ```

- **관련 요구사항**: REQ-035, REQ-036
- **관련 화면**: TBD (원본 A5)
- **관련 테스트**: TBD

### POL-020 용지 규격 [미확정]

- **규칙**: 소형 용지(A6 등) 출력이 가능한 프린터 확보 여부에 따라 명찰 용지 규격을 확정한다. 확정된 규격과 같은 비율로 미리보기를 제공한다.
- **적용 시점**: 명찰 미리보기 렌더 시, 출력 실행 시(원본 A5)
- **위반/실패 시 처리**: 규격 미확정 상태에서는 미리보기에 문구 「용지 규격이 확정되지 않았습니다. 출력 전에 실물 용지로 확인해 주세요.」를 표시한다.
- **예외**: 없음.
- **상태 사유**: **미확정.** 프린터를 대여할지 구매할지 정해지면 규격을 확정한다 — 오픈 이슈 OI-4(담당: 프린터 리서치 담당, 기한: 착수 +6주). 수양회에서 조정해 둔 여백·폼 설정값과 잔여 명찰 케이스 활용 여부도 함께 확인이 필요하다.
- **검증 의사코드**:

  ```js
  function checkPol020(badgeConfig) {
    if (!badgeConfig.paperSize) return warn("MSG_PAPER_SIZE_UNDECIDED");
    const required = ["name", "regNo", "region", "type"];         // 이름·등록번호·지역·구분
    const missing = required.filter(f => !badgeConfig.fields.includes(f));
    return missing.length === 0 ? pass() : fail("MSG_BADGE_FIELD_MISSING", { missing });
  }
  ```

- **관련 요구사항**: REQ-037
- **관련 화면**: TBD (원본 A5)
- **관련 테스트**: TBD

## 11. 상담 정책

### POL-021 접수 경로

- **규칙**: 상담 신청은 **본부에서만 접수한다**(현장 방문·전화). 사용자 모바일에는 신청 폼을 두지 않고 접수처 연락처만 노출한다.
- **적용 시점**: 사용자 상담 안내 화면 렌더 시(원본 U11), 관리자 상담 접수 입력 시(원본 A9)
- **위반/실패 시 처리**: 차단. 사용자 화면에 상담 신청 입력 폼이 존재하면 정책 위반으로 본다. 사용자에게는 문구 「상담은 본부 접수처에서 직접 신청하실 수 있습니다. 접수처(연락처)로 방문하시거나 전화해 주세요.」를 노출한다.
- **예외**: 없음.
- **배경·근거** (원본): 신청자별 특이사항이 많아 실시간 대화로 정해야 한다. 폼으로 받으면 되묻는 과정이 더 길어진다.
- **검증 의사코드**:

  ```js
  function checkPol021Screen(screen) {
    if (screen.id !== "U11") return pass();
    return screen.hasForm("counselApplication")
      ? fail("MSG_USER_COUNSEL_FORM_FORBIDDEN")
      : pass();
  }

  function checkPol021Intake(intake) {
    return ["현장", "전화"].includes(intake.channel) ? pass() : fail("MSG_INVALID_INTAKE_CHANNEL");
  }
  ```

- **관련 요구사항**: REQ-019, REQ-048
- **관련 화면**: TBD (원본 U11, A9)
- **관련 테스트**: TBD

### POL-022 운영 시간대 [미확정]

- **규칙**: 상담 타임라인의 세로축 범위를 **운영 시간대 설정값**으로 둔다. 현재 가정값은 00:00~24:00이다.
- **적용 시점**: 타임라인 렌더 시, 운영 시간대 설정 저장 시(원본 A8)
- **위반/실패 시 처리**:
  - 이미 배정된 상담이 있는 시간대를 벗어나게 범위를 줄이면 차단. 문구 「{시간}에 배정된 상담이 있어 운영 시간대를 줄일 수 없습니다. 배정을 먼저 옮겨 주세요.」
  - 운영 시간대 밖에 배정 시도 → 차단. 문구 「운영 시간대({시작}~{종료}) 안에서만 배정할 수 있습니다.」
- **예외**: 없음.
- **상태 사유**: **미확정.** 새벽 상담 운영 여부에 따라 범위를 확정한다 — 오픈 이슈 OI-13(담당: 본부, 기한: 착수 +8주). 현재는 24시까지 열어 두었다.
- **검증 의사코드**:

  ```js
  function checkPol022Setting(newRange, existingSlots) {
    const outside = existingSlots.filter(s => s.startAt < newRange.from || s.endAt > newRange.to);
    return outside.length === 0
      ? pass()
      : fail("MSG_SLOT_OUTSIDE_RANGE", { first: outside[0].startAt });
  }

  function checkPol022Assign(slot, range) {
    return slot.startAt >= range.from && slot.endAt <= range.to
      ? pass()
      : fail("MSG_ASSIGN_OUTSIDE_RANGE", { from: range.from, to: range.to });
  }
  ```

- **관련 요구사항**: REQ-054
- **관련 화면**: TBD (원본 A8)
- **관련 테스트**: TBD

### POL-023 결과 수집 [미확정]

- **규칙**: 상담사가 **종이 신청서에 적어 온 결과를 본부가 시스템에 입력**한다. 종이 신청서는 2장 중복 작성을 1장으로 줄여, 본부 입력 → 상담사 전달 → 결과 기재 후 회수 흐름으로 재사용한다.
- **적용 시점**: 상담 결과 입력 시(원본 A7 결과 집계, A8 타임라인 드로어)
- **위반/실패 시 처리**:
  - 상담 종료 상태인데 결과가 입력되지 않은 건 → 경고. 현황판에 문구 「결과가 입력되지 않은 종료 상담이 {n}건 있습니다.」
  - 상담사가 직접 시스템에 입력하는 경로는 만들지 않는다(계정 미발급 대상).
- **예외**: 없음.
- **상태 사유**: **미확정.** 종이 신청서 포맷이 확정되지 않았다 — 오픈 이슈 OI-14(담당: 본부, 기한: 착수 +8주). 포맷에 따라 입력 항목이 늘어날 수 있다.
- **검증 의사코드**:

  ```js
  function checkPol023(session) {
    if (session.progressStatus !== "상담 종료") return pass();
    return session.result ? pass() : warn("MSG_RESULT_NOT_ENTERED", { sessionId: session.id });
  }
  ```

- **관련 요구사항**: REQ-056
- **관련 화면**: TBD (원본 A7, A8)
- **관련 테스트**: TBD

### POL-024 결과 활용

- **규칙**: 상담 결과는 **해결 인원 집계**와 **간증자 컨택** 두 가지 목적으로만 사용한다. 간증 가능 여부는 상담 결과와 **별도 항목**으로 받는다.

  | 항목 | 값 |
  |---|---|
  | 상담 결과 | 해결 / 재상담 필요 / 미해결 |
  | 간증 가능 여부 | 가능 / 본인 거절 / 해당 없음 |

- **적용 시점**: 상담 결과 입력 시, 상담 지표 집계 시, 간증자 명단 조회 시(원본 A7, A8)
- **위반/실패 시 처리**:
  - 허용 값 밖의 입력 → 차단. 문구 「상담 결과를 선택해 주세요.」 / 「간증 가능 여부를 선택해 주세요.」
  - 상담 결과가 해결이라는 이유로 간증 가능을 자동 설정하지 않는다. 두 값을 연동하면 정책 위반이다.
- **예외**: 없음. 상담 결과를 다른 목적(예: 숙소 배정, 명찰 표기)에 사용하지 않는다.
- **배경·근거** (원본): 결과가 해결이어도 본인이 간증을 원하지 않을 수 있다. 두 값을 묶으면 나중에 컨택 대상 명단이 부정확해진다.
- **검증 의사코드**:

  ```js
  const POL024_RESULTS = ["해결", "재상담 필요", "미해결"];
  const POL024_TESTIMONY = ["가능", "본인 거절", "해당 없음"];

  function checkPol024(input) {
    if (!POL024_RESULTS.includes(input.result)) return fail("MSG_RESULT_REQUIRED");
    if (!POL024_TESTIMONY.includes(input.testimony)) return fail("MSG_TESTIMONY_REQUIRED");
    return pass();
  }

  function pol024TestimonyContacts(sessions) {
    return sessions.filter(s => s.testimony === "가능");           // 결과값과 무관하게 이 항목만 본다
  }
  ```

- **관련 요구사항**: REQ-055, REQ-056
- **관련 화면**: TBD (원본 A7, A8)
- **관련 테스트**: TBD

### POL-035 진행 상태 기록

- **규칙**: 상담 건은 **대기 → 진행 중 → 상담 종료** 순으로 상태를 기록한다. 타임라인에서 상태를 바꾸면 블록 색이 즉시 바뀌고, 배정된 예정 시간을 별도로 표시해 지연 여부를 함께 본다. 상담사 가능 시간은 **날짜별로** 등록한다.

  | 상태 | 블록 색 | 전이 조건 |
  |---|---|---|
  | 배치 대기 | 노란색 | 본부 접수 직후 |
  | 대기 | 초록색 | 배치 확정 → 타임라인에 블록 생성 |
  | 진행 중 | 노란색 + 점멸 | 드로어에서 진행 중 선택 |
  | 상담 종료 | 회색 | 드로어에서 상담 종료 선택 |
  | 취소 | 회색 | 드로어에서 결과를 상담 취소로 입력 |

- **적용 시점**: 타임라인 드로어의 상태 변경 시, 타임라인 렌더 시(원본 A8)
- **위반/실패 시 처리**:
  - 순서를 건너뛴 전이(대기 → 상담 종료) → 경고(진행 가능). 문구 「진행 중 단계를 거치지 않았습니다. 그대로 종료하시겠습니까?」
  - 종료된 상담을 대기로 되돌리기 → 차단. 문구 「종료된 상담은 되돌릴 수 없습니다. 새로 배정해 주세요.」
- **예외**: 취소는 어느 상태에서든 가능하다.
- **배경·근거** (원본): 현장에서 상담이 끝났을 때 별도 화면으로 이동하지 않고 그 자리에서 처리해야 한다. 예정 시간과 실제 진행을 겹쳐 보면 지연을 바로 알 수 있다.
- **검증 의사코드**:

  ```js
  const POL035_ORDER = ["배치 대기", "대기", "진행 중", "상담 종료"];

  function checkPol035Transition(from, to) {
    if (to === "취소") return pass();
    const fi = POL035_ORDER.indexOf(from), ti = POL035_ORDER.indexOf(to);
    if (ti < fi) return fail("MSG_CANNOT_REVERT_STATUS");
    if (ti - fi > 1) return warn("MSG_SKIPPED_STATUS", { from, to });
    return pass();
  }

  function pol035IsDelayed(session, now) {
    const end = session.actualEndAt ?? now;
    return end > session.scheduledEndAt;                          // 예정선보다 길면 지연
  }
  ```

- **관련 요구사항**: REQ-050, REQ-051, REQ-052
- **관련 화면**: TBD (원본 A8)
- **관련 테스트**: TBD

### POL-036 화면 역할 분리

- **규칙**: 상담 3화면의 역할을 아래와 같이 나눈다. 같은 데이터를 세 화면이 각자의 관점으로 보여주는 구조다.

  | 화면 | 역할 |
  |---|---|
  | 상담 접수·배치 (원본 A9) | 누구를 어느 방에 배치할지 **정하는 곳** |
  | 상담 스케줄 타임라인 (원본 A8) | 정해진 일정이 실제로 어떻게 흘러가는지 보고 **진행 상태를 바꾸는 현황판** |
  | 상담 현황판 (원본 A7) | 상담실 실시간 상태와 **결과 집계를 보는 곳** |

- **적용 시점**: 상담 3화면의 기능 구성 설계·구현 시(원본 A7, A8, A9)
- **위반/실패 시 처리**: 차단. 타임라인 화면에 상담실 × 시간 예약 격자를 두면 배치 화면과 역할이 겹치므로 정책 위반이다. 배정 데이터는 한 곳에만 저장하며, 어느 화면에서 배정해도 같은 데이터에 기록된다(중복 배치 금지).
- **예외**: 타임라인의 빈 칸 클릭 현장 배정(원본 A8-10)은 허용한다. 배치 화면과 같은 데이터를 사용하기 때문이다.
- **배경·근거** (원본): A8의 상담실 × 시간 예약 격자가 A9의 상담실 배치판과 역할이 겹쳐 A8에서 제거했다.
- **검증 의사코드**:

  ```js
  function checkPol036Duplication(bookings) {
    // 같은 상담사·같은 시간에 두 건이 잡히면 위반
    const key = b => `${b.counselorId}@${b.startAt}`;
    const seen = new Set();
    for (const b of bookings) {
      if (seen.has(key(b))) return fail("MSG_DOUBLE_BOOKING", { counselorId: b.counselorId, at: b.startAt });
      seen.add(key(b));
    }
    return pass();
  }
  ```

- **관련 요구사항**: REQ-049, REQ-053, REQ-055
- **관련 화면**: TBD (원본 A7, A8, A9)
- **관련 테스트**: TBD

### POL-050 상담 시간 단위 [신규]

- **규칙**: 상담의 **시작 시각과 종료 시각은 30분 단위로만** 설정한다. 허용 값은 매시 `00분`과 `30분`뿐이다. 타임라인 격자와 드로어의 시간 입력, 배치 화면의 시간 선택 모두 같은 단위를 쓴다. 상담 1건의 최소 길이는 **30분**이다.
- **적용 시점**: 상담 배치 시간 입력 시(원본 A9), 타임라인 빈 칸 현장 배정 시, 타임라인 드로어의 예정 시간 수정 시(원본 A8)
- **위반/실패 시 처리**:
  - 30분 단위가 아닌 시각 입력 → 차단. 문구 「상담 시간은 30분 단위로만 설정할 수 있습니다. (예: 10:00, 10:30)」
  - 종료 시각이 시작 시각과 같거나 이르면 → 차단. 문구 「종료 시각은 시작 시각보다 뒤여야 합니다.」
  - 30분보다 짧은 길이 → 차단. 문구 「상담은 30분 이상으로 설정해 주세요.」
- **예외**: **실제 진행 시간**(진행 중 → 상담 종료로 기록되는 시각)에는 이 제한을 적용하지 않는다. 예정 시간만 30분 단위로 잡고, 실제 진행은 분 단위로 기록해 지연 여부를 그대로 보여준다(POL-035).
- **배경·근거**: 2026-09-04 회의에서 "10분 대신 30분 단위로 시작/종료 시간을 설정하는 방식으로 단순화"하기로 결정했다(D-3). 이전 산출물은 40분 단위 예시(10:00~10:40)를 쓰고 있었고 시간 단위 자체가 정책으로 정의되어 있지 않아, 담당자마다 다른 간격으로 배치하면 타임라인 격자가 어긋났다.
- **검증 의사코드**:

  ```js
  const POL050_UNIT_MIN = 30;

  function isPol050Slot(at) {
    return at.getMinutes() % POL050_UNIT_MIN === 0 && at.getSeconds() === 0;
  }

  function checkPol050(schedule) {
    if (!isPol050Slot(schedule.startAt) || !isPol050Slot(schedule.endAt)) {
      return fail("MSG_NOT_30MIN_UNIT");
    }
    if (schedule.endAt <= schedule.startAt) return fail("MSG_END_BEFORE_START");
    const minutes = (schedule.endAt - schedule.startAt) / 60000;
    return minutes >= POL050_UNIT_MIN ? pass() : fail("MSG_TOO_SHORT");
  }

  function pol050Slots(range) {
    // 타임라인 격자: 운영 시간대(POL-022)를 30분으로 쪼갠다
    const out = [];
    for (let m = range.fromMin; m < range.toMin; m += POL050_UNIT_MIN) out.push(m);
    return out;
  }
  ```

- **관련 요구사항**: REQ-049, REQ-051, REQ-053, REQ-054
- **관련 화면**: SCR-020, SCR-021
- **관련 테스트**: TBD

## 12. 셔틀 정책

### POL-025 방향 분리

- **규칙**: **나가는 편(집회장→외부)**과 **들어오는 편(외부→집회장)**을 분리해 관리한다. 한 목록에 섞지 않는다.
- **적용 시점**: 사용자 수시 셔틀 요청 입력 시(원본 U10), 관리자 셔틀 관리 목록 렌더 시(원본 A10)
- **위반/실패 시 처리**:
  - 방향 미선택 → 차단. 문구 「가는 방향을 선택해 주세요.」
  - 두 방향이 한 목록에 함께 표시되면 정책 위반으로 본다.
- **예외**: 없음.
- **배경·근거** (원본): 터미널까지 가는 시간을 따로 계산해야 하므로 같은 목록에 섞으면 혼선이 생긴다.
- **검증 의사코드**:

  ```js
  const POL025_DIRECTIONS = ["OUT", "IN"];                        // 나가는 편 / 들어오는 편

  function checkPol025(request) {
    return POL025_DIRECTIONS.includes(request.direction) ? pass() : fail("MSG_DIRECTION_REQUIRED");
  }

  function checkPol025List(tab, rows) {
    return rows.every(r => r.direction === tab) ? pass() : fail("MSG_DIRECTION_MIXED");
  }
  ```

- **관련 요구사항**: REQ-017, REQ-057
- **관련 화면**: TBD (원본 U10, A10)
- **관련 테스트**: TBD

### POL-026 정렬 기준

- **규칙**: 사람 이름보다 **출발 시간이 핵심**이다. 출발 시간을 각 행의 **가장 왼쪽에 가장 크게** 두고, 빠른 시간 순으로 나열한다.
- **적용 시점**: 셔틀 요청 목록 렌더 시, 배차 현황 렌더 시(원본 A10)
- **위반/실패 시 처리**: 차단 아님(표시 규칙). 정렬이 출발 시간 오름차순이 아니거나 출발 시간이 첫 열이 아니면 정책 위반으로 본다.
- **예외**: 비슷한 시간대라도 인원이 차량 정원을 넘으면 나눠 배차한다. 이때도 정렬 기준은 출발 시간이다.
- **배경·근거** (원본): 셔틀팀이 태워 갈 사람만 체크해 바로 배차할 수 있어야 한다.
- **검증 의사코드**:

  ```js
  function checkPol026Sort(rows) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].departAt < rows[i - 1].departAt) return fail("MSG_NOT_SORTED_BY_TIME");
    }
    return pass();
  }

  function checkPol026Layout(columns) {
    return columns[0] === "출발 시간" ? pass() : fail("MSG_TIME_NOT_FIRST_COLUMN");
  }
  ```

- **관련 요구사항**: REQ-057, REQ-059
- **관련 화면**: TBD (원본 A10)
- **관련 테스트**: TBD

### POL-028 대상 범위

- **규칙**: 참여자 외에 **식당·집회장 스태프**도 셔틀을 신청할 수 있다. 구분값으로 표시해 함께 관리한다.
- **적용 시점**: 수시 셔틀 요청 입력 시(원본 U10), 전화 요청 등록 시, 셔틀 목록 렌더 시(원본 A10)
- **위반/실패 시 처리**:
  - 구분 미선택 → 차단. 문구 「구분(참여자 / 스태프)을 선택해 주세요.」
  - 스태프 요청에 구분 배지가 표시되지 않으면 정책 위반으로 본다.
- **예외**: 스태프는 참가자로 등록되지 않았을 수 있다. 참가자 명단에 없어도 셔틀 요청을 등록할 수 있다.
- **배경·근거** (원본): 스태프의 터미널↔금수원 이동 수요가 있었고 기존에는 텔레그램·전화로만 처리했다.
- **검증 의사코드**:

  ```js
  const POL028_TYPES = ["참여자", "스태프"];

  function checkPol028(request) {
    if (!POL028_TYPES.includes(request.riderType)) return fail("MSG_RIDER_TYPE_REQUIRED");
    if (request.riderType === "스태프") return pass();             // 참가자 명단 조회를 요구하지 않는다
    return pass();
  }
  ```

- **관련 요구사항**: REQ-017, REQ-058
- **관련 화면**: TBD (원본 U10, A10)
- **관련 테스트**: TBD

### POL-049 셔틀 탑승 확정 마감 [신규]

- **규칙**: 참가자는 배차가 확정된 셔틀에 대해 **출발 시각 10분 전까지** 탑승 확정을 누를 수 있다. 그 이후에는 버튼을 비활성화한다.
- **적용 시점**: 사용자 셔틀 화면의 탑승 확정 버튼 렌더 시와 실행 시(원본 U10), 관리자 탑승자 명단 표시 시(원본 A10)
- **위반/실패 시 처리**:
  - 마감 후 탑승 확정 시도 → 차단(버튼 비활성). 문구 「탑승 확정은 출발 10분 전까지만 가능합니다. 셔틀 담당자에게 직접 말씀해 주세요.」
  - 배차가 확정되지 않은 요청에 탑승 확정 시도 → 차단. 문구 「아직 배차가 확정되지 않았습니다.」
  - 배차가 취소되면 탑승 확정도 함께 해제하고 문구 「배차가 취소되었습니다.」를 표시한다.
- **예외**: 관리자는 출발 시각 이후에도 탑승자 명단에서 탑승 확인을 체크할 수 있다(현장 확인은 시간 제한 없음). 탑승 확정(참가자)과 탑승 확인(관리자)은 서로 다른 값이다.
- **배경·근거**: 원본 기능정의서 U10-04에 「출발 10분 전까지」라는 수치가 있으나 정책으로는 정리되어 있지 않았다. 셔틀팀이 출발 직전에 명단을 확정해야 하므로 마감 시각이 필요하다.
- **검증 의사코드**:

  ```js
  const POL049_CUTOFF_MIN = 10;

  function pol049CanConfirm(request, now) {
    if (request.status !== "배차 확정") return fail("MSG_NOT_DISPATCHED");
    const cutoff = request.departAt - POL049_CUTOFF_MIN * 60 * 1000;
    return now <= cutoff ? pass() : fail("MSG_BOARDING_CONFIRM_CLOSED");
  }

  function onPol049DispatchCancelled(request) {
    request.riderConfirmed = false;                               // 참가자 탑승 확정 해제
    notify(request.requesterId, "MSG_DISPATCH_CANCELLED");
  }

  // 관리자 탑승 확인은 시간 제한을 받지 않는다.
  function checkPol049AdminCheck(actor) {
    return actor.role === "participant" ? fail("MSG_ADMIN_ONLY") : pass();
  }
  ```

- **관련 요구사항**: REQ-018, REQ-059
- **관련 화면**: TBD (원본 U10, A10)
- **관련 테스트**: TBD

## 13. 이력 정책

### POL-033 기록 대상

- **규칙**: **접수·입금·환불·숙소·상담·셔틀·설정**의 변경을 **담당자와 사유와 함께** 기록한다. 각 관리 화면에서 건별 이력도 조회할 수 있게 한다. 기록된 이력은 수정·삭제할 수 없다.

  | 영역 | 기록 대상 | 사유 입력 |
  |---|---|---|
  | 접수 | 등록, 정보 수정, 접수 취소 | 취소만 필수 |
  | 입금 | 자동·수동·분할 매칭, 매칭 해제 | 선택 |
  | 환불 | 환불 처리 | 필수 |
  | 숙소 | 배정, 이동, 교환, 해제, 보류 지정, 메모 | 선택 |
  | 상담 | 배치, 배치 변경, 진행 상태 변경, 결과 입력, 장소 변경 | 선택 |
  | 셔틀 | 요청 등록, 배차 확정, 배차 취소, 탑승 확인 | 취소만 필수 |
  | 설정 | 집회 설정, 계정·권한, 명단 내보내기 | 선택 |

- **적용 시점**: 위 영역의 모든 생성·수정·삭제 처리 직후(전 관리자 화면, 원본 A13에서 조회)
- **위반/실패 시 처리**: 차단. 이력 기록에 실패하면 원 처리도 함께 실패시킨다(기록 없는 변경을 만들지 않는다). 문구 「처리 기록에 실패해 작업을 취소했습니다. 다시 시도해 주세요.」 사유가 필수인 처리에서 사유 미입력 시 문구 「사유를 입력해 주세요.」
- **예외**: 조회는 기록 대상이 아니다. 다만 **명단 내보내기는 개인정보가 외부로 나가므로 기록**한다(POL-041).
- **배경·근거** (원본): 프로그램 정확도는 좋은데 어디서 이상해지면 그것을 찾는 데 너무 오래 걸린다. 「이 사람은 왜 이렇게 바꿨는지」 물어볼 수 있어야 한다.
- **검증 의사코드**:

  ```js
  const POL033_AREAS = ["접수", "입금", "환불", "숙소", "상담", "셔틀", "설정"];
  const POL033_REASON_REQUIRED = ["접수 취소", "환불 처리", "배차 취소"];

  function checkPol033(change) {
    if (!POL033_AREAS.includes(change.area)) return pass();
    if (!change.actorId) return fail("MSG_ACTOR_REQUIRED");
    if (change.before === undefined || change.after === undefined) return fail("MSG_BEFORE_AFTER_REQUIRED");
    if (POL033_REASON_REQUIRED.includes(change.action) && !change.reason) return fail("MSG_REASON_REQUIRED");
    return pass();
  }

  // 원 처리와 이력 기록은 한 트랜잭션이다.
  function applyPol033(change, apply) {
    return transaction(() => {
      const result = apply();
      const logged = writeHistory(change);
      if (!logged) throw new Error("MSG_HISTORY_WRITE_FAILED");   // 롤백
      return result;
    });
  }
  ```

- **관련 요구사항**: REQ-024, REQ-026, REQ-027, REQ-031, REQ-046, REQ-049, REQ-052, REQ-059, REQ-068, REQ-069, REQ-073, REQ-074, REQ-075
- **관련 화면**: TBD (원본 A13, 전 관리자 화면)
- **관련 테스트**: TBD

## 변경 이력

| 버전 | 일자 | 변경 내용 | 관련 CR |
|---|---|---|---|
| v0.1 | 2026-09-02 | 최초 작성. 원본 『운영 정책 기준서 v1.0』의 P-01~P-36을 POL-001~036으로 승계하고, 위반 시 문구와 검증 의사코드를 새로 작성. PRD·NFR에서 파생된 신규 정책 13건(POL-037~049) 추가 | - |
| v0.2 | 2026-09-04 | 2026-09-04 회의 결정 반영. POL-050(상담 시간 30분 단위, D-3)·POL-051(좌석 사용 불가 지정, D-5)·POL-052(좌석 번호 체계 1층 홀수/2층 짝수, D-5) 신규. POL-051 도입에 따라 POL-048 좌석 합계 식을 `배정+보류+사용불가+빈자리=총 좌석`으로 개정 | - |
| v0.3 | 2026-09-04 | 2026-09-03 검토 결과 반영. 신규 정책 없음. POL-008·033·038·041·046의 「관련 요구사항」에 REQ-073~075를 역참조로 추가해 정책→요구사항 링크를 복구. POL-038·041에는 미정 사항(OI-22 등록번호 처리, OI-23 내보내기 범위)을 함께 표기 | - |
