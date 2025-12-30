// components/ui/card.jsx
export function Card({ className = "", children }) {
  return <div className={`bg-[var(--bg-card)] text-card-foreground rounded-lg border shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

export function CardContent({ className = "", children }) {
  return <div className={`p-4 pt-0 ${className}`}>{children}</div>;
}
