export default function StatCard({ value, label, icon }) {
  return (
    <div className="stat-card">
      <span className="absolute right-3 top-3 text-lg opacity-30">{icon}</span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
