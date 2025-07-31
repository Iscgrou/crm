import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, UserPlus, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Reseller } from '@/api/entities';
import { sendTelegramMessage } from '@/api/functions';

export default function TelegramManager() {
  const [resellers, setResellers] = useState([]);
  const [selectedReseller, setSelectedReseller] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResellers();
  }, []);

  const loadResellers = async () => {
    setLoading(true);
    try {
      const data = await Reseller.list();
      setResellers(data);
      
      // بررسی وضعیت اتصال تلگرام
      const status = {};
      data.forEach(reseller => {
        status[reseller.id] = reseller.telegram_user_id ? 'connected' : 'disconnected';
      });
      setConnectionStatus(status);
    } catch (error) {
      console.error('Error loading resellers:', error);
      if (window.showNotification) {
        window.showNotification('error', 'خطا در بارگذاری', 'خطا در دریافت اطلاعات نمایندگان');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedReseller || !messageText.trim()) {
      if (window.showNotification) {
        window.showNotification('error', 'خطا در ورودی', 'لطفاً نماینده و متن پیام را انتخاب کنید');
      }
      return;
    }
    
    setSending(true);
    try {
      const { data } = await sendTelegramMessage({
        reseller_id: selectedReseller.id,
        message_text: messageText,
        is_urgent: isUrgent
      });
      
      if (data.success) {
        setMessageText('');
        setIsUrgent(false);
        if (window.showNotification) {
          window.showNotification('success', 'پیام ارسال شد', 'پیام شما با موفقیت به نماینده ارسال شد.');
        }
      } else {
        if (data.reseller_disconnected) {
          setConnectionStatus(prev => ({
            ...prev,
            [selectedReseller.id]: 'disconnected'
          }));
        }
        throw new Error(data.error || 'خطا در ارسال پیام');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (window.showNotification) {
        window.showNotification('error', 'خطا در ارسال', error.message);
      }
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />متصل</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />قطع</Badge>;
      default:
        return <Badge variant="secondary">نامشخص</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-indigo-600" />
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مدیریت تلگرام</h2>
        <Button onClick={loadResellers} variant="outline" disabled={loading}>
          {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
          بروزرسانی لیست
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* لیست نمایندگان */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              نمایندگان ({resellers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {resellers.length > 0 ? resellers.map(reseller => (
                <div
                  key={reseller.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReseller?.id === reseller.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedReseller(reseller)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{reseller.shop_name}</h4>
                      <p className="text-sm text-gray-600">{reseller.contact_person}</p>
                    </div>
                    {getStatusBadge(connectionStatus[reseller.id])}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>هیچ نماینده‌ای یافت نشد</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ارسال پیام */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              ارسال پیام
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReseller ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">پیام برای:</h4>
                  <p className="text-blue-700">{selectedReseller.shop_name}</p>
                  <p className="text-sm text-blue-600">{selectedReseller.contact_person}</p>
                  <div className="mt-2">
                    {getStatusBadge(connectionStatus[selectedReseller.id])}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">متن پیام:</label>
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="min-h-32"
                    disabled={sending}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {messageText.length}/1000 کاراکتر
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded"
                    disabled={sending}
                  />
                  <label htmlFor="urgent" className="text-sm">
                    پیام فوری (🚨 اضافه می‌شود)
                  </label>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending || connectionStatus[selectedReseller.id] !== 'connected'}
                  className="w-full"
                >
                  {sending ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      ارسال پیام
                    </>
                  )}
                </Button>

                {connectionStatus[selectedReseller.id] !== 'connected' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ این نماینده به تلگرام متصل نیست. پیام ارسال نمی‌شود.
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      برای اتصال، نماینده باید ربات تلگرام را استارت کند.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>نماینده‌ای را برای ارسال پیام انتخاب کنید</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* آمار کلی */}
      <Card>
        <CardHeader>
          <CardTitle>آمار اتصالات تلگرام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {resellers.length}
              </div>
              <div className="text-sm text-gray-600">کل نمایندگان</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(connectionStatus).filter(status => status === 'connected').length}
              </div>
              <div className="text-sm text-gray-600">متصل شده</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(connectionStatus).filter(status => status === 'disconnected').length}
              </div>
              <div className="text-sm text-gray-600">قطع شده</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {resellers.length > 0 ? Math.round((Object.values(connectionStatus).filter(status => status === 'connected').length / resellers.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">نرخ اتصال</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}