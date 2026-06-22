import { useEffect, useState } from "react";
import {
  Camera,
  X,
  FileText,
  Trash2,
  Check,
  AlertTriangle,
  UploadCloud,
} from "lucide-react";
import { profileApi } from "../services/profileApi";
import { useToast } from "../contexts/ToastContext";

const ProfilePage = () => {
  const { showToast } = useToast();

  // --- States quản lý UI ---
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // --- States Dữ liệu ---
  const [resumes, setResumes] = useState([]);
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    title: "",
    experience: "",
    education: "",
    skillsSummary: "",
    avatarUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // --- Helper lấy đường dẫn tệp đầy đủ từ Server ---
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    // Bỏ hậu tố /api ở cuối VITE_API_URL để lấy đường dẫn Host tĩnh
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}${path}`;
  };

  // --- Gọi API lấy dữ liệu Profile & CV song song ---
  const fetchData = async () => {
    try {
      const [profileData, resumesData] = await Promise.all([
        profileApi.getMyProfile(),
        profileApi.getResumes(),
      ]);

      if (profileData) {
        setProfile({
          fullName: profileData.fullName || "",
          phone: profileData.phone || "",
          title: profileData.title || "",
          experience: profileData.experience || "",
          education: profileData.education || "",
          skillsSummary: profileData.skillsSummary || "",
          avatarUrl: profileData.avatarUrl || "",
        });
        const skillsStr = profileData.skillsSummary || "";
        const skillsArray = skillsStr
          ? skillsStr
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        setTags(skillsArray);
      }
      setResumes(resumesData || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu trang cá nhân:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- XỬ LÝ TAG CHIPS CHO KỸ NĂNG ---
  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleTagInputBlur = () => {
    addTag();
  };

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/,$/, "").trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  // --- XỬ LÝ CẬP NHẬT PROFILE ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.fullName.trim()) {
      return showToast("Họ tên không được để trống.", "error");
    }
    setSavingProfile(true);
    try {
      const skillsJoined = tags.join(", ");
      await profileApi.updateProfile({
        ...profile,
        skillsSummary: skillsJoined,
      });
      setProfile((prev) => ({ ...prev, skillsSummary: skillsJoined }));
      showToast("Cập nhật thông tin cá nhân thành công!", "success");
    } catch (error) {
      console.error(error);
    } finally {
      setSavingProfile(false);
    }
  };

  // --- XỬ LÝ ẢNH ĐẠI DIỆN (AVATAR) ---
  const triggerAvatarInput = () => {
    const input = document.getElementById("avatar-file-input");
    if (input) input.click();
  };

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Kiểm tra định dạng ảnh
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        return showToast(
          "Chỉ chấp nhận ảnh định dạng JPG, JPEG, PNG.",
          "error",
        );
      }
      // Giới hạn 2MB
      if (file.size > 2 * 1024 * 1024) {
        return showToast("Dung lượng ảnh tối đa là 2MB.", "error");
      }

      const formData = new FormData();
      formData.append("File", file);

      setUploadingAvatar(true);
      try {
        const res = await profileApi.uploadAvatar(formData);
        if (res && res.avatarUrl) {
          setProfile((prev) => ({ ...prev, avatarUrl: res.avatarUrl }));
          showToast("Cập nhật ảnh đại diện thành công!", "success");
        }
      } catch (error) {
        console.error("Lỗi khi tải ảnh đại diện lên server:", error);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  // --- XỬ LÝ KHO CV ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return showToast("Vui lòng chọn file CV!", "warning");
    if (selectedFile.size > 5 * 1024 * 1024)
      return showToast("Dung lượng file tối đa là 5MB.", "error");

    const formData = new FormData();
    formData.append("File", selectedFile);

    setUploading(true);
    try {
      await profileApi.uploadResume(formData);
      showToast("Tải lên CV thành công!", "success");
      setSelectedFile(null);

      // Clear input file
      const fileInput = document.getElementById("cv-file-input");
      if (fileInput) fileInput.value = "";

      // Tải lại riêng danh sách CV
      const updatedResumes = await profileApi.getResumes();
      setResumes(updatedResumes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await profileApi.setDefaultResume(id);
      showToast("Đã thiết lập CV mặc định thành công.", "success");
      const updatedResumes = await profileApi.getResumes();
      setResumes(updatedResumes || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenDeleteConfirm = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await profileApi.deleteResume(deleteConfirmId);
      setResumes((prev) => prev.filter((r) => r.id !== deleteConfirmId));
      showToast("Đã xóa CV thành công.", "success");
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Helper format ngày tháng năm
  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Chưa cập nhật";
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return "Chưa cập nhật";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 bg-[#fcfdfe]">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="w-6 h-6 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin absolute"></div>
        </div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Đang tải hồ sơ của bạn...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-16 relative">
      {/* --- COVER PHOTO & PROFILE HEADER --- */}
      <div className="h-60 bg-primary-600 w-full relative overflow-hidden">
        <div className="container-custom relative h-full">
          <div className="absolute -bottom-10 left-4 md:left-8 flex items-end gap-5">
            {/* Avatar block */}
            <div
              onClick={triggerAvatarInput}
              className="relative w-28 h-28 bg-white p-1.5 rounded-2xl shadow-lg border border-slate-100/50 hover:scale-[1.02] transition-transform duration-300 shrink-0 cursor-pointer group"
              title="Nhấp vào để đổi ảnh đại diện"
            >
              {/* Invisible file input */}
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              {/* Profile Image or Fallback character */}
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-primary-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-inner">
                {profile.avatarUrl ? (
                  <img
                    src={getFullUrl(profile.avatarUrl)}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : profile.fullName ? (
                  profile.fullName.trim().charAt(0).toUpperCase()
                ) : (
                  "U"
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-300 text-white z-10">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Đổi ảnh
                  </span>
                </div>

                {/* Upload spinner */}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-15">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Role badge placed neatly in the bottom-right corner of the avatar */}
              <span className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500 text-white border-2 border-white shadow-md select-none z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Ứng viên
              </span>
            </div>

            {/* Header user text info */}
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                {profile.fullName || "Ứng viên mới"}
              </h1>
              <p className="text-primary-100 text-sm font-medium mt-0.5 drop-shadow-sm">
                {profile.title || "Chưa cập nhật vị trí chuyên môn"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="container-custom mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* CỘT TRÁI: FORM THÔNG TIN CÁ NHÂN (CHIẾM 2/3) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Thông tin cá nhân
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Cập nhật đầy đủ hồ sơ của bạn giúp thu hút sự chú ý của các nhà
                tuyển dụng công nghệ.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Row 1: FullName & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="09xx xxx xxx"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Chức danh / Vị trí hiện tại
                </label>
                <input
                  type="text"
                  name="title"
                  value={profile.title}
                  onChange={handleProfileChange}
                  placeholder="VD: Senior Frontend Developer / DevOps Engineer"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                />
              </div>

              {/* Row 3: Skills Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Kỹ năng của bạn (Skills)
                </label>
                <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all outline-none">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-primary-50 text-primary-600 text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 group"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(idx)}
                          className="text-primary-400 hover:text-rose-600 font-bold hover:bg-rose-50 rounded-sm w-4 h-4 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={handleTagInputBlur}
                    placeholder={
                      tags.length === 0
                        ? "Nhập kỹ năng (ví dụ: Marketing, C#) rồi nhấn Enter hoặc phẩy (,)..."
                        : "Thêm kỹ năng..."
                    }
                    className="w-full bg-transparent border-none text-slate-900 text-sm focus:outline-none focus:ring-0 p-1.5 placeholder-slate-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Nhập các kỹ năng của bạn (ví dụ: Marketing, C#, Bán hàng) và
                  nhấn **Enter** hoặc dấu phẩy **(,)** để tạo nhãn (tag).
                </p>
              </div>

              {/* Row 4: Education & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Học vấn
                  </label>
                  <textarea
                    name="education"
                    value={profile.education}
                    onChange={handleProfileChange}
                    rows="4"
                    placeholder="VD: Đại học Công nghệ thông tin - Chuyên ngành Khoa học máy tính (2019 - 2023)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Kinh nghiệm làm việc
                  </label>
                  <textarea
                    name="experience"
                    value={profile.experience}
                    onChange={handleProfileChange}
                    rows="4"
                    placeholder="VD: - Công ty Tech Soft (2023 - Nay): Lập trình viên ReactJS&#10;- Công ty Startup Hub (2022 - 2023): Thực tập sinh Web"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Submit btn */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-primary-500/10 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer text-sm"
                >
                  {savingProfile ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang cập nhật...
                    </span>
                  ) : (
                    "Lưu Thay Đổi"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* CỘT PHẢI: QUẢN LÝ KHO CV (CHIẾM 1/3) */}
          <div className="space-y-6">
            {/* CARD 1: UPLOAD CV MỚI */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-4">
                Tải lên CV Mới
              </h3>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 hover:border-primary-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-primary-50/5 transition-all duration-300 relative group cursor-pointer">
                  <input
                    id="cv-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-3 pointer-events-none">
                    <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center mx-auto group-hover:scale-105 transition-all duration-300 shadow-xs">
                      <UploadCloud className="w-6 h-6 text-primary-550" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {selectedFile
                          ? selectedFile.name
                          : "Nhấn hoặc kéo thả CV"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Hỗ trợ PDF, DOC, DOCX (Tối đa 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full bg-slate-950 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-3 rounded-2xl transition-all active:scale-[0.98] cursor-pointer text-sm shadow-xs"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang xử lý tải lên...
                    </span>
                  ) : (
                    "Lưu Lên Hệ Thống"
                  )}
                </button>
              </form>
            </div>

            {/* CARD 2: DANH SÁCH CV TRONG KHO */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-4 flex items-center justify-between">
                <span>Kho CV cá nhân</span>
                <span className="bg-primary-50 text-primary-600 text-xs py-1 px-3 rounded-full font-bold">
                  {resumes.length} bản
                </span>
              </h3>

              {resumes.length === 0 ? (
                /* Empty state */
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Bạn chưa tải lên CV nào.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Tải CV mới để bắt đầu nộp hồ sơ.
                    </p>
                  </div>
                </div>
              ) : (
                /* CV items list */
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`p-4 border rounded-2xl transition-all duration-300 group relative ${
                        resume.isDefault
                          ? "border-emerald-200 bg-emerald-500/[0.02]"
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                    >
                      {/* File Name & Delete btn */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {/* File Icon SVG */}
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                              resume.isDefault
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <a
                              href={getFullUrl(resume.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-xs text-slate-800 hover:text-primary-600 transition-colors truncate block"
                              title={resume.fileName}
                            >
                              {resume.fileName}
                            </a>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Tải lên ngày: {formatDate(resume.uploadedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Action Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteConfirm(resume.id)}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Xóa CV"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Default status info / action */}
                      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-100/50">
                        {resume.isDefault ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold px-2 py-1 rounded-lg border border-emerald-500/10">
                            <Check className="w-3.5 h-3.5" />
                            CV MẶC ĐỊNH
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(resume.id)}
                            className="text-[10px] font-bold text-slate-500 hover:text-primary-600 underline cursor-pointer bg-transparent border-none p-0 outline-none"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONFIRM DELETE MODAL (Premium Modal) --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-sm w-full shadow-2xl animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-xl mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">
              Xác nhận xóa tài liệu?
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Bạn chắc chắn muốn xóa bản CV này khỏi hệ thống? Thao tác này sẽ
              gỡ bỏ file vật lý và không thể khôi phục lại.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
