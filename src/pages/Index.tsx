import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import ActivityChart from "@/components/ActivityChart";
import RecentActivity from "@/components/RecentActivity";
import BotStatus from "@/components/BotStatus";
import TopCommands from "@/components/TopCommands";

const stats = [
  { title: "Пользователей", value: "12,847", change: "+14.2%", changeType: "up" as const, icon: "Users", gradient: true },
  { title: "Сообщений сегодня", value: "3,421", change: "+8.7%", changeType: "up" as const, icon: "MessageCircle" },
  { title: "Команд обработано", value: "1,893", change: "+23.1%", changeType: "up" as const, icon: "Terminal" },
  { title: "Активных сессий", value: "347", change: "-2.4%", changeType: "down" as const, icon: "Activity" },
];

const sectionTitles: Record<string, string> = {
  dashboard: "Статистика",
  messages: "Сообщения",
  users: "Пользователи",
  commands: "Команды",
  broadcast: "Рассылка",
  moderation: "Модерация",
  integrations: "Интеграции",
  logs: "Логи",
  settings: "Настройки",
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="ml-[240px] p-8 transition-all duration-300">
        <DashboardHeader />

        {activeSection === "dashboard" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <StatCard key={stat.title} {...stat} delay={`stagger-${i + 1}`} />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <ActivityChart />
              </div>
              <BotStatus />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RecentActivity />
              <TopCommands />
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center opacity-0 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 animate-pulse-glow">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {sectionTitles[activeSection]}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Этот раздел готов к настройке. Скоро здесь появится полный функционал управления.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
