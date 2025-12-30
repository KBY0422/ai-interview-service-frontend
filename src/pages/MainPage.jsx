// src/pages/MainPage.jsx
import "../styles/MainPage.css";
import { Link } from "react-router-dom";

export default function MainPage() {
    return (
        <main className="main">
            {/* HERO */}
            <section className="hero">
                <div className="hero-inner">
                    <h1 className="hero-title">
                        AI로 준비하는
                        <br />
                        실전 모의면접
                    </h1>

                    <p className="hero-desc">AI 기반 분석으로 나의 강점과 개선점을 정확하게 파악하세요.</p>

                    <div className="hero-actions">
                        <Link to="/interviewsetting" className="primary">
                            AI 면접 시작하기
                        </Link>
                        <Link to="/analysis/list" className="secondary">
                            분석 기록 보기
                        </Link>
                    </div>

                    {/* 🔹 시각적 포인트 (Step 1) */}
                    <div className="hero-divider">
                        <span>AI 질문 자동 생성</span>
                        <span>세션 기반 분석</span>
                        <span>PDF 리포트</span>
                        <span>결과 피드백</span>
                    </div>
                </div>
            </section>

            {/* QUICK ACTION */}
            <section className="quick">
                <div className="quick-inner">
                    <div className="quick-card">
                        <h3>AI 면접 자동 생성</h3>
                        <p>직무·유형·난이도에 맞는 질문을 AI가 자동으로 생성합니다.</p>
                    </div>

                    <div className="quick-card">
                        <h3>세션 기반 분석 저장</h3>
                        <p>면접 세션별로 점수와 피드백을 체계적으로 관리합니다.</p>
                    </div>

                    <div className="quick-card">
                        <h3>PDF 리포트 제공</h3>
                        <p>분석 결과를 PDF로 저장하고 언제든 다시 확인할 수 있습니다.</p>
                    </div>
                </div>
            </section>

            {/* SAMPLE RESULT */}
            <section className="sample">
                <div className="sample-inner">
                    <h2 className="section-title">예시 분석 결과</h2>

                    <div className="sample-box">
                        <div className="sample-score">
                            <span>종합 점수</span>
                            <strong>82점</strong>
                        </div>

                        <div className="sample-feedback">
                            <p>논리적인 답변 구조가 잘 유지되었으며, 기술 설명이 명확합니다. 다만 일부 질문에서 핵심 키워드가 누락되었습니다.</p>

                            <ul>
                                <li>논리 우수</li>
                                <li>기술 이해도 높음</li>
                                <li>키워드 보완 필요</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="features">
                <div className="features-inner">
                    <h2 className="section-title">서비스 특징</h2>

                    <div className="feature-grid">
                        <div className="feature-card">
                            <h3>실전 중심 분석</h3>
                            <p>실제 면접 흐름을 반영한 질문과 평가 기준을 제공합니다.</p>
                        </div>

                        <div className="feature-card">
                            <h3>누적 기록 관리</h3>
                            <p>면접 결과를 누적하여 성장 과정을 한눈에 확인할 수 있습니다.</p>
                        </div>

                        <div className="feature-card">
                            <h3>AI 피드백 제공</h3>
                            <p>단순 점수가 아닌 개선 방향 중심의 피드백을 제공합니다.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
