import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Users, Globe, Shield, Check, Briefcase } from "lucide-react";
import { companyApi } from "../services/companyApi";
import JobCard from "../components/JobCard";

const CompanyPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper helper to get static file URLs
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        const response = await companyApi.getCompanyDetail(id);
        setCompany(response);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin chi tiết doanh nghiệp:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm">
          Đang tải thông tin doanh nghiệp...
        </p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">
          Không tìm thấy thông tin doanh nghiệp!
        </h2>
        <Link
          to="/jobs"
          className="text-primary-600 hover:underline mt-4 inline-block font-semibold"
        >
          Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* 1. COVER HERO SECTION */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-100">
        {company.coverUrl ? (
          <img
            src={getFullUrl(company.coverUrl)}
            alt="Company Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-100"></div>
        )}
      </div>

      {/* 2. PROFILE HEADER CARD (Overlapping) */}
      <div className="container-custom relative -mt-20 z-10 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 w-full md:w-auto">
            {/* Logo */}
            <div className="w-28 h-28 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
              {company.logoUrl ? (
                <img
                  src={getFullUrl(company.logoUrl)}
                  alt={company.companyName}
                  className="object-contain w-full h-full"
                />
              ) : (
                <span className="text-5xl font-extrabold text-primary-500">
                  {company.companyName?.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {company.companyName}
                </h1>
                {company.isVerified && (
                  <span
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold shadow-xs border border-blue-200 cursor-default"
                    title="Doanh nghiệp đã được xác thực"
                  >
                    <Check className="w-3.5 h-3.5" /> Đã xác thực
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm md:text-base font-medium max-w-2xl line-clamp-2">
                {company.shortDescription ||
                  "Hân hạnh mang tới cơ hội nghề nghiệp tốt nhất."}
              </p>
            </div>
          </div>

          {/* Website Button */}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 w-full md:w-auto text-center block cursor-pointer"
            >
              Ghé thăm Website
            </a>
          )}
        </div>
      </div>

      {/* 3. MAIN CONTENT: 2 COLUMNS */}
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Column Left (70%): Description & Job Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-primary-500 pl-3">
                Giới thiệu công ty
              </h2>
              {company.description ? (
                <div
                  className="text-slate-700 leading-relaxed space-y-3 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: company.description }}
                />
              ) : (
                <p className="text-slate-500 italic text-sm">
                  Thông tin giới thiệu về doanh nghiệp đang được cập nhật.
                </p>
              )}
            </div>

            {/* Job Posts */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-primary-500 pl-3">
                Vị trí đang tuyển dụng ({company.jobPosts?.length || 0})
              </h2>

              {company.jobPosts && company.jobPosts.length > 0 ? (
                <div className="space-y-4">
                  {company.jobPosts.map((job) => (
                    // Cần map Company object vào job để JobCard có thể hiển thị logo và tên công ty
                    <JobCard
                      key={job.id}
                      job={{
                        ...job,
                        company: {
                          id: company.id,
                          companyName: company.companyName,
                          logoUrl: company.logoUrl,
                          website: company.website,
                          address: company.address,
                        },
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                  <Briefcase className="w-10 h-10 text-slate-400" />
                  <p className="text-slate-500 text-sm font-medium">
                    Doanh nghiệp hiện tại chưa đăng tuyển vị trí nào mới.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Column Right (30%): Stats & Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Thông tin liên hệ
              </h3>

              <div className="space-y-4 text-sm">
                {/* Địa chỉ */}
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-bold text-slate-700">
                      Trụ sở chính
                    </span>
                    <span className="text-slate-650 block mt-0.5">
                      {company.address || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                {/* Quy mô */}
                <div className="flex gap-3">
                  <Users className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-bold text-slate-700">
                      Quy mô công ty
                    </span>
                    <span className="text-slate-650 block mt-0.5">
                      {company.companySize || "Chưa xác định"}
                    </span>
                  </div>
                </div>

                {/* Website */}
                {company.website && (
                  <div className="flex gap-3">
                    <Globe className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-bold text-slate-700">
                        Website chính thức
                      </span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-650 hover:text-primary-750 hover:underline break-all block mt-0.5 font-medium"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}

                {/* Trạng thái xác thực */}
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-bold text-slate-700">
                      Trạng thái
                    </span>
                    <span
                      className={`block font-semibold mt-0.5 ${company.isVerified ? "text-blue-600" : "text-slate-500"}`}
                    >
                      {company.isVerified
                        ? "Đã được xác minh danh tính"
                        : "Chờ xác minh"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
