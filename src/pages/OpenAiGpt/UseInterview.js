import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { askGPT, writeInterview } from "../../api/OpenAiGpt";
import { buildLivePrompt } from "./BuildLivePrompt";

const SESSION_KEY = "interviewState";


function safeJsonParse(text) {
    if (typeof text !== "string") return text;

    try {
        const cleaned = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON 파싱 실패, 원본 응답:", text);
        return null; // ← 중요
    }
}

export function useInterview() {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. 모든 상태 선언
    const [selectedSkillText, setSelectedSkillText] = useState("");
    const [usedTechTopics, setUsedTechTopics] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [liveQuestion, setLiveQuestion] = useState("");
    const [answers, setAnswers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [difficulty, setDifficulty] = useState(3);
    const [prevDifficulty, setPrevDifficulty] = useState(3);
    const [diffDirection, setDiffDirection] = useState(null);
    const [baseLevel, setBaseLevel] = useState(3);
    const [totalQuestionCount, setTotalQuestionCount] = useState(15);
    const [normalizedType, setNormalizedType] = useState("인성"); // 기본값
    const [sessionId, setSessionId] = useState(null);

    // 2. 초기 로드 (useEffect)
    useEffect(() => {
        const rawActiveType = location.state?.activeType;
        const type = rawActiveType?.includes("종합") ? "종합" : rawActiveType?.includes("기술") ? "기술" : "인성";
        setNormalizedType(type);

        const initialBaseLevel = Number(location.state?.level ?? 3);
        const initialTotalCount = location.state?.totalQuestionCount ?? 15;
        setBaseLevel(initialBaseLevel);
        setTotalQuestionCount(initialTotalCount);

        // 넘어온 값 중에 질문이 있을때 (정상진행)
        if (location.state?.questions) {
            // 초기 설정 (면접 시작 시)
            const initState = {
                questions: location.state.questions,
                currentIndex: 0,
                answers: [],
                liveQuestion: location.state.questions[0],
                difficulty: initialBaseLevel,
                totalQuestionCount: initialTotalCount,
                skillText: location.state.skillText || "",
                usedTechTopics: [],
            };

            // 질문 리스트 저장
            setQuestions(initState.questions);
            // gpt에게 받은 질문 리스트 저장
            setLiveQuestion(initState.liveQuestion);
            // gpt에게 받은 실시간 난이도 저장
            setDifficulty(initialBaseLevel);
            // 실시간 난이도 이전 값 저장
            setPrevDifficulty(initialBaseLevel);
            // 선택된 스킬 정보 리스트 저장
            setSelectedSkillText(initState.skillText);
            // 기술 이름 저장
            setUsedTechTopics(initState.usedTechTopics);

            // 세션에 정보들 저장
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(initState));

            // 질문이 없을 때 (면접보다가 새로고침 같은거 했을때 상황)
        } else {
            // 세션에서 모든 내용 복원
            const saved = sessionStorage.getItem(SESSION_KEY);

            // 세션 정보 있을 때
            if (saved) {
                const parsed = JSON.parse(saved);

                setQuestions(parsed.questions);
                setCurrentIndex(parsed.currentIndex);
                setAnswers(parsed.answers);
                setLiveQuestion(parsed.liveQuestion);
                setSelectedSkillText(parsed.skillText || "");
                setUsedTechTopics(parsed.usedTechTopics || []);

                const restoredDifficulty = parsed.difficulty ?? initialBaseLevel;
                setDifficulty(restoredDifficulty);
                setPrevDifficulty(restoredDifficulty);

                if (parsed.sessionId) {
                    setSessionId(parsed.sessionId);
                }
            }
            // 세션정보 없을 때
            else {
                alert("질문 정보가 없습니다. 다시 시작해주세요.");
                navigate("/interviewsetting");
            }
        }
    }, [location.state, navigate]);

    // 3. 난이도 업데이트 로직 (useCallback 적용)
    const updateDifficulty = useCallback(
        // 매개변수로 들어온 값
        (nextDifficulty) => {
            if (nextDifficulty > prevDifficulty) setDiffDirection("up"); // 이전보다 높을 때
            else if (nextDifficulty < prevDifficulty) setDiffDirection("down"); // 이전보다 낮을 때

            setPrevDifficulty(nextDifficulty);
            setDifficulty(nextDifficulty);

            setTimeout(() => setDiffDirection(null), 1000);
        },
        [prevDifficulty]
    );

    // 4. 세션 저장 로직 분리 (useCallback 적용)
    const saveStateToSession = useCallback(
        (currentAnswers, nextIndex, nextQuestion, nextDifficulty, nextUsedTopics = usedTechTopics, currentSessionId = sessionId) => {
            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({
                    questions,
                    currentIndex: nextIndex,
                    answers: currentAnswers,
                    liveQuestion: nextQuestion,
                    difficulty: nextDifficulty,
                    totalQuestionCount,
                    skillText: selectedSkillText,
                    usedTechTopics: nextUsedTopics,
                    sessionId: currentSessionId,
                })
            );
        },
        [questions, totalQuestionCount, selectedSkillText, usedTechTopics, sessionId]
    );

    // 5. 핵심 로직: handleSend
    const handleSend = useCallback(
        async (text) => {
            if (isLoading || !text.trim()) return;

            setIsLoading(true);

            const currentQuestion = liveQuestion;
            const newAnswers = [...answers, { question: currentQuestion, answer: text }];

            const nextIndex = currentIndex + 1;
            const currentDifficulty = difficulty;

            // 1. 면접 종료 확인
            const isLastQuestion = currentIndex === totalQuestionCount - 1;
            if (isLastQuestion) {
                setAnswers(newAnswers);
                setIsFinished(true);
                setIsLoading(false);

                saveStateToSession(newAnswers, currentIndex, liveQuestion, currentDifficulty);

                // DB 저장 형식 추출 질문(0)과 답변(1)을 연속된 레코드로 평탄화
                const interviewRecords = newAnswers.flatMap((item) => [
                    { q_content: item.question, q_type: 0 },
                    { q_content: item.answer, q_type: 1 },
                ]);

                try {
                    const response = await writeInterview(interviewRecords);
                    const receivedSessionId = response.data.data;

                    if (receivedSessionId) {
                        setSessionId(receivedSessionId);

                        saveStateToSession(newAnswers, currentIndex, liveQuestion, currentDifficulty, usedTechTopics, receivedSessionId);
                    }
                    console.log("응답받은 세션 번호 : ", response.data.data);
                } catch (error) {
                    console.log("세션번호 받기 실패");
                }

                return;
            }

            // 2. 다음 질문 유형 결정
            const nextQuestionType = normalizedType === "종합" ? (nextIndex % 2 === 0 ? "인성" : "기술") : normalizedType;

            // 3. 인성 질문 분기
            if (normalizedType === "종합" && nextQuestionType === "인성" && questions[nextIndex]) {
                const nextQuestionFromList = questions[nextIndex];

                setAnswers(newAnswers);
                setCurrentIndex(nextIndex);
                setLiveQuestion(nextQuestionFromList);
                updateDifficulty(currentDifficulty);

                saveStateToSession(newAnswers, nextIndex, nextQuestionFromList, currentDifficulty);

                setIsLoading(false);
                return;
            }

            // 4. GPT 요청을 위한 데이터 준비 (생략)
            const usedTopicsText = usedTechTopics.join(", ");
            const previousQuestions = newAnswers.map((a) => a.question);
            const usedQuestionsText = previousQuestions.join("\n - ");

            const prompt = buildLivePrompt({
                currentQuestion,
                answer: text,
                baseLevel,
                difficulty: currentDifficulty,
                activeType: normalizedType,
                nextQuestionType,
                usedQuestions: usedQuestionsText,
                skillText: selectedSkillText,
                usedTechTopics: usedTopicsText,
            });

            try {
                const response = await askGPT({ msg: prompt, prompts: [] });
                let data = response.data?.result ?? response.data;
                data = safeJsonParse(data);

                const hasValidQuestion = data && typeof data.question === "string" && data.question.trim().length > 0;

                if (!hasValidQuestion) {
                    // Fallback
                    setAnswers(newAnswers);
                    setCurrentIndex(nextIndex);
                    setLiveQuestion(liveQuestion);
                    updateDifficulty(currentDifficulty);

                    saveStateToSession(newAnswers, nextIndex, liveQuestion, currentDifficulty);
                    return;
                }

                // 5. 정상 흐름 및 상태 업데이트 (난이도, 사용 주제)
                const safeDifficulty = Math.min(5, Math.max(1, Number(data.difficulty ?? currentDifficulty)));

                const newUsedTechTopics = [...usedTechTopics];

                if (data.topic && data.topic.trim().length > 0) {
                    const topicLower = String(data.topic).toLowerCase().trim();

                    const topicsToSave = topicLower
                        .split(/[,/]/)
                        .map((t) => t.trim())
                        .filter((t) => t.length > 0);

                    topicsToSave.forEach((topic) => {
                        if (!newUsedTechTopics.map((t) => t.toLowerCase()).includes(topic)) {
                            newUsedTechTopics.push(topic);
                        }
                    });

                    setUsedTechTopics(newUsedTechTopics);
                }

                setAnswers(newAnswers);
                setCurrentIndex(nextIndex);
                setLiveQuestion(data.question);
                updateDifficulty(safeDifficulty);

                saveStateToSession(newAnswers, nextIndex, data.question, safeDifficulty, newUsedTechTopics);
            } catch (error) {
                console.error("GPT 호출 실패", error);
                alert("다음 질문 생성에 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        },
        [
            answers,
            currentIndex,
            liveQuestion,
            normalizedType,
            questions,
            selectedSkillText,
            baseLevel,
            difficulty,
            totalQuestionCount,
            usedTechTopics,
            isLoading,
            saveStateToSession,
            updateDifficulty,
        ]
    );

    // 6. 컴포넌트로 전달할 값 반환
    return {
        currentValue: currentIndex + 1,
        maxValue: totalQuestionCount,
        difficulty,
        diffDirection,
        isFinished,
        isLoading,
        liveQuestion,
        handleSend,
        navigate,
        sessionId,
    };
}
