const styles = {
  high: "bg-danger/10 text-danger",
  medium: "bg-warning/10 text-warning",
  low: "bg-success/10 text-success",
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  );
}