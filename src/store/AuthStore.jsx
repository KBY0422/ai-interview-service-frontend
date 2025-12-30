import { create } from "zustand";

const useAuthStore = create((set) => ({
  zu_isLoggedIn: false,
  zu_isAdmin: false,
  zu_user: null,          // 🔥 추가
  authChecked: false,

  zu_login: (user, isAdmin = false) =>
    set({
      zu_isLoggedIn: true,
      zu_isAdmin: isAdmin,
      zu_user: user,      // 🔥 저장
      authChecked: true,
    }),

  zu_logout: () =>
    set({
      zu_isLoggedIn: false,
      zu_isAdmin: false,
      zu_user: null,
      authChecked: true,
    }),
}));

export default useAuthStore;
