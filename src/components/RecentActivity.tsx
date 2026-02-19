import Icon from "@/components/ui/icon";

const activities = [
  {
    id: 1,
    user: "Алексей М.",
    action: "отправил команду /start",
    time: "2 мин назад",
    icon: "Play",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    id: 2,
    user: "Мария К.",
    action: "подписалась на рассылку",
    time: "5 мин назад",
    icon: "Bell",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: 3,
    user: "Система",
    action: "заблокировала спам-сообщение",
    time: "12 мин назад",
    icon: "ShieldAlert",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    id: 4,
    user: "Дмитрий В.",
    action: "использовал команду /help",
    time: "18 мин назад",
    icon: "HelpCircle",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    id: 5,
    user: "Елена С.",
    action: "оставила отзыв",
    time: "25 мин назад",
    icon: "Star",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
];

const RecentActivity = () => {
  return (
    <div className="glass rounded-2xl p-6 opacity-0 animate-fade-in stagger-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Последние события</h3>
          <p className="text-sm text-muted-foreground mt-0.5">В реальном времени</p>
        </div>
        <button className="text-xs text-[hsl(var(--primary))] hover:underline font-medium">
          Все логи
        </button>
      </div>

      <div className="space-y-1">
        {activities.map((activity, i) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`w-9 h-9 rounded-lg ${activity.bg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}>
              <Icon name={activity.icon} size={16} className={activity.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
