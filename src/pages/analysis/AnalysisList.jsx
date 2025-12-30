import "../../styles/AnalysisList.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAnalysisList } from "../../api/api";

export default function AnalysisList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await getAnalysisList();
        if (res?.data?.success && Array.isArray(res.data.data)) {
          setList(res.data.data);
        } else {
          setList([]);
        }
      } catch (e) {
        console.error(e);
        setError("분석 목록을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  if (loading) return <div className="analysis-state">불러오는 중...</div>;
  if (error) return <div className="analysis-error">{error}</div>;
  if (list.length === 0) return <div className="analysis-empty">분석 결과가 없습니다.</div>;

  return (
    <div className="analysis-page">
      <div className="analysis-layout">
        <main className="analysis-content">
          <h1 className="analysis-title">면접 분석 목록</h1>

          <div className="analysis-grid">
            {list.map((item) => (
              <Link
                key={item.sidx}
                to={`/analysis/result/${item.sidx}`}
                className="analysis-card"
              >
                <div className="analysis-card-header">
                  <div className="analysis-card-date">{item.date}</div>

                  <span
                    className={`analysis-card-badge ${
                      item.hasPdf === 1 ? "pdf-exists" : "pdf-none"
                    }`}
                  >
                    {item.hasPdf === 1 ? "PDF" : "PDF 없음"}
                  </span>
                </div>

                <div className="analysis-card-title">{item.title}</div>

                <div className="analysis-card-score">
                  총점 : {item.totalScore ?? "-"} / 100
                </div>

                <div className="analysis-card-footer">
                  {item.job} · {item.type}
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
