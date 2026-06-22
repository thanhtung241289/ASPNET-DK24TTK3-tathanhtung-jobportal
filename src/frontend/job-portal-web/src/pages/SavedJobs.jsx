// File: src/pages/SavedJobs.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { profileApi } from "../services/profileApi";
import { useToast } from "../contexts/ToastContext";
import {
  Heart,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  translateJobLevel,
  translateWorkType,
  formatSalary,
} from "../utils/translators";

const SavedJobs = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getSavedJobs();
      setSavedJobs(data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách việc làm đã lưu:", error);
      showToast("Không thể tải danh sách việc làm đã lưu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const handleUnsave = async (jobId, e) => {
    e.preventDefault(); // Tránh kích hoạt Link bọc ngoài
    e.stopPropagation();

    try {
      await profileApi.unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
      showToast("Đã bỏ lưu việc làm.", "info");
      window.dispatchEvent(new Event("bookmarksChanged"));
    } catch (error) {
      showToast("Không thể bỏ lưu việc làm. Vui lòng thử lại.", "error");
    }
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-slate-50 min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen py-10">
      <div className="container-custom max-w-6xl">
        {/* Header Breadcrumb & Title */}
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
          <Link to="/" className="hover:text-primary-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-medium">Việc làm đã lưu</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Heart
              className="text-rose-500 fill-rose-500 animate-pulse"
              size={32}
            />
            Việc làm đã lưu của bạn
          </h1>
          <p className="text-slate-500 mt-2">
            Xem và quản lý danh sách các việc làm bạn đã lưu lại để ứng tuyển
            sau.
          </p>
        </div>

        {savedJobs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-12 text-center max-w-2xl mx-auto mt-8">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <Heart size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Danh sách lưu trống
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Bạn chưa lưu bất kỳ công việc nào. Khám phá hàng ngàn cơ hội việc
              làm IT hấp dẫn ngay hôm nay.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Search size={18} />
              Tìm việc ngay
            </Link>
          </div>
        ) : (
          /* Jobs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="group relative bg-white rounded-2xl border border-slate-100 hover:border-primary-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col p-6 overflow-hidden"
              >
                {/* Header Card */}
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 p-2 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {job.logoUrl ? (
                      <img
                        src={getFullUrl(job.logoUrl)}
                        alt={job.companyName}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.target.src = "";
                        }}
                      />
                    ) : (
                      <Building2 className="text-slate-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors leading-snug line-clamp-1">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-sm font-semibold text-slate-600 mt-0.5 line-clamp-1">
                      {job.companyName}
                    </p>
                  </div>

                  {/* Button Unsave */}
                  <button
                    onClick={(e) => handleUnsave(job.id, e)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors duration-200 border border-transparent hover:border-rose-100"
                    title="Bỏ lưu"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Info Badges */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mb-5 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500" />
                    <span className="font-medium text-slate-700">
                      {formatSalary(job)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="truncate">
                      {job.locationName || "Toàn quốc"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Briefcase size={16} className="text-slate-400" />
                    <span>
                      {translateJobLevel(job.jobLevel)} •{" "}
                      {translateWorkType(job.workType)}
                    </span>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="mt-auto pt-4 border-t border-slate-100/80 flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    Hạn nộp:{" "}
                    {new Date(job.expirationDate).toLocaleDateString("vi-VN")}
                  </span>

                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-bold group/link"
                  >
                    Chi tiết
                    <ChevronRight
                      size={14}
                      className="transform group-hover/link:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
