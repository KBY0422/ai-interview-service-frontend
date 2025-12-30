// src/pages/PrivacyPolicy.jsx
import "../styles/PrivacyPolicy.css";

export default function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <div className="privacy-container">
        <h1 className="privacy-title">개인정보처리방침</h1>

        <p className="privacy-desc">
          ICT AI Mock Interview 프로젝트(이하 “본 프로젝트”)는 개인정보 보호법 등
          관련 법령을 준수하며, 이용자의 개인정보를 보호하기 위해 다음과 같은
          개인정보처리방침을 수립·공개합니다.
        </p>

        <section className="privacy-section">
          <h2>1. 개인정보의 수집 항목 및 수집 방법</h2>
          <h3>① 수집 항목</h3>
          <ul>
            <li>필수 항목: 아이디, 비밀번호(암호화 저장), 이메일</li>
            <li>선택 항목: 이름</li>
            <li>
              서비스 이용 과정에서 자동 수집될 수 있는 항목
              <ul>
                <li>접속 로그, 접속 IP, 서비스 이용 기록</li>
              </ul>
            </li>
          </ul>

          <h3>② 수집 방법</h3>
          <ul>
            <li>회원가입 및 서비스 이용 과정에서 이용자가 직접 입력</li>
            <li>서비스 이용 과정에서 자동 생성되는 정보 수집</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>2. 개인정보의 이용 목적</h2>
          <ul>
            <li>회원 식별 및 본인 확인</li>
            <li>AI 모의면접 서비스 제공 및 결과 조회</li>
            <li>서비스 이용 기록 관리 및 품질 개선</li>
            <li>문의사항 처리 및 공지사항 전달</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            본 프로젝트는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를
            지체 없이 파기합니다. 단, 관계 법령에 따라 보관이 필요한 경우에는
            해당 법령에서 정한 기간 동안 보관할 수 있습니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>4. 개인정보의 제3자 제공</h2>
          <p>
            본 프로젝트는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
            다만, 이용자가 사전에 동의한 경우 또는 법령에 의해 요구되는 경우에는
            예외로 합니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>5. 개인정보의 파기 절차 및 방법</h2>
          <ul>
            <li>전자적 파일 형태: 복구 불가능한 방법으로 영구 삭제</li>
            <li>종이 문서 형태: 분쇄 또는 소각</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>6. 개인정보 보호를 위한 조치</h2>
          <ul>
            <li>비밀번호 암호화 저장</li>
            <li>접근 권한 최소화</li>
            <li>내부 관리 계획 수립 및 관리</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>7. 개인정보 보호책임자</h2>
          <p>책임자: 홍길동</p>
          <p>이메일: contact@ict-mockinterview.dev</p>
        </section>

        <section className="privacy-section">
          <h2>8. 개인정보처리방침의 변경</h2>
          <p>
            본 개인정보처리방침은 관련 법령 또는 서비스 변경에 따라 수정될 수 있으며,
            변경 시 공지사항을 통해 안내합니다.
          </p>
          <p className="privacy-date">
            공고일자: 2025년 1월 1일<br />
            시행일자: 2025년 1월 1일
          </p>
        </section>
      </div>
    </main>
  );
}
