import axios from "axios";
import useAuthStore from "../store/AuthStore";

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
})


api.interceptors.request.use(
    (config) => {
    if (!config || !config.url) {
    return config;
    }
        // 특수요청 제외 (로그인, 회원가입, GuestBook 할 때는 JWT가 없는 상태)
        const excludePaths = [
            "/member/login",
            "/member/register",
            "/member/idCheck",
            "/member/sendCode",
            "/member/verifyCode",
            "/member/findId",
            "/member/sendPasswordResetCode",
            "/member/verifyPasswordResetCode",
            "/member/newPassword",
        ];
        const excludeMatch = excludePaths.some((path)=> config.url.includes(path));

        if(!excludeMatch){
            const tokens = localStorage.getItem("tokens");
            const parsed = tokens ? JSON.parse(tokens) : null;

            if (parsed?.accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${parsed.accessToken}`;
            }
        }
        return config;
    },
    (error) =>{
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (AccessToken 자동 재발급 + 재시도)
api.interceptors.response.use(
    (res)=>res,
    async (error)=>{
        const {config, response} = error;

    if (!config || !config.url) {
    return Promise.reject(error);
    }
        // /refresh, /logout 응답은 재시도 제외
        const excludePaths = ["/member/refresh", "/member/logout"];
        const isExcluded = excludePaths.some((path)=>config.url.includes(path));
        if(isExcluded){
            return Promise.reject(error);
        }

        // AccessToken 만료 -> 자동 Refresh 시도
        // 토큰 만료가 처음 발생했을때만, 자동으로 한번 더 시도 하자
      if (response?.status === 401 && !config._retry) {
                config._retry = true;
                try {
                    const refreshRes = await api.post("/member/refresh");
                    const payload = refreshRes.data; // DataVO2라고 가정

                    if (!payload?.success) throw new Error(payload?.msg || "refresh 실패");

                    const accessToken = payload?.data?.accessToken;
                    if (!accessToken) throw new Error("accessToken 없음");

                    const prev = JSON.parse(localStorage.getItem("tokens") || "{}");
                    localStorage.setItem("tokens", JSON.stringify({ ...prev, accessToken }));
                    
                    // UI는 아무 변화 없이 계속 사용 가능해야 함
                    // useAuthStore.getState().zu_login(); 

                    // 실패했던 원 요청에 새 토큰 붙여서 재시도
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${accessToken}`;
                    return api(config);

                } catch (e) {
                     localStorage.clear();
                    useAuthStore.getState().zu_logout();
                    window.location.href = "/login";
                    return Promise.reject(e);
                }
            }
         return Promise.reject(error);
    }
);