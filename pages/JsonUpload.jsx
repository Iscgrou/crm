import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { processWeeklySalesFile } from "@/api/functions";

export default function JsonUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setUploadResult(null);
    } else {
      if (window.showNotification) {
        window.showNotification('error', 'فرمت فایل نادرست', 'لطفاً فقط فایل‌های JSON انتخاب کنید');
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json') {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        if (window.showNotification) {
          window.showNotification('error', 'فرمت فایل نادرست', 'لطفاً فقط فایل‌های JSON انتخاب کنید');
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      if (window.showNotification) {
        window.showNotification('error', 'خطا', 'لطفاً ابتدا فایل را انتخاب کنید');
      }
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data, status } = await processWeeklySalesFile(formData);
      
      if (data.success) {
        setUploadResult(data);
        if (window.showNotification) {
          window.showNotification('success', 'آپلود موفق', 
            `${data.processed_records} رکورد پردازش شد. ${data.new_resellers} نماینده جدید اضافه شد.`);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (window.showNotification) {
        window.showNotification('error', 'خطا در آپلود', error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadResult(null);
    document.getElementById('file-input').value = '';
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
            <Upload className="w-8 h-8 text-indigo-600" />
            ورود فایل فروش هفتگی
          </h1>
          <p className="text-gray-600 mt-1">آپلود فایل JSON حاوی اطلاعات فروش نمایندگان</p>
        </div>
      </motion.div>

      {/* راهنمای فرمت فایل */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            راهنمای فرمت فایل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">ساختار مورد انتظار فایل JSON:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>۱۶ خط اول فایل حاوی اطلاعات header (نادیده گرفته می‌شود)</li>
              <li>بخش data شامل آرایه‌ای از اشیاء با فیلدهای: admin_username, total_transactions, total_invoice_amount</li>
              <li>admin_username: شناسه یکتای نماینده در سیستم خارجی</li>
              <li>total_transactions: تعداد تراکنش‌های هفتگی</li>
              <li>total_invoice_amount: مجموع مبلغ فروش هفتگی (تومان)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* منطقه آپلود فایل */}
      <Card>
        <CardHeader>
          <CardTitle>انتخاب فایل JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-indigo-400 bg-indigo-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {selectedFile ? selectedFile.name : 'فایل JSON خود را اینجا رها کنید یا کلیک کنید'}
                </p>
                <p className="text-sm text-gray-500">
                  حداکثر حجم فایل: ۱۰ مگابایت
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => document.getElementById('file-input').click()}
                  variant="outline"
                  disabled={uploading}
                >
                  انتخاب فایل
                </Button>
                {selectedFile && (
                  <Button
                    onClick={clearSelection}
                    variant="outline"
                    disabled={uploading}
                  >
                    حذف
                  </Button>
                )}
              </div>
            </div>
            <input
              id="file-input"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">
                      حجم: {(selectedFile.size / 1024).toFixed(2)} کیلوبایت
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      در حال پردازش...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      آپلود و پردازش
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* نتایج آپلود */}
      {uploadResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                نتیجه پردازش فایل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {uploadResult.processed_records}
                  </div>
                  <div className="text-sm text-gray-600">رکورد پردازش شده</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {uploadResult.new_resellers}
                  </div>
                  <div className="text-sm text-gray-600">نماینده جدید</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {uploadResult.week_number}
                  </div>
                  <div className="text-sm text-gray-600">هفته سال</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {uploadResult.year_number}
                  </div>
                  <div className="text-sm text-gray-600">سال</div>
                </div>
              </div>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    خطاهای رخ داده ({uploadResult.errors.length})
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {uploadResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700 mb-1">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ فایل با موفقیت پردازش شد. اطلاعات فروش هفتگی نمایندگان بروزرسانی گردید.
                </p>
                {uploadResult.new_resellers > 0 && (
                  <p className="text-sm text-orange-700 mt-1">
                    ⚠️ {uploadResult.new_resellers} نماینده جدید ایجاد شده‌اند که نیاز به تکمیل پروفایل دارند.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}