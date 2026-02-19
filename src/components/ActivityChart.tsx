const data = [
  { day: "Пн", value: 65 },
  { day: "Вт", value: 85 },
  { day: "Ср", value: 45 },
  { day: "Чт", value: 95 },
  { day: "Пт", value: 75 },
  { day: "Сб", value: 55 },
  { day: "Вс", value: 40 },
];

const maxValue = Math.max(...data.map(d => d.value));

const ActivityChart = () => {
  return (
    <div className="glass rounded-2xl p-6 opacity-0 animate-fade-in stagger-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Активность</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Сообщения за неделю</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full gradient-bg" />
          <span className="text-xs text-muted-foreground">Сообщения</span>
        </div>
      </div>

      <div className="flex items-end gap-3 h-[180px]">
        {data.map((item, i) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </span>
              <div className="w-full relative group cursor-pointer" style={{ height: `${height}%` }}>
                <div
                  className="absolute inset-0 rounded-xl gradient-bg opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[hsl(250,90%,65%)]/30"
                  style={{
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-border">
                  {item.value} сообщений
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityChart;
