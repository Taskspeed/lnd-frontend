
import { api } from "src/boot/axios";

export const report_list = () => {
  return api.get(`report/list`);
};


export const report_agency_learning_development_generate = (year) => {
  return api.get("excel/agency-learning-development", {
    responseType: "blob",
    params: { year },
  });
};