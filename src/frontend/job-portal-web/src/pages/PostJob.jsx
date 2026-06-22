import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Sparkles, Plus, Check } from "lucide-react";
import { masterDataApi } from "../services/masterDataApi";
import { employerApi } from "../services/employerApi";
import { useToast } from "../contexts/ToastContext";

const PostJob = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // States chứa kho Master Data để hiển thị ra form
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [creatingSkill, setCreatingSkill] = useState(false);

  // State quản lý toàn bộ dữ liệu người dùng nhập
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    quantity: 1,
    salaryMin: "",
    salaryMax: "",
    isNegotiable: false,
    jobLevel: "Fresher", // Mặc định theo Enum Backend
    workType: "FullTime", // Mặc định theo Enum Backend
    description: "",
    requirements: "",
    benefits: "",
    expirationDate: "",
    locationIds: [], // Lưu mảng ID địa điểm được chọn [1, 2]
    skillIds: [], // Lưu mảng ID kỹ năng được chọn [5, 8, 12]
  });

  // Load Master Data khi vào trang
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catData, locData, skillData] = await Promise.all([
          masterDataApi.getCategories(),
          masterDataApi.getLocations(),
          masterDataApi.getSkills(),
        ]);
        setCategories(catData || []);
        setLocations(locData || []);
        setSkills(skillData || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu cấu hình:", error);
        showToast("Không thể tải danh mục cấu hình hệ thống!", "danger");
      }
    };
    fetchMasterData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Logic thêm/xóa ID trong mảng Đa lựa chọn (Multiple Tags Selection)
  const handleToggleSelection = (field, id) => {
    setFormData((prev) => {
      const currentIds = prev[field];
      const isSelected = currentIds.includes(id);
      return {
        ...prev,
        [field]: isSelected
          ? currentIds.filter((item) => item !== id) // Nếu chọn rồi -> bỏ chọn
          : [...currentIds, id], // Nếu chưa chọn -> thêm vào
      };
    });
  };

  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) {
      showToast("Vui lòng nhập tên kỹ năng!", "warning");
      return;
    }
    setCreatingSkill(true);
    try {
      const response = await employerApi.createSkill({
        name: newSkillName.trim(),
      });
      const newSkill = response; // Trả về { id, name } từ API

      // Bổ sung vào kho skills nếu chưa tồn tại
      setSkills((prev) => {
        if (prev.some((s) => s.id === newSkill.id)) return prev;
        return [...prev, newSkill];
      });

      // Tự động kích hoạt chọn kỹ năng vừa tạo
      setFormData((prev) => ({
        ...prev,
        skillIds: prev.skillIds.includes(newSkill.id)
          ? prev.skillIds
          : [...prev.skillIds, newSkill.id],
      }));

      setNewSkillName("");
      showToast(
        `Đã thêm kỹ năng "${newSkill.name}" vào danh sách chọn!`,
        "success",
      );
    } catch (error) {
      console.error("Lỗi khi tạo kỹ năng mới:", error);
    } finally {
      setCreatingSkill(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      showToast("Vui lòng chọn ngành nghề chính!", "warning");
      return;
    }
    if (formData.locationIds.length === 0) {
      showToast("Vui lòng chọn ít nhất một địa điểm làm việc!", "warning");
      return;
    }
    if (formData.skillIds.length === 0) {
      showToast("Vui lòng chọn ít nhất một kỹ năng yêu cầu!", "warning");
      return;
    }
    if (!formData.isNegotiable) {
      if (!formData.salaryMin || !formData.salaryMax) {
        showToast("Vui lòng nhập khoảng lương tối thiểu và tối đa!", "warning");
        return;
      }
      if (parseFloat(formData.salaryMin) > parseFloat(formData.salaryMax)) {
        showToast(
          "Lương tối thiểu không được lớn hơn lương tối đa!",
          "warning",
        );
        return;
      }
    }
    if (!formData.expirationDate) {
      showToast("Vui lòng chọn hạn nộp hồ sơ!", "warning");
      return;
    }
    const expDate = new Date(formData.expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expDate < today) {
      showToast("Hạn nộp hồ sơ không được ở trong quá khứ!", "warning");
      return;
    }

    setLoading(true);

    try {
      // Ép kiểu các trường số học để khớp với API .NET, giữ nguyên chuỗi cho Enum
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        quantity: parseInt(formData.quantity),
        salaryMin: formData.isNegotiable
          ? null
          : parseFloat(formData.salaryMin),
        salaryMax: formData.isNegotiable
          ? null
          : parseFloat(formData.salaryMax),
        jobLevel: formData.jobLevel,
        workType: formData.workType,
      };

      await employerApi.createJobPost(payload);
      showToast(
        "Đăng tin tuyển dụng thành công! Đang chuyển hướng...",
        "success",
      );
      setTimeout(() => {
        navigate("/employer/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi đăng tin:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-10 max-w-4xl min-h-screen">
      {/* Premium Header Accent Card */}
      <div className="relative bg-primary-600 text-white rounded-3xl p-8 md:p-10 mb-8 shadow-sm overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" /> Tuyển dụng nhân sự
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Tạo tin tuyển dụng mới
            </h1>
            <p className="text-white/80 text-sm mt-2 max-w-xl">
              Thu hút nhân tài đa ngành bằng cách cung cấp thông tin vị trí công
              việc rõ ràng, đầy đủ và chuyên nghiệp. Tin đăng sẽ được duyệt bởi
              quản trị viên trước khi hiển thị.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-slate-100/80 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Tiêu đề và Ngành nghề */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Thông tin chung
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Tiêu đề công việc *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Senior Fullstack Developer (Java/React)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-semibold outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Ngành nghề chính *
                </label>
                <select
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-semibold text-slate-700 outline-none cursor-pointer transition-all"
                >
                  <option value="">-- Chọn ngành nghề --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Cấu hình phân cấp & Lương */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Yêu cầu & Hạn nộp
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Cấp bậc chuyên môn
                </label>
                <select
                  name="jobLevel"
                  value={formData.jobLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-semibold text-slate-700 outline-none cursor-pointer transition-all"
                >
                  <option value="Intern">Thực tập (Intern)</option>
                  <option value="Fresher">Mới ra trường (Fresher)</option>
                  <option value="Junior">Nhân viên (Junior)</option>
                  <option value="Senior">Chuyên viên (Senior)</option>
                  <option value="Manager">Quản lý (Manager/Leader)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Hình thức làm việc
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-semibold text-slate-700 outline-none cursor-pointer transition-all"
                >
                  <option value="FullTime">Toàn thời gian</option>
                  <option value="PartTime">Bán thời gian</option>
                  <option value="Remote">Làm từ xa (Remote)</option>
                  <option value="Hybrid">Linh hoạt (Hybrid)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Số lượng tuyển dụng *
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-semibold outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Hạn nộp hồ sơ *
                </label>
                <input
                  type="date"
                  name="expirationDate"
                  required
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-semibold text-slate-700 outline-none cursor-pointer transition-all"
                />
              </div>
            </div>
          </div>

          {/* Khối quản lý Khoảng lương */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isNegotiable"
                name="isNegotiable"
                checked={formData.isNegotiable}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500/20 border-slate-200 rounded-lg cursor-pointer"
              />
              <label
                htmlFor="isNegotiable"
                className="text-xs font-bold text-slate-700 cursor-pointer select-none"
              >
                Mức lương thỏa thuận (Thương lượng trực tiếp)
              </label>
            </div>

            {!formData.isNegotiable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Lương tối thiểu (VND)
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    placeholder="Ví dụ: 10000000"
                    required={!formData.isNegotiable}
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-primary-500 rounded-2xl text-sm font-semibold outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Lương tối đa (VND)
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    placeholder="Ví dụ: 25000000"
                    required={!formData.isNegotiable}
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-primary-500 rounded-2xl text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. ĐA LỰA CHỌN ĐỊA ĐIỂM (Multiple Locations Tag Selection) */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Địa điểm làm việc *{" "}
              <span className="text-slate-400 font-medium lowercase">
                (chọn ít nhất 1)
              </span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {locations.map((loc) => {
                const isSelected = formData.locationIds.includes(loc.id);
                return (
                  <button
                    type="button"
                    key={loc.id}
                    onClick={() => handleToggleSelection("locationIds", loc.id)}
                    className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm shadow-primary-500/10"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/80"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{loc.name}</span>
                    {isSelected && (
                      <Check className="w-3 h-3 text-primary-600 font-extrabold ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. ĐA LỰA CHỌN KỸ NĂNG (Multiple Skills Tag Selection) */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Kỹ năng yêu cầu *{" "}
              <span className="text-slate-400 font-medium lowercase">
                (chọn ít nhất 1)
              </span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill) => {
                const isSelected = formData.skillIds.includes(skill.id);
                return (
                  <button
                    type="button"
                    key={skill.id}
                    onClick={() => handleToggleSelection("skillIds", skill.id)}
                    className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-500/10"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/80"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{skill.name}</span>
                    {isSelected && (
                      <Check className="w-3 h-3 text-emerald-600 font-extrabold ml-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tạo kỹ năng mới nhanh */}
            <div className="mt-3 flex gap-2 items-center max-w-sm">
              <input
                type="text"
                placeholder="Nhập tên kỹ năng mới (ví dụ: Swift, Angular...)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleCreateSkill}
                disabled={creatingSkill}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl cursor-pointer transition-colors whitespace-nowrap active:scale-95 shadow-sm shadow-emerald-500/10 flex items-center gap-1.5"
              >
                {creatingSkill ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Tạo Kỹ năng
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5. Khối nhập Text Mô tả */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Nội dung mô tả tuyển dụng
            </p>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Mô tả công việc *
                </label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Thực hiện phát triển tính năng mới của sản phẩm, bảo trì hệ thống, tối ưu hóa code..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-semibold outline-none resize-none transition-all"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Yêu cầu ứng viên *
                </label>
                <textarea
                  name="requirements"
                  rows="4"
                  required
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Tối thiểu 1 năm kinh nghiệm Javascript/React, kỹ năng làm việc nhóm tốt, tự giác trong công việc..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-semibold outline-none resize-none transition-all"
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Quyền lợi & Đãi ngộ *
                </label>
                <textarea
                  name="benefits"
                  rows="4"
                  required
                  value={formData.benefits}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Lương tháng 13, đóng bảo hiểm đầy đủ, du lịch hàng năm, môi trường làm việc trẻ trung..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-semibold outline-none resize-none transition-all"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Nút lưu gửi thông tin */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/employer/dashboard")}
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-extrabold px-6 py-3 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading ? "Đang gửi yêu cầu..." : "Đăng Tin Tuyển Dụng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
