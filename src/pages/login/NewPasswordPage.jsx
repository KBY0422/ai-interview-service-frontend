import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { passwordChange } from "../../api/Auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "@radix-ui/react-label";
export default function NewPasswordPage(params) {
    const navigate = useNavigate();
    const location = useLocation();
    const {m_id, m_email} = location.state || {} ;
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordCheck, setNewPasswordCheck] = useState("");
    const isMatch = newPassword === newPasswordCheck;
    const handleNewPassword = async() => {
        try {
            const response = await passwordChange({m_id, m_email, newPassword});
            if(response.data.success){
                alert("비밀번호가 변경되었습니다.");
                navigate("/login")
            }else {
                alert(response.data.message || "비밀번호 변경 실패");
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류 발생");
        }
    }
    return (
        <div className="resetpw-container">
        
              <main className="resetpw-main">
                <Card className="resetpw-card">
                  <CardHeader>
                    <CardTitle className="resetpw-title">새 비밀번호 설정</CardTitle>
                    <CardDescription className="resetpw-description">
                      새 비밀번호를 설정합니다.
                    </CardDescription>
                  </CardHeader>
        
                  <CardContent className="resetpw-form-area">
                    <div className="resetpw-input-group">
                      <Label htmlFor="newPassword">새 비밀번호</Label>
                      <Input id="newPassword" type="password" placeholder="새 비밀번호를 입력하세요" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)}/>
                    </div>
        
                    <div className="resetpw-input-group">
                      <Label htmlFor="newPasswordCheck">새 비밀번호 확인</Label>
                      <Input id="newPasswordCheck" type="password"  placeholder="새 비밀번호를 다시 입력하세요" value={newPasswordCheck} onChange={(e)=>setNewPasswordCheck(e.target.value)}/>
                    {newPasswordCheck.length > 0 &&
                    (<p style={{color: isMatch ? "green" : "red"}}> {isMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."} </p>)}
                    </div>
        
                    <Button className="resetpw-submit-btn" disabled={!isMatch} onClick={handleNewPassword}>
                      비밀번호 변경하기
                    </Button>
                  </CardContent>
                </Card>
              </main>
        
            </div>
    )
}