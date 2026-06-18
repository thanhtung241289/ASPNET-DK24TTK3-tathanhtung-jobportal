// File: src/components/JobCard.jsx
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  // Hàm format hiển thị mức lương trực quan
  const formatSalary = () => {
    if (job.isNegotiable) return "Thỏa thuận";
    if (job.salaryMin && job.salaryMax)
      return `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu`;
    if (job.salaryMin)
      return `Từ ${(job.salaryMin / 1000000).toFixed(0)} triệu`;
    return "Cạnh tranh";
  };

  return (
    <div className="bg-surface p-5 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
      {/* Khối thông tin bên trái */}
      <div className="flex gap-4 items-start">
        {/* Ảnh Logo Công Ty Giả định (Dùng placeholder nếu chưa có logoUrl thực tế) */}
        <div className="w-14 h-14 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {job.company?.logoUrl ? (
            <img
              src={job.company.logoUrl}
              alt={job.company?.companyName}
              className="object-contain w-full h-full"
            />
          ) : (
            <span className="text-xl font-bold text-primary-500">
              {job.company?.companyName?.charAt(0)}
            </span>
          )}
        </div>

        <div>
          {/* Tiêu đề công việc - Click để vào trang chi tiết */}
          <Link
            to={`/jobs/${job.id}`}
            className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors block mb-1"
          >
            {job.title}
          </Link>
          {/* Tên công ty */}
          <p className="text-gray-600 text-sm font-medium mb-2">
            {job.company?.companyName}
          </p>

          {/* Danh sách Tags Kỹ năng & Địa điểm */}
          <div className="flex flex-wrap gap-2">
            {job.locations?.map((loc) => (
              <span
                key={loc.id}
                className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium"
              >
                {loc.name}
              </span>
            ))}
            {job.skills?.map((skill) => (
              <span
                key={skill.id}
                className="bg-primary-50 text-primary-600 text-xs px-2.5 py-1 rounded-md font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Khối hành động và mức lương bên phải */}
      <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 flex-shrink-0 gap-2">
        <span className="text-success-600 font-bold text-base md:text-lg">
          {formatSalary()}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm active:scale-95"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
