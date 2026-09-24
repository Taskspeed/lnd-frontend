import { api } from "src/boot/axios";

export const profile_view = () => {
  return api.get(`user/profile`);

};

export const profile_update = (payload) => {
  return api.put(`user/profile/update`, payload);

};