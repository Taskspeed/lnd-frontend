
import { api } from "src/boot/axios";

export const certificate_preview = (nominatedEmployeeId) => {
  return api.get(`certification/preview/${nominatedEmployeeId}`, {
     responseType: 'blob',
  });
};

export const certificate_send = (nominatedEmployeeId) => {
    return api.post(`certification/send/${nominatedEmployeeId}`);
};

export const certificate_release = (params = {}) => {
    return api.get(`certification/release`,{ params });
};

export const certificate_list = (controlNo,params = {}) => {
    return api.get(`certification/list/certificate/${controlNo}`,{params});
};

