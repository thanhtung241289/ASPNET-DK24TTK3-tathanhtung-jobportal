// File: src/components/JobCard.jsx
import { Link } from "react-router-dom";
import {
  translateJobLevel,
  translateWorkType,
  formatSalary,
  formatTimeAgo,
} from "../utils/translators";

const JobCard = ({ job }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden group">
      {/* Top indicator line on hover */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

      {/* Khối thông tin bên trái */}
      <div className="flex gap-4 items-start w-full md:w-auto">
        {/* Ảnh Logo Công Ty */}
        {job.company ? (
          <Link
            to={`/companies/${job.company.id}`}
            className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 hover:border-primary-300 transition-colors"
          >
            {job.company.logoUrl ? (
              <img
                src={job.company.logoUrl}
                alt={job.company.companyName}
                className="object-contain w-full h-full p-1"
              />
            ) : (
              <span className="text-xl font-bold text-primary-500">
                {job.company.companyName?.charAt(0)}
              </span>
            )}
          </Link>
        ) : (
          <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <span className="text-xl font-bold text-slate-400">?</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Tiêu đề công việc - Click để vào trang chi tiết */}
          <Link
            to={`/jobs/${job.id}`}
            className="text-base md:text-lg font-bold text-slate-900 hover:text-primary-600 transition-colors block mb-1 truncate"
          >
            {job.title}
          </Link>

          {/* Tên công ty */}
          <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
            {job.company ? (
              <Link
                to={`/companies/${job.company.id}`}
                className="text-slate-600 hover:text-primary-600 text-sm font-semibold transition-colors hover:underline"
              >
                {job.company.companyName}
              </Link>
            ) : (
              <span className="text-slate-500 text-sm font-medium">
                Doanh nghiệp ẩn danh
              </span>
            )}

            {/* Dấu chấm ngăn cách */}
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>

            {/* Đăng lúc */}
            <span className="text-slate-400 text-xs">
              Đăng {formatTimeAgo(job.createdAt)}
            </span>
          </div>

          {/* Danh sách Tags Kỹ năng & Địa điểm & Level & WorkType */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {/* Locations */}
            {job.locations?.map((loc) => (
              <span
                key={loc.id}
                className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
              >
                📍 {loc.name}
              </span>
            ))}

            {/* Job Level */}
            {job.jobLevel && (
              <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-lg font-semibold">
                {translateJobLevel(job.jobLevel)}
              </span>
            )}

            {/* Work Type */}
            {job.workType && (
              <span className="bg-violet-50 text-violet-600 text-xs px-2.5 py-1 rounded-lg font-semibold">
                {translateWorkType(job.workType)}
              </span>
            )}

            {/* Skills */}
            {job.skills?.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="bg-emerald-50 text-emerald-600 text-xs px-2.5 py-1 rounded-lg font-medium"
              >
                {skill.name}
              </span>
            ))}
            {job.skills?.length > 3 && (
              <span className="text-slate-400 text-xs font-medium pl-1">
                +{job.skills.length - 3} kỹ năng
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Khối hành động và mức lương bên phải */}
      <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0 gap-3 md:min-w-[150px]">
        <div className="flex flex-col md:items-end">
          <span className="text-emerald-600 font-extrabold text-base md:text-lg">
            {formatSalary(job)}
          </span>
          {job.expirationDate && (
            <span className="text-slate-400 text-[11px] mt-0.5">
              Hạn nộp:{" "}
              {new Date(job.expirationDate).toLocaleDateString("vi-VN")}
            </span>
          )}
        </div>
        <Link
          to={`/jobs/${job.id}`}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 text-center cursor-pointer"
        >
          Chi tiết
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
