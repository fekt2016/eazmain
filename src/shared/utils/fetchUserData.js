import api from "../services/api"';

export const fetchUserData = async (role) => {
  let user;
  if (role === "user") {
    user = await api.get(`/users/me`);
  }

  return user;
};
