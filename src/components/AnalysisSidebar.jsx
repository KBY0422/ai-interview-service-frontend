import "../styles/AnalysisList.css";
import { Link } from "react-router-dom";

export default function AnalysisSidebar({ sessions = [], activeSIdx }) {
  return (
    <aside className="analysis-sidebar-desktop">
      <div className="analysis-sidebar-box">
        <div className="analysis-sidebar-title">세션 목록</div>

        <div className="analysis-sidebar-list">
          {sessions.map((s) => (
            <Link
              key={s.sIdx}
              to={`/analysis/result/${s.sidx}`}
              className={`analysis-sidebar-item ${
                String(s.sidx) === String(activeSIdx) ? "active" : ""
              }`}
            >
              <div className="sidebar-item-title">
                {s.title}
              </div>

              <div className="sidebar-item-meta">
                {s.date} · {s.job}
              </div>

              <span
                className={`analysis-sidebar-pdf ${
                  s.hasPdf === 1 ? "pdf-exists" : "pdf-none"
                }`}
              >
                {s.hasPdf === 1 ? "PDF" : "PDF 없음"}
              </span>
            </Link>
          ))}

          {sessions.length === 0 && (
            <div className="analysis-sidebar-empty">
              다른 분석 세션이 없습니다.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
