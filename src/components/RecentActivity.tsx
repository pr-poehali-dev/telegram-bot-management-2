import Icon from "@/components/ui/icon";

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  icon: string;
  color: string;
  bg: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <div className="glass rounded-2xl p-6 opacity-0 animate-fade-in stagger-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Последние события
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            В реальном времени
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Нет событий
        </p>
      ) : (
        <div className="space-y-1">
          {activities.map((activity, i) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className={`w-9 h-9 rounded-lg ${activity.bg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}
              >
                <Icon
                  name={activity.icon}
                  size={16}
                  className={activity.color}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">
                    {activity.action}
                  </span>
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
