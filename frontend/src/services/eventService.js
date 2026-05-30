import api from "./api";

export const eventService = {
  async getAll({ category = "", search = "" } = {}) {
    const res = await api.get("/events", { params: { category, search } });
    return res.data;
  },
  async getById(id) {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },
};
