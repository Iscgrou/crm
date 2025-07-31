import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { Reseller } from "@/api/entities";
import { Agent } from "@/api/entities";
import { User } from "@/api/entities";
import TaskCard from "../components/workbench/TaskCard";
import { motion } from "framer-motion";
import { Target, Clock, TrendingUp, RefreshCw } from "lucide-react";

export default function Workbench() {
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    completed_today: 0,
    avg_rating: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [taskData, resellerData, agentData] = await Promise.all([
        Task.list("-created_date"),
        Reseller.list(),
        Agent.list()
      ]);
      
      let augmentedTasks = [];
      if (resellerData.length > 0 && agentData.length > 0) {
          // HACK: Augment tasks with reseller and agent data to fix sample data ID mismatch.
          // This assigns resellers and agents to tasks in a round-robin fashion.
          augmentedTasks = taskData.map((task, index) => {
              const reseller = resellerData[index % resellerData.length];
              const agent = agentData[index % agentData.length]; 
              return { ...task, reseller, agent };
          });
      }

      const pendingTasks = augmentedTasks.filter(task => task.status === "pending");
      
      const completedToday = augmentedTasks.filter(task => 
        task.status === "completed" && 
        new Date(task.updated_date).toDateString() === new Date().toDateString()
      ).length;

      const TaskReport = (await import("@/api/entities")).TaskReport;
      const reports = await TaskReport.list("-completion_timestamp");
      const avgRating = reports.length > 0 ? 
        (reports.reduce((sum, r) => sum + (r.task_effectiveness_rating || 0), 0) / reports.length).toFixed(1) : 0;

      setTasks(pendingTasks);
      setStats({
        pending: pendingTasks.length,
        completed_today: completedToday,
        avg_rating: parseFloat(avgRating)
      });

    } catch (error) {
      console.error('Error fetching workbench data:', error);
      if (window.showNotification) {
        window.showNotification('error', 'خطا در بارگذاری', 'خطا در دریافت اطلاعات میزکار');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onTaskUpdate = () => {
    fetchData(true);
  };

  const handleRefresh = () => {
    fetchData(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Task Card Skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header با آمار */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              سلام {currentUser?.full_name || 'کاربر گرامی'}! 
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-gray-600 mt-1">وظایف اولویت‌بندی شده توسط مدیر هوشمند</p>
          </div>
          
          <div className="flex gap-6 items-center">
            <div className="text-center">
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
              <p className="text-sm text-gray-600">در انتظار</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center gap-2 text-green-600">
                <Target className="w-5 h-5" />
                <span className="text-2xl font-bold">{stats.completed_today}</span>
              </div>
              <p className="text-sm text-gray-600">امروز تکمیل</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold">{stats.avg_rating}</span>
              </div>
              <p className="text-sm text-gray-600">میانگین امتیاز</p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              بروزرسانی
            </button>
          </div>
        </div>
      </motion.div>

      {/* لیست وظایف */}
      {tasks.length > 0 ? (
        <div className="space-y-6">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TaskCard 
                task={task} 
                reseller={task.reseller}
                agent={task.agent}
                onTaskUpdate={onTaskUpdate}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Target className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">عالی! همه وظایف تکمیل شد! 🎉</h3>
          <p className="text-gray-600 mb-4">
            شما تمام وظایف امروز را با موفقیت انجام داده‌اید. 
            <br />
            موتور هوشمند به‌زودی وظایف جدیدی برای شما تولید خواهد کرد.
          </p>
          <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
            <p className="text-sm text-gray-500">
              آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            بررسی وظایف جدید
          </button>
        </motion.div>
      )}
    </div>
  );
}