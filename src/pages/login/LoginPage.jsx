import { useState } from "react";
import useAuthStore from "../../store/AuthStore";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/Auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import "../../styles/LoginPage.css"



export default function LoginPage() {
  const [m_id, setM_id] = useState("");
  const [m_pwd, setM_pwd] = useState("");

  const zu_login = useAuthStore((state) => state.zu_login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // 🔥 Enter 기본 submit 방지

    try {
      const response = await login(m_id, m_pwd);

      if (response.data.success) {
        const { accessToken, refreshToken, memberVO } = response.data.data;

        alert(`${memberVO.m_name}님 환영합니다.`);

        localStorage.setItem(
          "tokens",
          JSON.stringify({ accessToken, refreshToken })
        );

        const isAdmin = memberVO.m_admin === "1";
        zu_login(memberVO, isAdmin);

        navigate(isAdmin ? "/admin/dashboard" : "/");
      } else {
        alert("등록된 회원정보가 없습니다.");
      }
    } catch (error) {
      alert("서버 에러 발생");
    }
  };

  return (
    <div className="login-wrapper">
      <main className="login-main">
        <Card className="login-card">
          <CardHeader className="login-card-header">
            <CardTitle className="login-title">로그인</CardTitle>
            <CardDescription className="login-subtitle">
              AI-InterView에 오신 것을 환영합니다
            </CardDescription>
          </CardHeader>

          {/* 🔥 여기 핵심 */}
          <CardContent>
            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-field">
                <label htmlFor="username">아이디</label>
                <Input
                  id="username"
                  placeholder="아이디를 입력하세요"
                  value={m_id}
                  onChange={(e) => setM_id(e.target.value)}
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">비밀번호</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={m_pwd}
                  onChange={(e) => setM_pwd(e.target.value)}
                />
              </div>

              <Button
                className="login-button"
                type="submit"          // 🔥 중요
                disabled={!m_id || !m_pwd}
              >
                로그인
              </Button>

              <div className="login-links">
                <Link to="/find-id">아이디 찾기</Link>
                <span>|</span>
                <Link to="/reset-password">비밀번호 재설정</Link>
                <span>|</span>
                <Link to="/register">회원가입</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
