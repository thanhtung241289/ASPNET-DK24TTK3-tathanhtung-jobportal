// File: src/pages/JobDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DollarSign,
  Briefcase,
  Layers,
  Calendar,
  Building2,
  MapPin,
  Globe,
  Heart,
  Share2,
  ArrowLeft,
  Send,
  CheckCircle2,
  Users,
  Info,
} from "lucide-react";
import { jobApi } from "../services/jobApi";
import { profileApi } from "../services/profileApi";
import { useAuth } from "../contexts/AuthContext";
import {
  translateJobLevel,
  translateWorkType,
  formatTextToHtml,
  formatSalary,
} from "../utils/translators";
import { useToast } from "../contexts/ToastContext";
import JobCard from "../components/JobCard"; // Import JobCard để làm danh sách đề xuất
// File: src/pages/JobDetailPage.jsx
// Sửa lại dòng import translators ở đầu file để bổ sung formatSalary:

const JobDetailPage = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  // States quản lý việc làm liên quan
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [userSkills, setUserSkills] = useState(null);

  // States quản lý trạng thái mở Modal Ứng tuyển và nộp đơn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái lưu tin tuyển dụng
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const data = await jobApi.getById(id);
        setJob(data);

        // Đọc danh sách bookmark cá nhân kiểm tra trạng thái lưu tin
        if (user && user.role === "Seeker") {
          try {
            const savedIds = await profileApi.getSavedJobIds();
            setIsBookmarked((savedIds || []).includes(data.id));
          } catch (err) {
            console.error("Lỗi khi lấy danh sách việc làm yêu thích:", err);
            const bookmarked = JSON.parse(
              localStorage.getItem("bookmarkedJobs") || "[]",
            );
            setIsBookmarked(bookmarked.includes(data.id));
          }
        } else {
          const bookmarked = JSON.parse(
            localStorage.getItem("bookmarkedJobs") || "[]",
          );
          setIsBookmarked(bookmarked.includes(data.id));
        }

        // Lấy danh sách việc làm liên quan từ API hệ thống
        if (data.category?.id || data.id) {
          const related = await jobApi.getAll({
            categoryId: data.category?.id,
            pageSize: 4,
          });
          // Loại bỏ công việc hiện tại ra khỏi danh sách đề xuất
          setRelatedJobs(
            related.items?.filter((item) => item.id !== data.id) || [],
          );
        }
      } catch (error) {
        showToast("Không thể tải thông tin chi tiết công việc này.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [id]);

  // Lấy danh sách hồ sơ CV của ứng viên khi mở Modal
  useEffect(() => {
    if (isModalOpen && user) {
      const fetchResumes = async () => {
        try {
          const [profileData, resumesData] = await Promise.all([
            profileApi.getMyProfile(),
            profileApi.getResumes(),
          ]);
          setResumes(resumesData || []);
          setUserSkills(profileData?.skillsSummary || null);

          const defaultResume = resumesData?.find((r) => r.isDefault);
          if (defaultResume) {
            setSelectedResumeId(defaultResume.id);
          } else if (resumesData?.length > 0) {
            setSelectedResumeId(resumesData[0].id);
          }
        } catch (error) {
          showToast("Không thể tải danh sách hồ sơ CV của bạn.", "error");
        }
      };
      fetchResumes();
    }
  }, [isModalOpen, user]);

  const handleBookmarkToggle = async () => {
    if (user && user.role === "Seeker") {
      try {
        if (isBookmarked) {
          await profileApi.unsaveJob(job.id);
          setIsBookmarked(false);
          showToast("Đã bỏ lưu việc làm này.", "info");
        } else {
          await profileApi.saveJob(job.id);
          setIsBookmarked(true);
          showToast("Lưu tin tuyển dụng thành công!", "success");
        }
        window.dispatchEvent(new Event("bookmarksChanged"));
      } catch (error) {
        showToast("Không thể lưu/bỏ lưu việc làm. Vui lòng thử lại.", "error");
      }
    } else {
      const bookmarked = JSON.parse(
        localStorage.getItem("bookmarkedJobs") || "[]",
      );
      let updated;
      if (bookmarked.includes(job.id)) {
        updated = bookmarked.filter((jobId) => jobId !== job.id);
        setIsBookmarked(false);
        showToast("Đã bỏ lưu việc làm này.", "info");
      } else {
        updated = [...bookmarked, job.id];
        setIsBookmarked(true);
        showToast("Lưu tin tuyển dụng thành công!", "success");
      }
      localStorage.setItem("bookmarkedJobs", JSON.stringify(updated));
      window.dispatchEvent(new Event("bookmarksChanged"));
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      showToast("Vui lòng chọn một bản hồ sơ CV để ứng tuyển.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      await jobApi.applyJob({
        jobId: job.id,
        resumeId: selectedResumeId,
      });
      showToast(
        "Nộp đơn ứng tuyển thành công! Nhà tuyển dụng sẽ sớm xem hồ sơ.",
        "success",
      );
      setIsModalOpen(false);
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Ứng tuyển thất bại. Vui lòng thử lại.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-slate-50/50 min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-black text-slate-800">
          Không tìm thấy việc làm
        </h2>
        <p className="text-slate-500 mt-2">
          Tin tuyển dụng này không tồn tại hoặc đã bị gỡ bỏ gầy đây.
        </p>
        <Link
          to="/jobs"
          className="mt-6 inline-flex items-center gap-2 text-primary-600 font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  // Calculate matching score
  const jobSkills = job?.skills
    ? job.skills.map((s) => s.name.toLowerCase().trim())
    : [];
  const candidateSkills = userSkills
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

  return (
    <div className="bg-slate-50/60 min-h-screen pb-16">
      {/* 1. Tuyến điều hướng đầu trang */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-40 shadow-2xs">
        <div className="container-custom h-14 flex items-center justify-between">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />{" "}
            Quay lại tìm kiếm
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-xl border border-slate-200 hover:bg-rose-50 transition-colors cursor-pointer ${isBookmarked ? "text-rose-500 border-rose-200 bg-rose-50/25" : "text-slate-400 hover:text-rose-500"}`}
            >
              <Heart
                className={`w-4 h-4 ${isBookmarked ? "fill-rose-500 text-rose-500" : ""}`}
              />
            </button>
            <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Khối tóm tắt thông tin trên (Hero Header) */}
      <div className="bg-white border-b border-slate-200/50 py-8 mb-8 shadow-2xs">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex gap-5 items-start flex-1 min-w-0">
              {job.company ? (
                <Link
                  to={`/companies/${job.company.id}`}
                  className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm"
                >
                  {job.company.logoUrl && !logoError ? (
                    <img
                      src={getFullUrl(job.company.logoUrl)}
                      alt={job.company.companyName}
                      className="object-contain w-full h-full p-2"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-black text-primary-600 bg-primary-50 w-full h-full flex items-center justify-center">
                      {job.company.companyName?.charAt(0)}
                    </span>
                  )}
                </Link>
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200">
                  <span className="text-2xl font-bold text-slate-400">?</span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-600 text-sm font-medium">
                  {job.company ? (
                    <Link
                      to={`/companies/${job.company.id}`}
                      className="font-bold text-slate-700 hover:text-primary-600 flex items-center gap-1.5"
                    >
                      <Building2 className="w-4 h-4 text-slate-400" />{" "}
                      {job.company.companyName}
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic">
                      Doanh nghiệp ẩn danh
                    </span>
                  )}
                  <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:inline"></span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />{" "}
                    {job.locations?.map((l) => l.name).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="lg:text-right">
                <div className="text-emerald-600 font-black text-xl lg:text-2xl flex items-center lg:justify-end gap-1">
                  <DollarSign className="w-5 h-5 text-emerald-500" />{" "}
                  {formatSalary(job)}
                </div>
                {job.expirationDate && (
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Hạn nộp:{" "}
                    {new Date(job.expirationDate).toLocaleDateString("vi-VN")}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-primary-600/10 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Ứng tuyển ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Khối nội dung phân chia Layout Grid */}
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* CỘT TRÁI: Mô tả công việc chi tiết (Chiếm 2 phần) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Matching Score Bar */}
            {hasSkillsForMatching ? (
              <div className="bg-emerald-50/35 p-5 rounded-3xl border border-emerald-100/60 shadow-[0_2px_12px_rgba(16,185,129,0.02)]">
                <div className="flex justify-between items-center text-xs font-bold mb-2.5">
                  <span className="text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                    Độ tương thích kỹ năng với hồ sơ của bạn
                  </span>
                  <span className="text-emerald-700 font-extrabold text-sm">
                    {matchScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${matchScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-semibold">
                  Hồ sơ của bạn khớp{" "}
                  <strong>
                    {
                      jobSkills.filter((skill) =>
                        candidateSkills.includes(skill),
                      ).length
                    }
                  </strong>{" "}
                  trên <strong>{jobSkills.length}</strong> kỹ năng được yêu cầu
                  từ nhà tuyển dụng.
                </p>
              </div>
            ) : (
              user &&
              user.role === "Seeker" && (
                <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-200/60 shadow-2xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-500 leading-normal font-medium">
                    Hãy cập nhật đầy đủ kỹ năng tại{" "}
                    <Link
                      to="/profile"
                      className="text-primary-600 font-bold underline"
                    >
                      Hồ sơ cá nhân
                    </Link>{" "}
                    để hệ thống tự động đánh giá và hiển thị mức độ tương thích
                    kỹ năng của bạn với công việc này.
                  </div>
                </div>
              )
            )}

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/70 shadow-2xs space-y-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 border-l-4 border-primary-500 pl-3 mb-4">
                  Chi tiết tin tuyển dụng
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-slate-200/50">
                      <Layers className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Cấp bậc
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {translateJobLevel(job.jobLevel)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-slate-200/50">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Hình thức
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {translateWorkType(job.workType)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-slate-200/50">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Kinh nghiệm
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {job.experienceRequired || "Không yêu cầu"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {job.description && (
                <div>
                  <h3 className="text-lg font-black text-slate-900 border-l-4 border-primary-500 pl-3 mb-4">
                    Mô tả công việc
                  </h3>
                  <div
                    className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatTextToHtml(job.description),
                    }}
                  />
                </div>
              )}

              {job.requirements && (
                <div>
                  <h3 className="text-lg font-black text-slate-900 border-l-4 border-primary-500 pl-3 mb-4">
                    Yêu cầu công việc
                  </h3>
                  <div
                    className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatTextToHtml(job.requirements),
                    }}
                  />
                </div>
              )}

              {job.benefits && (
                <div>
                  <h3 className="text-lg font-black text-slate-900 border-l-4 border-primary-500 pl-3 mb-4">
                    Quyền lợi được hưởng
                  </h3>
                  <div
                    className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatTextToHtml(job.benefits),
                    }}
                  />
                </div>
              )}

              {job.skills?.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-slate-900 border-l-4 border-primary-500 pl-3 mb-3">
                    Từ khóa kỹ năng
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="bg-primary-50 border border-primary-100 text-primary-700 text-xs px-3 py-1.5 rounded-xl font-bold"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: Thông tin công ty & Ô CÁC CÔNG VIỆC LIÊN QUAN ĐỀ XUẤT */}
          <div className="space-y-6">
            {/* Box Doanh nghiệp */}
            {job.company && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-4">
                <h3 className="text-base font-black text-slate-900">
                  Thông tin doanh nghiệp
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0">
                    <img
                      src={getFullUrl(job.company.logoUrl)}
                      alt={job.company.companyName}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 w-full">
                      <h4 className="font-extrabold text-slate-800 text-sm truncate">
                        {job.company.companyName}
                      </h4>
                      {job.company.isVerified && (
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-500 shrink-0"
                          title="Đã xác minh"
                        />
                      )}
                    </div>
                    {job.company.website && (
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary-600 hover:underline inline-flex items-center gap-1 mt-0.5 font-semibold"
                      >
                        <Globe className="w-3 h-3" /> Ghé thăm website
                      </a>
                    )}
                  </div>
                </div>

                {job.company.shortDescription && (
                  <p className="text-xs text-slate-500 leading-relaxed italic border-t border-slate-100 pt-3">
                    "{job.company.shortDescription}"
                  </p>
                )}

                <div className="text-xs text-slate-500 space-y-2.5 border-t border-slate-100 pt-3">
                  {job.company.companySize && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        Quy mô nhân sự:{" "}
                        <strong className="text-slate-700">
                          {job.company.companySize}
                        </strong>
                      </span>
                    </div>
                  )}
                  {job.company.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        Trụ sở chính:{" "}
                        <strong className="text-slate-700">
                          {job.company.address}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/companies/${job.company.id}`}
                  className="block text-center border border-slate-200 hover:border-primary-500 hover:text-primary-600 font-bold text-xs py-2.5 rounded-xl transition-all bg-slate-50/50"
                >
                  Xem trang công ty
                </Link>
              </div>
            )}

            {/* Ô CÁC CÔNG VIỆC LIÊN QUAN ĐỀ XUẤT (RECOMMENDED SIDEBAR BOX) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">
                  Việc làm tương tự
                </h3>
                <Link
                  to="/jobs"
                  className="text-xs text-primary-600 font-bold hover:underline"
                >
                  Xem thêm
                </Link>
              </div>

              {relatedJobs.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {relatedJobs.map((relatedJob) => (
                    <div
                      key={relatedJob.id}
                      className="w-full transition-all duration-300"
                    >
                      {/* 1. Chuyển variant sang "grid" để thẻ job tự động chuyển thành khối dọc fit vừa khít Sidebar.
        2. Truyền chuẩn state candidateSkills (hoặc userSkills tùy theo file của bạn) để đo độ tương thích.
      */}
                      <JobCard
                        job={relatedJob}
                        variant="grid"
                        userSkills={userSkills}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    Chưa có công việc tương tự phù hợp.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL NỘP ĐƠN ỨNG TUYỂN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-5 relative animate-slide-up">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Nộp đơn ứng tuyển
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Bạn đang ứng tuyển vị trí{" "}
                <span className="font-bold text-slate-800">{job.title}</span>
              </p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Chọn hồ sơ CV đính kèm
                </label>
                {resumes.length === 0 ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <p className="text-xs text-amber-800 font-medium">
                      Bạn chưa tải file CV nào lên hệ thống.
                    </p>
                    <Link
                      to="/profile"
                      className="text-xs text-primary-600 font-bold underline mt-1 block"
                    >
                      Tải CV ngay tại Hồ sơ cá nhân
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="">-- Chọn CV nộp đơn --</option>
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
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer text-slate-600"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || resumes.length === 0}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Đang gửi hồ sơ..." : "Nộp đơn ứng tuyển"}
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
