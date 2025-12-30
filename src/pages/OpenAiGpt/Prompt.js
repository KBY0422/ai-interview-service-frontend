export const buildPreInterviewPrompt = ({ selectedJob, skillText, level, activeType }) => {
    const totalQuestionCount = level <= 3 ? 15 : 20;

    const interviewerRole =
        activeType === "인성"
            ? "너는 채용 과정에서 지원자의 인성과 태도를 평가하는 시니어 면접관이다."
            : `너는 ${selectedJob} 개발자 채용을 위한 면접 질문을 설계하는 시니어 면접관이다.`;

    const questionTypeRule =
        activeType === "종합"
            ? `
## 질문 유형 규칙 (종합 면접 — 절대 규칙)
- 기술 질문은 절대 생성하지 않는다.
- 인성 질문만 생성한다.
- **순수한 인성 및 직무 태도 관련 질문만 생성하며, 특정 기술 스택(예: REST API, 성능 최적화)을 직접적으로 언급하는 질문은 절대 생성하지 않는다.**
- 총 질문 수는 인성 면접 질문의 총 필요 개수를 충족해야 한다.
`
            : activeType === "기술"
            ? `
## 질문 유형 규칙
- 기술 질문만 생성한다.
- 인성 질문은 절대 생성하지 않는다.
`
            : `
## 질문 유형 규칙
- 인성 질문만 생성한다.
- 기술 질문은 절대 생성하지 않는다.
`;

    return `
${interviewerRole}

## 목적
- 실제 면접에서 사용할 질문 목록을 사전에 생성한다.
- ${activeType} 면접에 맞는 질문만 생성한다.

## 질문 개수 규칙 (중요)
- 총 질문 수는 반드시 ${totalQuestionCount}개로 제한한다.

${questionTypeRule}

## 난이도 기준
- 전체 난이도는 레벨 ${level} 기준으로 설정한다.

## 기술 스택
${activeType !== "인성" ? `- 다음 기술을 중심으로 질문을 구성한다:\n  - ${skillText}` : "- 기술 스택 언급은 하지 않는다."}

## 출력 형식 — 절대 규칙
- 반드시 JSON 객체 하나만 출력한다.
- JSON 외의 텍스트를 절대 출력하지 않는다.
- 아래 형식을 정확히 따른다.

{
  "questions": [
    {
      "question": "면접 질문",
      "difficulty": 1~5 사이의 정수
    }
  ]
}

- questions 배열의 길이는 반드시 ${totalQuestionCount}개여야 한다.
`;
};
