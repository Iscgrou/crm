

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    BarChart3, Users, CheckSquare, Briefcase, Settings, 
    BookOpen, MessageSquare, Upload, Menu, X, 
    Bell, User, LogOut, ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { User as UserEntity } from '@/api/entities';
import NotificationSystem from './components/common/NotificationSystem';

const NAVIGATION_ITEMS = [
    { name: 'داشبورد', path: 'Dashboard', icon: BarChart3, description: 'نمای کلی و آمار سیستم' },
    { name: 'میز کار', path: 'Workbench', icon: Briefcase, description: 'انجام وظایف روزانه' },
    { name: 'وظایف', path: 'Tasks', icon: CheckSquare, description: 'مدیریت وظایف شخصی و عمومی' },
    { name: 'نمایندگان', path: 'ResellerManagement', icon: Users, description: 'مدیریت اطلاعات نمایندگان' },
    { name: 'آموزش', path: 'Training', icon: BookOpen, description: 'مرکز آموزش و راهنما' },
    { name: 'یکپارچه‌سازی‌ها', path: 'TelegramIntegration', icon: MessageSquare, description: 'اتصال به تلگرام' },
    { name: 'آپلود داده', path: 'JsonUpload', icon: Upload, description: 'بارگذاری داده‌ها' },
    { name: 'تنظیمات', path: 'Settings', icon: Settings, description: 'تنظیمات پیشرفته سیستم' }
];

export default function Layout({ children, currentPageName }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await UserEntity.me();
                setUser(currentUser);
            } catch (error) {
                console.error('Error loading user:', error);
            }
        };
        loadUser();
    }, []);
    
    const handleLogout = async () => {
        try {
            await UserEntity.logout();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            if(window.showNotification) window.showNotification('error', 'خطا در خروج');
        }
    };

    const isActivePage = (pagePath) => location.pathname === createPageUrl(pagePath);
    const currentPage = NAVIGATION_ITEMS.find(item => isActivePage(item.path)) || { name: 'صفحه فعلی', description: '' };

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <div className="fixed top-0 left-0 z-[100]">
                 <NotificationSystem 
                    isPanelOpen={isNotificationPanelOpen} 
                    setPanelOpen={setNotificationPanelOpen}
                />
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : 'translate-x-full'
            } lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
                
                <div className="flex items-center justify-between p-6 border-b border-gray-200 h-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <CheckSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">ClayTasks</h1>
                            <p className="text-xs text-gray-500">مدیر هوشمند CRM</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {NAVIGATION_ITEMS.map((item) => (
                        <Link
                            key={item.name}
                            to={createPageUrl(item.path)}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                                isActivePage(item.path)
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>خروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                         <button 
                            onClick={() => setSidebarOpen(true)} 
                            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{currentPage.name}</h2>
                            <p className="text-sm text-gray-500">{currentPage.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         <Button variant="outline" size="icon" className="relative" onClick={() => setNotificationPanelOpen(true)}>
                            <Bell className="w-5 h-5" />
                            {/* The count will be managed by NotificationSystem now */}
                        </Button>
                        <div className="relative">
                            <button 
                                onClick={() => setUserMenuOpen(!userMenuOpen)} 
                                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-600"/>
                                </div>
                                <div className="hidden md:block text-right">
                                    <p className="font-semibold text-sm">{user?.full_name || 'کاربر'}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {userMenuOpen && (
                                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                                    <button className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        پروفایل
                                    </button>
                                    <button 
                                        onClick={handleLogout} 
                                        className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        خروج
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
            
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}

