// File: JobPortal.Infrastructure/Data/JobPortalDbContext.cs
using System.Reflection;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Data;

public class JobPortalDbContext : DbContext
{
    public JobPortalDbContext(DbContextOptions<JobPortalDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<SeekerProfile> SeekerProfiles => Set<SeekerProfile>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<JobPost> JobPosts => Set<JobPost>();

    public DbSet<Domain.Entities.Application> Applications => Set<Domain.Entities.Application>();
    public DbSet<SavedJob> SavedJobs => Set<SavedJob>();

    // File: JobPortal.Infrastructure/Data/JobPortalDbContext.cs
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); 

        // Tự động quét các file cấu hình đơn lẻ
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // 1. Seed dữ liệu bảng Ngành nghề (Categories)
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Công nghệ thông tin / Phần mềm" },
            new Category { Id = 2, Name = "Marketing / Truyền thông" },
            new Category { Id = 3, Name = "Kế toán / Kiểm toán" },
            new Category { Id = 4, Name = "Quản trị nhân sự" },
            new Category { Id = 5, Name = "Kinh doanh / Bán hàng" }
        );

        // 2. Seed dữ liệu bảng Địa điểm (Locations)
        modelBuilder.Entity<Location>().HasData(
            new Location { Id = 1, Name = "Hồ Chí Minh" },
            new Location { Id = 2, Name = "Hà Nội" },
            new Location { Id = 3, Name = "Đà Nẵng" },
            new Location { Id = 4, Name = "Cần Thơ" },
            new Location { Id = 5, Name = "Remote (Làm việc từ xa)" }
        );

        // 3. Seed dữ liệu bảng Kỹ năng mẫu (Skills)
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 1, Name = ".NET / C#" },
            new Skill { Id = 2, Name = "ReactJS / JavaScript" },
            new Skill { Id = 3, Name = "SQL Server" },
            new Skill { Id = 4, Name = "Golang" },
            new Skill { Id = 5, Name = "Flutter / Dart" },
            new Skill { Id = 6, Name = "Docker / Devops" },
            new Skill { Id = 7, Name = "Content Writing" },
            new Skill { Id = 8, Name = "SEO Marketing" },
            new Skill { Id = 9, Name = "Corporate Finance" },
            new Skill { Id = 10, Name = "Negotiation & Sales" },
            new Skill { Id = 11, Name = "Recruitment" },
            new Skill { Id = 12, Name = "Communication" },
            new Skill { Id = 13, Name = "English" },
            new Skill { Id = 14, Name = "Excel" }
        );

        var adminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var employerUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var candidateUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var companyId = Guid.Parse("44444444-4444-4444-4444-444444444444");

        var employerVingroupId = Guid.Parse("22222222-2222-2222-2222-222222222223");
        var companyVingroupId = Guid.Parse("44444444-4444-4444-4444-444444444445");

        var employerShopeeId = Guid.Parse("22222222-2222-2222-2222-222222222224");
        var companyShopeeId = Guid.Parse("44444444-4444-4444-4444-444444444446");

        var employerEYId = Guid.Parse("22222222-2222-2222-2222-222222222225");
        var companyEYId = Guid.Parse("44444444-4444-4444-4444-444444444447");

        // Chuỗi PasswordHash tương ứng với mật khẩu gốc "Abc@123456" sau khi băm mã hóa
        string mockHashPassword = "$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm";
        var baseDate = new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc);

        // ----------------------------------------------------
        // 2. SEED DATA HỆ THỐNG TÀI KHOẢN (USERS)
        // ----------------------------------------------------
        modelBuilder.Entity<User>().HasData(
            new User { Id = adminUserId, Email = "admin@jobportal.com", PasswordHash = mockHashPassword, Role = UserRole.Admin, CreatedAt = baseDate },
            new User { Id = employerUserId, Email = "hr@fpt.com", PasswordHash = mockHashPassword, Role = UserRole.Employer, CreatedAt = baseDate },
            new User { Id = candidateUserId, Email = "an.nguyen@gmail.com", PasswordHash = mockHashPassword, Role = UserRole.Seeker, CreatedAt = baseDate },
            new User { Id = employerVingroupId, Email = "hr@vingroup.net", PasswordHash = mockHashPassword, Role = UserRole.Employer, CreatedAt = baseDate },
            new User { Id = employerShopeeId, Email = "hr@shopee.vn", PasswordHash = mockHashPassword, Role = UserRole.Employer, CreatedAt = baseDate },
            new User { Id = employerEYId, Email = "hr@ey.com", PasswordHash = mockHashPassword, Role = UserRole.Employer, CreatedAt = baseDate }
        );

        // ----------------------------------------------------
        // 3. SEED DATA HỒ SƠ DOANH NGHIỆP (COMPANIES)
        // ----------------------------------------------------
        modelBuilder.Entity<Company>().HasData(
            new Company
            {
                Id = companyId,
                UserId = employerUserId,
                CompanyName = "FPT Software",
                Website = "https://fpt-software.com",
                LogoUrl = "https://img.vietnamworks.com/pictureprofile/vnw/logo_fpt_software.png",
                Address = "Khu Công Nghệ Cao, Quận 9, TP. Hồ Chí Minh",
                ShortDescription = "Tập đoàn công nghệ hàng đầu, tiên phong trong chuyển đổi số toàn cầu.",
                CompanySize = "10,000+ nhân viên",
                IsVerified = true,
                Description = "Tập đoàn công nghệ và dịch vụ CNTT hàng đầu Việt Nam, cung cấp giải pháp chuyển đổi số toàn diện cho các đối tác toàn cầu."
            },
            new Company
            {
                Id = companyVingroupId,
                UserId = employerVingroupId,
                CompanyName = "Vingroup",
                Website = "https://vingroup.net",
                LogoUrl = "https://img.vietnamworks.com/pictureprofile/vnw/logo_vingroup.png",
                CoverUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
                ShortDescription = "Tập đoàn kinh tế tư nhân đa ngành hàng đầu Việt Nam.",
                Address = "Số 7 Đường Bằng Lăng 1, KĐT Vinhomes Riverside, Long Biên, Hà Nội",
                CompanySize = "10,000+ nhân viên",
                IsVerified = true,
                Description = "Vingroup là một trong những tập đoàn kinh tế tư nhân đa ngành lớn nhất Châu Á, tập trung phát triển với 3 nhóm hoạt động trọng tâm: Công nghệ – Công nghiệp, Thương mại Dịch vụ, Thiện nguyện Xã hội."
            },
            new Company
            {
                Id = companyShopeeId,
                UserId = employerShopeeId,
                CompanyName = "Shopee Vietnam",
                Website = "https://shopee.vn",
                LogoUrl = "https://logodownload.org/wp-content/uploads/2020/09/shopee-logo-1.png",
                CoverUrl = "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
                ShortDescription = "Nền tảng thương mại điện tử hàng đầu tại Đông Nam Á.",
                Address = "Tòa nhà Saigon Centre Tower 2, 67 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                CompanySize = "1,000 - 5,000 nhân viên",
                IsVerified = true,
                Description = "Shopee là nền tảng thương mại điện tử hàng đầu tại Đông Nam Á và Đài Loan. Ra mắt năm 2015, Shopee mang đến trải nghiệm mua sắm trực tuyến dễ dàng, an toàn và nhanh chóng."
            },
            new Company
            {
                Id = companyEYId,
                UserId = employerEYId,
                CompanyName = "Ernst & Young Vietnam (EY)",
                Website = "https://www.ey.com/vi_vn",
                LogoUrl = "https://logodownload.org/wp-content/uploads/2021/03/ey-ernst-young-logo-0.png",
                CoverUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
                ShortDescription = "Một trong bốn hãng kiểm toán lớn nhất thế giới (Big Four).",
                Address = "Tầng 8, Tòa nhà CornerStone, 16 Phan Chu Trinh, Hoàn Kiếm, Hà Nội",
                CompanySize = "1,000 - 2,000 nhân viên",
                IsVerified = true,
                Description = "EY là tổ chức hàng đầu thế giới về dịch vụ kiểm toán, thuế, giao dịch tài chính và tư vấn, xây dựng niềm tin vào các thị trường vốn và nền kinh tế toàn cầu."
            }
        );

        // ----------------------------------------------------
        // 4. SEED DATA BÀI VIẾT TUYỂN DỤNG (JOB POSTS)
        // ----------------------------------------------------
        modelBuilder.Entity<JobPost>().HasData(
            new JobPost
            {
                Id = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa"),
                CompanyId = companyId,
                CategoryId = 1,
                Title = "Chuyên Viên Phát Triển Hệ Thống Backend .NET Core",
                Quantity = 3,
                SalaryMin = 15000000,
                SalaryMax = 30000000,
                IsNegotiable = false,
                JobLevel = JobLevel.Junior,
                WorkType = WorkType.FullTime,
                Description = "Phát triển các mô-đun dịch vụ RESTful API, tối ưu truy vấn SQL Server cho hệ thống Core Banking.",
                Requirements = "Có ít nhất 1-2 năm kinh nghiệm làm việc thực tế với ASP.NET Core, C#, EF Core. Nắm chắc kiến trúc OOP.",
                Benefits = "Mức lương cạnh tranh, thưởng tháng 13 + thưởng hiệu quả dự án. Bảo hiểm FPT Care cao cấp dành riêng cho nhân viên.",
                Status = JobStatus.Published,
                IsHot = true,
                CreatedAt = baseDate.AddDays(-2),
                ExpirationDate = baseDate.AddMonths(1)
            },
            new JobPost
            {
                Id = Guid.Parse("bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb"),
                CompanyId = companyId,
                CategoryId = 1,
                Title = "Frontend Developer (ReactJS / Tailwind CSS)",
                Quantity = 2,
                SalaryMin = 18000000,
                SalaryMax = 35000000,
                IsNegotiable = false,
                JobLevel = JobLevel.Senior,
                WorkType = WorkType.Hybrid,
                Description = "Xây dựng các Dashboard quản trị hệ thống phức tạp, tối ưu hóa tốc độ tải trang Core Web Vitals cho đối tác nước ngoài.",
                Requirements = "Thành thạo JavaScript/TypeScript, có kinh nghiệm sâu sắc về ReactJS (Hooks, Redux/Context API). Biết Tailwind là điểm cộng.",
                Benefits = "Làm việc theo mô hình Hybrid linh hoạt 2 ngày tại văn phòng. Cơ hội đi Onsite làm việc trực tiếp tại thị trường Nhật Bản.",
                Status = JobStatus.Published,
                CreatedAt = baseDate.AddDays(-1),
                ExpirationDate = baseDate.AddMonths(1)
            },
            new JobPost
            {
                Id = Guid.Parse("cccccccc-3333-3333-3333-cccccccccccc"),
                CompanyId = companyId,
                CategoryId = 1,
                Title = "[Hỏa Tốc] Cloud DevOps Engineer (AWS / Docker)",
                Quantity = 1,
                SalaryMin = null,
                SalaryMax = null,
                IsNegotiable = true,
                JobLevel = JobLevel.Manager,
                WorkType = WorkType.FullTime,
                Description = "Thiết kế kiến trúc hệ thống Microservices, thiết lập đường ống CI/CD tự động hóa hạ tầng đám mây AWS.",
                Requirements = "Có kinh nghiệm sâu với Docker, Kubernetes, Jenkins hoặc GitHub Actions. Sở hữu chứng chỉ AWS là lợi thế lớn.",
                Benefits = "Mức lương thỏa thuận kịch trần theo năng lực thực tế. Thưởng cổ phiếu ESOP và trợ cấp thiết bị làm việc Macbook Pro.",
                Status = JobStatus.Pending,
                CreatedAt = baseDate,
                ExpirationDate = baseDate.AddDays(15)
            },
            new JobPost
            {
                Id = Guid.Parse("aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa"),
                CompanyId = companyVingroupId,
                CategoryId = 5,
                Title = "Trưởng Nhóm Kinh Doanh Bất Động Sản (Vinhomes)",
                Quantity = 5,
                SalaryMin = 20000000,
                SalaryMax = 50000000,
                IsNegotiable = false,
                JobLevel = JobLevel.Manager,
                WorkType = WorkType.FullTime,
                Description = "Quản lý và điều hành đội ngũ kinh doanh dự án Vinhomes, hỗ trợ tư vấn khách hàng VIP, thúc đẩy doanh số bán hàng.",
                Requirements = "Tối thiểu 3 năm kinh nghiệm trong lĩnh vực Bất động sản, kỹ năng đàm phán thuyết phục tốt. Có khả năng chịu áp lực cao.",
                Benefits = "Hoa hồng hấp dẫn theo doanh số, thưởng nóng dự án. Nghỉ dưỡng hàng năm tại các cơ sở Vinpearl.",
                Status = JobStatus.Published,
                IsHot = true,
                CreatedAt = baseDate.AddDays(-3),
                ExpirationDate = baseDate.AddMonths(1)
            },
            new JobPost
            {
                Id = Guid.Parse("aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa"),
                CompanyId = companyShopeeId,
                CategoryId = 2,
                Title = "Chuyên Viên SEO Marketing - Thương Mại Điện Tử",
                Quantity = 2,
                SalaryMin = 12000000,
                SalaryMax = 22000000,
                IsNegotiable = false,
                JobLevel = JobLevel.Junior,
                WorkType = WorkType.FullTime,
                Description = "Nghiên cứu từ khóa, tối ưu hóa on-page/off-page cho website Shopee.vn, theo dõi hiệu quả traffic và thứ hạng công cụ tìm kiếm.",
                Requirements = "1-2 năm kinh nghiệm làm SEO chuyên sâu, sử dụng thành thạo Google Search Console, Ahrefs, Screaming Frog.",
                Benefits = "Môi trường trẻ trung năng động. Trợ cấp ăn trưa, trà chiều miễn phí tại văn phòng Shopee.",
                Status = JobStatus.Published,
                IsHot = true,
                CreatedAt = baseDate.AddDays(-4),
                ExpirationDate = baseDate.AddMonths(2)
            },
            new JobPost
            {
                Id = Guid.Parse("aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa"),
                CompanyId = companyEYId,
                CategoryId = 3,
                Title = "Trợ Lý Kiểm Toán (Audit Assistant)",
                Quantity = 10,
                SalaryMin = null,
                SalaryMax = null,
                IsNegotiable = true,
                JobLevel = JobLevel.Fresher,
                WorkType = WorkType.FullTime,
                Description = "Hỗ trợ kiểm toán viên chính thực hiện quy trình kiểm toán tại doanh nghiệp khách hàng, đối chiếu chứng từ sổ sách kế toán.",
                Requirements = "Sinh viên mới tốt nghiệp hoặc dưới 1 năm kinh nghiệm chuyên ngành Kế toán, Kiểm toán, Tài chính. Tiếng Anh tốt.",
                Benefits = "Đào tạo bài bản theo tiêu chuẩn Big 4 toàn cầu. Cơ hội thăng tiến lên Kiểm toán viên chính sau 1-2 năm.",
                Status = JobStatus.Published,
                CreatedAt = baseDate.AddDays(-5),
                ExpirationDate = baseDate.AddMonths(1)
            },
            new JobPost
            {
                Id = Guid.Parse("aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa"),
                CompanyId = companyShopeeId,
                CategoryId = 4,
                Title = "Chuyên Viên Tuyển Dụng (Recruitment Executive)",
                Quantity = 2,
                SalaryMin = 15000000,
                SalaryMax = 25000000,
                IsNegotiable = false,
                JobLevel = JobLevel.Junior,
                WorkType = WorkType.Hybrid,
                Description = "Lập kế hoạch tuyển dụng, tìm kiếm ứng viên qua các kênh, thực hiện phỏng vấn vòng sơ loại cho các vị trí non-tech.",
                Requirements = "Tối thiểu 1 năm kinh nghiệm tuyển dụng. Kỹ năng giao tiếp và tạo thiện cảm tốt. Ưu tiên ứng viên từng làm headhunter.",
                Benefits = "Thời gian làm việc linh hoạt, 2 ngày hybrid. Bảo hiểm sức khỏe quốc tế.",
                Status = JobStatus.Published,
                CreatedAt = baseDate.AddDays(-1),
                ExpirationDate = baseDate.AddMonths(1)
            }
        );

        // ----------------------------------------------------
        // 5. SEED DATA BẢNG LIÊN KẾT NHIỀU - NHIỀU (JOB SKILLS & JOB LOCATIONS)
        // ----------------------------------------------------
        modelBuilder.Entity("JobPostSkill").HasData(
            // Job 1: .NET Software
            new { JobPostsId = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa"), SkillsId = 1 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa"), SkillsId = 3 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa"), SkillsId = 6 },
            // Job 2: Frontend
            new { JobPostsId = Guid.Parse("bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb"), SkillsId = 2 },
            new { JobPostsId = Guid.Parse("bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb"), SkillsId = 12 },
            // Job 3: Cloud DevOps
            new { JobPostsId = Guid.Parse("cccccccc-3333-3333-3333-cccccccccccc"), SkillsId = 6 },
            // Job 4: Vingroup Sales Manager
            new { JobPostsId = Guid.Parse("aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa"), SkillsId = 10 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa"), SkillsId = 12 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa"), SkillsId = 13 },
            // Job 5: Shopee SEO Marketing
            new { JobPostsId = Guid.Parse("aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa"), SkillsId = 8 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa"), SkillsId = 7 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa"), SkillsId = 13 },
            // Job 6: EY Audit Assistant
            new { JobPostsId = Guid.Parse("aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa"), SkillsId = 9 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa"), SkillsId = 14 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa"), SkillsId = 13 },
            // Job 7: Shopee HR Recruitment
            new { JobPostsId = Guid.Parse("aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa"), SkillsId = 11 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa"), SkillsId = 12 }
        );

        modelBuilder.Entity("JobPostLocation").HasData(
            // Job 1: .NET Software
            new { JobPostsId = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa"), LocationsId = 1 },
            new { JobPostsId = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa"), LocationsId = 2 },
            // Job 2: Frontend
            new { JobPostsId = Guid.Parse("bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb"), LocationsId = 1 },
            new { JobPostsId = Guid.Parse("bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb"), LocationsId = 5 },
            // Job 3: Cloud DevOps
            new { JobPostsId = Guid.Parse("cccccccc-3333-3333-3333-cccccccccccc"), LocationsId = 1 },
            // Job 4: Vingroup Sales Manager
            new { JobPostsId = Guid.Parse("aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa"), LocationsId = 2 },
            // Job 5: Shopee SEO Marketing
            new { JobPostsId = Guid.Parse("aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa"), LocationsId = 1 },
            // Job 6: EY Audit Assistant
            new { JobPostsId = Guid.Parse("aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa"), LocationsId = 2 },
            // Job 7: Shopee HR Recruitment
            new { JobPostsId = Guid.Parse("aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa"), LocationsId = 1 }
        );
    }
}