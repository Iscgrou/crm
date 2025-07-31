import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Link, Users, Settings, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TelegramManager from "../components/telegram/TelegramManager";

export default function TelegramIntegration() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const webhookUrl = window.location.origin + '/functions/telegramWebhook';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-500" />
            یکپارچه‌سازی تلگرام
          </h1>
          <p className="text-gray-600 mt-1">مدیریت ارتباط با نمایندگان از طریق تلگرام</p>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 space-x-reverse">
          {[
            { id: 'overview', label: 'نمای کلی', icon: MessageCircle },
            { id: 'setup', label: 'راه‌اندازی', icon: Settings },
            { id: 'manage', label: 'مدیریت پیام‌ها', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  قابلیت‌های تلگرام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    ارسال پیام‌های فوری و عادی
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    دریافت پیام‌های نمایندگان
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    ثبت خودکار تعاملات
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    مدیریت اتصال نمایندگان
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  آمار اتصالات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">نمایندگان متصل:</span>
                    <Badge className="bg-green-100 text-green-800">2</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">نمایندگان غیرمتصل:</span>
                    <Badge className="bg-red-100 text-red-800">2</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">پیام‌های امروز:</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  وضعیت سیستم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">وضعیت ربات:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">نیاز به تنظیم</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Webhook:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">غیرفعال</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>راه‌اندازی ربات تلگرام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">مراحل راه‌اندازی:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>به @BotFather در تلگرام پیام دهید</li>
                    <li>دستور /newbot را اجرا کنید</li>
                    <li>نام و username برای ربات انتخاب کنید</li>
                    <li>توکن دریافتی را در تنظیمات محیط قرار دهید</li>
                    <li>Webhook را تنظیم کنید</li>
                  </ol>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium mb-2">آدرس Webhook:</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded text-sm font-mono">
                      {webhookUrl}
                    </code>
                    <Button 
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    این آدرس را در تنظیمات ربات تلگرام قرار دهید
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ نکات مهم:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                    <li>توکن ربات را محرمانه نگه دارید</li>
                    <li>Webhook باید HTTPS باشد</li>
                    <li>Secret Token برای امنیت بیشتر تنظیم کنید</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'manage' && (
          <TelegramManager />
        )}
      </motion.div>
    </div>
  );
}