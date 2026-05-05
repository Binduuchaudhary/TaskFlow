const statusLabels = {
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done"
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{statusLabels[status] || status}</span>;
}
