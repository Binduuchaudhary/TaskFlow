export function formatDate(value) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function isOverdue(date, status) {
  if (!date || status === "done") return false;
  return new Date(date).getTime() < Date.now();
}
