import api from "./api";

export const adminService = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/admin/upload", formData);
    return res.data.url;
  },
  async createEvent(data) {
    const res = await api.post("/admin/events", data);
    return res.data;
  },
  async updateEvent(id, data) {
    const res = await api.put(`/admin/events/${id}`, data);
    return res.data;
  },
  async deleteEvent(id) {
    const res = await api.delete(`/admin/events/${id}`);
    return res.data;
  },
  async getReport(id) {
    const res = await api.get(`/admin/events/${id}/report`);
    return res.data;
  },
};
