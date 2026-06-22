import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X, Trash2 } from "lucide-react";
import { jobApi } from "../services/jobApi";
import { masterDataApi } from "../services/masterDataApi";
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

  // States quản lý danh sách việc làm
  const [jobs, setJobs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // States quản lý bộ lọc để hiển thị trong select/input
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // Trích xuất các tham số từ URL
  const keyword = searchParams.get("keyword") || "";
  const locationId = searchParams.get("locationId") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const jobLevel = searchParams.get("jobLevel") || "";
  const workType = searchParams.get("workType") || "";
  const pageNumber = parseInt(searchParams.get("pageNumber") || "1");

  // Load danh mục & địa điểm làm dữ liệu cho bộ lọc
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [categoriesData, locationsData] = await Promise.all([
          masterDataApi.getCategories(),
          masterDataApi.getLocations(),
        ]);
        setCategories(categoriesData || []);
        setLocations(locationsData || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bộ lọc:", error);
      }
    };
    fetchFiltersData();
  }, []);

  // Khởi chạy API khi tham số thay đổi
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
          pageNumber,
          pageSize: 5, // Hiển thị 5 bài/trang để dễ kiểm chứng phân trang
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
  }, [keyword, locationId, categoryId, jobLevel, workType, pageNumber]);

  // Cập nhật tham số tìm kiếm động lên URL
  const updateFilter = (name, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(name, value);
    } else {
      nextParams.delete(name);
    }
    nextParams.set("pageNumber", "1"); // Reset về trang 1 khi lọc
    setSearchParams(nextParams);
  };

  // Nút xóa tất cả bộ lọc
  const handleClearFilters = () => {
    setSearchParams({});
  };

  // Phân trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("pageNumber", newPage.toString());
    setSearchParams(nextParams);
  };

  return (
    <div className="bg-slate-50/50 min-h-screen py-10">
      <div className="container-custom">
        {/* Layout hai cột: Trái Sidebar, Phải kết quả */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* CỘT 1: SIDEBAR BỘ LỌC */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs sticky top-20 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary-600" /> Bộ lọc tìm
                  kiếm
                </h2>
                {(keyword ||
                  locationId ||
                  categoryId ||
                  jobLevel ||
                  workType) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Xóa tất cả
                  </button>
                )}
              </div>

              {/* Bộ lọc 1: Từ khóa */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Từ khóa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tên công việc, công ty..."
                    value={keyword}
                    onChange={(e) => updateFilter("keyword", e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all"
                  />
                  {keyword && (
                    <button
                      onClick={() => updateFilter("keyword", "")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bộ lọc 2: Địa điểm */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Địa điểm
                </label>
                <select
                  value={locationId}
                  onChange={(e) => updateFilter("locationId", e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm cursor-pointer transition-all"
                >
                  <option value="">Tất cả địa điểm</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bộ lọc 3: Ngành nghề */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ngành nghề
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => updateFilter("categoryId", e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm cursor-pointer transition-all"
                >
                  <option value="">Tất cả ngành nghề</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bộ lọc 4: Cấp bậc */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cấp bậc chuyên môn
                </label>
                <select
                  value={jobLevel}
                  onChange={(e) => updateFilter("jobLevel", e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm cursor-pointer transition-all"
                >
                  <option value="">Tất cả cấp bậc</option>
                  {JOB_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bộ lọc 5: Hình thức làm việc */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Hình thức làm việc
                </label>
                <select
                  value={workType}
                  onChange={(e) => updateFilter("workType", e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm cursor-pointer transition-all"
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
            {/* Header thông tin tìm kiếm */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  Việc làm phù hợp
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Tìm thấy{" "}
                  <span className="text-primary-600 font-bold">
                    {totalItems}
                  </span>{" "}
                  cơ hội việc làm tuyển dụng
                </p>
              </div>
            </div>

            {/* List việc làm */}
            {loading ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-bold">
                  Đang cập nhật danh sách việc làm...
                </p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shadow-inner">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-slate-700 font-bold text-sm">
                  Không tìm thấy công việc phù hợp
                </p>
                <p className="text-slate-400 text-xs max-w-xs mx-auto">
                  Hãy thử điều chỉnh lại bộ lọc tìm kiếm hoặc từ khóa để có thêm
                  nhiều kết quả hơn nhé!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {/* Điều hướng phân trang */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-4 bg-white border border-slate-100 py-3.5 px-6 rounded-2xl shadow-xs w-fit mx-auto">
                <button
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber === 1}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
                >
                  Trước
                </button>

                <div className="text-xs text-slate-600 font-bold px-4">
                  Trang {pageNumber} / {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
