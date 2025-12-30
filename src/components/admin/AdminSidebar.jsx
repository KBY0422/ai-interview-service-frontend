// src/components/admin/AdminSidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/AdminSidebar.css";
import useAuthStore from "../../store/AuthStore";
import { logout } from "../../api/Auth";

export default function AdminSidebar() {
    const [openMenu, setOpenMenu] = useState(null);
    const location = useLocation();

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = async () => {
        try {
            await logout(); // 서버 세션/쿠키 정리
            alert("로그아웃 됐습니다.");
        } catch (e) {
            console.error("관리자 로그아웃 실패", e);
        } finally {
            // Zustand 상태 초기화

            // 로그아웃 시
            localStorage.removeItem("tokens"); // ⭐ 반드시
            useAuthStore.getState().zu_logout();
            window.location.href = "/login"; // 로그인 페이지로
        }
    };

    return (
        <aside className="admin-sidebar">
            <h2 className="admin-logo">ADMIN</h2>

            <nav className="admin-nav">
                {/* 대시보드 */}
                <Link to="/admin/dashboard" className={`admin-link ${isActive("/admin") ? "active" : ""}`}>
                    대시보드
                </Link>

                {/* 게시판 관리 */}
                <div className="admin-menu">
                    <button className={openMenu === "board" ? "open" : ""} onClick={() => toggleMenu("board")}>
                        게시판 관리
                    </button>
                    <div className={`admin-submenu ${openMenu === "board" ? "open" : ""}`}>
                        <Link to="/admin/notice">공지사항 관리</Link>
                        <Link to="/admin/inquiry">문의사항 관리</Link>
                        <Link to="/admin/guestbook">방명록 관리</Link>
                    </div>
                </div>

                {/* 통계 */}
                <div className="admin-menu">
                    <button className={openMenu === "stats" ? "open" : ""} onClick={() => toggleMenu("stats")}>
                        통계
                    </button>
                    <div className={`admin-submenu ${openMenu === "stats" ? "open" : ""}`}>
                        <Link to="/admin/stats/users">사용자 통계</Link>
                        <Link to="/admin/stats/tokens">토큰·매출 통계</Link>
                        <Link to="/admin/stats/interviews">면접 통계</Link>
                        <Link to="/admin/stats/keyword">검색 키워드 통계</Link>
                    </div>
                </div>

                {/* 회원 관리 */}
                <div className="admin-menu">
                    <button className={openMenu === "member" ? "open" : ""} onClick={() => toggleMenu("member")}>
                        회원 관리
                    </button>
                    <div className={`admin-submenu ${openMenu === "member" ? "open" : ""}`}>
                        <Link to="/admin/usercontrol">회원 목록</Link>
                    </div>
                </div>

                <div className="admin-menu">
                    <button className={openMenu === "Interview" ? "open" : ""} onClick={() => toggleMenu("Interview")}>
                        면접 관리
                    </button>
                    <div className={`admin-submenu ${openMenu === "Interview" ? "open" : ""}`}>
                        <Link to="/admin/AdminInterviewSetting">면접세션 관리</Link>
                    </div>
                </div>
            </nav>
            <div className="admin-logout">
                <button className="admin-logout-btn" onClick={handleLogout}>
                    로그아웃
                </button>
            </div>
        </aside>
    );
}
