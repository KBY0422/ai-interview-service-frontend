import { Navigate} from "react-router-dom";
import useAuthStore from "../store/AuthStore";

export default function ProtectedRoute({ children }) {
    const { zu_isLoggedIn, zu_isAdmin } = useAuthStore();

            // ❌ 비로그인
            if (!zu_isLoggedIn) {
                alert("로그인 후 이용해주세요.");
                return <Navigate to="/login" replace />;
            }

            // 👑 관리자가 user 페이지 접근 시 → 관리자 대시보드로
            if (zu_isAdmin) {
                return <Navigate to="/admin/dashboard" replace />;
            }

            // 👤 일반 사용자만 통과
            return children;
}
