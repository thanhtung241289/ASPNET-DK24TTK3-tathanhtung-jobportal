// File: src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { masterDataApi } from "../services/masterDataApi";
import { jobApi } from "../services/jobApi";
import JobCard from "../components/JobCard";
import { formatSalary } from "../utils/translators";
import {
  Search,
  MapPin,
  Briefcase,
  ChevronDown,
  ArrowRight,
  Building2,
  Users,
  CheckCircle2,
  Award,
  TrendingUp,
  Calendar,
  Mail,
  Laptop,
  Megaphone,
  Calculator,
  ShoppingBag,
  Clock,
  DollarSign,
} from "lucide-react";

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

  // Icon Lucide đẹp cho từng Category ID
  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 1: // CNTT
        return (
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <Laptop className="w-6 h-6" />
          </div>
        );
      case 2: // Marketing
        return (
          <div className="w-12 h-12 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center group-hover:bg-fuchsia-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <Megaphone className="w-6 h-6" />
          </div>
        );
      case 3: // Kế toán
        return (
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <Calculator className="w-6 h-6" />
          </div>
        );
      case 4: // Nhân sự
        return (
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
        );
      case 5: // Kinh doanh
        return (
          <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <ShoppingBag className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-slate-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <Briefcase className="w-6 h-6" />
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
      {/* --- HERO BANNER SECTION (Premium Solid Violet Light Mode) --- */}
      <section className="relative overflow-hidden bg-slate-50 py-20 md:py-24 text-slate-900 border-b border-slate-100/80">
        <div className="container-custom relative z-10">
          {/* Title & Tagline */}
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12 animate-slide-up">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary-50 text-primary-650 border border-primary-100 mb-6 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-primary-600" /> Nền tảng kết
              nối nhân sự đa ngành hàng đầu
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-5 leading-tight text-slate-900">
              Định hình tương lai <br />
              <span className="text-primary-600">Sự nghiệp</span> của chính bạn
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
              Tìm kiếm hàng ngàn cơ hội việc làm chất lượng cao từ các doanh
              nghiệp đã được xác thực uy tín tại Việt Nam.
            </p>
          </div>

          {/* Premium Search Box with Solid Brand Colors */}
          <div className="bg-white border border-slate-150 p-6 md:p-7 rounded-[28px] shadow-sm max-w-5xl mx-auto animate-fade-in">
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
                    <Search className="w-5 h-5 text-primary-600" />
                  </div>
                  <input
                    type="text"
                    name="keyword"
                    value={searchForm.keyword}
                    onChange={handleInputChange}
                    placeholder="Tên công việc, vị trí, kỹ năng cần tìm..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm font-semibold"
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
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <select
                    name="locationId"
                    value={searchForm.locationId}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-2xl text-slate-805 focus:outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                  >
                    <option value="">Tất cả địa điểm</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-405">
                    <ChevronDown className="w-4 h-4" />
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
                    <Briefcase className="w-5 h-5 text-primary-600" />
                  </div>
                  <select
                    name="categoryId"
                    value={searchForm.categoryId}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-2xl text-slate-805 focus:outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                  >
                    <option value="">Tất cả ngành nghề</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-405">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="flex items-end mt-4 lg:mt-0">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-10 py-3.5 rounded-2xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98] text-sm w-full cursor-pointer flex items-center justify-center gap-2 h-[50px]"
                >
                  <span>Tìm Kiếm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Suggest Tag Chips */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-1">
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
                  className="bg-slate-100 hover:bg-primary-50 hover:text-primary-650 text-slate-650 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-primary-200 transition-all cursor-pointer font-bold"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- STATISTICS COUNTER SECTION (Solid backgrounds) --- */}
      <section className="py-10 -mt-6 relative z-20">
        <div className="container-custom">
          {loadingStats ? (
            <div className="bg-white border border-slate-150 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold">
              Đang kết nối số liệu hệ thống thực tế...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat Item 1 */}
              <div className="bg-white border border-slate-150 shadow-sm hover:shadow rounded-2xl p-6 flex items-center gap-5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {stats.activeJobsCount}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    Việc làm đang mở tuyển
                  </p>
                </div>
              </div>
              {/* Stat Item 2 */}
              <div className="bg-white border border-slate-150 shadow-sm hover:shadow rounded-2xl p-6 flex items-center gap-5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {stats.companiesCount}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    Doanh nghiệp tin cậy
                  </p>
                </div>
              </div>
              {/* Stat Item 3 */}
              <div className="bg-white border border-slate-150 shadow-sm hover:shadow rounded-2xl p-6 flex items-center gap-5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {stats.applicationsCount}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    Lượt kết nối ứng tuyển
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- FEATURED CATEGORIES SECTION --- */}
      <section className="py-14 bg-[#fcfdfe]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Khám Phá Theo Ngành Nghề
            </h2>
            <p className="text-slate-500 text-xs font-semibold">
              Tìm kiếm cơ hội nghề nghiệp tương ứng trong các lĩnh vực thịnh
              hành nhất
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="bg-white border border-slate-150 rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 hover:shadow hover:border-primary-300 group flex flex-col items-center gap-3.5"
              >
                {getCategoryIcon(cat.id)}
                <h3 className="font-bold text-slate-805 text-xs group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[36px] flex items-center justify-center">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED/HOT JOBS SECTION (3-Column Grid with Solid Accent) --- */}
      <section className="py-16 bg-slate-50/50 border-t border-b border-slate-100/80">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full tracking-wider uppercase">
                <TrendingUp className="w-3 h-3 text-rose-500" /> Hot Job / Đề
                xuất tuyển gấp
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-3">
                Việc Làm Nổi Bật hàng tuần
              </h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">
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
                  className="bg-white border border-slate-150 p-6 rounded-2xl animate-pulse h-48 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 bg-slate-105 rounded-xl" />
                    <div className="w-16 h-5 bg-slate-105 rounded-md" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-150 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : hotJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-150 text-slate-400 font-semibold text-xs">
              Hiện chưa có việc làm nổi bật nào được thiết lập.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hotJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs hover:shadow transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[220px] relative group overflow-hidden"
                >
                  {/* Solid Brand accent line */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-primary-600" />

                  <div>
                    {/* Top Row: Logo & Tag */}
                    <div className="flex justify-between items-start gap-4 mb-3.5">
                      {job.company ? (
                        <Link
                          to={`/companies/${job.company.id}`}
                          className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 hover:scale-105 transition-transform"
                        >
                          {job.company.logoUrl ? (
                            <img
                              src={getFullUrl(job.company.logoUrl)}
                              alt={job.company.companyName}
                              className="object-contain w-full h-full p-1"
                            />
                          ) : (
                            <span className="text-base font-bold text-primary-600">
                              {job.company.companyName?.charAt(0)}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          <span className="text-base font-bold text-slate-405">
                            ?
                          </span>
                        </div>
                      )}

                      <span className="bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border border-rose-100 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5 text-rose-500" /> Nổi
                        bật
                      </span>
                    </div>

                    {/* Middle: Title & Company */}
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-sm md:text-base font-bold text-slate-900 hover:text-primary-600 transition-colors block mb-1 truncate"
                      title={job.title}
                    >
                      {job.title}
                    </Link>

                    {job.company ? (
                      <Link
                        to={`/companies/${job.company.id}`}
                        className="text-slate-500 text-xs font-semibold hover:text-primary-600 transition-colors hover:underline block mb-3.5 truncate"
                      >
                        {job.company.companyName}
                      </Link>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium block mb-3.5">
                        Doanh nghiệp ẩn danh
                      </span>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3.5">
                      {job.locations?.slice(0, 1).map((loc) => (
                        <span
                          key={loc.id}
                          className="bg-slate-50 text-slate-500 text-[9px] px-2 py-0.5 rounded-lg border border-slate-150 font-medium flex items-center gap-0.5"
                        >
                          <MapPin className="w-2.5 h-2.5 text-slate-400" />{" "}
                          {loc.name}
                        </span>
                      ))}
                      {job.skills?.slice(0, 2).map((skill) => (
                        <span
                          key={skill.id}
                          className="bg-emerald-50 text-emerald-600 text-[9px] px-2 py-0.5 rounded-lg border border-emerald-100 font-semibold"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Salary & Button */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2 flex-shrink-0">
                    <span className="text-emerald-600 font-black text-xs md:text-sm flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />{" "}
                      {formatSalary(job)}
                    </span>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-[11px] font-extrabold text-slate-905 group-hover:text-primary-600 flex items-center gap-0.5 transition-colors"
                    >
                      Chi tiết{" "}
                      <ArrowRight className="w-3 h-3 text-slate-550 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- TOP EMPLOYERS SECTION --- */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full tracking-wider uppercase">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Nhà tuyển
              dụng hàng đầu
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Doanh nghiệp nổi bật liên kết
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Hợp tác chiến lược cùng những tập đoàn lớn mang đến cơ hội thăng
              tiến vững chắc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredEmployers.map((emp) => (
              <div
                key={emp.id}
                className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs hover:shadow transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between items-center text-center relative overflow-hidden group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2 mb-3 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={emp.logo}
                      alt={emp.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-xs md:text-sm mb-1">
                    {emp.name}
                  </h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                    {emp.industry}
                  </span>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 px-2">
                    {emp.desc}
                  </p>
                </div>

                <Link
                  to={`/companies/${emp.id}`}
                  className="w-full bg-slate-50 hover:bg-primary-50 group-hover:text-primary-650 text-slate-650 text-xs font-bold py-2 rounded-xl border border-slate-150 hover:border-primary-200 transition-all cursor-pointer block"
                >
                  Xem {emp.jobsCount} vị trí tuyển
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LATEST JOBS SECTION (2-Column Grid with variant="grid") --- */}
      <section className="py-16 bg-slate-50/30 border-t border-b border-slate-100/85">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-primary-600 bg-primary-50 border border-primary-100 px-3 py-1 rounded-full tracking-wider uppercase">
                <Clock className="w-3.5 h-3.5 text-primary-600" /> Cập nhật mới
                nhất
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-3">
                Việc làm mới đăng tuyển
              </h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">
                Tìm kiếm vị trí tuyển dụng vừa được phát hành trên hệ thống.
              </p>
            </div>
            <button
              onClick={() => navigate("/jobs")}
              className="group flex items-center gap-1 text-xs md:text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
            >
              Xem tất cả công việc
              <ArrowRight className="w-3.5 h-3.5 text-primary-650 group-hover:translate-x-1 transition-transform ml-1" />
            </button>
          </div>

          {loadingJobs ? (
            /* Skeleton Loading State (2 columns grid) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-100 p-5 rounded-2xl flex gap-4 animate-pulse h-28"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                  <div className="space-y-2 flex-1 mt-1">
                    <div className="h-3.5 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="h-3 bg-slate-150 rounded-md w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : latestJobs.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-150 flex flex-col items-center justify-center gap-2.5">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-lg text-slate-400 shadow-inner">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-slate-500 font-semibold text-xs">
                Hiện tại chưa có tin tuyển dụng nào được đăng.
              </p>
            </div>
          ) : (
            /* Jobs List in 2 Columns Grid with variant="grid" to fix alignment! */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} variant="grid" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- WHY CHOOSE US SECTION (Solid Premium Slate Background) --- */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Graphics */}
            <div className="space-y-5">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full tracking-wider uppercase">
                <Award className="w-3.5 h-3.5 text-emerald-500" /> Lý do chọn
                JobPortal
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                Giải pháp tìm kiếm việc làm hàng đầu cho thế hệ mới
              </h2>
              <p className="text-slate-505 text-xs md:text-sm leading-relaxed">
                Chúng tôi cung cấp giải pháp tuyển dụng minh bạch, kết nối nhanh
                chóng thông qua hệ thống CV PDF đạt chuẩn và các doanh nghiệp
                được thẩm định hồ sơ kỹ càng từ Admin.
              </p>

              <div className="space-y-4 pt-1">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
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
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
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
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
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

            {/* Right decorative card statistics visual - Solid Slate-900 */}
            <div className="bg-slate-900 rounded-[28px] p-8 md:p-9 text-white shadow relative overflow-hidden flex flex-col justify-between h-[340px]">
              <div>
                <span className="text-[9px] font-black text-primary-200 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                  Trải nghiệm vượt trội
                </span>
                <h3 className="text-xl md:text-2xl font-black mt-4 leading-snug">
                  Hệ thống tuyển dụng được xây dựng trên công nghệ tìm kiếm tối
                  ưu
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
                <div>
                  <h4 className="text-xl md:text-2xl font-black">99.8%</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Thời gian hoạt động liên tục (Uptime)
                  </p>
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-black">&lt; 100ms</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tốc độ truy vấn tìm kiếm trung bình
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEWSLETTER SUBSCRIPTION SECTION --- */}
      <section className="py-14 bg-slate-50 border-t border-slate-100/80">
        <div className="container-custom">
          <div className="bg-white border border-slate-150 rounded-[24px] p-6 md:p-9 shadow-xs max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 md:max-w-md">
              <h3 className="text-lg md:text-xl font-black text-slate-900">
                Nhận thông báo việc làm mới nhất
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Đăng ký nhận bản tin việc làm hàng tuần gửi trực tiếp tới email
                của bạn dựa trên kỹ năng bạn quan tâm.
              </p>
            </div>

            {subscribed ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-5 py-3 rounded-xl text-center md:w-80">
                🎉 Đăng ký thành công! Hãy kiểm tra hòm thư hàng tuần.
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
                  className="flex-1 px-3.5 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-xs font-semibold outline-none transition-all"
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> Đăng ký
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
