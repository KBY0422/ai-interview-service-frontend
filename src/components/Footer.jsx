// src/components/Footer.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
  useEffect(() => {
    const KAKAO_KEY = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;

    if (!KAKAO_KEY) {
      console.error("Kakao JavaScript key not found");
      return;
    }

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
      return;
    }

    const script = document.createElement("script");
    script.src =
      `https://dapi.kakao.com/v2/maps/sdk.js` +
      `?appkey=${KAKAO_KEY}` +
      `&autoload=false` +
      `&libraries=services`;

    script.onload = () => {
      window.kakao.maps.load(initMap);
    };

    document.head.appendChild(script);

    function initMap() {
      const container = document.getElementById("footer-kakao-map");
      if (!container || container.dataset.loaded) return;

      container.dataset.loaded = "true";

      const position = new window.kakao.maps.LatLng(
        37.55237,
        126.937605
      );

      const map = new window.kakao.maps.Map(container, {
        center: position,
        level: 3,
        draggable: false,
        scrollwheel: false,
      });

      new window.kakao.maps.Marker({
        position,
        map,
      });
    }
  }, []);

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* 좌측 */}
        <div className="footer-section">
          <h3 className="footer-logo">AI Interview</h3>
          <p className="footer-desc">
            AI 기반 모의면접 및 분석 서비스를 제공하는 웹 사이트 입니다.
          </p>
        </div>

        {/* 중앙 */}
        <div className="footer-section">
          <h4 className="footer-title">바로가기</h4>
          <ul className="footer-links">
            <li><Link to="/notice">공지사항</Link></li>
            <li><Link to="/inquery">문의사항</Link></li>
            <li><Link to="/guestbook">방명록</Link></li>
            
          </ul>
        </div>

        {/* 우측 */}
        <div className="footer-section">
          <h4 className="footer-title">오시는 길</h4>
          <p className="footer-address">
            서울 마포구 백범로 23 케이터틀 3층
          </p>

          <div
            id="footer-kakao-map"
            className="footer-kakao-map"
            onClick={() =>
              window.open(
                "https://map.kakao.com/?q=서울 마포구 백범로 23 케이터틀 3층",
                "_blank"
              )
            }
          />
        </div>
      </div>

      {/* 하단 마무리 영역 */}
      <div className="footer-bottom">
        <span>© 2025 AI Interview </span>
        <span><Link to="/privacy"> 개인정보처리방침 </Link> · <Link to="/terms"> 이용약관 </Link></span>
      </div>
    </footer>
  );
}
