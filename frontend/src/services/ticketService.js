import api from "./api";

export const ticketService = {
  async purchase(eventId, quantity = 1) {
    const res = await api.post("/tickets/purchase", { event_id: eventId, quantity });
    return res.data;
  },
  async getMyTickets() {
    const res = await api.get("/tickets/my-tickets");
    return res.data;
  },
  async cancel(ticketId) {
    const res = await api.post(`/tickets/${ticketId}/cancel`);
    return res.data;
  },
  async transfer(ticketId, targetDNI) {
    const res = await api.post(`/tickets/${ticketId}/transfer`, { target_dni: targetDNI });
    return res.data;
  },
};
