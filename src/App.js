import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import MainPage from "./pages/MainPage";
import AnalysisList from "./pages/analysis/AnalysisList";
import InterviewResult from "./pages/analysis/InterviewResult";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLayout from "./components/admin/AdminLayout";
import { useEffect, useState } from "react";
import ResumeUploadPage from "./pages/resume/ResumeUploadPage";
import ResumeResultPage from "./pages/resume/ResumeResultPage";
import NewsPage from "./pages/news/NewsPage";
import AdminKeywordManagePage from "./pages/news/AdminKeywordManagePage";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/login/RegisterPage";
import FindIdPage from "./pages/login/FindIdPage";
import ResetPasswordPage from "./pages/login/ResetPasswordPage";
import MyPage from "./pages/login/MyPage";
import NewPasswordPage from "./pages/login/NewPasswordPage";
import InterviewSetting from "./pages/OpenAiGpt/InterviewSetting";
import AdminInterviewSetting from "./pages/OpenAiGpt/AdminInterviewSetting";
import Interview from "./pages/OpenAiGpt/Interview";
import AdminDashboardPage from "./pages/dashboard/AdminDashboardPage";
import AdminInterviewStatPage from "./pages/dashboard/AdminInterviewStatPage";
import AdminTokenStatPage from "./pages/dashboard/AdminTokenStatPage";
import AdminUserStatPage from "./pages/dashboard/AdminUserStatPage";
import UserDashboardPage from "./pages/dashboard/UserDashboardPage";
import NoticePage from "./pages/notice/NoticePage";
import NoticeDetailPage from "./pages/notice/NoticeDetailPage";
import InquiryPage from "./pages/inquery/InquiryPage";
import InquiryWritePage from "./pages/inquery/InquiryWritePage";
import InqueryDetailPage from "./pages/inquery/InqueryDetailPage";
import InqueryUpdatePage from "./pages/inquery/InqueryUpdatePage";
import GuestbookPage from "./pages/guestbook/GuestbookPage";
import GuestbookWritePage from "./pages/guestbook/GuestbookWritePage";
import GuestbookDetailPage from "./pages/guestbook/GuestbookDetailPage";
import NoticeWritePage from "./pages/notice/NoticeWritePage";
import NoticeUpdatePage from "./pages/notice/NoticeUpdatePage";
import NoticeDeletePage from "./pages/notice/NoticeDeletePage";
import NoticeDeletedDetailPage from "./pages/notice/NoticeDeletedDetailPage";
import InqueryResponsePage from "./pages/inquery/InqueryResponsePage";
import AdminNoticeManagePage from "./pages/notice/AdminNoticeManagePage";
import AdminInquiryManagePage from "./pages/inquery/AdminInquiryManagePage";
import AdminGuestbookManagePage from "./pages/guestbook/AdminGuestbookManagePage";
import AdminMembersPage from "./pages/usercontrol/AdminMembersPage";
import useAuthStore from "./store/AuthStore";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { me } from "./api/Auth";
import { ChatBot } from "./components/ChatBot";
import TermsOfService from "./pages/TermsOfService";

export default function App() {

    // 다크모드
    const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

    useEffect(() => {
        if (darkMode) {
            document.body.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <BrowserRouter>
            <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
        </BrowserRouter>
    );
}

function AppContent({ darkMode, setDarkMode }) {
    const { zu_isAdmin, zu_isLoggedIn, zu_login, zu_logout, authChecked } = useAuthStore();

    useEffect(() => {
        const restoreAuth = async () => {
            const tokens = localStorage.getItem("tokens");
            console.log(tokens);

           
            if (!tokens) {
                zu_logout(); // authChecked를 true로 만들어줌
                return;
            }

            try {
                const res = await me();
                console.log(res);

                if (res.data.success) {
                    const user = res.data.data;
                    const isAdmin = res.data.data.m_admin === "1";
                    zu_login(user, isAdmin)
                } else {
                    zu_logout();
                }
            } catch (e) {
                zu_logout();
            }
        };

        restoreAuth();
    }, [zu_login, zu_logout]);

    // 이 줄이 PR에서 가장 중요
    if (!authChecked) {
        return <div className="auth-loading">로딩 중...</div>;
    }

    return (
        <>
            {/* 일반 사용자 로그인 상태일 때만 Header 표시 */}
            {!zu_isAdmin && <Header darkMode={darkMode} setDarkMode={setDarkMode} />}

            <Routes>
                {/* User용 */}

                <Route path="/" element={<MainPage />} />
                <Route path="/analysis/list" element={<ProtectedRoute><AnalysisList /></ProtectedRoute>} />
                <Route path="/analysis/result/:sIdx" element={<ProtectedRoute><InterviewResult /></ProtectedRoute>} />
                <Route path="/privacy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
                <Route path="/terms" element={<ProtectedRoute><TermsOfService /></ProtectedRoute>} />
                <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
                <Route path="/resume/upload" element={<ProtectedRoute><ResumeUploadPage /></ProtectedRoute>} />
                <Route path="/resume/result" element={<ProtectedRoute><ResumeResultPage /></ProtectedRoute>} />
                <Route path="/interviewsetting" element={ <ProtectedRoute><InterviewSetting /></ProtectedRoute>} />
                <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
                <Route path="/user/dashboard" element={  <ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />

                <Route path="/notice" element={<ProtectedRoute><NoticePage /></ProtectedRoute>} />
                <Route path="/notice/:n_idx" element={<ProtectedRoute><NoticeDetailPage /></ProtectedRoute>} />
                <Route path="/inquery" element={<ProtectedRoute><InquiryPage /></ProtectedRoute>} />
                <Route path="/inquery/write" element={<ProtectedRoute><InquiryWritePage /></ProtectedRoute>} />
                <Route path="/inquery/:i_idx" element={<ProtectedRoute><InqueryDetailPage /></ProtectedRoute>} />
                <Route path="/inquery/update/:i_idx" element={<ProtectedRoute><InqueryUpdatePage /></ProtectedRoute>} />
                <Route path="/inquery/delete/:i_idx" element={<ProtectedRoute><InqueryDetailPage /></ProtectedRoute>} />
                <Route path="/guestbook" element={<GuestbookPage/>} />
                <Route path="/guestbook/write" element={<GuestbookWritePage />} />
                <Route path="/guestbook/:g_idx" element={<GuestbookDetailPage />} />

                {/* Auth */}
                {/* Login Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/find-id" element={<FindIdPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/newPassword" element={<NewPasswordPage />} />

                {/* Admin용  */}
                
                <Route path="/admin" element={  <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                <Route path="stats/keyword" element={<AdminKeywordManagePage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="stats/interviews" element={<AdminInterviewStatPage />} />
                <Route path="stats/tokens" element={<AdminTokenStatPage />} />
                <Route path="stats/users" element={<AdminUserStatPage />} />
                <Route path="usercontrol" element={<AdminMembersPage />} />
                <Route path="AdminInterviewSetting" element={<AdminInterviewSetting />} />

                <Route path="notice" element={<AdminNoticeManagePage />} />
                <Route path="inquiry" element={<AdminInquiryManagePage />} />
                <Route path="guestbook" element={<AdminGuestbookManagePage />} />
                <Route path="notice/write" element={<NoticeWritePage />} />
                <Route path="notice/update/:n_idx" element={<NoticeUpdatePage />} />
                <Route path="notice/delete/:n_idx" element={<NoticeDeletePage />} />
                <Route path="notice/deleted/:n_idx" element={<NoticeDeletedDetailPage />} />
                <Route path="inquery/response/:i_idx" element={<InqueryResponsePage />} />
                </Route>
            </Routes>

            {/* ✅ 로그인 사용자만 + 관리자 제외 */}
            {zu_isLoggedIn && !zu_isAdmin && <ChatBot />}

            {/* Footer도 동일 */}
            {!zu_isAdmin && <Footer />}
        </>
    );
}
