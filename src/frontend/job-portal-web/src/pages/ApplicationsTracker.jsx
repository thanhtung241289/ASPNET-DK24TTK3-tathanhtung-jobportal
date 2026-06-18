// File: src/pages/ApplicationsTracker.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobApi } from "../services/jobApi";

const ApplicationsTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await jobApi.getMyApplications();
        setApplications(data || []);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử ứng tuyển:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // Hàm phụ trợ xuất thẻ Badge màu sắc dựa trên trạng thái thực tế của đơn hồ sơ
  const renderStatusBadge = (status) => {
    switch (status) {
      case "New":
        return (
          <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100">
            Đã nộp đơn
          </span>
        );
      case "Viewed":
        return (
          <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-100">
            Đã xem hồ sơ
          </span>
        );
      case "Interviewing":
        return (
          <span className="bg-primary-50 text-primary-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-primary-100">
            Hẹn phỏng vấn
          </span>
        );
      case "Accepted":
        return (
          <span className="bg-success-50 text-success-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-success-100">
            Đã tuyển dụng
          </span>
        );
      case "Rejected":
        return (
          <span className="bg-danger-50 text-danger-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-danger-100">
            Từ chối
          </span>
        );
      default:
        return (
          <span className="bg-gray-50 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-100">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">
          Đang đồng bộ trạng thái hồ sơ...
        </p>
      </div>
    );
  }

  return (
    <div className="container-custom py-10 flex flex-col gap-6">
      {/* Tiêu đề vùng thông tin */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Việc làm đã ứng tuyển
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi tiến độ duyệt CV và phản hồi từ các nhà tuyển dụng công nghệ.
        </p>
      </div>

      {/* Danh sách các đơn đã nộp */}
      {applications.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl shadow-card border border-gray-100 max-w-2xl mx-auto w-full animate-fade-in">
          <p className="text-gray-500 font-medium text-lg">
            Bạn chưa nộp đơn vào vị trí công việc nào.
          </p>
          <p className="text-gray-400 text-sm mt-1 mb-6">
            Hàng ngàn cơ hội hấp dẫn đang chờ bạn khám phá!
          </p>
          <Link
            to="/jobs"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Tìm việc ngay
          </Link>
        </div>
      ) : (
        // Render dạng bảng danh sách trực quan trên màn hình máy tính, tự co giãn
        <div className="bg-surface rounded-2xl shadow-card border border-gray-100 overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Thông tin vị trí</th>
                  <th className="py-4 px-6">Thời gian nộp</th>
                  <th className="py-4 px-6">Trạng thái xử lý</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Cột 1: Thông tin công ty & việc làm */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-primary-500 font-bold overflow-hidden shrink-0">
                          {app.logoUrl ? (
                            <img
                              src={app.logoUrl}
                              alt={app.companyName}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <span>{app.companyName?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/jobs/${app.jobId}`}
                            className="font-bold text-gray-900 hover:text-primary-600 block mb-0.5 transition-colors"
                          >
                            {app.jobTitle}
                          </Link>
                          <span className="text-gray-500 font-medium text-xs">
                            {app.companyName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Thời gian nộp */}
                    <td className="py-4 px-6 font-medium text-gray-500">
                      {new Date(app.appliedAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>

                    {/* Cột 3: Trạng thái Huy hiệu Badge */}
                    <td className="py-4 px-6">
                      {renderStatusBadge(app.status)}
                    </td>

                    {/* Cột 4: Thao tác phụ */}
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/jobs/${app.jobId}`}
                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
                      >
                        Xem lại bài đăng
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTracker;
