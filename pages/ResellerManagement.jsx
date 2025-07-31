import React, { useState, useEffect } from "react";
import { Reseller } from "@/api/entities";
import { Task } from "@/api/entities";
import { Agent } from "@/api/entities";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Phone, MessageCircle, TrendingUp, TrendingDown, AlertTriangle, Eye, Target, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import ResellerForm from "../components/reseller/ResellerForm";
import ResellerDetails from "../components/reseller/ResellerDetails";
import QuickTaskForm from "../components/reseller/QuickTaskForm";

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

export default function ResellerManagement() {
  const [allResellers, setAllResellers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder, itemsPerPage]);

  const loadData = async () => {
    try {
      const [resellerData, taskData, agentData] = await Promise.all([
        Reseller.list(),
        Task.list(),
        Agent.list()
      ]);
      setAllResellers(resellerData);
      setTasks(taskData);
      setAgents(agentData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReseller = async (resellerData) => {
    try {
      await Reseller.create(resellerData);
      setShowAddForm(false);
      loadData();
      if (window.showNotification) {
        window.showNotification('success', 'نماینده اضافه شد', 'نماینده جدید با موفقیت اضافه شد.');
      }
    } catch (error) {
      console.error("Error adding reseller:", error);
      if (window.showNotification) {
        window.showNotification('error', 'خطا در اضافه کردن', 'لطفاً دوباره تلاش کنید.');
      }
    }
  };

  const handleViewDetails = (reseller) => {
    setSelectedReseller(reseller);
    setShowDetails(true);
  };

  const handleCreateTask = (reseller) => {
    setSelectedReseller(reseller);
    setShowTaskForm(true);
  };

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    setSelectedReseller(null);
    if (window.showNotification) {
      window.showNotification('success', 'وظیفه ایجاد شد', 'وظیفه جدید با موفقیت ایجاد شد.');
    }
  };

  // Filter and sort logic
  const filteredAndSortedResellers = React.useMemo(() => {
    let filtered = allResellers.filter(reseller => {
      const matchesSearch = reseller.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reseller.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reseller.admin_username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || reseller.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'shop_name':
          aValue = a.shop_name.toLowerCase();
          bValue = b.shop_name.toLowerCase();
          break;
        case 'contact_person':
          aValue = a.contact_person?.toLowerCase() || '';
          bValue = b.contact_person?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created_date':
          aValue = new Date(a.created_date);
          bValue = new Date(b.created_date);
          break;
        case 'tasks_count':
          aValue = getResellerTasks(a.id).length;
          bValue = getResellerTasks(b.id).length;
          break;
        case 'completion_rate':
          const aCompleted = getResellerTasks(a.id).filter(t => t.status === 'completed').length;
          const aTotal = getResellerTasks(a.id).length;
          const bCompleted = getResellerTasks(b.id).filter(t => t.status === 'completed').length;
          const bTotal = getResellerTasks(b.id).length;
          aValue = aTotal > 0 ? (aCompleted / aTotal) : 0;
          bValue = bTotal > 0 ? (bCompleted / bTotal) : 0;
          break;
        default:
          aValue = a.created_date;
          bValue = b.created_date;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allResellers, searchTerm, statusFilter, sortBy, sortOrder, tasks]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedResellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResellers = filteredAndSortedResellers.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'lapsed': return 'bg-yellow-100 text-yellow-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4" />;
      case 'inactive': return <TrendingDown className="w-4 h-4" />;
      case 'lapsed': return <AlertTriangle className="w-4 h-4" />;
      case 'new': return <Plus className="w-4 h-4" />;
      default: return null;
    }
  };

  const getResellerTasks = (resellerId) => {
    return tasks.filter(task => task.reseller_id === resellerId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">مدیریت نمایندگان</h1>
          <p className="text-gray-600 mt-1">
            مدیریت و نظارت بر نمایندگان فروش 
            <span className="font-medium text-indigo-600 mr-2">
              ({filteredAndSortedResellers.length} از {allResellers.length})
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          افزودن نماینده
        </button>
      </motion.div>

      {/* فیلترها و مرتب‌سازی */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* جستجو */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام فروشگاه، شخص مسئول یا نام کاربری..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* فیلتر وضعیت */}
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="lapsed">کاهش یافته</option>
              <option value="new">جدید</option>
            </select>
          </div>

          {/* مرتب‌سازی */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="created_date">تاریخ ایجاد</option>
              <option value="shop_name">نام فروشگاه</option>
              <option value="contact_person">شخص مسئول</option>
              <option value="status">وضعیت</option>
              <option value="tasks_count">تعداد وظایف</option>
              <option value="completion_rate">نرخ تکمیل</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={sortOrder === 'asc' ? 'صعودی' : 'نزولی'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* تنظیمات صفحه‌بندی */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">نمایش:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">مورد در صفحه</span>
        </div>
        
        <div className="text-sm text-gray-600">
          نمایش {startIndex + 1} تا {Math.min(endIndex, filteredAndSortedResellers.length)} از {filteredAndSortedResellers.length} مورد
        </div>
      </div>

      {/* لیست نمایندگان */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentResellers.map((reseller, index) => {
          const resellerTasks = getResellerTasks(reseller.id);
          const completedTasks = resellerTasks.filter(t => t.status === 'completed').length;
          const globalIndex = startIndex + index;
          
          return (
            <motion.div
              key={reseller.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      #{globalIndex + 1}
                    </span>
                    {reseller.is_profile_incomplete && (
                      <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        نیاز به تکمیل
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{reseller.shop_name}</h3>
                  <p className="text-gray-600">{reseller.contact_person}</p>
                  {reseller.admin_username && (
                    <p className="text-xs text-gray-500 mt-1">
                      نام کاربری: {reseller.admin_username}
                    </p>
                  )}
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reseller.status)}`}>
                  {getStatusIcon(reseller.status)}
                  <span>{reseller.status === 'active' ? 'فعال' : 
                         reseller.status === 'inactive' ? 'غیرفعال' :
                         reseller.status === 'lapsed' ? 'کاهش یافته' : 'جدید'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">کل وظایف:</span>
                    <span className="font-medium">{resellerTasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">تکمیل شده:</span>
                    <span className="font-medium text-green-600">{completedTasks}</span>
                  </div>
                </div>
                
                {resellerTasks.length > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedTasks / resellerTasks.length) * 100}%` }}
                    ></div>
                  </div>
                )}

                {reseller.psychological_profile && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">کانال ارتباطی:</span>
                    <span className="flex items-center gap-1">
                      {reseller.psychological_profile.preferredCommunicationChannel === 'telegram' ? 
                        <MessageCircle className="w-4 h-4 text-blue-500" /> : 
                        <Phone className="w-4 h-4 text-green-500" />}
                      <span className="text-xs">
                        {reseller.psychological_profile.preferredCommunicationChannel === 'telegram' ? 'تلگرام' : 'تلفن'}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {reseller.sales_history && reseller.sales_history.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">آخرین فروش:</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">هفته {reseller.sales_history[0]?.week}</span>
                    <span className="text-sm font-medium">
                      {reseller.sales_history[0]?.salesAmount?.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => handleViewDetails(reseller)}
                  className="flex-1 bg-indigo-50 text-indigo-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  مشاهده جزئیات
                </button>
                <button 
                  onClick={() => handleCreateTask(reseller)}
                  className="bg-gray-50 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  ایجاد وظیفه
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* پیام عدم وجود نتیجه */}
      {filteredAndSortedResellers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">نماینده‌ای یافت نشد</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'نماینده‌ای با این مشخصات یافت نشد. فیلترها را تغییر دهید یا نماینده جدید اضافه کنید.'
              : 'هنوز نماینده‌ای اضافه نشده است. اولین نماینده را اضافه کنید.'}
          </p>
        </motion.div>
      )}

      {/* صفحه‌بندی */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <div className="flex gap-1">
              {generatePageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            صفحه {currentPage} از {totalPages}
          </div>
        </motion.div>
      )}

      {/* فرم اضافه کردن نماینده */}
      {showAddForm && (
        <ResellerForm
          onSubmit={handleAddReseller}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* نمایش جزئیات نماینده */}
      {showDetails && selectedReseller && (
        <ResellerDetails
          reseller={selectedReseller}
          tasks={getResellerTasks(selectedReseller.id)}
          onClose={() => setShowDetails(false)}
        />
      )}

      {/* فرم ایجاد وظیفه سریع */}
      {showTaskForm && selectedReseller && (
        <QuickTaskForm
          reseller={selectedReseller}
          agents={agents}
          onSubmit={handleTaskCreated}
          onCancel={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
}