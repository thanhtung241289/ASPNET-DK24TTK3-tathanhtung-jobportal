// File: src/pages/JobsPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { jobApi } from "../services/jobApi";
import JobCard from "../components/JobCard";

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // States quản lý dữ liệu danh sách việc làm từ API Backend
  const [jobs, setJobs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Trích xuất các tham số từ URL
  const keyword = searchParams.get("keyword") || "";
  const locationId = searchParams.get("locationId") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const pageNumber = parseInt(searchParams.get("pageNumber") || "1");

  // Khởi chạy API bất cứ khi nào tham số trên URL thay đổi
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const queryParams = {
          keyword,
          locationId: locationId ? parseInt(locationId) : undefined,
          categoryId: categoryId ? parseInt(categoryId) : undefined,
          pageNumber,
          pageSize: 5, // Ta hiển thị 5 bài một trang cho dễ test phân trang
        };

        const response = await jobApi.searchJobs(queryParams);

        // Cập nhật dữ liệu từ struct PagedResult của .NET trả về
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
  }, [keyword, locationId, categoryId, pageNumber]); // Theo dõi chặt chẽ bộ tứ này

  // Hàm chuyển trang an toàn
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    // Cập nhật lại param pageNumber trên URL, các param cũ giữ nguyên
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("pageNumber", newPage.toString());
    setSearchParams(nextParams);
  };

  return (
    <div className="container-custom py-10 flex flex-col gap-6">
      {/* Tiêu đề kết quả */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kết quả tìm kiếm việc làm
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tìm thấy{" "}
            <span className="font-semibold text-primary-600">{totalItems}</span>{" "}
            vị trí công việc phù hợp
          </p>
        </div>
      </div>

      {/* Vùng hiển thị danh sách chính */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">
            Đang tải danh sách việc làm...
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl shadow-card border border-gray-100">
          <p className="text-gray-500 text-lg font-medium">
            Không tìm thấy công việc nào thỏa mãn tiêu chí của bạn.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Hãy thử tìm kiếm bằng một từ khóa khác xem sao nhé!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* --- CỤM ĐIỀU HƯỚNG PHÂN TRANG (PAGINATION) --- */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-surface hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-surface cursor-pointer transition-colors"
          >
            Trước
          </button>

          <div className="text-sm text-gray-600 font-medium px-4">
            Trang <span className="text-gray-900 font-bold">{pageNumber}</span>{" "}
            / {totalPages}
          </div>

          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber === totalPages}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-surface hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-surface cursor-pointer transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
