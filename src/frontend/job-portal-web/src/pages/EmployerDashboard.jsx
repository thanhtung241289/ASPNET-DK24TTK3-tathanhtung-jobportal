import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Camera,
  FolderOpen,
  Building2,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { employerApi } from "../services/employerApi";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("jobs"); // 'jobs' | 'applications' | 'settings'

  // States for data fetching
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for form / uploads
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const { showToast } = useToast();

  // Helper helper to get static file URLs
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

  // Fetch all necessary data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, jobsData, appsData] = await Promise.all([
        employerApi.getProfile(),
        employerApi.getJobs(),
        employerApi.getApplications(),
      ]);
      setProfile(profileData);
      setJobs(jobsData || []);
      setApplications(appsData || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "Employer") {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user]);

  // Handle saving company settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await employerApi.updateProfile({
        companyName: profile.companyName,
        website: profile.website || "",
        description: profile.description || "",
        address: profile.address || "",
        logoUrl: profile.logoUrl || "",
        coverUrl: profile.coverUrl || "",
        shortDescription: profile.shortDescription || "",
        companySize: profile.companySize || "",
      });
      showToast("Cập nhật thông tin công ty thành công!");
    } catch (error) {
      console.error(error);
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle logo file upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Dung lượng ảnh vượt quá 2MB!", "danger");
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await employerApi.uploadLogo(formData);
      setProfile((prev) => ({ ...prev, logoUrl: res.logoUrl }));
      showToast("Cập nhật Logo công ty thành công!");
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle cover file upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Dung lượng ảnh vượt quá 2MB!", "danger");
      return;
    }

    setUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await employerApi.uploadCover(formData);
      setProfile((prev) => ({ ...prev, coverUrl: res.coverUrl }));
      showToast("Cập nhật ảnh bìa công ty thành công!");
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle application status updates
  const handleStatusChange = async (appId, newStatusStr) => {
    // Map string enum from backend to integer needed for update
    const statusMap = {
      New: 0,
      Viewed: 1,
      Contacted: 2,
      Interviewing: 3,
      Offered: 4,
      Rejected: 5,
    };
    const statusInt = statusMap[newStatusStr];

    try {
      await employerApi.updateApplicationStatus(appId, statusInt);
      // Update local state application list
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatusStr } : app,
        ),
      );
      showToast("Cập nhật trạng thái xử lý hồ sơ thành công!");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-semibold animate-pulse">
          Đang tải dữ liệu bảng điều khiển tuyển dụng...
        </p>
      </div>
    );
  }

  // Aggregate stats
  const pendingJobsCount = jobs.filter((j) => j.status === "Pending").length;
  const activeJobsCount = jobs.filter((j) => j.status === "Published").length;
  const totalAppsCount = applications.length;
  const newAppsCount = applications.filter((a) => a.status === "New").length;

  return (
    <div className="container-custom py-10 min-h-screen">
      {/* Header Banner Section */}
      <div className="relative bg-primary-600 text-white rounded-3xl p-8 md:p-10 mb-8 shadow-sm overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" /> Trang tuyển dụng doanh
              nghiệp
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {profile?.companyName || "Bảng điều khiển tuyển dụng"}
            </h1>
            <p className="text-white/80 text-sm md:text-base mt-2 max-w-xl">
              {profile?.shortDescription ||
                "Chào mừng bạn đến với trang quản trị tuyển dụng. Tại đây bạn có thể đăng tin mới, sàng lọc hồ sơ ứng viên và cấu hình thông tin doanh nghiệp."}
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-3">
            <Link
              to="/employer/post-job"
              className="bg-white text-primary-600 hover:bg-slate-50 transition-all font-extrabold text-sm px-6 py-3 rounded-2xl shadow-md shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
            >
              + Đăng tin mới
            </Link>
            {profile?.id && (
              <Link
                to={`/companies/${profile.id}`}
                className="bg-white/10 hover:bg-white/20 transition-all text-white font-bold text-sm px-5 py-3 rounded-2xl backdrop-blur-md active:scale-[0.98]"
              >
                Xem trang công ty ➔
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Tab Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Menu */}
        <div className="lg:w-1/4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">
              Menu quản trị
            </p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("jobs")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer group ${
                  activeTab === "jobs"
                    ? "bg-primary-50 text-primary-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase
                    className={`w-4 h-4 transition-colors ${activeTab === "jobs" ? "text-primary-600" : "text-slate-400 group-hover:text-primary-600"}`}
                  />
                  <span>Tin tuyển dụng đã đăng</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "jobs"
                      ? "bg-primary-100 text-primary-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {jobs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("applications")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer group ${
                  activeTab === "applications"
                    ? "bg-primary-50 text-primary-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen
                    className={`w-4 h-4 transition-colors ${activeTab === "applications" ? "text-primary-600" : "text-slate-400 group-hover:text-primary-600"}`}
                  />
                  <span>Hồ sơ ứng tuyển</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "applications"
                      ? "bg-primary-100 text-primary-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {applications.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer group ${
                  activeTab === "settings"
                    ? "bg-primary-50 text-primary-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Building2
                  className={`w-4 h-4 transition-colors ${activeTab === "settings" ? "text-primary-600" : "text-slate-400 group-hover:text-primary-600"}`}
                />
                <span>Thông tin công ty</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100/80 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
              Thống kê nhanh
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md">
                    Live
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-slate-800 leading-none">
                    {activeJobsCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">
                    Đang tuyển
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md">
                    Wait
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-amber-650 leading-none">
                    {pendingJobsCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">
                    Chờ duyệt
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <FolderOpen className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <span className="block text-2xl font-black text-primary-600 leading-none">
                    {totalAppsCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">
                    Đơn đã nhận
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md">
                    New
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-indigo-600 leading-none">
                    {newAppsCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">
                    Hồ sơ mới
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tab Content Panel */}
        <div className="lg:w-3/4 flex-grow bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-100/80">
          {/* TAB 1: Posted Jobs */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">
                    Tin tuyển dụng đã đăng
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Danh sách các tin tuyển dụng bạn đã đăng tải và trạng thái
                    tương ứng.
                  </p>
                </div>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Briefcase className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700">
                    Chưa có tin tuyển dụng nào
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Hãy đăng tin tuyển dụng đầu tiên của bạn để tiếp cận hàng
                    ngàn ứng viên.
                  </p>
                  <Link
                    to="/employer/post-job"
                    className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md mt-5 transition-all"
                  >
                    + Đăng tuyển ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => {
                    const borderStatusClass =
                      job.status === "Published"
                        ? "border-l-4 border-l-emerald-500"
                        : job.status === "Pending"
                          ? "border-l-4 border-l-amber-500"
                          : job.status === "Rejected"
                            ? "border-l-4 border-l-rose-500"
                            : "border-l-4 border-l-slate-400";
                    return (
                      <div
                        key={job.id}
                        className={`bg-white hover:bg-slate-50/55 rounded-2xl p-5 border border-slate-100 ${borderStatusClass} shadow-xs hover:shadow-sm transition-all duration-300`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-base font-extrabold text-slate-800 hover:text-primary-600 transition-colors">
                              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                            </h3>
                            <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs font-semibold text-slate-500">
                              <span className="flex items-center gap-1">
                                <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                                {job.category?.name || "N/A"}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                {job.isNegotiable
                                  ? "Thỏa thuận"
                                  : `${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} VNĐ`}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                Tuyển: {job.quantity}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                Hạn:{" "}
                                {new Date(
                                  job.expirationDate,
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                                job.status === "Published"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-250"
                                  : job.status === "Pending"
                                    ? "bg-amber-50 text-amber-600 border-amber-250"
                                    : job.status === "Rejected"
                                      ? "bg-rose-50 text-rose-600 border-rose-250"
                                      : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  job.status === "Published"
                                    ? "bg-emerald-500"
                                    : job.status === "Pending"
                                      ? "bg-amber-500"
                                      : job.status === "Rejected"
                                        ? "bg-rose-500"
                                        : "bg-slate-500"
                                }`}
                              ></span>
                              {job.status === "Published"
                                ? "Hoạt động"
                                : job.status === "Pending"
                                  ? "Chờ duyệt"
                                  : job.status === "Rejected"
                                    ? "Bị từ chối"
                                    : "Hết hạn"}
                            </span>

                            {/* Applicant Count */}
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              {job.applicantCount || 0} hồ sơ ứng tuyển
                            </span>
                          </div>
                        </div>

                        {/* Display Reject Reason if status is Rejected */}
                        {job.status === "Rejected" && (
                          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 mt-4 text-xs text-rose-700 flex gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">
                                Lý do từ chối kiểm duyệt:
                              </p>
                              {/* Extract rejection text from Description if prepended */}
                              <p className="mt-0.5">
                                {job.description &&
                                job.description.includes(
                                  "Lý do từ chối kiểm duyệt:",
                                )
                                  ? job.description
                                      .split(
                                        "<p style='color:red;'><b>Lý do từ chối kiểm duyệt:</b>",
                                      )[1]
                                      ?.split("</p>")[0]
                                      ?.trim()
                                  : "Nội dung bài viết không phù hợp hoặc vi phạm điều khoản tuyển dụng."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Applications Tracker */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">
                    Quản lý hồ sơ ứng tuyển
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Theo dõi và cập nhật trạng thái xử lý các hồ sơ ứng tuyển từ
                    seeker.
                  </p>
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FolderOpen className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700">
                    Chưa có đơn ứng tuyển nào
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Khi ứng viên ứng tuyển vào công việc của bạn, hồ sơ sẽ hiển
                    thị ở đây.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-3">Ứng viên</th>
                        <th className="py-4 px-3">Vị trí nộp</th>
                        <th className="py-4 px-3">Thời gian</th>
                        <th className="py-4 px-3">CV đính kèm</th>
                        <th className="py-4 px-3 text-right">
                          Trạng thái xử lý
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm font-semibold">
                      {applications.map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-3">
                            <p className="font-extrabold text-slate-800">
                              {app.candidateName}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {app.candidateEmail}
                            </p>
                            {app.candidatePhone && (
                              <p className="text-xs text-slate-400">
                                {app.candidatePhone}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-3">
                            <span className="font-bold text-slate-700 line-clamp-1">
                              {app.jobTitle}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-slate-500 text-xs">
                            {new Date(app.appliedAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </td>
                          <td className="py-4 px-3">
                            {app.resumeUrl ? (
                              <a
                                href={getFullUrl(app.resumeUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:underline font-bold"
                              >
                                <FileText className="w-3.5 h-3.5" /> Tải CV xem
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 font-normal">
                                Không đính kèm
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-right">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusChange(app.id, e.target.value)
                              }
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-all ${
                                app.status === "New"
                                  ? "bg-sky-50/70 text-sky-700 border-sky-200 hover:bg-sky-50"
                                  : app.status === "Viewed"
                                    ? "bg-indigo-50/70 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                    : app.status === "Contacted"
                                      ? "bg-amber-50/70 text-amber-700 border-amber-200 hover:bg-amber-50"
                                      : app.status === "Interviewing"
                                        ? "bg-purple-50/70 text-purple-700 border-purple-200 hover:bg-purple-50"
                                        : app.status === "Offered"
                                          ? "bg-emerald-50/70 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                          : "bg-rose-50/70 text-rose-700 border-rose-200 hover:bg-rose-50"
                              }`}
                            >
                              <option value="New">Mới nộp</option>
                              <option value="Viewed">Đã xem</option>
                              <option value="Contacted">Đã liên hệ</option>
                              <option value="Interviewing">Phỏng vấn</option>
                              <option value="Offered">Nhận việc (Offer)</option>
                              <option value="Rejected">Từ chối</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Company Profile Settings */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-800">
                  Thông tin doanh nghiệp
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Thiết lập Logo, ảnh bìa và các thông tin mô tả chi tiết cho
                  trang doanh nghiệp.
                </p>
              </div>

              {/* Cover & Logo Upload Grid */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Hình ảnh thương hiệu
                </p>

                {/* Cover Image Container */}
                <div className="relative h-48 md:h-60 rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden group shadow-sm">
                  {profile?.coverUrl ? (
                    <img
                      src={getFullUrl(profile.coverUrl)}
                      alt="Cover"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-400 text-xs font-bold">
                        Chưa cấu hình ảnh bìa
                      </span>
                    </div>
                  )}

                  {/* Upload Overlay */}
                  <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <div className="text-center text-white">
                      <Camera className="w-6 h-6 mx-auto mb-1 text-white" />
                      <span className="text-xs font-bold">
                        Tải ảnh bìa mới (Max 2MB)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>

                  {uploadingCover && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Logo positioning & upload */}
                <div className="flex flex-col sm:flex-row items-center gap-4 px-4 -mt-16 sm:-mt-12 relative z-10">
                  <div className="relative w-28 h-28 rounded-3xl bg-white border-4 border-white shadow-md overflow-hidden group">
                    {profile?.logoUrl ? (
                      <img
                        src={getFullUrl(profile.logoUrl)}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-inner">
                        {profile?.companyName?.charAt(0).toUpperCase() || "C"}
                      </div>
                    )}

                    {/* Upload Overlay */}
                    <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>

                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="text-center sm:text-left mt-2 sm:mt-8">
                    <h3 className="text-lg font-extrabold text-slate-800">
                      {profile?.companyName || "Tên công ty"}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">
                      {profile?.isVerified
                        ? "✓ Đã xác minh"
                        : "Chưa xác minh thương hiệu"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Form */}
              <form onSubmit={handleSaveProfile} className="space-y-6 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Thông tin văn bản chi tiết
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">
                      Tên doanh nghiệp *
                    </label>
                    <input
                      type="text"
                      required
                      value={profile?.companyName || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      placeholder="Ví dụ: Công ty TNHH Giải pháp Công nghệ ABC"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Company Size */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">
                      Quy mô nhân sự
                    </label>
                    <input
                      type="text"
                      value={profile?.companySize || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          companySize: e.target.value,
                        }))
                      }
                      placeholder="Ví dụ: 50-100 nhân viên"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">
                      Trang web công ty
                    </label>
                    <input
                      type="url"
                      value={profile?.website || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      placeholder="Ví dụ: https://company.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">
                      Trụ sở chính
                    </label>
                    <input
                      type="text"
                      value={profile?.address || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Quận 1, TP. HCM"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">
                    Giới thiệu ngắn
                  </label>
                  <input
                    type="text"
                    value={profile?.shortDescription || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        shortDescription: e.target.value,
                      }))
                    }
                    placeholder="Tóm tắt lĩnh vực hoạt động chính, sứ mệnh của công ty..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all"
                  />
                </div>

                {/* Detailed Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">
                    Mô tả chi tiết doanh nghiệp
                  </label>
                  <textarea
                    rows={6}
                    value={profile?.description || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Mô tả chi tiết về lịch sử phát triển, văn hóa công ty, chế độ đãi ngộ..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white px-4 py-4 rounded-2xl text-sm font-semibold outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
                  >
                    {savingSettings && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {savingSettings ? "Đang lưu thay đổi..." : "Lưu cấu hình"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
