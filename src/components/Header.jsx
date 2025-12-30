// src/components/Header.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";
import useAuthStore from "../store/AuthStore";
import { logout } from "../api/Auth";

export default function Header({ darkMode, setDarkMode }) {
    const [openMenu, setOpenMenu] = useState(null);
    const { zu_isLoggedIn, zu_isAdmin } = useAuthStore();

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = async () => {
        try {
            await logout();
            alert("로그아웃 됐습니다.");
        } catch (e) {
            console.error("로그아웃 실패", e);
        } finally {
            // 로그아웃 시
            localStorage.removeItem("tokens"); // access + refresh 모두 제거
            localStorage.setItem("theme", "light");
            useAuthStore.getState().zu_logout(); // zustand 초기화
            // 🔥 SPA 메모리까지 완전 초기화
            window.location.href = "/";
        }
    };

    const closeMenu = () => {
        setOpenMenu(null);
    };

    const isInterviewGroupActive = isActive("/interview") || isActive("/interviewsetting") || isActive("/analysis");

    const isBoardGroupActive = isActive("/guestbook") || isActive("/notice") || isActive("/inquery");

    return (
        <header className="header">
            <div className="header-inner">
                {/* 좌측: 로고 */}
                <div className="header-left">
                    <Link to="/" className="header-logo">
                        AI Interview
                    </Link>
                </div>

                {/* 중앙: 메뉴 */}
                <nav className="header-nav">
                    {/* ✅ 일반 사용자 로그인 상태에서만 */}
                    {zu_isLoggedIn && !zu_isAdmin && (
                        <>
                            {/* 대시보드 */}
                            <Link to="/user/dashboard" className="header-link">
                                대시보드
                            </Link>

                            {/* AI 면접 · 분석 */}
                            <div className="header-menu">
                                <button
                                    className={`header-menu-btn ${openMenu === "interview" || isInterviewGroupActive ? "active" : ""}`}
                                    onClick={() => toggleMenu("interview")}
                                >
                                    AI 면접 · 분석
                                </button>
                                <div className={`header-submenu ${openMenu === "interview" ? "open" : ""}`}>
                                    <Link to="/interviewsetting" onClick={closeMenu} className={isActive("/interviewsetting") ? "active" : ""}>
                                        모의면접
                                    </Link>
                                    <Link to="/analysis/list" onClick={closeMenu} className={isActive("/analysis") ? "active" : ""}>
                                        분석목록
                                    </Link>
                                    <Link to="/resume/upload" onClick={closeMenu} className={isActive("/resume") ? "active" : ""}>
                                        이력서 분석
                                    </Link>
                                </div>
                            </div>

                            {/* 기사 검색 */}
                            <div className="header-menu">
                                {/* AI 검색 */}
                                <Link to="/news" className={`header-link ${isActive("/news") ? "active" : ""}`}>
                                    기사 검색
                                </Link>
                            </div>
                        </>
                    )}

                    {/* 📌 게시판 (항상 표시) */}
                    <div className="header-menu">
                        <button className={`header-menu-btn ${openMenu === "board" || isBoardGroupActive ? "active" : ""}`} onClick={() => toggleMenu("board")}>
                            게시판
                        </button>
                        <div className={`header-submenu ${openMenu === "board" ? "open" : ""}`}>
                            {/* 🔓 비로그인 허용 */}
                            <Link to="/guestbook" onClick={closeMenu} className={isActive("/guestbook") ? "active" : ""}>
                                <span>방명록</span>
                            </Link>

                            {/* 🔐 로그인 사용자만 */}
                            {zu_isLoggedIn && !zu_isAdmin && (
                                <>
                                    <Link to="/inquery" onClick={closeMenu} className={isActive("/inquery") ? "active" : ""}>
                                        <span>문의사항</span>
                                    </Link>
                                    <Link to="/notice" onClick={closeMenu} className={isActive("/notice") ? "active" : ""}>
                                        <span>공지사항</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* 우측: 사용자 영역 */}
                <div className="header-right">
                    {/* 🌙 다크모드 스위치 - 로그인 사용자만 */}
                        {zu_isLoggedIn && !zu_isAdmin && (
                        <button
                            className={`theme-switch ${darkMode ? "on" : ""}`}
                            onClick={() => setDarkMode((prev) => !prev)}
                            aria-label="다크모드 전환"
                        >
                            <span className="switch-thumb" />
                        </button>
                        )}

                    {/* 로그인 상태별 버튼 */}
                    {!zu_isLoggedIn && (
                        <>
                            <Link to="/login">
                                <button className="header-btn outline">로그인</button>
                            </Link>
                            <Link to="/register">
                                <button className="header-btn">회원가입</button>
                            </Link>
                        </>
                    )}

                    {zu_isLoggedIn && !zu_isAdmin && (
                        <>
                            <Link to="/mypage">
                                <button className="header-btn">마이페이지</button>
                            </Link>
                            <button className="header-btn" onClick={handleLogout}>
                                로그아웃
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
