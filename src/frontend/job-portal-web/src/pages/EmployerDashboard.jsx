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
  AlertCircle,
  Eye,
  X,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Plus,
  ExternalLink,
  Settings,
  ChevronDown,
  CheckCircle2,
  Edit,
  Trash2,
} from "lucide-react";
import { employerApi } from "../services/employerApi";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("jobs");

  // States
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [candidateModal, setCandidateModal] = useState(null);

  const { showToast } = useToast();

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

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
      console.error("Lỗi khi tải dữ liệu:", error);
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
      showToast("Đã lưu cấu hình doanh nghiệp!");
    } catch (error) {
      console.error(error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await employerApi.uploadLogo(formData);
      setProfile((prev) => ({ ...prev, logoUrl: res.logoUrl }));
      showToast("Cập nhật Logo thành công!");
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleStatusChange = async (appId, newStatusStr) => {
    const statusMap = {
      New: 0,
      Viewed: 1,
      Contacted: 2,
      Interviewing: 3,
      Offered: 4,
      Rejected: 5,
    };
    try {
      await employerApi.updateApplicationStatus(appId, statusMap[newStatusStr]);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatusStr } : app,
        ),
      );
      showToast("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tin tuyển dụng này không? Hành động này không thể hoàn tác.",
      )
    ) {
      try {
        await employerApi.deleteJobPost(jobId);
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
        showToast("Xóa tin tuyển dụng thành công!", "success");
      } catch (error) {
        console.error("Lỗi khi xóa tin tuyển dụng:", error);
        showToast(
          "Không thể xóa tin tuyển dụng này. Vui lòng thử lại sau.",
          "danger",
        );
      }
    }
  };

  const handleViewCandidateProfile = async (userId) => {
    if (!userId) return;
    setCandidateModal({ loading: true });
    try {
      const data = await employerApi.getCandidateProfile(userId);
      setCandidateModal({ loading: false, profile: data });
    } catch (error) {
      showToast("Không tìm thấy hồ sơ chi tiết.", "warning");
      setCandidateModal(null);
    }
  };

  const parseRejectReason = (description) => {
    if (!description) return null;
    const marker = "Lý do từ chối kiểm duyệt:";
    if (!description.includes(marker)) return null;
    try {
      const start = description.indexOf(marker) + marker.length;
      const end = description.indexOf("</p>", start);
      return end > start ? description.substring(start, end).trim() : null;
    } catch {
      return null;
    }
  };

  const calculateMatchScore = (candSkills, jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) return 100;
    const normJobSkills = jobSkills.map((s) => s.toLowerCase().trim());
    const normCandSkills =
      typeof candSkills === "string"
        ? candSkills
            .split(",")
            .map((s) => s.toLowerCase().trim())
            .filter(Boolean)
        : Array.isArray(candSkills)
          ? candSkills.map((s) => s.toLowerCase().trim())
          : [];
    if (normCandSkills.length === 0) return 0;
    const matched = normJobSkills.filter((skill) =>
      normCandSkills.includes(skill),
    ).length;
    return Math.round((matched / jobSkills.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">
          Đang đồng bộ dữ liệu...
        </p>
      </div>
    );
  }

  const activeJobsCount = jobs.filter((j) => j.status === "Published").length;
  const pendingJobsCount = jobs.filter((j) => j.status === "Pending").length;
  const newAppsCount = applications.filter((a) => a.status === "New").length;

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans pb-16">
      {/* HEADER: Minimalist & Functional */}
      <header className="border-b border-slate-200 bg-white sticky top-[72px] z-30 pt-8 pb-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 shrink-0 overflow-hidden">
                {profile?.logoUrl ? (
                  <img
                    src={getFullUrl(profile.logoUrl)}
                    alt="Logo"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="font-bold text-slate-400">
                    {profile?.companyName?.charAt(0) || "C"}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {profile?.companyName || "Thiết lập doanh nghiệp"}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Cổng quản trị tuyển dụng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {profile?.id && (
                <Link
                  to={`/companies/${profile.id}`}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  Xem trang <ExternalLink className="w-4 h-4 text-slate-400" />
                </Link>
              )}
              <Link
                to="/employer/post-job"
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Đăng tin mới
              </Link>
            </div>
          </div>

          {/* HORIZONTAL NAVIGATION */}
          <nav className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
            {[
              { id: "jobs", label: "Tin tuyển dụng", count: jobs.length },
              {
                id: "applications",
                label: "Hồ sơ ứng viên",
                count: applications.length,
              },
              { id: "settings", label: "Cài đặt doanh nghiệp" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-slate-100 text-slate-900" : "bg-slate-100 text-slate-500"}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* TAB 1: JOBS LIST */}
        {activeTab === "jobs" && (
          <div className="space-y-6 animate-fade-in">
            {/* Minimal Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Đang hiển thị", value: activeJobsCount },
                { label: "Chờ kiểm duyệt", value: pendingJobsCount },
                { label: "Tổng hồ sơ", value: applications.length },
                {
                  label: "Tin đã đóng",
                  value: jobs.filter(
                    (j) => j.status === "Expired" || j.status === "Rejected",
                  ).length,
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-200 rounded-lg bg-white"
                >
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Jobs Table/List */}
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
              {jobs.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-500">
                  Chưa có tin tuyển dụng nào.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-sm font-semibold text-slate-900 hover:underline block truncate"
                        >
                          {job.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="w-3.5 h-3.5" />{" "}
                            {job.category?.name || "Khác"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />{" "}
                            {new Date(job.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />{" "}
                            {job.applicantCount || 0} hồ sơ
                          </span>
                        </div>
                        {job.status === "Rejected" && (
                          <div className="mt-2 text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded inline-flex items-center gap-1 border border-rose-100">
                            <AlertCircle className="w-3.5 h-3.5" />{" "}
                            {parseRejectReason(job.description) ||
                              "Vi phạm tiêu chuẩn."}
                          </div>
                        )}
                      </div>

                      {/* Status & Action */}
                      <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              job.status === "Published"
                                ? "bg-emerald-500"
                                : job.status === "Pending"
                                  ? "bg-amber-500"
                                  : job.status === "Rejected"
                                    ? "bg-rose-500"
                                    : "bg-slate-300"
                            }`}
                          />
                          <span className="text-slate-700">
                            {job.status === "Published"
                              ? "Đang hiển thị"
                              : job.status === "Pending"
                                ? "Chờ duyệt"
                                : job.status === "Rejected"
                                  ? "Từ chối"
                                  : "Đã đóng"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-xs text-slate-500 hover:text-slate-900 font-medium px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                          >
                            Chi tiết
                          </Link>
                          <Link
                            to={`/employer/edit-job/${job.id}`}
                            className="text-xs text-primary-600 hover:text-primary-800 font-medium px-2.5 py-1.5 border border-primary-200 rounded hover:bg-primary-50 transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" /> Sửa
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2.5 py-1.5 border border-rose-200 rounded hover:bg-rose-50 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATIONS LIST */}
        {activeTab === "applications" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
              {applications.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-500">
                  Chưa có hồ sơ ứng tuyển nào.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <th className="p-4 font-medium">Ứng viên</th>
                        <th className="p-4 font-medium">Vị trí ứng tuyển</th>
                        <th className="p-4 font-medium">Độ phù hợp</th>
                        <th className="p-4 font-medium">Trạng thái</th>
                        <th className="p-4 font-medium text-right">Hồ sơ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {applications.map((app) => {
                        const score = calculateMatchScore(
                          app.candidateSkills,
                          app.jobSkills,
                        );
                        return (
                          <tr
                            key={app.id}
                            className="hover:bg-slate-50 transition-colors text-sm"
                          >
                            {/* Candidate Col */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 shadow-2xs">
                                  {app.candidateAvatarUrl ? (
                                    <img
                                      src={getFullUrl(app.candidateAvatarUrl)}
                                      alt={app.candidateName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="font-extrabold text-slate-400 text-xs">
                                      {app.candidateName
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div
                                    className="font-bold text-slate-900 hover:text-primary-600 transition-colors cursor-pointer"
                                    onClick={() =>
                                      handleViewCandidateProfile(
                                        app.candidateUserId,
                                      )
                                    }
                                  >
                                    {app.candidateName}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    {app.candidateEmail}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Job Col */}
                            <td className="p-4">
                              <div className="text-slate-900">
                                {app.jobTitle}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {new Date(app.appliedAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </div>
                            </td>

                            {/* Score Col */}
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  score >= 80
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : score >= 50
                                      ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                      : "bg-rose-50 text-rose-700 border border-rose-200/60"
                                }`}
                              >
                                {score}% Match
                              </span>
                            </td>

                            {/* Status Col */}
                            <td className="p-4">
                              <div className="relative inline-block w-36">
                                <select
                                  value={app.status}
                                  onChange={(e) =>
                                    handleStatusChange(app.id, e.target.value)
                                  }
                                  className="block w-full appearance-none bg-white border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded leading-tight focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs font-medium cursor-pointer"
                                >
                                  <option value="New">Mới nộp</option>
                                  <option value="Viewed">Đã xem</option>
                                  <option value="Contacted">Đã liên hệ</option>
                                  <option value="Interviewing">
                                    Phỏng vấn
                                  </option>
                                  <option value="Offered">Offer</option>
                                  <option value="Rejected">Từ chối</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                  <ChevronDown className="w-3 h-3" />
                                </div>
                              </div>
                            </td>

                            {/* Action Col */}
                            <td className="p-4 text-right space-x-2">
                              {app.resumeUrl && (
                                <a
                                  href={getFullUrl(app.resumeUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                                  title="Xem CV gốc"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() =>
                                  handleViewCandidateProfile(
                                    app.candidateUserId,
                                  )
                                }
                                className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                                title="Hồ sơ chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS (Minimal Form) */}
        {activeTab === "settings" && (
          <div className="max-w-3xl animate-fade-in pb-10">
            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Logo Upload Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
                <div className="relative w-20 h-20 rounded border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group">
                  {profile?.logoUrl ? (
                    <img
                      src={getFullUrl(profile.logoUrl)}
                      alt="Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xl font-medium text-slate-400">
                      Logo
                    </span>
                  )}
                  <label className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Logo doanh nghiệp
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Định dạng JPG, PNG. Tối đa 2MB. Tỷ lệ 1:1.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Tên công ty <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profile?.companyName || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Quy mô nhân sự
                  </label>
                  <input
                    type="text"
                    value={profile?.companySize || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, companySize: e.target.value })
                    }
                    placeholder="VD: 50-100 người"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Trang web
                  </label>
                  <input
                    type="url"
                    value={profile?.website || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, website: e.target.value })
                    }
                    placeholder="https://"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Địa chỉ trụ sở
                  </label>
                  <input
                    type="text"
                    value={profile?.address || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Khẩu hiệu / Giới thiệu ngắn
                </label>
                <input
                  type="text"
                  value={profile?.shortDescription || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, shortDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={5}
                  value={profile?.description || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all resize-y"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-6 py-2 rounded-md shadow-sm transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {savingSettings ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Settings className="w-3.5 h-3.5" />
                  )}
                  {savingSettings ? "Đang lưu..." : "Lưu cài đặt"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MINIMAL CANDIDATE MODAL */}
      {candidateModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setCandidateModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">
                Chi tiết ứng viên
              </h3>
              <button
                onClick={() => setCandidateModal(null)}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {candidateModal.loading ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Đang tải hồ sơ...
                </div>
              ) : candidateModal.profile ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl font-medium text-slate-600">
                      {candidateModal.profile.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {candidateModal.profile.fullName}
                      </h4>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {candidateModal.profile.title || "Ứng viên"}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-md border border-slate-200">
                    {candidateModal.profile.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />{" "}
                        {candidateModal.profile.email}
                      </div>
                    )}
                    {candidateModal.profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />{" "}
                        {candidateModal.profile.phone}
                      </div>
                    )}
                  </div>

                  {/* Sections */}
                  {candidateModal.profile.skillsSummary && (
                    <div>
                      <h5 className="text-xs font-semibold text-slate-900 uppercase mb-2">
                        Kỹ năng
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {candidateModal.profile.skillsSummary.split(",").map(
                          (s, i) =>
                            s.trim() && (
                              <span
                                key={i}
                                className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded"
                              >
                                {s.trim()}
                              </span>
                            ),
                        )}
                      </div>
                    </div>
                  )}

                  {candidateModal.profile.experience && (
                    <div>
                      <h5 className="text-xs font-semibold text-slate-900 uppercase mb-2">
                        Kinh nghiệm làm việc
                      </h5>
                      <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                        {candidateModal.profile.experience}
                      </p>
                    </div>
                  )}

                  {candidateModal.profile.education && (
                    <div>
                      <h5 className="text-xs font-semibold text-slate-900 uppercase mb-2">
                        Học vấn
                      </h5>
                      <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                        {candidateModal.profile.education}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Hồ sơ chưa cập nhật hoặc bị ẩn.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
