import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { askGPT, getJobList, getJobSkill, writeSession } from "../../api/OpenAiGpt";
import { buildPreInterviewPrompt } from "./Prompt";
import "../../styles/InterviewSetting.css";

export default function InterviewSetting() {
    // 면접 화면으로 넘어갈때 사용
    const navigate = useNavigate();

    // 면접 시작버튼 눌렀을 때 로딩 애니메이션 & 문구수정
    const [isLoading, setIsLoading] = useState(false);

    // 면접유형 active 클래스 주입때 사용
    const [activeType, setActiveType] = useState(null);

    // 직군선택 active 클래스 주입때 사용
    const [activeJobId, setActiveJobId] = useState(false);

    // 기술스택 active 클래스 주입때 사용
    const [activeSkillIds, setActiveSkillIds] = useState([]);

    // 난이도 active 클래스 주입때 사용
    const [activeLevel, setActiveLevel] = useState(null);

    // 직군선택 리스트 백엔드에서 가져올때 사용
    const [jobList, setJobList] = useState([]);

    // 기술스택 리스트 백엔드에서 가져올때 사용
    const [jobSkill, setJobSkill] = useState([]);

    // 면접유형 클릭시 하위 유형 선택된거 초기화
    const handleSelectType = (type) => {
        setActiveType(type);
        setActiveJobId(false);
        setActiveSkillIds([]);

        if (type === "인성 면접") {
            setJobSkill([]);
        }
    };

    // 클릭된 직군값 저장해서 active클래스 부여 (테두리 강조 되는 CSS부여)
    const handleSelectLevel = (type) => {
        setActiveLevel(type);
    };

    // 클릭된 기술스택 배열로 저장해서 active 클래스 부여 (테두리 강조 되는 CSS부여)
    const handleSkillIdActive = (e_skill_idx) => {
        const isSelect = activeSkillIds.includes(e_skill_idx);

        if (isSelect) {
            setActiveSkillIds(activeSkillIds.filter((idx) => idx !== e_skill_idx));
        } else {
            setActiveSkillIds([...activeSkillIds, e_skill_idx]);
        }
    };

    // 최초 화면 구성시 직군 목록 백엔드에서 가져오기
    const handleGetList = async () => {
        try {
            const response = await getJobList();

            if (response.data.success) {
                setJobList(response.data.data);
            }
        } catch (error) {
            console.log(error);
            alert("getList() 실패");
        }
    };

    // 직군 선택시 백엔드에서 기술 목록 가져오기
    const handleGetSkill = async (e_job, e_job_idx) => {
        try {
            setActiveJobId(e_job_idx);
            setActiveSkillIds([]);

            const response = await getJobSkill(e_job);

            if (response.data.success) {
                setJobSkill(response.data.data);
            }
        } catch (error) {
            console.log(error);
            alert("getJobSkill() 실패");
        }
    };

    // 선택결과 종합해서 prompt 문장 만들기
    const getPromptText = () => {
        if (!activeType) {
            alert("면접 유형을 선택해주세요.");
            return;
        }

        if (activeType !== "인성 면접") {
            if (!activeJobId || activeSkillIds.length === 0) {
                alert("직군과 기술 스택을 선택해주세요.");
                return;
            }
        }

        if (!activeLevel) {
            alert("난이도를 선택해주세요.");
            return;
        }

        // 현재 선택된 직종 문자열 가져오기
        const selectedJob = jobList.find((j) => j.e_job_idx === activeJobId)?.e_job;

        // 현재 선택된 기술스택들 배열 가져오기 (기술스택은 중복선택이 가능해서 배열로 저장)
        const selectedSkills = jobSkill.filter((s1) => activeSkillIds.includes(s1.e_skill_idx)).map((s2) => s2.e_skill);

        // 기술스택 배열에서 값을 꺼내 "기술1, 기술2, 기술3" 형태의 문자열로 바꾸기
        const skillText = selectedSkills.join(", ");

        // 난이도 숫자 여기서 미리 처리
        const levelValue = Number(activeLevel?.replace("단계", ""));

        // 기술면접, 인성면접, 종합면접  중에 앞 글자 2개만 추출
        const typeValue = activeType?.slice(0, 2);

        // 위에서 추출한 값들 객체로 만들어서 프롬프트 만드는 함수에 매개변수로 전달
        const startPrompt = buildPreInterviewPrompt({ selectedJob, skillText, level: levelValue, activeType: typeValue });

        // 완성된 프롬프트와 명령을 GPT로 전달할 포멧으로 만듬
        const startPromptBody = {
            msg: "사전 질문을 생성한다.",
            prompts: [startPrompt],
        };

        // 선택한 직업, 기술스택, 난이도, 유형 전달
        const sessionData = {
            s_job: selectedJob,
            s_type: activeType,
            s_skill: skillText,
            s_level: levelValue,
        };

        handleStart(startPromptBody, skillText, levelValue, sessionData);
    };

    const handleStart = async (startPrompt, skillText, levelValue, sessionData) => {
        try {
            setIsLoading(true);

            // 면접 초기 세팅 데이터 DB에 저장
            await writeSession(sessionData);

            // 시작 프롬프트 gpt에 전달
            const { data } = await askGPT(startPrompt);

            // gpt의 응답에서 질문리스트 가져옴
            const questionList = data.questions.map((q) => q.question).filter(Boolean);

            if (!questionList.length) {
                throw new Error("질문 목록이 비어있음");
            }

            // 질문리스트, 여러 정보들 면접페이지로 보냄
            navigate("/interview", {
                state: {
                    questions: questionList,
                    level: levelValue,
                    totalQuestionCount: levelValue <= 3 ? 15 : 20,
                    activeType,
                    skillText: skillText,
                },
            });
        } catch (error) {
            console.error(error);
            alert("질문 생성중 오류 발생");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleGetList();
    }, []);

    return (
        <div id="container">
            <main className="main">
                <div className="wrapper">
                    {/* 카드 위에 타이틀 */}
                    <div className="title">
                        <h1>AI 면접 시작하기</h1>
                        <p>맞춤형 면접 설정으로 실전 같은 면접을 경험하세요</p>
                    </div>

                    {/* 카드 영역 */}
                    <div className="card">
                        {/* 카드 헤더 */}
                        <div className="card-header">
                            <h2>면접 환경 설정</h2>
                        </div>

                        <div className="card-body">
                            {/* --- 면접 유형 선택 영역 --- */}
                            <div className="form-box">
                                <label className="label-title">면접 유형</label>
                                <p className="label-title-sub">연습하고 싶은 면접 유형을 선택하세요</p>

                                <div className="select">
                                    <button
                                        className={activeType === "기술 면접" ? "select-item active" : "select-item"}
                                        onClick={() => handleSelectType("기술 면접")}
                                        disabled={isLoading}
                                    >
                                        기술 면접
                                    </button>
                                    <button
                                        className={activeType === "인성 면접" ? "select-item active" : "select-item"}
                                        onClick={() => handleSelectType("인성 면접")}
                                        disabled={isLoading}
                                    >
                                        인성 면접
                                    </button>
                                    <button
                                        className={activeType === "종합 면접" ? "select-item active" : "select-item"}
                                        onClick={() => handleSelectType("종합 면접")}
                                        disabled={isLoading}
                                    >
                                        종합 면접
                                    </button>
                                </div>
                            </div>

                            <div className="form-box">
                                <label className="label-title">직군 선택</label>
                                <p className="label-title-sub">지원하시는 직군을 선택해주세요</p>
                                <div className="select">
                                    {jobList.map((k) => (
                                        <button
                                            className={k.e_job_idx === activeJobId ? "select-item active" : "select-item"}
                                            key={k.e_job_idx}
                                            onClick={() => handleGetSkill(k.e_job, k.e_job_idx)}
                                            disabled={activeType === "인성 면접" || isLoading}
                                        >
                                            {k.e_job}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* --- 기술 스택 선택 영역 (복수 선택 가능) --- */}
                            <div className="form-box">
                                <label className="label-title">기술 스택</label>
                                <p className="label-title-sub">다루는 기술 스택을 선택하세요 (복수 선택 가능)</p>
                                <div className="tag">
                                    {jobSkill.map((k) => (
                                        <button
                                            className={activeSkillIds.includes(k.e_skill_idx) ? "tag-item active" : "tag-item"}
                                            key={k.e_skill_idx}
                                            onClick={() => handleSkillIdActive(k.e_skill_idx)}
                                            disabled={isLoading}
                                        >
                                            {k.e_skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-box">
                            <label className="label-title">면접 난이도</label>
                            <p className="label-title-sub">면접 난이도를 선택하세요</p>

                            <div className="selectLevel">
                                <button
                                    className={activeLevel === "1단계" ? "select-item active" : "select-item"}
                                    onClick={() => handleSelectLevel("1단계")}
                                    disabled={isLoading}
                                >
                                    1단계
                                </button>
                                <button
                                    className={activeLevel === "2단계" ? "select-item active" : "select-item"}
                                    onClick={() => handleSelectLevel("2단계")}
                                    disabled={isLoading}
                                >
                                    2단계
                                </button>
                                <button
                                    className={activeLevel === "3단계" ? "select-item active" : "select-item"}
                                    onClick={() => handleSelectLevel("3단계")}
                                    disabled={isLoading}
                                >
                                    3단계
                                </button>
                                <button
                                    className={activeLevel === "4단계" ? "select-item active" : "select-item"}
                                    onClick={() => handleSelectLevel("4단계")}
                                    disabled={isLoading}
                                >
                                    4단계
                                </button>
                                <button
                                    className={activeLevel === "5단계" ? "select-item active" : "select-item"}
                                    onClick={() => handleSelectLevel("5단계")}
                                    disabled={isLoading}
                                >
                                    5단계
                                </button>
                            </div>
                        </div>
                        {/* 버튼 */}
                        <button className="start-btn" onClick={() => getPromptText()} disabled={isLoading}>
                            {isLoading ? (
                                <span className="loading-wrap">
                                    <span className="spinner" />
                                    질문 생성중입니다
                                </span>
                            ) : (
                                "AI 면접 시작하기"
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
