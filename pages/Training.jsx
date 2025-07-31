
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Play, FileText, Video, ExternalLink, 
    Search, Filter, Star, Clock, Users, 
    CheckCircle2, Download, Eye, ChevronRight,
    Lightbulb, Target, MessageCircle, Settings,
    Award, TrendingUp, Brain, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TRAINING_DATA = {
    guides: [
        {
            id: 'getting-started',
            title: 'راهنمای شروع سریع ClayTasks',
            description: 'آشنایی اولیه با محیط کاربری، داشبورد و میز کار برای شروع سریع فعالیت.',
            duration: '10 دقیقه',
            level: 'مبتدی',
            icon: Play,
            content: `
# راهنمای شروع سریع ClayTasks

## 1. ورود و آشنایی با داشبورد
- **داشبورد اصلی**: اولین صفحه‌ای که پس از ورود مشاهده می‌کنید، شامل آمار کلیدی عملکرد، آخرین فعالیت‌ها و وظایف فوری است.
- **آمار کلیدی**: معیارهایی مانند تعداد وظایف تکمیل شده، میانگین امتیاز و تعداد نمایندگان فعال را نمایش می‌دهد.

## 2. درک میز کار (Workbench)
- **قلب سیستم**: میز کار شما، مرکز اصلی برای انجام وظایف روزانه است.
- **کارت وظیفه**: هر وظیفه در یک کارت نمایش داده می‌شود که شامل اطلاعات نماینده، دلیل ایجاد وظیفه و راهکارهای پیشنهادی AI است.
- **تکمیل وظیفه**: پس از تعامل با نماینده، گزارش خود را از طریق فرم مربوطه ثبت کنید. امتیازدهی به اثربخشی پیشنهاد AI را فراموش نکنید.

## 3. مدیریت وظایف (Tasks Page)
- **نمای کلی**: در این بخش می‌توانید تمام وظایف (در انتظار، در حال انجام، تکمیل شده) را مشاهده کنید.
- **فیلتر و جستجو**: برای پیدا کردن وظایف خاص از فیلترها استفاده کنید.
- **نمای لیست و گرید**: بین دو حالت نمایش برای مدیریت بهتر جابجا شوید.

## 4. ارتباط با هوش مصنوعی
- **پیشنهادات AI**: در هر وظیفه، AI راهکارهایی را پیشنهاد می‌دهد. این راهکارها بر اساس تحلیل داده‌های قبلی است.
- **به چالش کشیدن AI**: اگر با پیشنهاد AI مخالفید، از گزینه "به چالش کشیدن" استفاده کرده و بازخورد خود را ثبت کنید. این کار به بهبود سیستم کمک می‌کند.
`
        },
        {
            id: 'effective-communication',
            title: 'ارتباط موثر با نمایندگان (ویژه ایران)',
            description: 'اصول و تکنیک‌های ارتباطی مبتنی بر فرهنگ ایرانی برای افزایش موفقیت در تعاملات.',
            duration: '15 دقیقه',
            level: 'متوسط',
            icon: MessageCircle,
            content: `
# ارتباط موثر با نمایندگان (مبتنی بر فرهنگ ایرانی)

## اصول کلیدی
1.  **احترام و تعارف**: همیشه مکالمه را با احترام و لحنی مودبانه آغاز کنید. استفاده از القاب "آقا" و "خانم" ضروری است.
2.  **ایجاد رابطه**: قبل از ورود به بحث اصلی، با یک احوالپرسی کوتاه و غیررسمی، رابطه شخصی ایجاد کنید. این کار اعتماد را افزایش می‌دهد.
3.  **ارتباط غیرمستقیم**: به جای دستور دادن مستقیم، از جملات پیشنهادی استفاده کنید. مثال: "به نظرم اگر این روش رو امتحان کنیم، نتیجه خوبی میگیریم."
4.  **صبر و پیگیری**: درک کنید که تصمیم‌گیری ممکن است زمان‌بر باشد. با صبر و حوصله پیگیری کنید و از فشار آوردن بپرهیزید.

## تکنیک‌های عملی
- **شروع مکالمه**: "سلام آقای/خانم [نام خانوادگی]، وقتتون بخیر. امیدوارم خوب باشید. تماس گرفتم که در مورد [موضوع] صحبتی داشته باشیم."
- **ارائه پیشنهاد**: به جای "باید این کار را بکنید", بگویید: "یک پیشنهادی داشتم که فکر می‌کنم به افزایش فروش شما کمک می‌کنه."
- **گوش دادن فعال**: به دغدغه‌های نماینده به دقت گوش دهید و نشان دهید که صحبت‌های او برای شما مهم است.
- **پایان مکالمه**: مکالمه را با یک جمع‌بندی کوتاه و تشکر از وقتی که گذاشته‌اند به پایان برسانید.
`
        },
        {
            id: 'using-ai-engine',
            title: 'استفاده از موتور هوشمند تولید وظیفه',
            description: 'نحوه کار با موتور تحلیل و تولید وظایف هوشمند برای هدف قرار دادن نمایندگان مناسب.',
            duration: '12 دقیقه',
            level: 'پیشرفته',
            icon: Brain,
            content: `
# استفاده از موتور هوشمند تولید وظیفه

## هدف
موتور هوشمند (Task Generator) به شما اجازه می‌دهد تا بر اساس داده‌های موجود، به صورت خودکار وظایف هدفمند برای نمایندگان ایجاد کنید.

## مراحل کار
1.  **انتخاب نمایندگان**: از لیست نمایندگان، یک یا چند نفر را برای تحلیل انتخاب کنید. می‌توانید نمایندگانی را انتخاب کنید که وضعیت خاصی دارند (مثلاً کاهش یافته یا جدید).
2.  **شروع تحلیل**: روی دکمه "تحلیل و تولید وظایف" کلیک کنید. سیستم شروع به پردازش داده‌های هر نماینده می‌کند.
    - **تحلیل ریسک**: سطح ریسک (ریزش) نماینده را مشخص می‌کند.
    - **نوع مداخله**: بهترین نوع وظیفه (پیگیری، تماس پیش‌دستانه و...) را پیشنهاد می‌دهد.
    - **نکات کلیدی**: دلایل اصلی پیشنهاد را به صورت خلاصه بیان می‌کند.
3.  **بررسی وظایف تولید شده**: پس از تحلیل، سیستم پیش‌نویس وظایف را نمایش می‌دهد. هر پیش‌نویس شامل:
    - دستورالعمل برای کارمند
    - زمینه و دلیل ایجاد وظیفه
    - راهکارهای عملی پیشنهادی
4.  **ذخیره وظایف**: پس از بررسی، با کلیک بر روی "ذخیره همه وظایف"، آن‌ها را به لیست وظایف کارمندان اضافه کنید.
`
        }
    ],
    categories: {
        system_basics: { title: 'اصول سیستم', icon: Settings, description: 'آموزش مبانی استفاده از ClayTasks' },
        task_management: { title: 'مدیریت وظایف', icon: CheckCircle2, description: 'ایجاد، مدیریت و پیگیری وظایف' },
        communication: { title: 'ارتباط مؤثر', icon: MessageCircle, description: 'تکنیک‌های ارتباط با نمایندگان' },
        ai_integration: { title: 'کار با AI', icon: Brain, description: 'بهره‌برداری از قابلیت‌های هوشمند' },
        performance: { title: 'بهبود عملکرد', icon: TrendingUp, description: 'راهکارهای افزایش بهره‌وری' }
    },
    resources: [
        {
            type: 'مستندات',
            title: 'مرجع کامل Entity Schema',
            description: 'توضیح تمام فیلدهای موجود در دیتابیس سیستم.',
            icon: FileText
        },
        {
            type: 'ویدئو',
            title: 'وبینار: افزایش فروش با ClayTasks',
            description: 'ویدئوی ضبط شده وبینار آموزشی با موضوع استراتژی‌های فروش.',
            icon: Video
        },
        {
            type: 'لینک خارجی',
            title: 'مقاله: روانشناسی فروش در ایران',
            description: 'یک مقاله تحلیلی از وبسایت معتبر در زمینه اصول مذاکره.',
            icon: ExternalLink
        }
    ]
};

export default function Training() {
    const [loading, setLoading] = useState(true);
    const [selectedContent, setSelectedContent] = useState(null);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleViewContent = (content) => {
        setSelectedContent(content);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-8">
            <Tabs defaultValue="guides" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
                    <TabsTrigger value="guides">راهنماهای سریع</TabsTrigger>
                    <TabsTrigger value="categories">دسته‌بندی‌ها</TabsTrigger>
                    <TabsTrigger value="resources">منابع بیشتر</TabsTrigger>
                    <TabsTrigger value="progress">پیشرفت من</TabsTrigger>
                </TabsList>

                {/* Quick Guides */}
                <TabsContent value="guides">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {TRAINING_DATA.guides.map((guide) => {
                            const Icon = guide.icon;
                            return (
                                <motion.div key={guide.id} whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}>
                                    <Card className="h-full flex flex-col cursor-pointer" onClick={() => handleViewContent(guide)}>
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                    <Icon className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <CardTitle className="flex-1">{guide.title}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col">
                                            <p className="text-gray-600 mb-4 flex-1">{guide.description}</p>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <Badge variant="outline">{guide.level}</Badge>
                                                <div className="flex items-center gap-1"><Clock className="w-4 h-4"/>{guide.duration}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Categories */}
                <TabsContent value="categories">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {Object.entries(TRAINING_DATA.categories).map(([key, category]) => {
                            const Icon = category.icon;
                            return (
                                <Card key={key} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold">{category.title}</h3>
                                        </div>
                                        <p className="text-gray-600 mb-4">{category.description}</p>
                                        <Button variant="outline" className="w-full">مشاهده</Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Additional Resources */}
                <TabsContent value="resources">
                    <div className="space-y-4 mt-6">
                        {TRAINING_DATA.resources.map((resource, index) => {
                             const Icon = resource.icon;
                            return (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{resource.title} <Badge variant="secondary">{resource.type}</Badge></p>
                                                <p className="text-sm text-gray-600">{resource.description}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon"><ChevronRight/></Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>

                {/* My Progress */}
                 <TabsContent value="progress">
                    <div className="mt-6 text-center bg-white p-8 rounded-lg shadow-md">
                        <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold">بخش پیشرفت به زودی...</h3>
                        <p className="text-gray-600 mt-2">در این بخش می‌توانید دستاوردها و پیشرفت آموزشی خود را مشاهده کنید.</p>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Content Viewer Modal */}
            <AnimatePresence>
            {selectedContent && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                    >
                        <header className="p-4 sm:p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{selectedContent.title}</h2>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedContent(null)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </header>
                        <main className="p-4 sm:p-6 overflow-y-auto">
                            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: selectedContent.content.replace(/\n/g, '<br />').replace(/## (.*)/g, '<h2>$1</h2>') }}>
                            </div>
                        </main>
                        <footer className="p-4 bg-gray-50 border-t flex justify-end">
                             <Button onClick={() => setSelectedContent(null)}>بستن</Button>
                        </footer>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>
        </div>
    );
}
