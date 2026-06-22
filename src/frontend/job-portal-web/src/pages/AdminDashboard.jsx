// File: src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { adminApi } from "../services/adminApi";
import { masterDataApi } from "../services/masterDataApi";
import { useToast } from "../contexts/ToastContext";

const AdminDashboard = () => {
  const { showToast } = useToast();

  // Tabs management
  const [activeTab, setActiveTab] = useState("jobs"); // "jobs" | "categories"

  // 1. States for Jobs Approval
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // 2. States for Categories Management
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Category Edit state
  const [editingCategory, setEditingCategory] = useState(null); // { id, name }
  const [editCategoryName, setEditCategoryName] = useState("");
  const [updatingCategory, setUpdatingCategory] = useState(false);

  // Load Pending Jobs
  const loadPendingJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await adminApi.getPendingJobs();
      setPendingJobs(data || []);
    } catch (error) {
      console.error("Lỗi khi tải hàng đợi kiểm duyệt:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Load Categories
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await masterDataApi.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách ngành nghề:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadPendingJobs();
  }, []);

  // Approve Job Post
  const handleApprove = async (jobId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn phê duyệt và xuất bản tin tuyển dụng này công khai không?",
      )
    )
      return;

    try {
      await adminApi.reviewJob(jobId, { status: "Approved", reason: "" });
      showToast("Đã phê duyệt và xuất bản tin thành công!", "success");
      setPendingJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      showToast("Phê duyệt thất bại. Vui lòng thử lại!", "error");
    }
  };

  // Open Reject Modal
  const handleOpenRejectModal = (jobId) => {
    setSelectedJobId(jobId);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Confirm Reject
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      showToast(
        "Bắt buộc phải nhập lý do từ chối để phản hồi cho doanh nghiệp!",
        "warning",
      );
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.reviewJob(selectedJobId, {
        status: "Rejected",
        reason: rejectReason.trim(),
      });
      showToast(
        "Đã từ chối bài viết và gửi phản hồi lý do thành công.",
        "success",
      );
      setPendingJobs((prev) => prev.filter((job) => job.id !== selectedJobId));
      setIsRejectModalOpen(false);
    } catch (error) {
      showToast("Gửi yêu cầu từ chối thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast("Vui lòng nhập tên ngành nghề!", "warning");
      return;
    }

    setCreatingCategory(true);
    try {
      const created = await adminApi.createCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, created]);
      setNewCategoryName("");
      showToast(`Đã tạo ngành nghề "${created.name}" thành công!`, "success");
    } catch (error) {
      // toast toàn cục trong axiosClient đã tự bắt và hiển thị thân thiện,
      // ở đây chỉ log và dọn trạng thái.
      console.error("Lỗi khi tạo ngành nghề:", error);
    } finally {
      setCreatingCategory(false);
    }
  };

  // Start Edit Category
  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
  };

  // Cancel Edit
  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName("");
  };

  // Update Category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryName.trim()) {
      showToast("Tên ngành nghề không được để trống!", "warning");
      return;
    }

    setUpdatingCategory(true);
    try {
      const updated = await adminApi.updateCategory(
        editingCategory.id,
        editCategoryName.trim(),
      );
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? updated : c)),
      );
      setEditingCategory(null);
      setEditCategoryName("");
      showToast("Cập nhật ngành nghề thành công!", "success");
    } catch (error) {
      console.error("Lỗi khi cập nhật ngành nghề:", error);
    } finally {
      setUpdatingCategory(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId, catName) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ngành nghề "${catName}" không?`,
      )
    ) {
      return;
    }

    try {
      await adminApi.deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      showToast("Xóa ngành nghề thành công!", "success");
    } catch (error) {
      // Axios interceptor đã xử lý lỗi (ví dụ lỗi 400 do có tin đang tham chiếu)
      console.error("Lỗi khi xóa ngành nghề:", error);
    }
  };

  return (
    <div className="container-custom py-10 flex flex-col gap-6">
      {/* Tiêu đề trang quản trị */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Trang Quản Trị Hệ Thống (Admin Portal)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị viên kiểm duyệt tin tuyển dụng của doanh nghiệp và thiết
            lập các thông số hệ thống.
          </p>
        </div>
      </div>

      {/* Tabs thanh lịch */}
      <div className="flex border-b border-slate-200 gap-1 bg-slate-50/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === "jobs"
              ? "bg-white text-amber-600 shadow-sm border border-slate-100"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
          }`}
        >
          <span>📋</span> Hàng đợi duyệt bài ({pendingJobs.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("categories");
            loadCategories();
          }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === "categories"
              ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
          }`}
        >
          <span>📁</span> Quản lý ngành nghề ({categories.length})
        </button>
      </div>

      {/* TAB 1: DUYỆT BÀI ĐĂNG */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          {loadingJobs ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm font-medium">
                Đang tải hàng đợi kiểm duyệt...
              </p>
            </div>
          ) : pendingJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto w-full animate-fade-in flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">🎉</span>
              <p className="text-slate-600 font-bold text-lg">
                Hàng đợi trống rỗng!
              </p>
              <p className="text-slate-400 text-xs max-w-xs">
                Toàn bộ các bài đăng tuyển dụng trên hệ thống đã được xử lý sạch
                sẽ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 animate-slide-up">
              {pendingJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-100 shadow-sm hover:shadow-md rounded-2xl p-5 flex flex-col lg:flex-row justify-between gap-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />

                  {/* Cột trái: Nội dung tóm tắt bài đăng */}
                  <div className="flex-1 space-y-3 pl-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-100">
                        Chờ kiểm duyệt
                      </span>
                      <span className="text-slate-400 text-xs">
                        Đăng lúc:{" "}
                        {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {job.title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <span className="text-primary-600">
                        🏢 {job.companyName || "Doanh nghiệp ẩn danh"}
                      </span>
                      <span>📂 {job.categoryName}</span>
                      <span className="text-rose-500">
                        ⏳ Hạn nộp:{" "}
                        {new Date(job.expirationDate).toLocaleDateString(
                          "vi-VN",
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Cột phải: Cụm nút bấm phê duyệt/từ chối */}
                  <div className="flex lg:flex-col justify-end items-center lg:items-end gap-3 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(job.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 w-full lg:w-36 text-center cursor-pointer"
                    >
                      Phê Duyệt ✓
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(job.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-5 py-2.5 rounded-xl transition-all border border-rose-200 active:scale-95 w-full lg:w-36 text-center cursor-pointer"
                    >
                      Từ Chối ✗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUẢN LÝ NGÀNH NGHỀ */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
          {/* Cột 1: Form Thêm mới / Cập nhật */}
          <div className="lg:col-span-1 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
              {editingCategory ? "Cập nhật ngành nghề" : "Thêm ngành nghề mới"}
            </h2>

            {editingCategory ? (
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Tên ngành nghề hiện tại
                  </label>
                  <input
                    type="text"
                    required
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    placeholder="Ví dụ: Công nghệ thông tin..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={cancelEditCategory}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={updatingCategory}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {updatingCategory ? "Đang lưu..." : "Cập nhật"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Tên ngành nghề
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ví dụ: Du lịch / Nhà hàng..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/15"
                >
                  {creatingCategory ? "Đang tạo..." : "Thêm Ngành Nghề"}
                </button>
              </form>
            )}
          </div>

          {/* Cột 2 & 3: Danh sách Ngành nghề */}
          <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <h2 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-6">
              Danh sách ngành nghề hiện có
            </h2>

            {loadingCategories ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-xs">
                  Đang tải danh sách ngành nghề...
                </p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Chưa có ngành nghề nào được lưu trong hệ thống.
              </div>
            ) : (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                      <th className="py-3.5 px-4 w-16">ID</th>
                      <th className="py-3.5 px-4">Tên ngành nghề</th>
                      <th className="py-3.5 px-4 w-28 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-semibold">
                    {categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                          {cat.id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-950 font-bold">
                          {cat.name}
                        </td>
                        <td className="py-3.5 px-4 text-right flex justify-end gap-2.5">
                          <button
                            onClick={() => startEditCategory(cat)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCategory(cat.id, cat.name)
                            }
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- REJECT PROMPT MODAL (Bắt buộc nhập lý do) --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg border border-slate-100 relative animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Lý do từ chối bài đăng
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-semibold">
              Nội dung này sẽ hiển thị trực tiếp cho Nhà tuyển dụng để họ biết
              đường chỉnh sửa lại thông tin.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <textarea
                  rows="4"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Nội dung tuyển dụng chứa thông tin liên hệ cá nhân bên ngoài / Sai lệch thông tin mức lương đề xuất..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all outline-none"
                ></textarea>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
