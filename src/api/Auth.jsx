import { api } from "./Http.jsx";

export const idCheck = (m_id) =>
    api.post("/member/idCheck", {m_id});

export const sendCode = (m_email) =>
    api.post("/member/sendCode", {m_email});

export const verification = (m_email, code) =>
    api.post("/member/verifyCode", {m_email, code });

export const register = (form) =>
    api.post("/member/register", form);

export const login = (m_id, m_pwd) =>
    api.post("/member/login", {m_id, m_pwd});

export const logout = () =>
    api.post("/member/logout");

export const findId = (m_name, m_email) =>
    api.post("/member/findId", {m_name, m_email});

// 새로고침 눌렀을때 안팅기게 하기위해서
export const me = () =>
  api.get("/member/me");


export const sendPasswordResetCode = (m_id, m_email) =>
    api.post("/member/sendPasswordResetCode", {m_id, m_email}); 

export const verifyPasswordResetCode = (m_email, code) =>
    api.post("/member/verifyPasswordResetCode", {m_email,code})

export const passwordChange = (data) =>
    api.post("/member/newPassword", data);

export const  guestBookPageList = (pageInfo) =>
    api.get("/guestbook/list", {params: {currentPage: pageInfo.nowPage}} );

export const  guestBookDetail = (g_idx) =>
    api.post("/guestbook/detail", g_idx) ;

export const guestBookInsert = (formData) => 
    api.post("/guestbook/insert", formData);

export const guestBookDelete = (g_idx) =>     
    api.post("/guestbook/delete", null, {
        params: {g_idx}
    }) ;


export const  inqueryPageList = (pageInfo) => {
    //console.log(" inquery pageInfo.nowPage :" ,pageInfo.nowPage);
    return api.get("/inquery/list", {params: {currentPage: pageInfo.nowPage}} );
}

export const  inqueryDetail = (i_idx) =>
    api.post("/inquery/detail", i_idx) ;

export const inqueryInsert = (formData) => 
    api.post("/inquery/insert", formData);

export const inqueryUpdate = (formData) => {
  return api.post(`/inquery/update`, formData);
};

export const inqueryDelete = (i_idx, pwd) => {
  return api.post(`/inquery/delete`, {
    i_idx,
    i_pwd: pwd 
  });
};

export const inqueryResponseUpdate = (i_idx, i_response) => {
    //console.log("i_idx : ", i_idx, "i_response :", i_response);
    return api.post('/inquery/response', {
        i_idx,
        i_response,
    });
};



export const  noticePageList = (pageInfo) =>
    api.get("/notice/list", {
        params: {
            currentPage: pageInfo.nowPage,
            type:2
        }});    

//export const  noticeAdminPageList = (pageInfo) =>
//    api.get("/notice/adminlist", {params: {currentPage: pageInfo.nowPage}} );    
export const  noticeAdminPageList = (pageInfo) =>
    api.get("/notice/list", {
        params: {
            currentPage: pageInfo.nowPage,
            type:1
        }});    

export const  noticeDetail = (n_idx) =>
    api.post("/notice/detail", n_idx) ;

export const noticeInsert = (formData) => 
    api.post("/notice/insert", formData);

export const noticeDelete = (formData) =>     
    api.post("/notice/delete", formData) ;

export const noticeUpdate = (formData) =>     
    api.post("/notice/update", formData) ;


// myPage
export const myPage = () => api.post("/member/myPage");

export const updateMyInfo = (form) =>
    api.post("/member/updateMyInfo", form);

export const getMyInquiries = () =>
  api.get("/member/inquiries");

export const getMyGuestbooks = () =>
    api.get("/member/guestbooks");

export const sendQuitMail = () => api.post("/member/quitMail");
export const verifyQuitCode = (data) => api.post("/member/quitVerify", data);
export const quitMember = () => api.post("/member/quit");