
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Users,
    Briefcase,
    Zap,
    MessageSquare,
    Database,
    Lock,
    BookOpen,
    FileText,
    Bell,
    Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgentManagement from '../components/settings/AgentManagement';
import OfferManagement from '../components/settings/OfferManagement';
import SystemIntegrations from '../components/settings/SystemIntegrations';
import SystemConfiguration from '../components/settings/SystemConfiguration';
import NotificationSettings from '../components/settings/NotificationSettings';
import AdvancedSettings from '../components/settings/AdvancedSettings';
import SystemDocumentation from '../components/common/SystemDocumentation';
import KnowledgeBaseManager from '../components/settings/KnowledgeBaseManager';

const SETTINGS_TABS = [
    { id: 'agents', name: 'مدیریت کارمندان', icon: Users, component: AgentManagement },
    { id: 'offers', name: 'مدیریت آفرها', icon: Briefcase, component: OfferManagement },
    { id: 'integrations', name: 'یکپارچه‌سازی‌ها', icon: Zap, component: SystemIntegrations },
    { id: 'config', name: 'پیکربندی سیستم', icon: SettingsIcon, component: SystemConfiguration },
    { id: 'notifications', name: 'تنظیمات اعلان‌ها', icon: Bell, component: NotificationSettings },
    { id: 'knowledge', name: 'پایگاه دانش', icon: BookOpen, component: KnowledgeBaseManager },
    { id: 'docs', name: 'مستندات', icon: FileText, component: SystemDocumentation },
    { id: 'advanced', name: 'تنظیمات پیشرفته', icon: Lock, component: AdvancedSettings },
];

export default function Settings() {
    const [activeTab, setActiveTab] = useState('agents');
    const [isAdmin, setIsAdmin] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [targetTab, setTargetTab] = useState(null);

    const handleTabClick = (tabId) => {
        const tab = SETTINGS_TABS.find(t => t.id === tabId);
        if (tab && tab.id === 'advanced' && !isAdmin) {
            setTargetTab(tabId);
            setShowPasswordPrompt(true);
        } else {
            setActiveTab(tabId);
        }
    };

    const handlePasswordSubmit = () => {
        if (password === "Fa867945") {
            setIsAdmin(true);
            setShowPasswordPrompt(false);
            if (targetTab) {
                setActiveTab(targetTab);
                setTargetTab(null);
            }
        } else {
            alert('گذرواژه نامعتبر است');
        }
        setPassword('');
    };

    const ActiveComponent = SETTINGS_TABS.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full" dir="rtl">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">تنظیمات</h2>
                <nav className="space-y-2">
                    {SETTINGS_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.name}</span>
                            {tab.id === 'advanced' && <Lock className="w-4 h-4 mr-auto opacity-70" />}
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 bg-white p-6 sm:p-8 rounded-2xl shadow-lg min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25 }}
                        className="h-full"
                    >
                        {ActiveComponent && <ActiveComponent />}
                    </motion.div>
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {showPasswordPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-lg p-6 w-full max-w-sm"
                        >
                            <h3 className="font-bold text-lg mb-4">ورود به بخش پیشرفته</h3>
                            <p className="text-sm text-gray-600 mb-4">برای دسترسی به این بخش، لطفاً گذرواژه مدیر را وارد کنید.</p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded mb-4"
                                placeholder="گذرواژه"
                            />
                            <div className="flex gap-2">
                                <Button onClick={() => setShowPasswordPrompt(false)} variant="outline" className="flex-1">انصراف</Button>
                                <Button onClick={handlePasswordSubmit} className="flex-1">تایید</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
