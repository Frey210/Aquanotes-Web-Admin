import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

interface TrendPoint {
  timestamp?: string;
  suhu?: number | null;
  ph?: number | null;
  do?: number | null;
}

interface SensorLineChartProps {
  data: TrendPoint[];
  metric: "suhu" | "ph" | "do";
}

export function SensorLineChart({ data, metric }: SensorLineChartProps) {
  const colors: Record<string, string> = {
    suhu: "#38d6ff",
    ph: "#10b981",
    do: "#f59e0b"
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 10 }}>
          <defs>
            <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[metric]} stopOpacity={0.6} />
              <stop offset="100%" stopColor={colors[metric]} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="timestamp" tick={{ fill: "#94a3b8", fontSize: 10 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
          <Tooltip contentStyle={{ background: "#0b1222", borderRadius: 12, border: "1px solid rgba(148,163,184,0.2)" }} />
          <Line type="monotone" dataKey={metric} stroke={colors[metric]} strokeWidth={2} fill="url(#trend)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
