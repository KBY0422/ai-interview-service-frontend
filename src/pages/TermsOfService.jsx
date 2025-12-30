// src/pages/TermsOfService.jsx
import "../styles/PrivacyPolicy.css";

export default function TermsOfService() {
  return (
    <main className="privacy-page">
      <div className="privacy-container">
        <h1 className="privacy-title">이용약관</h1>

        <p className="privacy-desc">
          ICT AI Mock Interview 프로젝트(이하 “본 프로젝트”)는 이용자와 본 프로젝트
          간의 권리·의무 및 책임사항을 규정함을 목적으로 다음과 같은 이용약관을
          제정합니다.
        </p>

        <section className="privacy-section">
          <h2>제1조 (목적)</h2>
          <p>
            본 약관은 본 프로젝트가 제공하는 AI 모의면접 및 부가 서비스의 이용과
            관련하여 이용자와 본 프로젝트 간의 권리, 의무 및 책임사항을 규정함을
            목적으로 합니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>제2조 (용어의 정의)</h2>
          <ul>
            <li>
              <strong>이용자</strong>란 회원 및 비회원을 포함하여 본 프로젝트의
              서비스를 이용하는 모든 자를 말합니다.
            </li>
            <li>
              <strong>회원</strong>이란 회원가입을 통해 계정을 생성하고 서비스를
              이용하는 자를 말합니다.
            </li>
            <li>
              <strong>비회원</strong>이란 회원가입 없이 일부 서비스를 이용하는 자를
              말합니다.
            </li>
            <li>
              <strong>콘텐츠</strong>란 이용자가 서비스 내에 게시하거나 생성한
              텍스트, 데이터, 게시물 등을 의미합니다.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>제3조 (약관의 효력 및 변경)</h2>
          <ul>
            <li>본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다.</li>
            <li>
              본 프로젝트는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수
              있으며, 변경 시 공지사항을 통해 안내합니다.
            </li>
            <li>
              변경된 약관에 동의하지 않을 경우 이용자는 서비스 이용을 중단할 수
              있습니다.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>제4조 (서비스의 제공)</h2>
          <ul>
            <li>AI 모의면접 분석 및 결과 제공 서비스</li>
            <li>회원 관리 및 로그인 서비스</li>
            <li>방명록 및 게시판 서비스</li>
            <li>기타 본 프로젝트가 정하는 서비스</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>제5조 (회원가입 및 탈퇴)</h2>
          <ul>
            <li>
              회원가입은 이용자가 약관에 동의하고 정해진 절차에 따라 신청함으로써
              성립됩니다.
            </li>
            <li>
              회원은 언제든지 회원 탈퇴를 요청할 수 있으며, 탈퇴 시 계정 정보는
              관련 법령에 따라 처리됩니다.
            </li>
            <li>
              탈퇴한 회원은 동일한 계정으로 서비스 이용이 제한될 수 있습니다.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>제6조 (이용자의 의무)</h2>
          <ul>
            <li>타인의 개인정보를 도용하거나 허위 정보를 입력하는 행위</li>
            <li>서비스 운영을 방해하는 행위</li>
            <li>법령 또는 공서양속에 반하는 콘텐츠를 게시하는 행위</li>
            <li>기타 본 프로젝트의 정상적인 운영을 방해하는 행위</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>제7조 (게시물의 관리)</h2>
          <ul>
            <li>게시물의 책임은 작성자 본인에게 있습니다.</li>
            <li>
              본 프로젝트는 다음에 해당하는 게시물을 사전 통지 없이 삭제할 수
              있습니다.
              <ul>
                <li>욕설, 비방, 음란물 등 부적절한 내용</li>
                <li>법령을 위반하는 내용</li>
                <li>서비스 목적에 부합하지 않는 내용</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>제8조 (면책조항)</h2>
          <ul>
            <li>
              본 프로젝트는 천재지변, 시스템 장애 등 불가항력으로 인한 서비스
              중단에 대해 책임을 지지 않습니다.
            </li>
            <li>
              본 프로젝트는 이용자가 서비스를 통해 얻은 정보의 정확성이나 신뢰성에
              대해 보장하지 않습니다.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>제9조 (분쟁 해결)</h2>
          <p>
            본 약관과 관련하여 발생한 분쟁에 대해서는 상호 협의를 원칙으로 하며,
            협의가 이루어지지 않을 경우 대한민국 법을 준거법으로 합니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>부칙</h2>
          <p className="privacy-date">
            공고일자: 2025년 1월 1일<br />
            시행일자: 2025년 1월 1일
          </p>
        </section>
      </div>
    </main>
  );
}
