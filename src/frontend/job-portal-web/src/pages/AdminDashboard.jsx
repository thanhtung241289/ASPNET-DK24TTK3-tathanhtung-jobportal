// File: src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { adminApi } from "../services/adminApi";
import { useToast } from "../contexts/ToastContext";

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // States quản lý hộp thoại từ chối kèm lý do vật lý
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Hàm tải danh sách bài viết chờ duyệt
  const loadPendingJobs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPendingJobs();
      setPendingJobs(data || []);
    } catch (error) {
      console.error("Lỗi khi tải hàng đợi kiểm duyệt:", error);
    }
    {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingJobs();
  }, []);

  // Xử lý PHÊ DUYỆT TIN (Approve)
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
      setPendingJobs((prev) => prev.filter((job) => job.id !== jobId)); // Xóa nhanh khỏi danh sách hiển thị
    } catch (error) {
      showToast("Phê duyệt thất bại. Vui lòng thử lại!", "error");
    }
  };

  // Kích hoạt Modal từ chối
  const handleOpenRejectModal = (jobId) => {
    setSelectedJobId(jobId);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Xử lý XÁC NHẬN TỪ CHỐI TIN (Reject) kèm lý do bắt buộc
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">
          Đang tải hàng đợi kiểm duyệt...
        </p>
      </div>
    );
  }

  return (
    <div className="container-custom py-10 flex flex-col gap-6">
      {/* Tiêu đề trang quản trị */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Hàng đợi kiểm duyệt chiến dịch
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Hệ thống xét duyệt chất lượng thông tin tin đăng tuyển dụng của các
          doanh nghiệp.
        </p>
      </div>

      {/* Danh sách bài đăng cần xử lý */}
      {pendingJobs.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-gray-100 shadow-card max-w-2xl mx-auto w-full animate-fade-in">
          <span className="text-4xl">🎉</span>
          <p className="text-gray-500 font-semibold text-lg mt-3">
            Hàng đợi trống rỗng!
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Toàn bộ các bài đăng tuyển dụng trên hệ thống đã được xử lý sạch sẽ.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 animate-slide-up">
          {pendingJobs.map((job) => (
            <div
              key={job.id}
              className="bg-surface border border-gray-100 shadow-card rounded-2xl p-6 flex flex-col lg:flex-row justify-between gap-6"
            >
              {/* Cột trái: Nội dung tóm tắt bài đăng */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-100 animate-pulse-slow">
                    Chờ kiểm duyệt
                  </span>
                  <span className="text-gray-400 text-xs">
                    ID: {job.id.substring(0, 8)}...
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {job.title}
                </h2>
                <p className="text-sm text-primary-600 font-semibold">
                  {job.companyName || "Công ty thành viên"}
                </p>

                {/* Chi tiết nội dung thô */}
                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 space-y-2 max-h-40 overflow-y-auto border border-gray-200">
                  <p>
                    <strong>Mô tả:</strong>{" "}
                    {job.description?.replace(/<[^>]*>/g, "").substring(0, 200)}
                    ...
                  </p>
                  <p>
                    <strong>Yêu cầu:</strong>{" "}
                    {job.requirements
                      ?.replace(/<[^>]*>/g, "")
                      .substring(0, 200)}
                    ...
                  </p>
                </div>
              </div>

              {/* Cột phải: Cụm nút bấm phê duyệt/từ chối */}
              <div className="flex lg:flex-col justify-end items-center lg:items-end gap-3 border-t lg:border-t-0 border-gray-100 pt-4 lg:pt-0 flex-shrink-0">
                <button
                  onClick={() => handleApprove(job.id)}
                  className="bg-success-600 hover:bg-success-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-sm cursor-pointer active:scale-95 w-full lg:w-40 text-center"
                >
                  Phê Duyệt ✓
                </button>
                <button
                  onClick={() => handleOpenRejectModal(job.id)}
                  className="bg-danger-50 hover:bg-danger-100 text-danger-600 font-bold text-sm px-5 py-3 rounded-xl transition-colors border border-danger-200 cursor-pointer active:scale-95 w-full lg:w-40 text-center"
                >
                  Từ Chối ✗
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- REJECT PROMPT MODAL (Bắt buộc nhập lý do) --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface w-full max-w-md p-6 rounded-2xl shadow-card-hover border border-gray-100 relative animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Lý do từ chối bài đăng
            </h3>
            <p className="text-xs text-gray-400 mb-4">
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-danger-500 focus:bg-white transition-all"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-danger-600 hover:bg-danger-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
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
