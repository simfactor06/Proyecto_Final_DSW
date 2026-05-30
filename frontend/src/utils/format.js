export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

export function formatPrice(price) {
  if (price === undefined || price === null) return "Gratis";
  if (Number(price) === 0) return "Gratis";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}
