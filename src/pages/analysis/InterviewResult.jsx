import "../../styles/AnalysisList.css";
import "../../styles/InterviewResult.css";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import AnalysisSidebar from "../../components/AnalysisSidebar";
import {
  getInterviewResult,
  getAnalysisList,
  downloadPdfBlob,
  createPdf,
} from "../../api/api";

export default function InterviewResult() {
  const { sIdx } = useParams();
  const invalidSIdx = useMemo(() => !sIdx || sIdx === "undefined", [sIdx]);

  const [result, setResult] = useState(null);
  const [sessions, setSessions] = useState([]);

  const [loadingResult, setLoadingResult] = useState(true);
  const [error, setError] = useState("");

  const [creatingPdf, setCreatingPdf] = useState(false);

  /* 분석 리스트(사이드바) */
  const fetchSessionList = async () => {
    try {
      const res = await getAnalysisList();
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setSessions(res.data.data);
      } else {
        setSessions([]);
      }
    } catch (e) {
      console.error(e);
      setSessions([]);
    }
  };

  /* 사이드바 세션 목록 */
  useEffect(() => {
    fetchSessionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 분석 결과 상세 */
  useEffect(() => {
    const fetchResult = async () => {
      if (invalidSIdx) {
        setError("잘못된 접근입니다.");
        setLoadingResult(false);
        return;
      }

      try {
        const res = await getInterviewResult(sIdx);
        if (res?.data?.success) {
          setResult(res.data.data);
          setError("");
        } else {
          setError("분석 결과를 불러올 수 없습니다.");
        }
      } catch (e) {
        console.error(e);
        setError("분석 결과를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoadingResult(false);
      }
    };

    fetchResult();
  }, [sIdx, invalidSIdx]);

  /* 현재 선택된 세션 정보 */
  const currentSession = sessions.find((s) => String(s.sidx) === String(sIdx));

  const jobLabel = currentSession?.job ?? "직무 정보 없음";
  const typeLabel = currentSession?.type ?? "면접 유형 미기재";
  const dateLabel =
    currentSession?.date ?? result?.createdAt?.replace("T", " ") ?? "날짜 정보 없음";

  const hasPdf = currentSession?.hasPdf === 1;

  const scores = result?.scores;
  const metrics = result?.metrics;

  /* PDF 생성 */
  const handlePdfCreate = async () => {
    if (creatingPdf) return;

    try {
      setCreatingPdf(true);
      await createPdf(sIdx);

      await fetchSessionList();
      alert("PDF 생성이 완료되었습니다.");
    } catch (e) {
      console.error(e);
      alert("PDF 생성 실패");
    } finally {
      setCreatingPdf(false);
    }
  };

  /* PDF 다운로드 */
  const handlePdfDownload = async () => {
    try {
      const res = await downloadPdfBlob(sIdx);
      const blob = new Blob([res.data], { type: "application/pdf" });

      let filename = `analysis_session_${sIdx}.pdf`;
      const cd = res.headers?.["content-disposition"];

      if (cd) {
        const match = cd.match(/filename\*?=(?:UTF-8'')?([^;]+)/);
        if (match?.[1]) {
          filename = decodeURIComponent(match[1].replace(/"/g, "").trim());
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("PDF 다운로드 실패");
    }
  };

  return (
    <div className="page-with-header analysis-page">
      <div className="analysis-layout">
        {/* 사이드바 */}
        <AnalysisSidebar sessions={sessions} activeSIdx={sIdx} />

        <main className="result-main">
          <h1 className="analysis-title">면접 분석 결과</h1>

          {loadingResult && <div className="analysis-state">불러오는 중...</div>}
          {!loadingResult && error && <div className="analysis-error">{error}</div>}

          {!loadingResult && !error && result && (
            <>
              {/* 상단 요약 카드 */}
              <section className="result-header-card">
                <div className="result-header-left">
                  <div className="result-job">{jobLabel}</div>
                  <div className="result-meta">
                    <span>{typeLabel}</span>
                    <span className="dot">·</span>
                    <span>{dateLabel}</span>
                  </div>
                </div>

                <div className="result-header-right">
                  <div className="result-total-label">총점</div>
                  <div className="result-total-score">
                    {scores?.total ?? "-"} <span>/ 100</span>
                  </div>
                </div>
              </section>

              {/* 점수 카드 */}
              <section className="result-score-row">
                <div className="result-score-card">
                  <div className="label">기술 역량</div>
                  <div className="value">
                    {scores?.tech ?? "-"} <span>/ 100</span>
                  </div>
                </div>

                <div className="result-score-card">
                  <div className="label">논리 · 구조</div>
                  <div className="value">
                    {scores?.logic ?? "-"} <span>/ 100</span>
                  </div>
                </div>

                <div className="result-score-card">
                  <div className="label">소프트 스킬</div>
                  <div className="value">
                    {scores?.soft ?? "-"} <span>/ 100</span>
                  </div>
                </div>
              </section>

              {/* 지표 */}
              <section className="result-metric-card">
                <div className="metric-item">
                  평균 난이도 <strong>{metrics?.levelAvg ?? "-"}</strong> / 5
                </div>
                <div className="metric-item">
                  오답률 <strong>{metrics?.wrongAnswerRate ?? "-"}</strong> %
                </div>
              </section>

              {/* 요약 */}
              <section className="result-section-card">
                <h2>면접 요약</h2>
                <p>{result.summary}</p>
              </section>

              {/* 강점 / 약점 */}
              <section className="result-section-row">
                <div className="result-section-card">
                  <h2>강점</h2>
                  <ul>
                    {result.strengths?.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-section-card">
                  <h2>약점</h2>
                  <ul>
                    {result.weaknesses?.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 종합 피드백 */}
              <section className="result-section-card">
                <h2>종합 피드백</h2>
                <ul>
                  {result.feedback?.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </section>

              {/* PDF 영역 */}
              <section className="result-pdf-card">
                {!hasPdf && (
                  <button
                    type="button"
                    className={`pdf-download-btn ${creatingPdf ? "loading" : ""}`}
                    onClick={handlePdfCreate}
                    disabled={creatingPdf}
                  >
                    {creatingPdf ? "PDF 생성 중..." : "PDF 생성"}
                  </button>
                )}

                {hasPdf && (
                  <button
                    type="button"
                    className="pdf-download-btn"
                    onClick={handlePdfDownload}
                  >
                    PDF 다운로드
                  </button>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
