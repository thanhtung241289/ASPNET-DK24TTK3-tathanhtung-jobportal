// File: src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { masterDataApi } from "../services/masterDataApi";
import { jobApi } from "../services/jobApi";
import JobCard from "../components/JobCard";
import { formatSalary } from "../utils/translators";

const HomePage = () => {
  const navigate = useNavigate();

  // 1. Quản lý State cho Master Data & Tuyển dụng
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [hotJobs, setHotJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    companiesCount: 0,
    applicationsCount: 0,
  });
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingHot, setLoadingHot] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Email đăng ký bản tin tuyển dụng
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // 2. Quản lý State cho Form Tìm kiếm
  const [searchForm, setSearchForm] = useState({
    keyword: "",
    locationId: "",
    categoryId: "",
  });

  // 3. Gọi API lấy dữ liệu khi Trang chủ vừa load xong
  useEffect(() => {
    const fetchMasterDataAndStats = async () => {
      try {
        const [categoriesData, locationsData, statsData] = await Promise.all([
          masterDataApi.getCategories(),
          masterDataApi.getLocations(),
          masterDataApi.getStats(),
        ]);
        setCategories(categoriesData || []);
        setLocations(locationsData || []);
        setStats(
          statsData || {
            activeJobsCount: 0,
            companiesCount: 0,
            applicationsCount: 0,
          },
        );
      } catch (error) {
        console.error("Lỗi khi tải master data và thống kê:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchJobs = async () => {
      setLoadingJobs(true);
      setLoadingHot(true);
      try {
        const [hotJobsData, latestJobsData] = await Promise.all([
          jobApi.searchJobs({ isHot: true, pageSize: 6 }),
          jobApi.searchJobs({ pageSize: 6 }), // Lấy 6 bài cho chẵn khi chia 2 cột
        ]);
        setHotJobs(hotJobsData?.items || []);
        setLatestJobs(latestJobsData?.items || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách việc làm trang chủ:", error);
      } finally {
        setLoadingJobs(false);
        setLoadingHot(false);
      }
    };

    fetchMasterDataAndStats();
    fetchJobs();
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

  // Đăng ký bản tin
  const handleSubscribeNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
  };

  // Helper to get static file URLs
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

  // Icon SVG đẹp cho từng Category ID
  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 1: // CNTT
        return (
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
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
          <div className="w-12 h-12 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center group-hover:bg-fuchsia-600 group-hover:text-white transition-all duration-300 shadow-sm">
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

  // Mock logo cho Employers để hiển thị chuyên nghiệp
  const featuredEmployers = [
    {
      id: "44444444-4444-4444-4444-444444444444",
      name: "FPT Software",
      logo: "https://img.vietnamworks.com/pictureprofile/vnw/logo_fpt_software.png",
      industry: "Công nghệ thông tin",
      desc: "Doanh nghiệp chuyển đổi số toàn cầu hàng đầu Việt Nam.",
      jobsCount: 3,
    },
    {
      id: "44444444-4444-4444-4444-444444444445",
      name: "Vingroup",
      logo: "https://img.vietnamworks.com/pictureprofile/vnw/logo_vingroup.png",
      industry: "Đa ngành",
      desc: "Tập đoàn kinh tế tư nhân lớn nhất Việt Nam.",
      jobsCount: 1,
    },
    {
      id: "44444444-4444-4444-4444-444444444446",
      name: "Shopee Vietnam",
      logo: "https://logodownload.org/wp-content/uploads/2020/09/shopee-logo-1.png",
      industry: "Thương mại điện tử",
      desc: "Nền tảng mua sắm trực tuyến hàng đầu Đông Nam Á.",
      jobsCount: 2,
    },
    {
      id: "44444444-4444-4444-4444-444444444447",
      name: "EY Vietnam",
      logo: "https://logodownload.org/wp-content/uploads/2021/03/ey-ernst-young-logo-0.png",
      industry: "Kiểm toán & Tư vấn tài chính",
      desc: "Một trong 4 hãng kiểm toán Big Four lớn nhất hành tinh.",
      jobsCount: 1,
    },
  ];

  return (
    <div className="w-full bg-[#fcfdfe]">
      {/* --- HERO BANNER SECTION (Premium Violet Mesh Gradient & Smooth Graphics) --- */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-violet-50/70 via-indigo-50/40 to-fuchsia-50/30 py-24 md:py-32 text-slate-900 border-b border-slate-100">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

        <div className="container-custom relative z-10">
          {/* Title & Tagline */}
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 animate-slide-up">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-primary-50 text-primary-600 border border-primary-100 mb-6 uppercase tracking-wider">
              ✨ Nền tảng kết nối nhân sự đa ngành hàng đầu
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-slate-900">
              Định hình tương lai <br />
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                Sự nghiệp
              </span>{" "}
              của chính bạn
            </h1>
            <p className="text-base md:text-lg text-slate-500 font-light max-w-xl mx-auto">
              Tìm kiếm hàng ngàn cơ hội việc làm chất lượng cao từ các doanh
              nghiệp đã được xác thực uy tín tại Việt Nam.
            </p>
          </div>

          {/* Premium Search Box with Glassmorphism and detailed layout */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-150 p-6 md:p-8 rounded-[32px] shadow-2xl shadow-slate-200/80 max-w-5xl mx-auto animate-fade-in">
            <form
              onSubmit={handleSearch}
              className="flex flex-col lg:flex-row gap-4"
            >
              {/* Keyword input with Icon */}
              <div className="flex-1 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2 pl-1">
                  Tìm kiếm từ khóa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <svg
                      className="w-5 h-5 text-primary-500"
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
                    placeholder="Tên công việc, vị trí, kỹ năng cần tìm..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Location Select with Icon */}
              <div className="lg:w-56 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2 pl-1">
                  Địa điểm
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <svg
                      className="w-5 h-5 text-primary-500"
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
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer"
                  >
                    <option value="">Tất cả địa điểm</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
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
              </div>

              {/* Category Select with Icon */}
              <div className="lg:w-64 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2 pl-1">
                  Ngành nghề
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <svg
                      className="w-5 h-5 text-primary-500"
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
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer"
                  >
                    <option value="">Tất cả ngành nghề</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
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
              </div>

              {/* Submit button at bottom or side */}
              <div className="flex items-end mt-4 lg:mt-0">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-extrabold px-10 py-4 rounded-2xl shadow-lg shadow-primary-500/25 transition-all duration-300 active:scale-[0.98] text-sm w-full cursor-pointer flex items-center justify-center gap-2 h-[54px]"
                >
                  <span>Tìm Kiếm</span>
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
              </div>
            </form>

            {/* Quick Suggest Tag Chips */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-1">
              <span className="font-bold text-slate-400">Gợi ý từ khóa:</span>
              {[
                "ReactJS",
                ".NET",
                "Marketing",
                "Sales",
                "Kế toán",
                "Devops",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleHotTagClick(tag)}
                  className="bg-slate-100 hover:bg-primary-50 hover:text-primary-600 text-slate-600 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-primary-200 transition-all cursor-pointer font-bold"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- STATISTICS COUNTER SECTION (Real database counts) --- */}
      <section className="py-12 -mt-6 relative z-20">
        <div className="container-custom">
          {loadingStats ? (
            <div className="bg-white border border-slate-150 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold">
              Đang kết nối số liệu hệ thống thực tế...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat Item 1 */}
              <div className="bg-white border border-slate-150 shadow-lg hover:shadow-xl rounded-3xl p-7 flex items-center gap-6 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-2xl shadow-inner">
                  💼
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">
                    {stats.activeJobsCount}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    Việc làm đang mở tuyển
                  </p>
                </div>
              </div>
              {/* Stat Item 2 */}
              <div className="bg-white border border-slate-150 shadow-lg hover:shadow-xl rounded-3xl p-7 flex items-center gap-6 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center text-2xl shadow-inner">
                  🏢
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">
                    {stats.companiesCount}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    Doanh nghiệp tin cậy
                  </p>
                </div>
              </div>
              {/* Stat Item 3 */}
              <div className="bg-white border border-slate-150 shadow-lg hover:shadow-xl rounded-3xl p-7 flex items-center gap-6 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
                  🤝
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">
                    {stats.applicationsCount}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    Lượt kết nối ứng tuyển
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- FEATURED CATEGORIES SECTION --- */}
      <section className="py-16 bg-[#fcfdfe]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
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
                className="bg-white border border-slate-150 rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary-500/5 hover:border-primary-300 group flex flex-col items-center gap-4"
              >
                {getCategoryIcon(cat.id)}
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[40px] flex items-center justify-center">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED/HOT JOBS SECTION (3-Column Grid) --- */}
      <section className="py-20 bg-gradient-to-b from-slate-50/40 to-indigo-50/20 border-t border-b border-slate-100">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full tracking-wider uppercase">
                🔥 Hot Job / Đề xuất tuyển gấp
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
                Việc Làm Nổi Bật hàng tuần
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Các chiến dịch tuyển dụng tiêu điểm với quyền lợi tốt và phản
                hồi nhanh từ HR.
              </p>
            </div>
          </div>

          {loadingHot ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-150 p-6 rounded-3xl animate-pulse h-48 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                    <div className="w-16 h-5 bg-slate-100 rounded-md" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-150 rounded-md w-1/2" />
                  <div className="flex gap-2">
                    <div className="w-12 h-5 bg-slate-100 rounded-md" />
                    <div className="w-12 h-5 bg-slate-100 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : hotJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-150 text-slate-400 font-semibold text-sm">
              Hiện chưa có việc làm nổi bật nào được thiết lập.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hotJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-150 rounded-3xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between min-h-[240px] relative group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-rose-500 via-primary-500 to-indigo-500" />

                  <div>
                    {/* Top Row: Logo & Level Tag */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      {job.company ? (
                        <Link
                          to={`/companies/${job.company.id}`}
                          className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 hover:scale-105 transition-transform"
                        >
                          {job.company.logoUrl ? (
                            <img
                              src={getFullUrl(job.company.logoUrl)}
                              alt={job.company.companyName}
                              className="object-contain w-full h-full p-1"
                            />
                          ) : (
                            <span className="text-lg font-bold text-primary-500">
                              {job.company.companyName?.charAt(0)}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          <span className="text-lg font-bold text-slate-400">
                            ?
                          </span>
                        </div>
                      )}

                      <span className="bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.75 rounded-lg border border-rose-100">
                        Nổi bật
                      </span>
                    </div>

                    {/* Middle: Title & Company */}
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-base font-black text-slate-900 hover:text-primary-600 transition-colors block mb-1 line-clamp-1"
                      title={job.title}
                    >
                      {job.title}
                    </Link>

                    {job.company ? (
                      <Link
                        to={`/companies/${job.company.id}`}
                        className="text-slate-600 text-xs font-semibold hover:text-primary-600 transition-colors hover:underline block mb-3"
                      >
                        {job.company.companyName}
                      </Link>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium block mb-3">
                        Doanh nghiệp ẩn danh
                      </span>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.locations?.slice(0, 1).map((loc) => (
                        <span
                          key={loc.id}
                          className="bg-slate-50 text-slate-500 text-[10px] px-2 py-0.5 rounded-lg border border-slate-150 font-medium"
                        >
                          📍 {loc.name}
                        </span>
                      ))}
                      {job.skills?.slice(0, 2).map((skill) => (
                        <span
                          key={skill.id}
                          className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-lg border border-emerald-100 font-semibold"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Salary & Button */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
                    <span className="text-emerald-600 font-black text-sm">
                      {formatSalary(job)}
                    </span>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-xs font-extrabold text-slate-900 group-hover:text-primary-600 flex items-center gap-1 transition-colors"
                    >
                      Chi tiết <span>➔</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- TOP EMPLOYERS SECTION (Premium new addition) --- */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full tracking-wider uppercase">
              🏢 Nhà tuyển dụng hàng đầu
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Doanh nghiệp nổi bật liên kết
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Hợp tác chiến lược cùng những tập đoàn lớn mang đến cơ hội thăng
              tiến vững chắc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredEmployers.map((emp) => (
              <div
                key={emp.id}
                className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between items-center text-center relative overflow-hidden group"
              >
                {/* Visual accent inside container */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-xl transform translate-x-6 -translate-y-6"></div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-2 mb-4 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={emp.logo}
                      alt={emp.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mb-1">
                    {emp.name}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {emp.industry}
                  </span>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 px-2">
                    {emp.desc}
                  </p>
                </div>

                <Link
                  to={`/companies/${emp.id}`}
                  className="w-full bg-slate-50 hover:bg-primary-50 group-hover:text-primary-600 text-slate-700 text-xs font-bold py-2.5 rounded-2xl border border-slate-150 hover:border-primary-200 transition-all cursor-pointer block"
                >
                  Xem {emp.jobsCount} vị trí tuyển
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LATEST JOBS SECTION (2-Column Grid) --- */}
      <section className="py-20 bg-slate-50/50 border-t border-b border-slate-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-[10px] font-black text-primary-600 bg-primary-50 border border-primary-100 px-3 py-1 rounded-full tracking-wider uppercase">
                💼 Cập nhật mới nhất
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
                Việc làm mới đăng tuyển
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Tìm kiếm vị trí tuyển dụng vừa được phát hành trên hệ thống.
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
            /* Skeleton Loading State (2 columns grid) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4 animate-pulse h-32"
                >
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl"></div>
                    <div className="space-y-3 flex-1">
                      <div className="h-4 bg-slate-200 rounded-md w-48"></div>
                      <div className="h-3 bg-slate-150 rounded-md w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : latestJobs.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-150 shadow-sm flex flex-col items-center justify-center gap-3">
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
            /* Jobs List in 2 Columns Grid! */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- WHY CHOOSE US SECTION (Premium platform highlight) --- */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Graphics */}
            <div className="space-y-6">
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full tracking-wider uppercase">
                🚀 Lý do chọn JobPortal
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Giải pháp tìm kiếm việc làm hàng đầu cho thế hệ mới
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Chúng tôi cung cấp giải pháp tuyển dụng minh bạch, kết nối nhanh
                chóng thông qua hệ thống CV PDF đạt chuẩn và các doanh nghiệp
                được thẩm định hồ sơ kỹ càng từ Admin.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Hồ sơ doanh nghiệp minh bạch
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      100% doanh nghiệp liên kết được kiểm tra mã số thuế và
                      thông tin pháp lý đầy đủ.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Nộp CV nhanh chỉ 1-Click
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lưu trữ CV mặc định, ứng tuyển nhanh chóng không tốn thời
                      gian soạn lại hồ sơ.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Thông tin đa ngành toàn diện
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Không chỉ có công nghệ thông tin, chúng tôi có đầy đủ cơ
                      hội cho Sales, Marketing, Kế toán, Nhân sự.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right decorative card statistics visual */}
            <div className="bg-gradient-to-tr from-primary-600 to-indigo-700 rounded-[36px] p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-[360px]">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
              <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl"></div>

              <div>
                <span className="text-[10px] font-black text-primary-100 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                  Trải nghiệm vượt trội
                </span>
                <h3 className="text-2xl font-black mt-4 leading-snug">
                  Hệ thống tuyển dụng được xây dựng trên công nghệ tìm kiếm Linq
                  tối ưu
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div>
                  <h4 className="text-2xl font-black">99.8%</h4>
                  <p className="text-[10px] text-primary-200 mt-0.5">
                    Thời gian hoạt động liên tục (Uptime)
                  </p>
                </div>
                <div>
                  <h4 className="text-2xl font-black">&lt; 100ms</h4>
                  <p className="text-[10px] text-primary-200 mt-0.5">
                    Tốc độ truy vấn tìm kiếm trung bình
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEWSLETTER SUBSCRIPTION SECTION (Premium newsletter addition) --- */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="container-custom">
          <div className="bg-white border border-slate-150 rounded-[32px] p-8 md:p-12 shadow-md relative overflow-hidden max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 md:max-w-md">
              <h3 className="text-xl md:text-2xl font-black text-slate-900">
                Nhận thông báo việc làm mới nhất
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Đăng ký nhận bản tin việc làm hàng tuần gửi trực tiếp tới email
                của bạn dựa trên kỹ năng bạn quan tâm.
              </p>
            </div>

            {subscribed ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-6 py-4 rounded-2xl text-center md:w-80">
                🎉 Đăng ký thành công! Hãy kiểm tra hòm thư của bạn hàng tuần.
              </div>
            ) : (
              <form
                onSubmit={handleSubscribeNewsletter}
                className="flex gap-2 w-full md:w-80"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Nhập email nhận tin..."
                  className="flex-1 px-4 py-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-2xl text-xs font-semibold outline-none transition-all"
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-3.5 rounded-2xl cursor-pointer transition-colors whitespace-nowrap shadow-sm shadow-primary-500/10"
                >
                  Đăng ký
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
