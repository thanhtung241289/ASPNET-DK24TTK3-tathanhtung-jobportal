import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X, Trash2, LayoutGrid, List } from "lucide-react";
import { jobApi } from "../services/jobApi";
import { masterDataApi } from "../services/masterDataApi";
import { useAuth } from "../contexts/AuthContext";
import { profileApi } from "../services/profileApi";
import JobCard from "../components/JobCard";

const JOB_LEVELS = [
  { value: "0", label: "Thực tập sinh (Intern)" },
  { value: "1", label: "Fresher" },
  { value: "2", label: "Junior" },
  { value: "3", label: "Senior" },
  { value: "4", label: "Trưởng nhóm / Quản lý" },
];

const WORK_TYPES = [
  { value: "0", label: "Toàn thời gian" },
  { value: "1", label: "Bán thời gian" },
  { value: "2", label: "Remote (Từ xa)" },
  { value: "3", label: "Hybrid" },
  { value: "4", label: "Tự do (Freelance)" },
];

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // States quản lý danh sách việc làm và hiển thị
  const [jobs, setJobs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("jobsViewMode") || "list",
  );

  // States bộ lọc ngành nghề & địa điểm
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // State thống kê thực tế từ database
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    companiesCount: 0,
    applicationsCount: 0,
  });

  // State kỹ năng ứng viên để tính độ tương thích
  const [candidateSkills, setCandidateSkills] = useState(null);

  // Trích xuất các tham số từ URL
  const keyword = searchParams.get("keyword") || "";
  const locationId = searchParams.get("locationId") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const jobLevel = searchParams.get("jobLevel") || "";
  const workType = searchParams.get("workType") || "";
  const minSalary = searchParams.get("minSalary") || "";
  const pageNumber = parseInt(searchParams.get("pageNumber") || "1");

  useEffect(() => {
    localStorage.setItem("jobsViewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    const fetchCandidateSkills = async () => {
      if (user && user.role === "Seeker") {
        try {
          const profileData = await profileApi.getMyProfile();
          if (profileData && profileData.skillsSummary) {
            setCandidateSkills(profileData.skillsSummary);
          }
        } catch (error) {
          console.error("Lỗi khi tải kỹ năng ứng viên:", error);
        }
      }
    };
    fetchCandidateSkills();
  }, [user]);

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [categoriesData, locationsData, statsData] = await Promise.all([
          masterDataApi.getCategories(),
          masterDataApi.getLocations(),
          masterDataApi.getStats(),
        ]);
        setCategories(categoriesData || []);
        setLocations(locationsData || []);
        if (statsData) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách bộ lọc và thống kê:", error);
      }
    };
    fetchFiltersData();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const queryParams = {
          keyword,
          locationId: locationId ? parseInt(locationId) : undefined,
          categoryId: categoryId ? parseInt(categoryId) : undefined,
          jobLevel: jobLevel !== "" ? parseInt(jobLevel) : undefined,
          workType: workType !== "" ? parseInt(workType) : undefined,
          minSalary: minSalary !== "" ? parseInt(minSalary) : undefined,
          pageNumber,
          pageSize: 6,
        };

        const response = await jobApi.searchJobs(queryParams);
        setJobs(response.items || []);
        setTotalItems(response.totalItems || 0);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm việc làm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [
    keyword,
    locationId,
    categoryId,
    jobLevel,
    workType,
    minSalary,
    pageNumber,
  ]);

  const updateFilter = (name, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(name, value);
    } else {
      nextParams.delete(name);
    }
    nextParams.set("pageNumber", "1");
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("pageNumber", newPage.toString());
    setSearchParams(nextParams);
  };

  const isFiltered =
    keyword || locationId || categoryId || jobLevel || workType || minSalary;

  return (
    <div className="bg-slate-50/50 min-h-screen py-10">
      <div className="container-custom">
        {/* --- BANNER THỐNG KÊ --- */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xl shadow-slate-200/20 mb-10 flex flex-col lg:flex-row justify-between items-center gap-8 animate-fade-in">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Thị Trường Việc Làm
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Cập nhật liên tục cơ hội việc làm mới và phù hợp nhất từ doanh
              nghiệp.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl flex-1 min-w-[140px] text-center">
              <div className="text-2xl font-black text-blue-600">
                {stats.activeJobsCount?.toLocaleString() || "0"}+
              </div>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mt-1">
                Việc làm mới
              </div>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-2xl flex-1 min-w-[140px] text-center">
              <div className="text-2xl font-black text-indigo-600">
                {stats.companiesCount?.toLocaleString() || "0"}+
              </div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-1">
                Nhà tuyển dụng
              </div>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100/50 p-4 rounded-2xl flex-1 min-w-[140px] text-center">
              <div className="text-2xl font-black text-emerald-600">
                {stats.applicationsCount?.toLocaleString() || "0"}+
              </div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-1">
                Lượt ứng tuyển
              </div>
            </div>
          </div>
        </div>

        {/* --- BỐ CỤC 2 CỘT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* CỘT 1: SIDEBAR BỘ LỌC */}
          <div className="lg:col-span-1 sticky top-24">
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/20 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary-600" /> Bộ lọc tìm
                  kiếm
                </h2>
                {isFiltered && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Xóa lọc
                  </button>
                )}
              </div>

              {/* Lọc: Từ khóa */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Từ khóa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tên công việc, công ty..."
                    value={keyword}
                    onChange={(e) => updateFilter("keyword", e.target.value)}
                    className="w-full pl-4 pr-9 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm transition-all font-medium"
                  />
                  {keyword && (
                    <button
                      onClick={() => updateFilter("keyword", "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lọc: Địa điểm */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Địa điểm
                </label>
                <select
                  value={locationId}
                  onChange={(e) => updateFilter("locationId", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm cursor-pointer transition-all font-medium appearance-none"
                >
                  <option value="">Tất cả địa điểm</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc: Ngành nghề */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ngành nghề
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => updateFilter("categoryId", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm cursor-pointer transition-all font-medium appearance-none"
                >
                  <option value="">Tất cả ngành nghề</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc: Lương tối thiểu */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Lương tối thiểu
                </label>
                <select
                  value={minSalary}
                  onChange={(e) => updateFilter("minSalary", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm cursor-pointer transition-all font-medium appearance-none"
                >
                  <option value="">Tất cả mức lương</option>
                  <option value="5000000">Từ 5 triệu</option>
                  <option value="10000000">Từ 10 triệu</option>
                  <option value="15000000">Từ 15 triệu</option>
                  <option value="20000000">Từ 20 triệu</option>
                  <option value="30000000">Từ 30 triệu</option>
                  <option value="50000000">Từ 50 triệu</option>
                </select>
              </div>

              {/* Lọc: Cấp bậc */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cấp bậc chuyên môn
                </label>
                <select
                  value={jobLevel}
                  onChange={(e) => updateFilter("jobLevel", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm cursor-pointer transition-all font-medium appearance-none"
                >
                  <option value="">Tất cả cấp bậc</option>
                  {JOB_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc: Hình thức làm việc */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Hình thức làm việc
                </label>
                <select
                  value={workType}
                  onChange={(e) => updateFilter("workType", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm cursor-pointer transition-all font-medium appearance-none"
                >
                  <option value="">Tất cả hình thức</option>
                  {WORK_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* CỘT 2: KẾT QUẢ TÌM KIẾM */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Thanh Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Danh sách việc làm
                </h2>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">
                  Tìm thấy{" "}
                  <span className="text-primary-600 font-bold">
                    {totalItems}
                  </span>{" "}
                  cơ hội phù hợp
                </p>
              </div>

              {/* View Switcher */}
              <div className="flex bg-white p-1.5 rounded-xl border border-slate-200/60 shadow-sm gap-1 flex-shrink-0">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-slate-100 text-slate-900 shadow-sm font-bold"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                  title="Xem dạng danh sách"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-slate-100 text-slate-900 shadow-sm font-bold"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                  title="Xem dạng lưới"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Vùng hiển thị kết quả */}
            {loading ? (
              <div className="bg-white border border-slate-200/60 rounded-3xl p-16 flex flex-col items-center justify-center gap-4 shadow-sm min-h-[400px]">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium">
                  Đang tìm kiếm cơ hội tốt nhất...
                </p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border border-slate-200/60 rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-4 shadow-sm min-h-[400px]">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                  <Search className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-slate-800 font-bold text-lg">
                    Không tìm thấy công việc phù hợp
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                    Có vẻ như các tiêu chí lọc đang quá hẹp. Hãy thử nới lỏng
                    hoặc thay đổi từ khóa nhé!
                  </p>
                </div>
                {isFiltered && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-2 text-primary-600 font-semibold text-sm hover:underline"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-5 animate-slide-up"
                    : "flex flex-col gap-5 animate-slide-up"
                }
              >
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    variant={viewMode}
                    userSkills={candidateSkills}
                  />
                ))}
              </div>
            )}

            {/* Phân trang */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="bg-white border border-slate-200/60 shadow-sm p-1.5 rounded-2xl flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={pageNumber === 1}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                  >
                    Trước
                  </button>
                  <div className="text-sm text-slate-600 font-bold px-4 py-2 border-x border-slate-100">
                    Trang {pageNumber} / {totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(pageNumber + 1)}
                    disabled={pageNumber === totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
