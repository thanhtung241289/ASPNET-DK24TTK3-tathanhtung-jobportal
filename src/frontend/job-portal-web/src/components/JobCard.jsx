// File: src/components/JobCard.jsx
import { Link } from "react-router-dom";
import { MapPin, Briefcase, Calendar, DollarSign, Layers } from "lucide-react";
import {
  translateJobLevel,
  translateWorkType,
  formatSalary,
  formatTimeAgo,
} from "../utils/translators";

const JobCard = ({ job, variant = "list" }) => {
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

  const isGrid = variant === "grid";

  if (isGrid) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-150 flex flex-col justify-between relative overflow-hidden group min-h-[250px] h-full">
        {/* Solid brand color indicator line on hover */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

        <div>
          {/* Top row: Logo and Company Info */}
          <div className="flex gap-3.5 items-start mb-4">
            {job.company ? (
              <Link
                to={`/companies/${job.company.id}`}
                className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 hover:border-primary-300 transition-colors"
              >
                {job.company.logoUrl ? (
                  <img
                    src={getFullUrl(job.company.logoUrl)}
                    alt={job.company.companyName}
                    className="object-contain w-full h-full p-1"
                  />
                ) : (
                  <span className="text-lg font-bold text-primary-600">
                    {job.company.companyName?.charAt(0)}
                  </span>
                )}
              </Link>
            ) : (
              <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <span className="text-lg font-bold text-slate-400">?</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <Link
                to={`/jobs/${job.id}`}
                className="text-sm md:text-base font-bold text-slate-900 hover:text-primary-600 transition-colors block truncate"
                title={job.title}
              >
                {job.title}
              </Link>
              {job.company ? (
                <Link
                  to={`/companies/${job.company.id}`}
                  className="text-slate-500 hover:text-primary-600 text-xs font-semibold transition-colors hover:underline block truncate mt-0.5"
                >
                  {job.company.companyName}
                </Link>
              ) : (
                <span className="text-slate-400 text-xs font-medium block mt-0.5">
                  Doanh nghiệp ẩn danh
                </span>
              )}
            </div>
          </div>

          {/* Middle: Info Tags */}
          <div className="flex flex-wrap gap-1.5 items-center mb-4">
            {/* Locations */}
            {job.locations?.slice(0, 1).map((loc) => (
              <span
                key={loc.id}
                className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-lg font-medium flex items-center gap-1"
              >
                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                {loc.name}
              </span>
            ))}

            {/* Job Level */}
            {job.jobLevel && (
              <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                <Layers className="w-2.5 h-2.5 text-indigo-400" />
                {translateJobLevel(job.jobLevel)}
              </span>
            )}

            {/* Work Type */}
            {job.workType && (
              <span className="bg-violet-50 text-violet-600 text-[10px] px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                <Briefcase className="w-2.5 h-2.5 text-violet-400" />
                {translateWorkType(job.workType)}
              </span>
            )}

            {/* Skills */}
            {job.skills?.slice(0, 2).map((skill) => (
              <span
                key={skill.id}
                className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-lg font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom row: Salary and Details Button */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-emerald-600 font-extrabold text-sm flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              {formatSalary(job)}
            </span>
            <span className="text-slate-400 text-[9px] mt-0.5 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 text-slate-350" />
              Đăng {formatTimeAgo(job.createdAt)}
            </span>
          </div>
          <Link
            to={`/jobs/${job.id}`}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 text-center cursor-pointer"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    );
  }

  // Default "list" variant (Horizontal)
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden group">
      {/* Solid brand color indicator line on hover */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

      {/* Left section: Logo and job details */}
      <div className="flex gap-4 items-start w-full md:w-auto">
        {/* Company Logo */}
        {job.company ? (
          <Link
            to={`/companies/${job.company.id}`}
            className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 hover:border-primary-300 transition-colors"
          >
            {job.company.logoUrl ? (
              <img
                src={getFullUrl(job.company.logoUrl)}
                alt={job.company.companyName}
                className="object-contain w-full h-full p-1"
              />
            ) : (
              <span className="text-xl font-bold text-primary-600">
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
          {/* Job Title */}
          <Link
            to={`/jobs/${job.id}`}
            className="text-base md:text-lg font-bold text-slate-900 hover:text-primary-600 transition-colors block mb-1 truncate"
          >
            {job.title}
          </Link>

          {/* Company Name & Post Date */}
          <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
            {job.company ? (
              <Link
                to={`/companies/${job.company.id}`}
                className="text-slate-650 hover:text-primary-600 text-sm font-semibold transition-colors hover:underline"
              >
                {job.company.companyName}
              </Link>
            ) : (
              <span className="text-slate-500 text-sm font-medium">
                Doanh nghiệp ẩn danh
              </span>
            )}

            <span className="w-1 h-1 bg-slate-350 rounded-full"></span>

            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-350" />
              Đăng {formatTimeAgo(job.createdAt)}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {/* Locations */}
            {job.locations?.map((loc) => (
              <span
                key={loc.id}
                className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-slate-400" />
                {loc.name}
              </span>
            ))}

            {/* Job Level */}
            {job.jobLevel && (
              <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                {translateJobLevel(job.jobLevel)}
              </span>
            )}

            {/* Work Type */}
            {job.workType && (
              <span className="bg-violet-50 text-violet-600 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-violet-400" />
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

      {/* Right section: Salary and Action Button */}
      <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0 gap-3 md:min-w-[150px]">
        <div className="flex flex-col md:items-end">
          <span className="text-emerald-600 font-extrabold text-base md:text-lg flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
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
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 text-center cursor-pointer"
        >
          Chi tiết
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
