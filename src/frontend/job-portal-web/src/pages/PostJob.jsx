// File: src/pages/PostJob.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { masterDataApi } from "../services/masterDataApi";
import { employerApi } from "../services/employerApi";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // States chứa kho Master Data để hiển thị ra form
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [skills, setSkills] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.locationIds.length === 0)
      return alert("Vui lòng chọn ít nhất một địa điểm làm việc!");
    if (formData.skillIds.length === 0)
      return alert("Vui lòng chọn ít nhất một kỹ năng yêu cầu!");

    setLoading(true);
    try {
      // Ép kiểu các trường số học để khớp với API .NET
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
      };

      await employerApi.createJobPost(payload);
      alert("Đăng tin tuyển dụng thành công! Tin đang chờ Admin phê duyệt.");
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi đăng tin:", error);
      alert(
        "Đăng tin thất bại. Vui lòng kiểm tra lại quyền hạn hoặc dữ liệu nhập vào.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-10 max-w-4xl">
      <div className="bg-surface rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 animate-fade-in">
        {/* Tiêu đề trang */}
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Tạo tin tuyển dụng mới
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thu hút nhân tài công nghệ bằng thông tin vị trí công việc chi tiết.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Tiêu đề và Ngành nghề */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tiêu đề công việc *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ví dụ: Senior Fullstack Developer (Java/React)"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ngành nghề chính *
              </label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface cursor-pointer"
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

          {/* 2. Cấu hình phân cấp & Lương */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Cấp bậc
              </label>
              <select
                name="jobLevel"
                value={formData.jobLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface"
              >
                <option value="Intern">Intern</option>
                <option value="Fresher">Fresher</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Manager">Manager/Leader</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hình thức làm việc
              </label>
              <select
                name="workType"
                value={formData.workType}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface"
              >
                <option value="FullTime">Toàn thời gian</option>
                <option value="PartTime">Bán thời gian</option>
                <option value="Remote">Làm từ xa (Remote)</option>
                <option value="Hybrid">Linh hoạt (Hybrid)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Số lượng tuyển *
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hạn nộp hồ sơ *
              </label>
              <input
                type="date"
                name="expirationDate"
                required
                value={formData.expirationDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface cursor-pointer"
              />
            </div>
          </div>

          {/* Khối quản lý Khoảng lương */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isNegotiable"
                name="isNegotiable"
                checked={formData.isNegotiable}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor="isNegotiable"
                className="text-sm font-semibold text-gray-700 cursor-pointer select-none"
              >
                Mức lương thỏa thuận (Thương lượng)
              </label>
            </div>

            {!formData.isNegotiable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Lương tối thiểu (VND)
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    placeholder="Ví dụ: 10000000"
                    required={!formData.isNegotiable}
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-surface border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Lương tối đa (VND)
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    placeholder="Ví dụ: 25000000"
                    required={!formData.isNegotiable}
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-surface border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. ĐA LỰA CHỌN ĐỊA ĐIỂM (Multiple Locations Tag Selection) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Địa điểm làm việc * (Chọn một hoặc nhiều)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {locations.map((loc) => {
                const isSelected = formData.locationIds.includes(loc.id);
                return (
                  <button
                    type="button"
                    key={loc.id}
                    onClick={() => handleToggleSelection("locationIds", loc.id)}
                    className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${isSelected ? "bg-primary-600 text-white border-primary-600 shadow-sm" : "bg-surface text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                  >
                    {loc.name} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. ĐA LỰA CHỌN KỸ NĂNG (Multiple Skills Tag Selection) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kỹ năng yêu cầu * (Chọn một hoặc nhiều)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill) => {
                const isSelected = formData.skillIds.includes(skill.id);
                return (
                  <button
                    type="button"
                    key={skill.id}
                    onClick={() => handleToggleSelection("skillIds", skill.id)}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${isSelected ? "bg-success-600 text-white border-success-600 shadow-sm" : "bg-surface text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                  >
                    {skill.name} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Khối nhập Text Mô tả */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mô tả công việc *
              </label>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhiệm vụ hàng ngày, dự án sẽ tham gia..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Yêu cầu ứng viên *
              </label>
              <textarea
                name="requirements"
                rows="4"
                required
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Số năm kinh nghiệm, công nghệ bắt buộc, học vấn..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Quyền lợi & Đãi ngộ *
              </label>
              <textarea
                name="benefits"
                rows="4"
                required
                value={formData.benefits}
                onChange={handleInputChange}
                placeholder="Lương tháng 13, bảo hiểm, du lịch, lộ trình thăng tiến..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
              ></textarea>
            </div>
          </div>

          {/* Nút lưu gửi thông tin */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm shadow-sm transition-colors cursor-pointer active:scale-95"
            >
              {loading ? "Đang xuất bản..." : "Đăng Tin Tuyển Dụng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
