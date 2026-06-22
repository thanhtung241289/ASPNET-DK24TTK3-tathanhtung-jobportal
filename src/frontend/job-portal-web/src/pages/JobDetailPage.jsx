import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DollarSign, Briefcase, Layers, Users, Calendar } from "lucide-react";
import { jobApi } from "../services/jobApi";
import {
  translateJobLevel,
  translateWorkType,
  formatTextToHtml,
} from "../utils/translators";
import { useToast } from "../contexts/ToastContext";

const JobDetailPage = () => {
  const { id } = useParams(); // Lấy mã Job Id từ thanh URL
  const { showToast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // States quản lý trạng thái mở Modal Ứng tuyển và nộp đơn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper helper to get static file URLs
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const data = await jobApi.getJobDetail(id);
        setJob(data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết công việc:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetail();
  }, [id]);

  // Xử lý khi nhấn nút "Ứng tuyển ngay" -> Mở Modal chọn CV
  const handleOpenApplyModal = async () => {
    setIsModalOpen(true);
    try {
      // Gọi API lấy kho CV đã tải lên của ứng viên
      const resumeList = await jobApi.getMyResumes();
      setResumes(resumeList || []);
      // Tự động chọn CV mặc định nếu có
      const defaultResume = resumeList.find((r) => r.isDefault);
      if (defaultResume) setSelectedResumeId(defaultResume.id);
    } catch (error) {
      console.error(
        "Không thể lấy danh sách CV. Bạn đã đăng nhập chưa?",
        error,
      );
    }
  };

  // Xử lý gửi đơn ứng tuyển vật lý xuống API Backend
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      showToast("Vui lòng chọn một file CV để ứng tuyển!", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await jobApi.applyJob({ jobId: id, resumeId: selectedResumeId });
      showToast(
        "Nộp đơn ứng tuyển thành công! Nhà tuyển dụng đã nhận được CV của bạn.",
        "success",
      );
      setIsModalOpen(false);
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Ứng tuyển thất bại. Vui lòng thử lại!";
      showToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">Đang tải chi tiết công việc...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">
          Không tìm thấy thông tin công việc!
        </h2>
        <Link
          to="/jobs"
          className="text-primary-600 hover:underline mt-4 inline-block"
        >
          Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      {/* --- BANNER ĐẦU TRANG CHI TIẾT --- */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 animate-fade-in">
        <div className="flex gap-5 items-center">
          {job.company ? (
            <Link
              to={`/companies/${job.company.id}`}
              className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 hover:border-primary-300 transition-colors"
            >
              {job.company.logoUrl ? (
                <img
                  src={getFullUrl(job.company.logoUrl)}
                  alt={job.company.companyName}
                  className="object-contain w-full h-full p-1"
                />
              ) : (
                <span className="text-3xl font-bold text-primary-500">
                  {job.company.companyName?.charAt(0)}
                </span>
              )}
            </Link>
          ) : (
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="text-3xl font-bold text-slate-400">?</span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              {job.title}
            </h1>
            {job.company ? (
              <Link
                to={`/companies/${job.company.id}`}
                className="text-lg text-primary-600 font-semibold hover:underline"
              >
                {job.company.companyName}
              </Link>
            ) : (
              <span className="text-lg text-slate-500 font-medium">
                Doanh nghiệp ẩn danh
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleOpenApplyModal}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-sm active:scale-95 w-full md:w-auto text-center cursor-pointer"
        >
          Ứng tuyển ngay
        </button>
      </div>

      {/* --- BỐ CỤC 2 CỘT NỘI DUNG CHI TIẾT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-slide-up">
        {/* Cột trái: Nội dung chi tiết công việc (70%) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-primary-500 pl-3 mb-4">
                Mô tả công việc
              </h2>
              <div
                className="text-slate-700 leading-relaxed space-y-2 prose"
                dangerouslySetInnerHTML={{
                  __html: formatTextToHtml(job.description),
                }}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-primary-500 pl-3 mb-4">
                Yêu cầu công việc
              </h2>
              <div
                className="text-slate-700 leading-relaxed space-y-2 prose"
                dangerouslySetInnerHTML={{
                  __html: formatTextToHtml(job.requirements),
                }}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-primary-500 pl-3 mb-4">
                Quyền lợi đãi ngộ
              </h2>
              <div
                className="text-slate-700 leading-relaxed space-y-2 prose"
                dangerouslySetInnerHTML={{
                  __html: formatTextToHtml(job.benefits),
                }}
              />
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin tổng hợp & Công ty (30%) */}
        <div className="space-y-6">
          {/* Hộp thông tin chung */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Thông tin chung
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  Mức lương
                </span>
                <span className="font-bold text-emerald-600">
                  {job.isNegotiable
                    ? "Thỏa thuận"
                    : `${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} VND`}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  Hình thức
                </span>
                <span className="font-bold text-slate-800">
                  {translateWorkType(job.workType)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  Cấp bậc
                </span>
                <span className="font-bold text-slate-800">
                  {translateJobLevel(job.jobLevel)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  Số lượng
                </span>
                <span className="font-bold text-slate-800">
                  {job.quantity} người
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Hạn nộp
                </span>
                <span className="font-bold text-rose-500">
                  {new Date(job.expirationDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Kỹ năng yêu cầu */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-2.5">
                Kỹ năng yêu cầu:
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((s) => (
                  <span
                    key={s.id}
                    className="bg-primary-50 text-primary-600 text-xs px-2.5 py-1 rounded-md font-medium"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- QUICK APPLY POP-UP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface w-full max-w-md p-6 rounded-2xl shadow-card-hover border border-gray-100 relative animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ứng tuyển vị trí này
            </h3>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn CV của bạn:
                </label>
                {resumes.length === 0 ? (
                  <div className="text-sm text-gray-500 py-3 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    Bạn chưa tải lên CV nào. <br />
                    <Link
                      to="/profile"
                      className="text-primary-600 font-semibold hover:underline"
                    >
                      Đến trang cá nhân để thêm CV
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  >
                    <option value="">-- Chọn CV đính kèm --</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fileName} {r.isDefault ? "(Mặc định)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || resumes.length === 0}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Đang gửi..." : "Nộp đơn ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
