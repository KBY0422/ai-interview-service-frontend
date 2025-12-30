import { useState } from "react";
import { findId } from "../../api/Auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import "../../styles/FindIdPage.css"
export default function FindIdPage() {
  const [m_name, setM_name] = useState("");
  const [m_email, setM_email] = useState("");

  const handleFindId = async() =>{
    try {
      const response = await findId(m_name, m_email);
      console.log("서버 응답 전체 : ", response);
      console.log("response.data : ", response.data);
      if(response.data.success){
        alert(`회원님의 아이디는 ${response.data.data.m_id} 입니다.`)
      }else if (!response.data.success){
        alert(`${response.data.message}`);
      }
      
    } catch (error) {
      console.error("findId 요청 실패", error);
    }
  }
  return (
    <div className="findid-container">

      <main className="findid-main">
        <Card className="findid-card">
          <CardHeader>
            <CardTitle className="findid-title">아이디 찾기</CardTitle>
            <CardDescription className="findid-description">
              가입 시 등록한 이메일로 아이디를 찾을 수 있습니다
            </CardDescription>
          </CardHeader>

          <CardContent className="findid-form-area">
            <div className="findid-input-wrapper">
              <label htmlFor="m_name">이름</label>
              <Input id="m_name" placeholder="이름을 입력하세요" value={m_name} onChange={(e)=>setM_name(e.target.value)}/>
            </div>

            <div className="findid-input-wrapper">
              <label htmlFor="m_email">이메일</label>
              <Input id="m_email" type="email" placeholder="이메일을 입력하세요" value={m_email} onChange={(e)=>{setM_email(e.target.value)}}/>
            </div>

            <Button className="findid-submit-btn" disabled={!m_name || !m_email}  onClick={handleFindId}>
              아이디 찾기
            </Button>
          </CardContent>
        </Card>
      </main>

    </div>
  )
}