import { jwtDecode } from "jwt-decode";
import { fetchUserData } from "./fetchUserData";

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");

  if (token) {
    const decodeToken = jwtDecode(token);

    const expireTime = new Date(decodeToken.exp) * 1000;

    if (new Date(Date.now()) > expireTime) {
      localStorage.removeItem("token");
      return "";
    } else {
      const user = await fetchUserData(decodeToken.role, decodeToken.id);
      if (user) {
        return { data: user.data };
      }
    }
  } else {
    return "";
  }
};
