import { useNavigate } from "react-router-dom";
import { useInterview } from "./UseInterview";
import { useState } from "react";
import { Send } from "lucide-react";
import "../../styles/Interview.css";

export default function Interview() {
    const navigate = useNavigate();

    // 1. Hook을 사용하여 모든 상태와 함수를 가져옴
    const { currentValue, maxValue, difficulty, diffDirection, isFinished, isLoading, liveQuestion, handleSend, sessionId } = useInterview();

    // 2. 답변 입력창
    const [input, setInput] = useState("");

    // 3. 답변 제출 핸들러 (Hook의 handleSend를 호출)
    const handleSubmit = () => {
        if (isFinished && sessionId) {
            // console.log("가져온 세션번호 확인 : ", sessionId);
            navigate(`/analysis/result/${sessionId}`);
        } else {
            handleSend(input);
            setInput(""); // 답변 제출 후 입력창 초기화
        }
    };

    // 그냥 엔터만 눌렀을때 답변 제출
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // 기본동작 막기 -> (그냥 엔터 동작 = 줄바꿈)
            handleSubmit(); // 답변제출 함수 호출
        }
    };

    if (!liveQuestion) {
        return <div className="container">질문을 불러오는 중입니다...</div>;
    }

    return (
        <div className="container">
            <div className="card">
                {/* 진행 상황 */}
                <div className="progress">
                    <div>
                        <h3>진행 상황</h3>
                        <span>
                            {currentValue}/{maxValue}
                        </span>
                    </div>
                    <progress className="progressbar" value={currentValue} max={maxValue} />
                </div>

                {/* 실시간 난이도 */}
                <div className="difficulty" data-level={difficulty}>
                    <span>실시간 난이도</span>
                    <div className="difficulty-bar">
                        <progress value={difficulty} max={5} />
                        {diffDirection && <span className={`diff-arrow ${diffDirection}`}>{diffDirection === "up" ? "▲" : "▼"}</span>}
                    </div>
                    <span>{difficulty}/5</span>
                </div>

                {/* 질문 */}
                <div className="question">
                    <p className="q-title">{isFinished ? "면접 종료" : `질문 ${currentValue}`}</p>
                    <div className="q-content">
                        {isFinished ? "면접이 모두 종료되었습니다. 수고하셨습니다." : isLoading ? "다음 질문을 생성 중..." : liveQuestion}
                    </div>
                </div>

                {/* 답변 */}
                <div className="answer">
                    <p className="a-title">답변 작성</p>
                    <textarea
                        className="a-textarea"
                        placeholder={isFinished ? "면접이 종료되었습니다." : "줄바꿈은 shift + enter 를 눌러주세요!!"}
                        value={input}
                        disabled={isLoading || isFinished}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <button className="submit-btn" onClick={handleSubmit} disabled={isLoading}>
                    <Send size={18} />
                    {isFinished ? "결과 보러 가기" : isLoading ? "질문 생성 중..." : "답변 제출"}
                </button>
            </div>
        </div>
    );
}
