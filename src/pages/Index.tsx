import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import ActivityChart from "@/components/ActivityChart";
import RecentActivity from "@/components/RecentActivity";
import BotStatus from "@/components/BotStatus";
import TopCommands from "@/components/TopCommands";
import UsersSection from "@/components/sections/UsersSection";
import BroadcastSection from "@/components/sections/BroadcastSection";
import SettingsSection from "@/components/sections/SettingsSection";
import LogsSection from "@/components/sections/LogsSection";
import MessagesSection from "@/components/sections/MessagesSection";
import CommandsSection from "@/components/sections/CommandsSection";
import ModerationSection from "@/components/sections/ModerationSection";
import IntegrationsSection from "@/components/sections/IntegrationsSection";
import { api } from "@/lib/api";

interface StatsData {
  total_users?: number;
  messages_today?: number;
  commands_processed?: number;
  active_sessions?: number;
  users_change?: string;
  messages_change?: string;
  commands_change?: string;
  sessions_change?: string;
  activity?: { day: string; value: number }[];
  top_commands?: { name: string; count: number; percentage: number }[];
  recent_activity?: {
    id: number;
    user: string;
    action: string;
    time: string;
    icon: string;
    color: string;
    bg: string;
  }[];
}

function parseChange(val?: string): { change: string; changeType: "up" | "down" | "neutral" } {
  if (!val) return { change: "0%", changeType: "neutral" };
  const num = parseFloat(val);
  if (num > 0) return { change: `+${val}`, changeType: "up" };
  if (num < 0) return { change: val, changeType: "down" };
  return { change: val, changeType: "neutral" };
}

const defaultActivity = [
  { day: "Пн", value: 0 },
  { day: "Вт", value: 0 },
  { day: "Ср", value: 0 },
  { day: "Чт", value: 0 },
  { day: "Пт", value: 0 },
  { day: "Сб", value: 0 },
  { day: "Вс", value: 0 },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState<StatsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStats()
      .then((data) => setStats(data))
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  const usersChange = parseChange(stats.users_change);
  const messagesChange = parseChange(stats.messages_change);
  const commandsChange = parseChange(stats.commands_change);
  const sessionsChange = parseChange(stats.sessions_change);

  const statCards = [
    {
      title: "Пользователей",
      value: stats.total_users?.toLocaleString() || "0",
      change: usersChange.change,
      changeType: usersChange.changeType,
      icon: "Users",
      gradient: true,
    },
    {
      title: "Сообщений сегодня",
      value: stats.messages_today?.toLocaleString() || "0",
      change: messagesChange.change,
      changeType: messagesChange.changeType,
      icon: "MessageCircle",
    },
    {
      title: "Команд обработано",
      value: stats.commands_processed?.toLocaleString() || "0",
      change: commandsChange.change,
      changeType: commandsChange.changeType,
      icon: "Terminal",
    },
    {
      title: "Активных сессий",
      value: stats.active_sessions?.toLocaleString() || "0",
      change: sessionsChange.change,
      changeType: sessionsChange.changeType,
      icon: "Activity",
    },
  ];

  const activityData = stats.activity || defaultActivity;
  const topCommands = stats.top_commands || [];
  const recentActivity = stats.recent_activity || [];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <StatCard
                  key={stat.title}
                  {...stat}
                  delay={`stagger-${i + 1}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <ActivityChart data={activityData} />
              </div>
              <BotStatus />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RecentActivity activities={recentActivity} />
              <TopCommands commands={topCommands} />
            </div>
          </div>
        );
      case "users":
        return <UsersSection />;
      case "messages":
        return <MessagesSection />;
      case "broadcast":
        return <BroadcastSection />;
      case "settings":
        return <SettingsSection />;
      case "logs":
        return <LogsSection />;
      case "commands":
        return <CommandsSection commands={topCommands} />;
      case "moderation":
        return <ModerationSection />;
      case "integrations":
        return <IntegrationsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />

      <main
        className={`${
          collapsed ? "ml-[72px]" : "ml-[240px]"
        } p-8 transition-all duration-300`}
      >
        <DashboardHeader />

        {loading && activeSection === "dashboard" ? (
          <div className="glass rounded-2xl p-12 text-center opacity-0 animate-fade-in">
            <p className="text-muted-foreground text-sm">
              Загрузка данных...
            </p>
          </div>
        ) : (
          renderSection()
        )}
      </main>
    </div>
  );
};

export default Index;