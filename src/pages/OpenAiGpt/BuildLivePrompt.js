/**
 * 실시간 면접 질문 생성을 위한 GPT 프롬프트 빌더
 * @param {object} params - 질문 생성에 필요한 파라미터
 * @param {string} params.currentQuestion - 방금 나간 질문
// ... (생략)
 * @param {string} params.skillText - 선택된 기술 스택 (쉼표로 연결된 문자열, 예: HTML, Oracle, MySQL)
 * @param {string} params.usedTechTopics - 이전에 사용된 기술/인성 주제 (쉼표로 연결된 문자열, 블랙리스트)
 * @returns {string} GPT 프롬프트
 */
export const buildLivePrompt = ({ currentQuestion, answer, baseLevel, difficulty, activeType, nextQuestionType, usedQuestions, skillText, usedTechTopics }) => {
    // ----------------------------------------------------
    // 1. 주제 관련 지침 생성
    // ----------------------------------------------------
    const isTech = nextQuestionType === "기술" || activeType === "기술";
    const isHR = nextQuestionType === "인성" || activeType === "인성";

    let subjectRule = "";

    if (isTech) {
        subjectRule = `
[기술 스택 지침 - 🔥최우선 절대 규칙🔥]
- 현재 선택된 기술 스택은 다음과 같다 (반드시 이 목록 내에서만 출제): ${skillText}
- 이전에 사용된 기술 주제 (블랙리스트): [${usedTechTopics || "없음"}]
- **GPT의 가장 중요한 임무 (기술 질문):** 다음에 생성할 질문은 **skillText 목록 내의 주제 중 블랙리스트에 없는 주제**를 선택해야 한다.
- **절대 skillText에 없는 주제는 질문하면 안 된다.**

- **🔥핵심 순환 규칙 (가장 중요):** ${skillText} 목록 내의 주제들을 **균등하고 순차적으로 출제**해야 한다. **특정 주제에 머무르거나, 다른 주제를 배제해서는 안 된다.** 예를 들어, HTML 질문을 했다면, 다음에는 MySQL 또는 Oracle 질문을 시도하여, 모든 선택 주제를 순차적으로 돌아가며 질문하도록 강제한다.
`;
    } else if (isHR) {
        subjectRule = `
[인성 질문 지침 - 절대 규칙]
- 인성 질문의 핵심 카테고리: 팀워크, 갈등 관리, 문제 해결, 도전/실패, 지원 동기/직무 이해, 가치관/윤리.
- 이전에 사용된 인성 주제 (블랙리스트): [${usedTechTopics || "없음"}]
- **가장 중요한 임무:** 위 카테고리 내에서 블랙리스트 주제를 **절대 반복하지 않는** 새로운 카테고리로 전환해야 한다.
`;
    }

    // ----------------------------------------------------
    // 2. 난이도 및 면접 유형 지침
    // ----------------------------------------------------
    const generalRule = `
[면접 진행 규칙]
- 현재 면접 유형: ${activeType}
- 다음에 생성할 질문 유형: ${nextQuestionType}
- 이전 질문: ${currentQuestion}
- 이전 답변: ${answer}
- 현재 체감 난이도(1~5): ${difficulty} (base: ${baseLevel})
- 면접자는 총 ${usedQuestions.split("\n - ").length}개의 질문에 답했습니다.

[난이도 조정]
- 답변이 훌륭하면 difficulty를 +1, 답변이 미흡하면 -1로 조정하여 1~5 사이의 정수로 출력하라.
- 인성 질문은 난이도에 큰 영향을 주지 않는다.
`;

    // ----------------------------------------------------
    // 3. 전체 프롬프트 구성
    // ----------------------------------------------------
    const topicInstruction = isTech
        ? "이 질문이 속하는 단일 핵심 기술 주제 (예: HTML, Oracle, MySQL)"
        : isHR
        ? "이 질문이 속하는 단일 인성 카테고리 (예: 팀워크, 갈등 관리, 문제 해결)"
        : "";

    return `
당신은 모의 면접관입니다. 지원자의 답변을 바탕으로 다음 질문을 JSON 형식으로 하나만 생성해야 합니다.

${generalRule}
${subjectRule}

[이전 질문 목록 (참고용)]
- ${usedQuestions}

[출력 형식 — 절대 규칙]
- 반드시 JSON 객체 하나만 출력하며, JSON 외의 다른 텍스트는 절대 출력하지 않는다.
- 필드 값은 다음과 같다:

{
  "question": "지원자의 이전 답변을 기반으로 꼬리 질문 또는 다음 유형의 질문을 생성",
  "difficulty": "1~5 사이의 정수 (조정된 난이도)",
  "topic": "${topicInstruction}" 
}
`;
};
