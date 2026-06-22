// File: src/utils/translators.js

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

export const formatTextToHtml = (text) => {
  if (!text) return "";
  // Check if it already contains HTML tags to avoid double formatting
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  const lines = text.split(/\r?\n/);
  let html = "";
  let inList = false;
  let listType = ""; // "ul" or "ol"

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Check for bullet list item: starts with "-" or "*"
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      if (!inList || listType !== "ul") {
        if (inList) html += `</${listType}>`;
        html += "<ul class='list-disc pl-5 space-y-1 my-2'>";
        inList = true;
        listType = "ul";
      }
      html += `<li>${trimmed.substring(1).trim()}</li>`;
    }
    // Check for numbered list item: starts with digit(s) followed by dot (e.g., "1.")
    else if (/^\d+\./.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\./);
      if (!inList || listType !== "ol") {
        if (inList) html += `</${listType}>`;
        html += "<ol class='list-decimal pl-5 space-y-1 my-2'>";
        inList = true;
        listType = "ol";
      }
      const textContent = trimmed.substring(match[0].length).trim();
      html += `<li>${textContent}</li>`;
    }
    // Normal paragraph
    else {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = "";
      }
      if (trimmed) {
        html += `<p class='mb-2'>${trimmed}</p>`;
      } else {
        html += "<br/>";
      }
    }
  });

  if (inList) {
    html += `</${listType}>`;
  }
  return html;
};
