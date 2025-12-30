import { Navigate } from "react-router-dom";
import useAuthStore from "../store/AuthStore";

export default function AdminProtectedRoute({ children }) {
  const { zu_isLoggedIn, zu_isAdmin } = useAuthStore();

  if (!zu_isLoggedIn) {
    alert("로그인 후 이용해주세요.");
    return <Navigate to="/login" replace />;
  }

  if (!zu_isAdmin) {
    alert("관리자만 접근 가능합니다.");
    return <Navigate to="/" replace />;
  }

  return children;
}
