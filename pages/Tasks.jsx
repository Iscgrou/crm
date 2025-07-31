import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Grid, List, CheckSquare, Filter, Search, Calendar, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskStats from "../components/tasks/TaskStats";

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all',
        priority: 'all'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const fetchedTasks = await Task.list('-created_date');
            // فیلتر کردن وظایف عمومی (که title دارند)
            const generalTasks = fetchedTasks.filter(t => t.title && !t.reseller_id);
            setTasks(generalTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'بارگذاری وظایف با خطا مواجه شد');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (taskData) => {
        try {
            if (editingTask) {
                await Task.update(editingTask.id, taskData);
                if (window.showToast) {
                    window.showToast('success', 'موفقیت', 'وظیفه با موفقیت بروزرسانی شد');
                }
            } else {
                await Task.create(taskData);
                if (window.showToast) {
                    window.showToast('success', 'موفقیت', 'وظیفه جدید با موفقیت ایجاد شد');
                }
            }
            setShowForm(false);
            setEditingTask(null);
            loadTasks();
        } catch (error) {
            console.error('Error saving task:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'ذخیره وظیفه با خطا مواجه شد');
            }
        }
    };

    const handleStatusChange = async (task, newStatus) => {
        try {
            await Task.update(task.id, { ...task, status: newStatus });
            loadTasks();
            if (window.showToast) {
                window.showToast('success', 'موفقیت', `وضعیت وظیفه به "${newStatus}" تغییر یافت`);
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'بروزرسانی وضعیت وظیفه با خطا مواجه شد');
            }
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    const handleDelete = async (taskId) => {
        if (!confirm('آیا از حذف این وظیفه اطمینان دارید؟')) {
            return;
        }

        try {
            await Task.delete(taskId);
            loadTasks();
            if (window.showToast) {
                window.showToast('success', 'موفقیت', 'وظیفه با موفقیت حذف شد');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'حذف وظیفه با خطا مواجه شد');
            }
        }
    };

    const filteredTasks = tasks.filter(task => {
        const statusMatch = filters.status === 'all' || task.status === filters.status;
        const categoryMatch = filters.category === 'all' || task.category === filters.category;
        const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
        const searchMatch = searchTerm === '' || 
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return statusMatch && categoryMatch && priorityMatch && searchMatch;
    });
    
    const groupedTasks = {
        todo: filteredTasks.filter(task => task.status === 'todo'),
        in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
        completed: filteredTasks.filter(task => task.status === 'completed')
    };

    const getUpcomingTasks = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return filteredTasks.filter(task => {
            if (!task.due_date) return false;
            const dueDate = new Date(task.due_date);
            return dueDate <= tomorrow && task.status !== 'completed';
        }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">بارگذاری وظایف...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">مدیریت وظایف</h1>
                    <p className="text-gray-600">وظایف شخصی و عمومی خود را اینجا مدیریت کنید</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => { setEditingTask(null); setShowForm(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        ایجاد وظیفه جدید
                    </Button>
                </div>
            </motion.div>

            {/* Stats */}
            <TaskStats tasks={tasks} />

            {/* Quick Actions & Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            جستجو و فیلترها
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="جستجو در وظایف..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    onClick={() => setViewMode('grid')}
                                    size="sm"
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    onClick={() => setViewMode('list')}
                                    size="sm"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            وظایف فوری
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {getUpcomingTasks().slice(0, 3).map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{task.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(task.due_date).toLocaleDateString('fa-IR')}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {task.priority}
                                    </Badge>
                                </div>
                            ))}
                            {getUpcomingTasks().length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    هیچ وظیفه فوری موجود نیست
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <TaskFilters filters={filters} onFilterChange={setFilters} />

            {/* Tasks Content */}
            <div className="min-h-96">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onStatusChange={handleStatusChange}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                            statusTasks.length > 0 && (
                                <motion.div
                                    key={status}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg p-6 shadow-sm"
                                >
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize flex items-center gap-2">
                                        {status === 'todo' && <div className="w-3 h-3 bg-gray-400 rounded-full"></div>}
                                        {status === 'in_progress' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                                        {status === 'completed' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                                        {status === 'todo' && 'انجام نشده'}
                                        {status === 'in_progress' && 'در حال انجام'}
                                        {status === 'completed' && 'تکمیل شده'}
                                        <Badge variant="outline" className="mr-2">
                                            {statusTasks.length}
                                        </Badge>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <AnimatePresence>
                                            {statusTasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onStatusChange={handleStatusChange}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )
                        ))}
                    </div>
                )}

                {filteredTasks.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-12 text-center rounded-lg shadow-sm"
                    >
                        <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {searchTerm || Object.values(filters).some(f => f !== 'all') 
                                ? 'هیچ وظیفه‌ای یافت نشد' 
                                : 'هیچ وظیفه‌ای وجود ندارد'
                            }
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || Object.values(filters).some(f => f !== 'all')
                                ? 'فیلترهای خود را تغییر دهید یا جستجوی جدیدی انجام دهید'
                                : 'اولین وظیفه خود را برای شروع ایجاد کنید!'
                            }
                        </p>
                        <Button
                            onClick={() => { setEditingTask(null); setShowForm(true); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                        >
                            <Plus className="w-5 h-5 ml-2" />
                            ایجاد وظیفه
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Task Form Modal */}
            <TaskForm
                task={editingTask}
                onSubmit={handleSubmit}
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditingTask(null);
                }}
            />
        </div>
    );
}