// File: src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { masterDataApi } from "../services/masterDataApi";
import { jobApi } from "../services/jobApi";
import JobCard from "../components/JobCard";

const HomePage = () => {
  const navigate = useNavigate();

  // 1. Quản lý State cho Master Data & Tuyển dụng
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // 2. Quản lý State cho Form Tìm kiếm
  const [searchForm, setSearchForm] = useState({
    keyword: "",
    locationId: "",
    categoryId: "",
  });

  // 3. Gọi API lấy dữ liệu khi Trang chủ vừa load xong
  useEffect(() => {
    const fetchMasterDataAndJobs = async () => {
      try {
        const [categoriesData, locationsData, jobsData] = await Promise.all([
          masterDataApi.getCategories(),
          masterDataApi.getLocations(),
          jobApi.searchJobs({ pageSize: 4 }),
        ]);

        setCategories(categoriesData || []);
        setLocations(locationsData || []);
        setFeaturedJobs(jobsData?.items || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchMasterDataAndJobs();
  }, []);

  // 4. Xử lý sự kiện khi gõ/chọn trên form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({ ...prev, [name]: value }));
  };

  // 5. Xử lý khi ấn nút Tìm kiếm
  const handleSearch = (e) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    if (searchForm.keyword) params.append("keyword", searchForm.keyword);
    if (searchForm.locationId)
      params.append("locationId", searchForm.locationId);
    if (searchForm.categoryId)
      params.append("categoryId", searchForm.categoryId);

    navigate(`/jobs?${params.toString()}`);
  };

  // Click vào từ khóa gợi ý
  const handleHotTagClick = (tag) => {
    setSearchForm((prev) => {
      const next = { ...prev, keyword: tag };
      const params = new URLSearchParams();
      params.append("keyword", tag);
      if (next.locationId) params.append("locationId", next.locationId);
      if (next.categoryId) params.append("categoryId", next.categoryId);
      navigate(`/jobs?${params.toString()}`);
      return next;
    });
  };

  // Điều hướng khi click vào danh mục nghề nghiệp
  const handleCategoryClick = (catId) => {
    navigate(`/jobs?categoryId=${catId}`);
  };

  // Icon SVG đẹp cho từng Category ID
  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 1: // CNTT
        return (
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
        );
      case 2: // Marketing
        return (
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
        );
      case 3: // Kế toán
        return (
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      case 4: // Nhân sự
        return (
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        );
      case 5: // Kinh doanh
        return (
          <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-slate-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-[#fcfdfe]">
      {/* --- HERO BANNER SECTION (Light Mesh Gradient & Premium Glassmorphism) --- */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-blue-50/70 via-indigo-50/50 to-purple-50/40 py-20 md:py-28 text-slate-900 border-b border-slate-100">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

        <div className="container-custom relative z-10">
          {/* Title & Tagline */}
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12 animate-slide-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-600 border border-primary-100 mb-4">
              ✨ Nền tảng việc làm đa ngành thế hệ mới
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight text-slate-900">
              Khám phá công việc <br />
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                mơ ước
              </span>{" "}
              của bạn
            </h1>
            <p className="text-base md:text-lg text-slate-500 font-light max-w-xl mx-auto">
              Hàng ngàn cơ hội việc làm từ các công ty uy tín hàng đầu tại Việt
              Nam đang chờ đón bạn.
            </p>
          </div>

          {/* Search Box Card with Light Glassmorphic design */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-100 p-5 md:p-6 rounded-3xl shadow-xl shadow-slate-100/80 max-w-5xl mx-auto animate-fade-in">
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-3"
            >
              {/* Input: Keyword */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="keyword"
                  value={searchForm.keyword}
                  onChange={handleInputChange}
                  placeholder="Tiêu đề, kỹ năng, công ty..."
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Select: Location */}
              <div className="md:w-52 relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <select
                  name="locationId"
                  value={searchForm.locationId}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-8 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="text-slate-700">
                    Tất cả địa điểm
                  </option>
                  {locations.map((loc) => (
                    <option
                      key={loc.id}
                      value={loc.id}
                      className="text-slate-700"
                    >
                      {loc.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Select: Category */}
              <div className="md:w-60 relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <select
                  name="categoryId"
                  value={searchForm.categoryId}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-8 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="text-slate-700">
                    Tất cả ngành nghề
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="text-slate-700"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-linear-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-semibold px-8 py-3.5 rounded-2xl shadow-md shadow-primary-500/20 transition-all duration-300 active:scale-[0.98] text-sm md:w-auto w-full cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Tìm Việc Ngay</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </form>

            {/* Quick Suggest Tag Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-1">
              <span className="font-semibold text-slate-500">
                Tìm kiếm phổ biến:
              </span>
              {[
                "ReactJS",
                ".NET",
                "Marketing",
                "Sales",
                "Kiểm toán",
                "Devops",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleHotTagClick(tag)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full border border-slate-200 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- STATISTICS COUNTER SECTION --- */}
      <section className="py-12 -mt-6 relative z-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Item 1 */}
            <div className="bg-white border border-slate-100/80 shadow-md hover:shadow-xl rounded-2xl p-6 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl shadow-sm">
                💼
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">1,200+</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Việc làm Active
                </p>
              </div>
            </div>
            {/* Stat Item 2 */}
            <div className="bg-white border border-slate-100/80 shadow-md hover:shadow-xl rounded-2xl p-6 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xl shadow-sm">
                🏢
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">450+</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Nhà tuyển dụng tin cậy
                </p>
              </div>
            </div>
            {/* Stat Item 3 */}
            <div className="bg-white border border-slate-100/80 shadow-md hover:shadow-xl rounded-2xl p-6 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl shadow-sm">
                🤝
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">98%</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Lượt kết nối thành công
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED CATEGORIES SECTION --- */}
      <section className="py-16 bg-[#fcfdfe]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Khám Phá Theo Ngành Nghề
            </h2>
            <p className="text-slate-500 text-sm">
              Tìm kiếm cơ hội nghề nghiệp tương ứng trong các lĩnh vực thịnh
              hành nhất
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/5 hover:border-primary-100 group flex flex-col items-center gap-4"
              >
                {getCategoryIcon(cat.id)}
                <h3 className="font-semibold text-slate-800 text-sm group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[40px] flex items-center justify-center">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED JOBS SECTION (Dynamic) --- */}
      <section className="py-16 bg-slate-50/50 border-t border-b border-slate-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Việc Làm Mới Nhất
              </h2>
              <p className="text-slate-500 text-sm mt-1.5">
                Các vị trí hot với mức lương hấp dẫn đang chờ hồ sơ ứng tuyển
                của bạn
              </p>
            </div>
            <button
              onClick={() => navigate("/jobs")}
              className="group flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
            >
              Xem tất cả công việc
              <span className="group-hover:translate-x-1 transition-transform">
                ➔
              </span>
            </button>
          </div>

          {loadingJobs ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4 animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl"></div>
                    <div className="space-y-3 flex-1">
                      <div className="h-4 bg-slate-200 rounded-md w-48"></div>
                      <div className="h-3 bg-slate-150 rounded-md w-32"></div>
                      <div className="flex gap-2">
                        <div className="h-5 bg-slate-100 rounded-md w-16"></div>
                        <div className="h-5 bg-slate-100 rounded-md w-16"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col justify-end items-end gap-2">
                    <div className="h-5 bg-slate-200 rounded-md w-24"></div>
                    <div className="h-8 bg-slate-100 rounded-md w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredJobs.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-2xl text-slate-400">
                🔍
              </div>
              <p className="text-slate-500 font-medium">
                Hiện tại chưa có tin tuyển dụng nào được đăng.
              </p>
              <p className="text-slate-400 text-xs">
                Hãy quay lại kiểm tra sau nhé!
              </p>
            </div>
          ) : (
            /* Jobs List */
            <div className="grid grid-cols-1 gap-4">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Quy Trình Ứng Tuyển Nhanh Chóng
            </h2>
            <p className="text-slate-500 text-sm">
              Tìm kiếm công việc mơ ước chỉ với 3 bước đơn giản
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Decorative arrow/line for tablet/desktop */}
            <div className="hidden md:block absolute top-1/4 left-[30%] right-[30%] h-0.5 border-t border-dashed border-slate-200 z-0"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-sm mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 hover:scale-105">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Tải Lên CV & Tạo Hồ Sơ
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Cập nhật thông tin kinh nghiệm làm việc, kỹ năng của bạn và tải
                lên file CV PDF chuyên nghiệp.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-bold shadow-sm mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 hover:scale-105">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Tìm Kiếm Công Việc
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Tìm kiếm công việc theo kỹ năng của bạn như ReactJS, Sales,
                Marketing hoặc theo địa điểm làm việc.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-sm mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 hover:scale-105">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Ứng Tuyển & Phỏng Vấn
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Gửi trực tiếp CV của bạn cho nhà tuyển dụng chỉ bằng 1 cú click
                và chờ nhận cuộc gọi phỏng vấn.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
