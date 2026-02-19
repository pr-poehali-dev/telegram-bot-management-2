import Icon from "@/components/ui/icon";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: string;
  gradient?: boolean;
  delay?: string;
}

const StatCard = ({ title, value, change, changeType, icon, gradient, delay }: StatCardProps) => {
  return (
    <div
      className={`relative rounded-2xl p-5 opacity-0 animate-fade-in overflow-hidden group transition-transform duration-300 hover:scale-[1.02] ${delay || ""}
        ${gradient
          ? "gradient-bg text-white shadow-xl shadow-[hsl(250,90%,65%)]/20"
          : "glass glass-hover"
        }`}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <div className="relative flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient ? "bg-white/20" : "bg-[hsl(var(--primary))]/10"}`}>
          <Icon name={icon} size={20} className={gradient ? "text-white" : "text-[hsl(var(--primary))]"} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
          ${changeType === "up" ? "bg-emerald-500/10 text-emerald-400" : ""}
          ${changeType === "down" ? "bg-red-500/10 text-red-400" : ""}
          ${changeType === "neutral" ? "bg-white/10 text-white/60" : ""}
          ${gradient && changeType === "up" ? "bg-white/20 text-white" : ""}
        `}>
          <Icon
            name={changeType === "up" ? "TrendingUp" : changeType === "down" ? "TrendingDown" : "Minus"}
            size={12}
          />
          {change}
        </div>
      </div>

      <div className="relative">
        <p className={`text-3xl font-bold tracking-tight ${gradient ? "" : "text-foreground"}`}>{value}</p>
        <p className={`text-sm mt-1 ${gradient ? "text-white/70" : "text-muted-foreground"}`}>{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
