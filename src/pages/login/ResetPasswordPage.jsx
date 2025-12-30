import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetCode, verifyPasswordResetCode } from "../../api/Auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import "../../styles/ResetPasswordPage.css"

export default function ResetPasswordPage() {
  const [m_id, setM_id] = useState("");
  const [m_email, setM_email] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(null);
  const navigate = useNavigate();

  const handleSendPasswordResetCode = async() => {
    try{
    const response = await sendPasswordResetCode(m_id, m_email);
    if(response.data.success) {
      alert("인증번호가 이메일로 전송되었습니다. 5분 이내에 인증해주세요.");
    }else {
      alert("일치하는 회원정보가 없습니다.")
    }
  } catch(error) {
    console.log(error);
    alert("서버 오류 발생");
  }
  } 

  const handleVerifyPasswordResetCode = async() => {
    try{
      const response = await verifyPasswordResetCode(m_email, code);
      if(response.data.success){
        alert("이메일 인증이 완료되었습니다.");
        setIsVerified(true);
      }else if(response.data.fail){
        alert("인증번호가 일치하지 않습니다.");
        setIsVerified(false);
      }else if(response.data.expired){
        alert("인증번호가 만료되었습니다.");
        setIsVerified(false);
      }
    } catch(error) {
      alert("서버 오류 발생");
    }
  }

 const handleGoToNewPassword = () => {
  // 인증된 상태인지 한번 더 확인
  if(isVerified) {
    navigate("/newPassword", {state: {m_id, m_email}});
  }
 }

  return (
    <div className="resetpw-container">

      <main className="resetpw-main">
        <Card className="resetpw-card">
          <CardHeader>
            <CardTitle className="resetpw-title">비밀번호 재설정</CardTitle>
            <CardDescription className="resetpw-description">
              가입 시 등록한 이메일로 비밀번호 재설정 인증 후 비밀번호를 재설정합니다.
            </CardDescription>
          </CardHeader>

          <CardContent className="resetpw-form-area">
            <div className="resetpw-input-group">
              <Label htmlFor="username">아이디</Label>
              <Input id="username" placeholder="아이디를 입력하세요" value={m_id} onChange={(e)=>setM_id(e.target.value)}/>
            </div>

            <div className="resetpw-input-group">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" placeholder="이메일을 입력하세요" value={m_email} onChange={(e)=>setM_email(e.target.value)}/>
            </div>

            <Button className="resetpw-submit-btn" disabled={!m_id || !m_email} onClick={handleSendPasswordResetCode}>
              재설정 인증번호 전송
            </Button>
            <div className="resetpw-input-group">
              <Label htmlFor="passwordResetCode">인증번호</Label>
              <Input id="passwordResetCode" value={code} placeholder="인증번호를 입력하세요" onChange={(e)=>setCode(e.target.value)}/>
            </div>
            <Button className="resetpw-submit-btn" disabled={!code} onClick={handleVerifyPasswordResetCode}>
              인증하기
            </Button>
            <Button className="resetpw-submit-btn" disabled={!isVerified} onClick={handleGoToNewPassword}>
              비밀번호 재설정 페이지로 이동하기
            </Button>
          </CardContent>
        </Card>
      </main>

    </div>
  )
}
