import { api } from "./Http.jsx";


// 분석 목록 (로그인 사용자 기준: 백엔드에서 @AuthenticationPrincipal로 mIdx 처리)
export const getAnalysisList = () => api.get(`/analysis/list`);

// 분석 결과
export const getInterviewResult = (sIdx) => api.get(`/analysis/result/${sIdx}`);

// PDF 정보
export const getPdfInfo = (sIdx) => api.get(`/analysis/pdf/info/${sIdx}`);

// PDF 생성
export const createPdf = (sIdx) => api.post(`/analysis/pdf/create/${sIdx}`);

// PDF 다운로드
export const downloadPdfBlob = (sIdx) =>
  api.get(`/analysis/pdf/download/${sIdx}`, {
    responseType: "blob",
  });


//이력서 분석
export const analyze=(formData)=>
    api.post("/resume/analyze",formData);

//PDF 이력서 생성
export const create=(formData)=>
    api.post("/resume/create",formData);

// 뉴스 기사 출력
// 뉴스 기사 출력
export const search = (keyword, display=100,start=1) => {
  return api.get("/news/search", {
    params: {
      recommendedKeywords: keyword,
      display: display,
      start: start
    },
  }).then(res => res.data)
}
//검색 키워드 횟수 증가
export const increaseKeyword = (keyword) =>
    api.post("/news/keyword/click", null, {
        params: { keyword },
    });
//키워드 리스트 출력
export const keywords = ()=>{
    return api.get("/news/keywords")
}
//관리자 키워드 추가
export const insertKeyword = (keyword) => {
  return api.post("/news/admin/keyword", null, {
    params: { keyword }
  });
};
//관리자 키워드 삭제
export const deleteKeyword = (k_content) => {
  return api.post("/news/admin/delete_keyword", null, {
    params: { k_content }
  });
};
//PDF 생성시 토큰 계산
export const getPdfToken = (t_total) => {
  return api.post("/resume/pdf_token", null, {
    params: {
      t_total
    },
  });
};

export const sendChatBot = (text) => {
  return api.post("/chatbot", null, {
    params: { text }
  });
};


// 사용자 대시보드(로그인시 midx넘겨주기)
export const UserDashboard = () =>
    api.post("/user/dashboard");

// 관리자로 로그인 했을때만.
// 관리자 대시보드 
export const AdminDashboard = () =>
    api.post("/admin/dashboard");

// 관리자 - 사용자 통계
export const AdminUserStat = () =>
    api.post("/admin/userstat");

// 관리자 - 토큰 · 매출 통계
export const AdminTokenStat = () =>
    api.post("/admin/tokenstat");

// 관리자 -면접 통계
export const AdminInterviewStat = () =>
    api.post("/admin/interviewstat");

// 관리자 - 사용자 전체 조회 (페이징), 사용자 검색시 페이징
export const AdminUserControl = (page, size, keyword) =>
  api.get("/admin/usercontrol", {
    params: { page, size, keyword }
  });


// 관리자 - 사용자 상태 변경
export const AdminUserStatusUpdate = (mIdx, active) =>
  api.patch(`/admin/${mIdx}/status`, null, {
    params: { active }
  });
