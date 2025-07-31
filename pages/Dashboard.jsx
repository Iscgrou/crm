import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { TaskReport } from "@/api/entities";
import { Agent } from "@/api/entities";
import { Reseller } from "@/api/entities";
import { InteractionLog } from "@/api/entities";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, CheckCircle2, AlertTriangle, Clock, Target, Award, MessageCircle } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState({
    tasks: [],
    reports: [],
    agents: [],
    resellers: [],
    interactions: [],
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tasks, reports, agents, resellers, interactions] = await Promise.all([
        Task.list("-created_date"),
        TaskReport.list("-completion_timestamp"),
        Agent.list(),
        Reseller.list(),
        InteractionLog.list("-created_date")
      ]);
      
      setData({ tasks, reports, agents, resellers, interactions, loading: false });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // محاسبات آماری بر اساس داده‌های واقعی
  const stats = {
    totalTasks: data.tasks.length,
    completedTasks: data.tasks.filter(t => t.status === 'completed').length,
    pendingTasks: data.tasks.filter(t => t.status === 'pending').length,
    activeAgents: data.agents.length,
    activeResellers: data.resellers.filter(r => r.status === 'active').length,
    avgRating: data.reports.length > 0 ? 
      (data.reports.reduce((sum, r) => sum + (r.task_effectiveness_rating || 0), 0) / data.reports.length).toFixed(1) : 0,
    totalInteractions: data.interactions.length,
    todayInteractions: data.interactions.filter(i => 
      new Date(i.created_date).toDateString() === new Date().toDateString()
    ).length
  };

  // داده‌های نمودار وضعیت وظایف
  const taskStatusData = [
    { name: 'تکمیل شده', value: stats.completedTasks, color: '#10B981' },
    { name: 'در انتظار', value: stats.pendingTasks, color: '#F59E0B' },
    { name: 'در حال انجام', value: data.tasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' }
  ];

  // داده‌های عملکرد کارمندان بر اساس داده‌های واقعی
  const agentPerformance = data.agents.map(agent => {
    const agentTasks = data.tasks.filter(t => t.assigned_to_agent_id === agent.id);
    const completed = agentTasks.filter(t => t.status === 'completed').length;
    const agentReports = data.reports.filter(r => {
      const task = data.tasks.find(t => t.id === r.task_id);
      return task && task.assigned_to_agent_id === agent.id;
    });
    const avgRating = agentReports.length > 0 ? 
      (agentReports.reduce((sum, r) => sum + r.task_effectiveness_rating, 0) / agentReports.length).toFixed(1) : 0;
    
    return {
      name: agent.name,
      completed,
      total: agentTasks.length,
      percentage: agentTasks.length > 0 ? Math.round((completed / agentTasks.length) * 100) : 0,
      avgRating: parseFloat(avgRating)
    };
  });

  // وضعیت نمایندگان بر اساس داده‌های واقعی
  const resellerStatusData = [
    { name: 'فعال', value: data.resellers.filter(r => r.status === 'active').length, color: '#10B981' },
    { name: 'غیرفعال', value: data.resellers.filter(r => r.status === 'inactive').length, color: '#EF4444' },
    { name: 'کاهش یافته', value: data.resellers.filter(r => r.status === 'lapsed').length, color: '#F59E0B' },
    { name: 'جدید', value: data.resellers.filter(r => r.status === 'new').length, color: '#3B82F6' }
  ];

  // آمار کانال‌های ارتباطی
  const communicationChannels = [
    { name: 'تلفن', value: data.interactions.filter(i => i.channel === 'phone').length, color: '#10B981' },
    { name: 'تلگرام', value: data.interactions.filter(i => i.channel === 'telegram').length, color: '#3B82F6' },
    { name: 'یادداشت سیستم', value: data.interactions.filter(i => i.channel === 'system_note').length, color: '#6B7280' }
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* هدر */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">داشبورد مدیریتی</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">نمای کلی از عملکرد سیستم و تیم</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="bg-indigo-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm lg:text-base"
        >
          <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">بروزرسانی</span>
          <span className="sm:hidden">بروز</span>
        </button>
      </motion.div>

      {/* کارت‌های آمار کلی */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {[
          { title: "کل وظایف", value: stats.totalTasks, icon: Target, color: "bg-blue-500" },
          { title: "تکمیل شده", value: stats.completedTasks, icon: CheckCircle2, color: "bg-green-500" },
          { title: "نمایندگان فعال", value: stats.activeResellers, icon: Users, color: "bg-purple-500" },
          { title: "میانگین امتیاز", value: `${stats.avgRating}/5`, icon: Award, color: "bg-yellow-500" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm">{stat.title}</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 lg:w-12 lg:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* نمودارها */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* وضعیت وظایف */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">وضعیت وظایف</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name, value }) => window.innerWidth > 640 ? `${name}: ${value}` : value}
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* وضعیت نمایندگان */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">وضعیت نمایندگان</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resellerStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* عملکرد کارمندان */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">عملکرد کارمندان</h3>
        <div className="space-y-3 lg:space-y-4">
          {agentPerformance.map((agent, index) => (
            <div key={index} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm lg:text-base">{agent.name}</p>
                  <p className="text-xs lg:text-sm text-gray-600">
                    {agent.completed} از {agent.total} وظیفه | امتیاز: {agent.avgRating}/5
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-16 lg:w-32 bg-gray-200 rounded-full h-2 lg:h-3">
                  <div
                    className="bg-indigo-600 h-2 lg:h-3 rounded-full transition-all duration-500"
                    style={{ width: `${agent.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs lg:text-sm font-medium text-gray-700 w-8 lg:w-10">{agent.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* آمار تعاملات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* کانال‌های ارتباطی */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">کانال‌های ارتباطی</h3>
          <div className="space-y-3">
            {communicationChannels.map((channel, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }}></div>
                  <span className="text-sm text-gray-700">{channel.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{channel.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* آمار تعاملات روزانه */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">آمار تعاملات</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalInteractions}</div>
              <div className="text-sm text-gray-600">کل تعاملات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.todayInteractions}</div>
              <div className="text-sm text-gray-600">امروز</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* گزارش‌های اخیر */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">آخرین گزارش‌ها</h3>
        <div className="space-y-3">
          {data.reports.slice(0, 5).map((report, index) => {
            const task = data.tasks.find(t => t.id === report.task_id);
            const reseller = data.resellers.find(r => r.id === task?.reseller_id);
            return (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{reseller?.shop_name || 'نامشخص'}</p>
                    <p className="text-xs text-gray-600 truncate">{report.outcome_summary.slice(0, window.innerWidth > 640 ? 50 : 30)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 lg:px-2 py-1 rounded">
                    {report.task_effectiveness_rating}/5
                  </span>
                  <span className="text-xs text-gray-500 hidden lg:inline">
                    {new Date(report.completion_timestamp).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}