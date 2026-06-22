// File: src/components/JobCard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Layers,
  Heart,
  ArrowRight,
} from "lucide-react";
import {
  translateJobLevel,
  translateWorkType,
  formatSalary,
  formatTimeAgo,
} from "../utils/translators";
import { useAuth } from "../contexts/AuthContext";
import { profileApi } from "../services/profileApi";
import { useToast } from "../contexts/ToastContext";

const JobCard = ({ job, variant = "list", userSkills = null }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [logoError, setLogoError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

  useEffect(() => {
    const updateBookmarkState = () => {
      const bookmarked = JSON.parse(
        localStorage.getItem("bookmarkedJobs") || "[]",
      );
      setIsBookmarked(bookmarked.includes(job.id));
    };

    updateBookmarkState();
    window.addEventListener("bookmarksChanged", updateBookmarkState);

    return () => {
      window.removeEventListener("bookmarksChanged", updateBookmarkState);
    };
  }, [job.id]);

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (user && user.role === "Seeker") {
      try {
        if (isBookmarked) {
          await profileApi.unsaveJob(job.id);
          setIsBookmarked(false);
          const bookmarked = JSON.parse(
            localStorage.getItem("bookmarkedJobs") || "[]",
          );
          const updated = bookmarked.filter((id) => id !== job.id);
          localStorage.setItem("bookmarkedJobs", JSON.stringify(updated));
          showToast("Đã bỏ lưu việc làm.", "info");
        } else {
          await profileApi.saveJob(job.id);
          setIsBookmarked(true);
          const bookmarked = JSON.parse(
            localStorage.getItem("bookmarkedJobs") || "[]",
          );
          const updated = [...bookmarked, job.id];
          localStorage.setItem("bookmarkedJobs", JSON.stringify(updated));
          showToast("Lưu việc làm thành công!", "success");
        }
        window.dispatchEvent(new Event("bookmarksChanged"));
      } catch (error) {
        showToast(
          "Không thể cập nhật việc làm đã lưu. Vui lòng thử lại.",
          "error",
        );
      }
    } else {
      // Local fallback for guest users
      const bookmarked = JSON.parse(
        localStorage.getItem("bookmarkedJobs") || "[]",
      );
      let updated;
      if (bookmarked.includes(job.id)) {
        updated = bookmarked.filter((id) => id !== job.id);
        setIsBookmarked(false);
        showToast("Đã bỏ lưu việc làm.", "info");
      } else {
        updated = [...bookmarked, job.id];
        setIsBookmarked(true);
        showToast("Lưu việc làm thành công!", "success");
      }
      localStorage.setItem("bookmarkedJobs", JSON.stringify(updated));
      window.dispatchEvent(new Event("bookmarksChanged"));
    }
  };

  // Tính toán độ tương thích kỹ năng
  const jobSkills = job.skills
    ? job.skills.map((s) => s.name.toLowerCase().trim())
    : [];
  const candidateSkills = Array.isArray(userSkills)
    ? userSkills.map((s) => s.toLowerCase().trim())
    : typeof userSkills === "string"
      ? userSkills
          .split(",")
          .map((s) => s.toLowerCase().trim())
          .filter(Boolean)
      : [];

  const hasSkillsForMatching =
    jobSkills.length > 0 && candidateSkills.length > 0;

  let matchScore = 0;
  if (hasSkillsForMatching) {
    const matchCount = jobSkills.filter((skill) =>
      candidateSkills.includes(skill),
    ).length;
    matchScore = Math.round((matchCount / jobSkills.length) * 100);
  }

  const isGrid = variant === "grid";

  // =========================================================
  // 1. BIẾN THỂ DẠNG LƯỚI (GRID VARIANT)
  // =========================================================
  if (isGrid) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 hover:shadow-xl hover:shadow-slate-200/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden min-h-[290px] h-full group">
        {/* Nút lưu tin tuyển dụng */}
        <button
          onClick={handleBookmarkToggle}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-colors cursor-pointer z-10"
          title={isBookmarked ? "Bỏ lưu" : "Lưu việc làm"}
        >
          <Heart
            className={`w-4.5 h-4.5 ${isBookmarked ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
          />
        </button>

        <div>
          {/* Header Row: Logo & Info */}
          <div className="flex gap-4 items-start mb-4 pr-6">
            {job.company ? (
              <Link
                to={`/companies/${job.company.id}`}
                className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs"
              >
                {job.company.logoUrl && !logoError ? (
                  <img
                    src={getFullUrl(job.company.logoUrl)}
                    alt={job.company.companyName}
                    className="object-contain w-full h-full p-1"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-base font-bold text-primary-600 bg-primary-50/50 w-full h-full flex items-center justify-center">
                    {job.company.companyName?.charAt(0)}
                  </span>
                )}
              </Link>
            ) : (
              <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                <span className="text-base font-semibold text-slate-400">
                  ?
                </span>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <Link
                to={`/jobs/${job.id}`}
                className="text-base font-bold text-slate-900 hover:text-primary-600 transition-colors block truncate"
                title={job.title}
              >
                {job.title}
              </Link>
              {job.company ? (
                <Link
                  to={`/companies/${job.company.id}`}
                  className="text-slate-500 text-xs font-semibold hover:text-primary-600 transition-colors block truncate mt-0.5"
                >
                  {job.company.companyName}
                </Link>
              ) : (
                <span className="text-slate-400 text-xs font-medium block mt-0.5">
                  Doanh nghiệp ẩn danh
                </span>
              )}
            </div>
          </div>

          {/* Badges Chi tiết */}
          <div className="flex flex-wrap gap-1.5 items-center mb-4">
            {job.locations?.slice(0, 1).map((loc) => (
              <span
                key={loc.id}
                className="bg-slate-50 border border-slate-200/60 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-slate-400" /> {loc.name}
              </span>
            ))}

            {job.jobLevel && (
              <span className="bg-slate-50 border border-slate-200/60 text-slate-600 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />{" "}
                {translateJobLevel(job.jobLevel)}
              </span>
            )}

            {job.workType && (
              <span className="bg-slate-50 border border-slate-200/60 text-slate-600 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-slate-400" />{" "}
                {translateWorkType(job.workType)}
              </span>
            )}

            {job.skills?.slice(0, 1).map((skill) => (
              <span
                key={skill.id}
                className="bg-primary-50/50 border border-primary-100 text-primary-700 text-xs px-2.5 py-1 rounded-md font-semibold"
              >
                {skill.name}
              </span>
            ))}
          </div>

          {/* Khối đo độ tương thích */}
          {hasSkillsForMatching && (
            <div className="mb-4 bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50">
              <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                <span className="text-emerald-800">Kỹ năng tương thích</span>
                <span className="text-emerald-600 font-extrabold">
                  {matchScore}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Row */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2 shrink-0">
          <div className="flex flex-col">
            <span className="text-emerald-600 font-bold text-base flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-emerald-500" />{" "}
              {formatSalary(job)}
            </span>
            <span className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-350" />{" "}
              {formatTimeAgo(job.createdAt)}
            </span>
          </div>
          <Link
            to={`/jobs/${job.id}`}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1 group/btn"
          >
            Chi tiết{" "}
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // 2. BIẾN THỂ DANH SÁCH (LIST VARIANT - THẲNG HÀNG TUYỆT ĐỐI)
  // =========================================================
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/70 hover:shadow-xl hover:shadow-slate-200/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
      {/* Bookmark button */}
      <button
        onClick={handleBookmarkToggle}
        className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-colors cursor-pointer z-10"
        title={isBookmarked ? "Bỏ lưu" : "Lưu việc làm"}
      >
        <Heart
          className={`w-4.5 h-4.5 ${isBookmarked ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
        />
      </button>

      {/* VÙNG 1: TRÁI - LOGO VÀ NỘI DUNG CHÍNH (Tự co giãn thông minh) */}
      <div className="flex gap-5 items-start flex-1 min-w-0 w-full">
        {/* Company Logo */}
        {job.company ? (
          <Link
            to={`/companies/${job.company.id}`}
            className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs mt-0.5"
          >
            {job.company.logoUrl && !logoError ? (
              <img
                src={getFullUrl(job.company.logoUrl)}
                alt={job.company.companyName}
                className="object-contain w-full h-full p-1.5"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xl font-bold text-primary-600 bg-primary-50/50 w-full h-full flex items-center justify-center">
                {job.company.companyName?.charAt(0)}
              </span>
            )}
          </Link>
        ) : (
          <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xl font-semibold text-slate-400">?</span>
          </div>
        )}

        {/* Text Details Area */}
        <div className="flex-1 min-w-0 pr-4">
          <Link
            to={`/jobs/${job.id}`}
            className="text-base md:text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors block mb-1 line-clamp-1"
            title={job.title}
          >
            {job.title}
          </Link>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {job.company ? (
              <Link
                to={`/companies/${job.company.id}`}
                className="text-slate-600 hover:text-primary-600 text-sm font-semibold transition-colors"
              >
                {job.company.companyName}
              </Link>
            ) : (
              <span className="text-slate-500 text-sm font-medium">
                Doanh nghiệp ẩn danh
              </span>
            )}
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />{" "}
              {formatTimeAgo(job.createdAt)}
            </span>
          </div>

          {/* Badges Tags */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {job.locations?.map((loc) => (
              <span
                key={loc.id}
                className="bg-slate-50 border border-slate-200/60 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-slate-400" /> {loc.name}
              </span>
            ))}

            {job.jobLevel && (
              <span className="bg-slate-50 border border-slate-200/60 text-slate-600 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />{" "}
                {translateJobLevel(job.jobLevel)}
              </span>
            )}

            {job.workType && (
              <span className="bg-slate-50 border border-slate-200/60 text-slate-600 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-slate-400" />{" "}
                {translateWorkType(job.workType)}
              </span>
            )}

            {job.skills?.slice(0, 2).map((skill) => (
              <span
                key={skill.id}
                className="bg-primary-50/40 border border-primary-100 text-primary-700 text-xs px-2.5 py-1 rounded-md font-semibold"
              >
                {skill.name}
              </span>
            ))}
            {job.skills?.length > 2 && (
              <span className="text-slate-400 text-xs font-semibold pl-0.5">
                +{job.skills.length - 2} kỹ năng
              </span>
            )}
          </div>

          {/* Khối tương thích hồ sơ */}
          {hasSkillsForMatching && (
            <div className="mt-3 max-w-xs bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/50">
              <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                <span className="text-emerald-800">Kỹ năng tương thích</span>
                <span className="text-emerald-600 font-bold">
                  {matchScore}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VÙNG 2: PHẢI - CỐ ĐỊNH KÍCH THƯỚC (Giúp giá tiền và nút luôn thẳng hàng tăm tắp) */}
      <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-56 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0 gap-3">
        <div className="flex flex-col md:items-end text-left md:text-right">
          <span className="text-emerald-600 font-bold text-base md:text-lg flex items-center gap-1 whitespace-nowrap">
            <DollarSign className="w-4 h-4 text-emerald-500" />{" "}
            {formatSalary(job)}
          </span>
          {job.expirationDate && (
            <span className="text-slate-400 text-xs mt-0.5 font-medium whitespace-nowrap">
              Hạn nộp:{" "}
              {new Date(job.expirationDate).toLocaleDateString("vi-VN")}
            </span>
          )}
        </div>

        <Link
          to={`/jobs/${job.id}`}
          className="w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all text-center active:scale-95 cursor-pointer inline-flex items-center gap-1 group/btn"
        >
          Chi tiết{" "}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
