// File: src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { masterDataApi } from "../services/masterDataApi";

const HomePage = () => {
  const navigate = useNavigate();

  // 1. Quản lý State cho Master Data (Dữ liệu đổ vào Dropdown)
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // 2. Quản lý State cho Form Tìm kiếm
  const [searchForm, setSearchForm] = useState({
    keyword: "",
    locationId: "",
    categoryId: "",
  });

  // 3. Gọi API khi Trang chủ vừa load xong
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // Gọi song song 2 API để tăng tốc độ load trang
        const [categoriesData, locationsData] = await Promise.all([
          masterDataApi.getCategories(),
          masterDataApi.getLocations(),
        ]);

        setCategories(categoriesData);
        setLocations(locationsData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu danh mục:", error);
      }
    };

    fetchMasterData();
  }, []);

  // 4. Xử lý sự kiện khi gõ/chọn trên form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({ ...prev, [name]: value }));
  };

  // 5. Xử lý khi ấn nút Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();

    // Dựng chuỗi query params. Ví dụ: /jobs?keyword=react&locationId=1
    const params = new URLSearchParams();
    if (searchForm.keyword) params.append("keyword", searchForm.keyword);
    if (searchForm.locationId)
      params.append("locationId", searchForm.locationId);
    if (searchForm.categoryId)
      params.append("categoryId", searchForm.categoryId);

    // Điều hướng sang trang Danh sách việc làm kèm theo bộ lọc
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* --- HERO BANNER SECTION --- */}
      <section className="bg-primary-50 py-16 md:py-24 border-b border-primary-100">
        <div className="container-custom">
          {/* Tagline */}
          <div className="text-center max-w-3xl mx-auto mb-10 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Khám phá công việc{" "}
              <span className="text-primary-600">IT mơ ước</span> của bạn
            </h1>
            <p className="text-lg text-gray-600">
              Hàng ngàn cơ hội việc làm từ các công ty công nghệ hàng đầu đang
              chờ đón bạn.
            </p>
          </div>

          {/* Search Box Card */}
          <div className="bg-surface p-4 md:p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 max-w-5xl mx-auto animate-fade-in">
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-4"
            >
              {/* Input: Từ khóa */}
              <div className="flex-1">
                <label className="sr-only">Từ khóa</label>
                <input
                  type="text"
                  name="keyword"
                  value={searchForm.keyword}
                  onChange={handleInputChange}
                  placeholder="Tiêu đề, kỹ năng, công ty..."
                  className="w-full w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Select: Địa điểm */}
              <div className="md:w-56">
                <label className="sr-only">Địa điểm</label>
                <select
                  name="locationId"
                  value={searchForm.locationId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Tất cả địa điểm</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select: Ngành nghề */}
              <div className="md:w-64">
                <label className="sr-only">Ngành nghề</label>
                <select
                  name="categoryId"
                  value={searchForm.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Tất cả ngành nghề</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nút Tìm kiếm */}
              <button
                type="submit"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 active:scale-95 transition-all shadow-sm md:w-auto w-full"
              >
                Tìm Việc Ngay
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- STATISTICS/INFO SECTION (Optional) --- */}
      <section className="py-16 container-custom text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Nền tảng tuyển dụng đáng tin cậy
        </h2>
        {/* Bạn có thể bổ sung các logo đối tác hoặc số liệu thống kê ở đây */}
      </section>
    </div>
  );
};

export default HomePage;
