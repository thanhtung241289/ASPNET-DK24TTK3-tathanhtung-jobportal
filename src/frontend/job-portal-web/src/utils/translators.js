export const translateJobLevel = (level) => {
  const map = {
    Intern: "Thực tập sinh",
    Fresher: "Mới ra trường",
    Junior: "Nhân viên (Junior)",
    Senior: "Chuyên viên (Senior)",
    Manager: "Quản lý / Trưởng phòng",
  };
  return map[level] || level;
};

export const translateWorkType = (type) => {
  const map = {
    FullTime: "Toàn thời gian",
    PartTime: "Bán thời gian",
    Remote: "Remote (Từ xa)",
    Hybrid: "Hybrid (Linh hoạt)",
    Freelance: "Tự do (Freelance)",
  };
  return map[type] || type;
};

export const formatSalary = (job) => {
  if (job.isNegotiable) return "Thỏa thuận";
  if (job.salaryMin && job.salaryMax)
    return `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu`;
  if (job.salaryMin) return `Từ ${(job.salaryMin / 1000000).toFixed(0)} triệu`;
  return "Cạnh tranh";
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return "Hôm nay";
  if (diffDays === 2) return "Hôm qua";
  if (diffDays <= 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};
