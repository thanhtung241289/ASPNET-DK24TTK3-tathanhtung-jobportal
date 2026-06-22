import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Users,
  Globe,
  Shield,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  Building2,
  FileText,
  Info,
} from "lucide-react";
import { companyApi } from "../services/companyApi";
import JobCard from "../components/JobCard";
import { formatTextToHtml } from "../utils/translators";

const CompanyPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 bg-white">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">
          Đang tải hồ sơ doanh nghiệp...
        </p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white text-center px-4">
        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4 border border-slate-200">
          <Building2 className="w-6 h-6 text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Doanh nghiệp không tồn tại
        </h2>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
          Hồ sơ công ty này đã bị ẩn hoặc không tồn tại trên hệ thống hiện tại.
        </p>
        <Link
          to="/jobs"
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
        >
          Khám phá việc làm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* 1. COVER SECTION (Fixed ratio layout to prevent blur stretching) */}
      <div className="relative h-48 md:h-64 lg:h-72 w-full bg-slate-100 border-b border-slate-200 overflow-hidden">
        {company.coverUrl ? (
          <img
            src={getFullUrl(company.coverUrl)}
            alt={`Cover of ${company.companyName}`}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-400">
              Chưa cấu hình ảnh bìa doanh nghiệp
            </span>
          </div>
        )}
      </div>

      {/* 2. HEADER INFO OVERLAP */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 -mt-12 md:-mt-16 mb-10">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 w-full">
            {/* LOGO AVATAR: Aspect containment setup */}
            <div className="relative -mt-16 md:-mt-20 w-24 h-24 md:w-28 md:h-28 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden p-2 shrink-0 shadow-xs">
              {company.logoUrl && !logoError ? (
                <img
                  src={getFullUrl(company.logoUrl)}
                  alt={company.companyName}
                  className="object-contain w-full h-full"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-3xl font-bold text-slate-400 bg-slate-50 w-full h-full flex items-center justify-center">
                  {company.companyName?.charAt(0)}
                </span>
              )}
            </div>

            {/* IDENTITY */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                  {company.companyName}
                </h1>
                {company.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded border border-slate-200 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-slate-600" /> Verified
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed font-medium">
                {company.shortDescription ||
                  "Nhà tuyển dụng công nghệ liên kết hệ thống."}
              </p>
            </div>
          </div>

          {/* LINK ACTION */}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors text-center inline-flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" /> Trang web công ty
            </a>
          )}
        </div>
      </div>

      {/* 3. CORE CONTENT GRID (Data-dense UI Layout) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* CONTENT COLUMN LEFT (ABOUT & JOBS) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Giới thiệu chi tiết doanh nghiệp */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Info className="w-4 h-4 text-slate-400" /> Tổng quan doanh
                nghiệp
              </h2>

              {/* LƯU Ý: Hiển thị trường company.description dưới dạng Raw HTML an toàn */}
              {company.description || company.Description ? (
                <div
                  className="text-slate-600 text-sm leading-relaxed space-y-4 font-medium break-words prose max-w-none 
                             [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5
                             [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-slate-800 [&>h3]:mt-4 [&>h3]:mb-2"
                  dangerouslySetInnerHTML={{
                    __html: formatTextToHtml(
                      company.description || company.Description,
                    ),
                  }}
                />
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                  <p className="text-slate-400 text-xs font-medium">
                    Doanh nghiệp chưa cập nhật tài liệu giới thiệu chi tiết.
                  </p>
                </div>
              )}
            </div>

            {/* Chiến dịch tuyển dụng mở rộng */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" /> Vị trí tuyển
                  dụng mở rộng
                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold ml-1">
                    {company.jobPosts?.length || 0}
                  </span>
                </h2>
              </div>

              {company.jobPosts && company.jobPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {company.jobPosts.map((job) => (
                    <JobCard
                      key={job.id}
                      variant="list"
                      job={{
                        ...job,
                        company: {
                          id: company.id,
                          companyName: company.companyName,
                          logoUrl: company.logoUrl,
                        },
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                  <p className="text-slate-500 font-medium text-sm">
                    Hiện chưa có tin tuyển dụng nào đang hoạt động.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SPECIFICATION COLUMN RIGHT */}
          <div className="lg:col-span-1 border border-slate-200 rounded-xl p-5 bg-white space-y-6 lg:sticky lg:top-28">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
              Thông tin vận hành
            </h3>

            <div className="space-y-5 text-sm">
              {/* Địa điểm văn phòng */}
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  Trụ sở hành chính
                </span>
                <span className="text-sm font-medium text-slate-800 mt-1 block leading-snug">
                  {company.address || "Đang cập nhật vị trí văn phòng"}
                </span>
              </div>

              {/* Quy mô tổ chức */}
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  Quy mô lao động
                </span>
                <span className="text-sm font-medium text-slate-800 mt-1 block">
                  {company.companySize || "Chưa xác định quy mô"}
                </span>
              </div>

              {/* Chứng thực bảo mật hệ thống */}
              <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold block text-slate-700">
                    Trạng thái định danh
                  </span>
                  <span
                    className={`text-xs font-medium block mt-0.5 ${company.isVerified ? "text-slate-600" : "text-slate-400"}`}
                  >
                    {company.isVerified
                      ? "Doanh nghiệp đã được kiểm tra pháp lý"
                      : "Hồ sơ đang chờ phê duyệt xác thực"}
                  </span>
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
