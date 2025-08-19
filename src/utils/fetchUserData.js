import api from "../service/api";

export const fetchUserData = async (role) => {
  let user;
  if (role === "user") {
    user = await api.get(`/users/me`);
  }

  return user;
};
