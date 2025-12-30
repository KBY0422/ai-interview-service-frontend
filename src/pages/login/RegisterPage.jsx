import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { idCheck, register, sendCode, verification } from "../../api/Auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import "../../styles/RegisterPage.css"
export default function RegisterPage() {
  // 전체 동의용 변수
  const [allChecked, setAllChecked] = useState(false);
  // 서비스 이용약관 동의용 변수
  const [service,setService] = useState(false);
  // 개인정보 처리방침 동의용 변수
  const [privacy, setPrivacy] = useState(false);
  // 마케팅 정보 수신 동의용 변수
  const [marketing,setMarketing] = useState(false); 
  
  // 전체 동의용 핸들러
  const handleAllChecked = () => {
    const temp = !allChecked;
    setAllChecked(temp);
    setService(temp);
    setPrivacy(temp);
    setMarketing(temp);
  }

  // 서비스 이용약관 동의 핸들러
  const handleServiceChecked = () => {
    setService(!service)
  }

  // 개인정보 처리방침 동의 핸들러
  const handlePrivacyChecked = () => {
    setPrivacy(!privacy)
  }

  // 마케팅 정보 수신 동의 핸들러
  const handleMarketingChekced = () => {
    setMarketing(!marketing)
  }

  // form에 들어갈 변수들 선언
  const [form, setForm] = useState({
    m_name : '',
    m_id : '',
    m_pwd : '',
    m_addr1 : '',
    m_addr2 : '',
    m_email : ''
  });

  // id중복확인 검증용 변수
  const [isIdChecked, setIsIdChecked] = useState(null);
  // 비밀번호 확인 변수
  const [m_pwd_check, setM_pwd_check] = useState("");

  // 회원가입 후 로그인 페이지로 이동하기 위해 사용
  const navigate = useNavigate();


  // id 인증하고 form.m_id 변경하는 것 방지
  useEffect(() => {
  setIsIdChecked(null);
  }, [form.m_id]);

  // email 인증 후 form.m_email 변경하는 것 방지
  useEffect(() => {
  setIsVerified(null);
  setVerifyCode("");
  }, [form.m_email]);

  // 이메일 인증번호 변수
  const [verifyCode, setVerifyCode] = useState("");
  // 이메일 인증 완료용 변수
  const [isVerified, setIsVerified] = useState(false);
  // 비밀번호(form.m_pwd)와 비밀번호 확인(m_pwd_check)이 일치하는지 확인하는 변수
  const isMatch = form.m_pwd === m_pwd_check;

  // form 하위 변수들의 입력값이 변할 때 마다 감지하는 핸들러 
  const handleChange = (e) => {
    setForm({...form, [e.target.name] : e.target.value});
  }

  // m_id 중복확인용 핸들러
  const handleIdCheck = async() => {
    try{
        const response = await idCheck(form.m_id);
        if(response.data.success){
          alert("사용 가능한 아이디 입니다.");
          setIsIdChecked(true);
        }else {
          alert("사용 불가능한 아이디 입니다.")
          setIsIdChecked(false);
        }
    }catch (error){
      alert("서버 오류 발생");
    }
  }

  // m_addr1 입력용 핸들러
  const handleAddrFind = () => {
    new window.daum.Postcode({
      oncomplete : function(data) {
        setForm(prev => ({
          ...prev,
          m_addr1: data.address
        }));
      }
    }).open();
  };

  // 이메일 인증번호 발송 핸들러
  const handleSendCode = async() => {
    try {
      const response = await sendCode(form.m_email);
      if(response.data.success){
        alert("인증번호가 이메일로 발송되었습니다. 5분 이내에 인증해주세요.")
      }else {
        if(response.data.message){
          alert(response.data.message);
        }
      }
    } catch (error) {
      alert("서버 오류 발생");
    }
  }

  // 이메일 인증번호 검증 핸들러
  const handleVerification = async() => {
    try {
      const response = await verification(form.m_email, verifyCode);
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
    } catch (error) {
      alert("서버 오류 발생");
    }
     
  }

  // 회원가입 핸들러 / 입력되지 않은 값 있을 경우 경고창 발생. 기본적으로는 필수사항 입력되지 않으면 버튼 자체가 활성화 되지 않음
  const handleRegister = async() =>{
    if (!service){
      alert("서비스 이용약관에 동의해주세요");
      return;
    }
    
    if(!privacy){
      alert("개인정보 처리방침에 동의해주세요");
      return;
    }

    if (!isIdChecked) {
    alert("아이디 중복 체크를 해주세요");
    return;
  }

  if (!isMatch) {
    alert("비밀번호가 일치하지 않습니다");
    return;
  }

  if (!isVerified) {
    alert("이메일 인증을 완료해주세요");
    return;
  }
    try{
      const response = await register(form);
      if(response.data.success){
        alert("회원가입성공");
        navigate("/login");
      }
    }  catch (error){
      alert("서버 오류 발생");
    } 
  }


  return (
    <div className="register-wrapper">
      <main className="register-main">
        <Card className="register-card">
          <CardHeader>
            <CardTitle className="register-title">회원가입</CardTitle>
            <CardDescription className="register-description">
              AI-InterView의 회원이 되어 다양한 서비스를 이용하세요
            </CardDescription>
          </CardHeader>

          <CardContent className="register-content">
            {/* 약관 영역 register-terms-box*/}
            <div className="register-terms-box">
              <h3 className="register-terms-title">약관 동의</h3>

              <div className="register-terms-list">
                <div className="register-checkbox-line">
                  <Checkbox id="terms-all" checked={allChecked} onCheckedChange={handleAllChecked}/>
                  <Label htmlFor="terms-all" className="register-checkbox-label">
                    전체 동의
                  </Label>
                </div>

                <div className="register-terms-depth">

                  <div className="register-checkbox-line">
                    <Checkbox id="terms-service" checked={service} onCheckedChange={handleServiceChecked}/>
                    <Label htmlFor="terms-service" className="register-checkbox-sub">
                      (필수) 서비스 이용약관
                    </Label>
                  </div>

                  <div className="register-checkbox-line">
                    <Checkbox id="terms-privacy" checked={privacy} onCheckedChange={handlePrivacyChecked}/>
                    <Label htmlFor="terms-privacy" className="register-checkbox-sub">
                      (필수) 개인정보 처리방침
                    </Label>
                  </div>

                  <div className="register-checkbox-line">
                    <Checkbox id="terms-marketing" checked={marketing} onCheckedChange={handleMarketingChekced}/>
                    <Label htmlFor="terms-marketing" className="register-checkbox-sub">
                      (선택) 마케팅 정보 수신
                    </Label>
                  </div>

                </div>
              </div>
            </div>

            {/* 입력 폼 register-form-section*/}
            <div className="register-form-section">
              <div className="register-input-box">
                <Label htmlFor="m_name">이름</Label>
                <Input id="m_name" name="m_name" placeholder="이름을 입력하세요" value={form.m_name} onChange={handleChange}/>
              </div>

              <div className="register-input-box">
                <Label htmlFor="m_id">아이디</Label>
                <div className="register-horizontal">
                  <Input id="m_id" name="m_id" placeholder="아이디를 입력하세요" className="flex-1" value={form.m_id} onChange={handleChange}/>
                  <Button variant="outline" className="register-outline-btn" onClick={handleIdCheck} disabled={!form.m_id}>중복확인</Button>
                </div>
                  {isIdChecked !== null &&
                (<p style={{ color: isIdChecked ? "green" : "red" }}>{isIdChecked ? "사용가능한 아이디입니다." : "다른 아이디를 입력해 주십시오."}</p>)}
              </div>

              <div className="register-input-box">
                <Label htmlFor="m_pwd" >비밀번호</Label>
                <Input
                  id="m_pwd"
                  name = "m_pwd"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={form.m_pwd} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="register-input-box">
                <Label htmlFor="m_pwd_check">비밀번호 확인</Label>
                <Input id="m_pwd_check" type="password" placeholder="비밀번호를 다시 입력하세요" value={m_pwd_check} onChange={ (e) =>setM_pwd_check(e.target.value)}/>
                {m_pwd_check.length > 0 && 
                (<p style={{ color: isMatch ? "green" : "red" }}>{isMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}</p>)}
              </div>
              
              <div className="register-input-box">
                <Label htmlFor="m_addr1" >주소</Label>
                <div className="register-horizontal">
                <Input id="m_addr1" name="m_addr1" value={form.m_addr1} readOnly/>
                <Button variant="outline" className="register-outline-btn" onClick={handleAddrFind}>주소 찾기</Button>
                </div>
              </div>
              
              <div className="register-input-box">
                <Label htmlFor="m_addr2" >상세주소</Label>
                <Input 
                id="m_addr2"
                name="m_addr2"
                value={form.m_addr2}
                onChange={handleChange}
                />
              </div>

              <div className="register-input-box">
                <Label htmlFor="m_email">이메일</Label>
                <div className="register-horizontal">
                  <Input id="m_email" name="m_email" type="email" placeholder="이메일을 입력하세요" className="flex-1" value={form.m_email} onChange={handleChange}/>
                  <Button variant="outline" className="register-outline-btn" disabled={!form.m_email} onClick={handleSendCode}>인증요청</Button>
                </div>
              </div>

              <div className="register-input-box">
                <Label htmlFor="verification-code">인증번호</Label>
                <div className="register-horizontal">
                  <Input id="verification-code" placeholder="인증번호를 입력하세요" className="flex-1" value={verifyCode} onChange={(e)=>setVerifyCode(e.target.value)}/>
                  <Button variant="outline" className="register-outline-btn" onClick={handleVerification}>인증확인</Button>
                </div>
                {isVerified !== null && 
                (<p style={{ color: isVerified ? "green" : "red" }}>{isVerified ? "인증이 완료되었습니다." : "다시 인증해주십시오."}</p>)}
              </div>
            </div>

            <Button className="register-submit-btn" 
                disabled={!service || !privacy || !form.m_name || !form.m_id || !isIdChecked || !form.m_pwd || !isMatch || !form.m_email || !isVerified}
                onClick={handleRegister}>
              회원가입 신청
            </Button>
          </CardContent>
        </Card>
      </main>

    </div>
  )
}