import { api } from "src/boot/axios";

export const get_notifications = () => api.get('notifications');
export const mark_notification_read = (id) => api.put(`notifications/${id}/read`);