IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Categories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Locations] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Locations] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Skills] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Skills] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Users] (
    [Id] uniqueidentifier NOT NULL,
    [Email] nvarchar(255) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [Role] int NOT NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Companies] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [CompanyName] nvarchar(max) NOT NULL,
    [LogoUrl] nvarchar(max) NULL,
    [CoverUrl] nvarchar(max) NULL,
    [ShortDescription] nvarchar(max) NULL,
    [Address] nvarchar(max) NULL,
    [CompanySize] nvarchar(max) NULL,
    [Website] nvarchar(max) NULL,
    [IsVerified] bit NOT NULL,
    CONSTRAINT [PK_Companies] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Companies_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [SeekerProfiles] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [FullName] nvarchar(255) NOT NULL,
    [Dob] datetime2 NULL,
    [Gender] int NULL,
    [Phone] nvarchar(20) NULL,
    [Address] nvarchar(500) NULL,
    [AvatarUrl] nvarchar(max) NULL,
    CONSTRAINT [PK_SeekerProfiles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SeekerProfiles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [JobPosts] (
    [Id] uniqueidentifier NOT NULL,
    [CompanyId] uniqueidentifier NOT NULL,
    [CategoryId] int NOT NULL,
    [Title] nvarchar(255) NOT NULL,
    [JobLevel] int NOT NULL,
    [WorkType] int NOT NULL,
    [Quantity] int NOT NULL,
    [SalaryMin] decimal(18,2) NULL,
    [SalaryMax] decimal(18,2) NULL,
    [IsNegotiable] bit NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [Requirements] nvarchar(max) NOT NULL,
    [Benefits] nvarchar(max) NOT NULL,
    [ExpirationDate] datetime2 NOT NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_JobPosts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_JobPosts_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_JobPosts_Companies_CompanyId] FOREIGN KEY ([CompanyId]) REFERENCES [Companies] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Resumes] (
    [Id] uniqueidentifier NOT NULL,
    [SeekerId] uniqueidentifier NOT NULL,
    [FileName] nvarchar(max) NOT NULL,
    [FileUrl] nvarchar(max) NOT NULL,
    [IsDefault] bit NOT NULL,
    [SeekerProfileId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Resumes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Resumes_SeekerProfiles_SeekerProfileId] FOREIGN KEY ([SeekerProfileId]) REFERENCES [SeekerProfiles] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [JobLocations] (
    [JobPostsId] uniqueidentifier NOT NULL,
    [LocationsId] int NOT NULL,
    CONSTRAINT [PK_JobLocations] PRIMARY KEY ([JobPostsId], [LocationsId]),
    CONSTRAINT [FK_JobLocations_JobPosts_JobPostsId] FOREIGN KEY ([JobPostsId]) REFERENCES [JobPosts] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_JobLocations_Locations_LocationsId] FOREIGN KEY ([LocationsId]) REFERENCES [Locations] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [JobSkills] (
    [JobPostsId] uniqueidentifier NOT NULL,
    [SkillsId] int NOT NULL,
    CONSTRAINT [PK_JobSkills] PRIMARY KEY ([JobPostsId], [SkillsId]),
    CONSTRAINT [FK_JobSkills_JobPosts_JobPostsId] FOREIGN KEY ([JobPostsId]) REFERENCES [JobPosts] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_JobSkills_Skills_SkillsId] FOREIGN KEY ([SkillsId]) REFERENCES [Skills] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [SavedJobs] (
    [SeekerId] uniqueidentifier NOT NULL,
    [JobId] uniqueidentifier NOT NULL,
    [SavedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_SavedJobs] PRIMARY KEY ([SeekerId], [JobId]),
    CONSTRAINT [FK_SavedJobs_JobPosts_JobId] FOREIGN KEY ([JobId]) REFERENCES [JobPosts] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_SavedJobs_SeekerProfiles_SeekerId] FOREIGN KEY ([SeekerId]) REFERENCES [SeekerProfiles] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Applications] (
    [Id] uniqueidentifier NOT NULL,
    [JobId] uniqueidentifier NOT NULL,
    [SeekerId] uniqueidentifier NOT NULL,
    [ResumeId] uniqueidentifier NOT NULL,
    [Status] int NOT NULL,
    [AppliedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Applications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Applications_JobPosts_JobId] FOREIGN KEY ([JobId]) REFERENCES [JobPosts] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Applications_Resumes_ResumeId] FOREIGN KEY ([ResumeId]) REFERENCES [Resumes] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Applications_SeekerProfiles_SeekerId] FOREIGN KEY ([SeekerId]) REFERENCES [SeekerProfiles] ([Id]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_Applications_JobId] ON [Applications] ([JobId]);
GO

CREATE INDEX [IX_Applications_ResumeId] ON [Applications] ([ResumeId]);
GO

CREATE INDEX [IX_Applications_SeekerId] ON [Applications] ([SeekerId]);
GO

CREATE UNIQUE INDEX [IX_Companies_UserId] ON [Companies] ([UserId]);
GO

CREATE INDEX [IX_JobLocations_LocationsId] ON [JobLocations] ([LocationsId]);
GO

CREATE INDEX [IX_JobPosts_CategoryId] ON [JobPosts] ([CategoryId]);
GO

CREATE INDEX [IX_JobPosts_CompanyId] ON [JobPosts] ([CompanyId]);
GO

CREATE INDEX [IX_JobSkills_SkillsId] ON [JobSkills] ([SkillsId]);
GO

CREATE INDEX [IX_Resumes_SeekerProfileId] ON [Resumes] ([SeekerProfileId]);
GO

CREATE INDEX [IX_SavedJobs_JobId] ON [SavedJobs] ([JobId]);
GO

CREATE UNIQUE INDEX [IX_SeekerProfiles_UserId] ON [SeekerProfiles] ([UserId]);
GO

CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260520140716_InitialCreate', N'8.0.27');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] ON;
INSERT INTO [Categories] ([Id], [Name])
VALUES (1, N'Công nghệ thông tin / Phần mềm'),
(2, N'Marketing / Truyền thông'),
(3, N'Kế toán / Kiểm toán'),
(4, N'Quản trị nhân sự'),
(5, N'Kinh doanh / Bán hàng');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Locations]'))
    SET IDENTITY_INSERT [Locations] ON;
INSERT INTO [Locations] ([Id], [Name])
VALUES (1, N'Hồ Chí Minh'),
(2, N'Hà Nội'),
(3, N'Đà Nẵng'),
(4, N'Cần Thơ'),
(5, N'Remote (Làm việc từ xa)');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Locations]'))
    SET IDENTITY_INSERT [Locations] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Skills]'))
    SET IDENTITY_INSERT [Skills] ON;
INSERT INTO [Skills] ([Id], [Name])
VALUES (1, N'.NET / C#'),
(2, N'ReactJS / JavaScript'),
(3, N'SQL Server'),
(4, N'Golang'),
(5, N'Flutter / Dart'),
(6, N'Docker / Devops');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Skills]'))
    SET IDENTITY_INSERT [Skills] OFF;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260520145335_SeedMasterData', N'8.0.27');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [SeekerProfiles] ADD [Description] nvarchar(max) NULL;
GO

ALTER TABLE [SeekerProfiles] ADD [Education] nvarchar(max) NULL;
GO

ALTER TABLE [SeekerProfiles] ADD [Experience] nvarchar(max) NULL;
GO

ALTER TABLE [SeekerProfiles] ADD [SkillsSummary] nvarchar(max) NULL;
GO

ALTER TABLE [SeekerProfiles] ADD [Title] nvarchar(max) NULL;
GO

ALTER TABLE [Companies] ADD [Description] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260520154844_UpdateSeekerProfileFields', N'8.0.27');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'PasswordHash', N'Role', N'Status') AND [object_id] = OBJECT_ID(N'[Users]'))
    SET IDENTITY_INSERT [Users] ON;
INSERT INTO [Users] ([Id], [CreatedAt], [Email], [PasswordHash], [Role], [Status])
VALUES ('11111111-1111-1111-1111-111111111111', '2026-05-21T08:49:13.9123234Z', N'admin@jobportal.com', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 1, 1),
('22222222-2222-2222-2222-222222222222', '2026-05-21T08:49:13.9123237Z', N'hr@fpt.com', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 3, 1),
('33333333-3333-3333-3333-333333333333', '2026-05-21T08:49:13.9123238Z', N'an.nguyen@gmail.com', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 2, 1);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'PasswordHash', N'Role', N'Status') AND [object_id] = OBJECT_ID(N'[Users]'))
    SET IDENTITY_INSERT [Users] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'CompanyName', N'CompanySize', N'CoverUrl', N'Description', N'IsVerified', N'LogoUrl', N'ShortDescription', N'UserId', N'Website') AND [object_id] = OBJECT_ID(N'[Companies]'))
    SET IDENTITY_INSERT [Companies] ON;
INSERT INTO [Companies] ([Id], [Address], [CompanyName], [CompanySize], [CoverUrl], [Description], [IsVerified], [LogoUrl], [ShortDescription], [UserId], [Website])
VALUES ('44444444-4444-4444-4444-444444444444', N'Khu Công Nghệ Cao, Quận 9, TP. Hồ Chí Minh', N'FPT Software', NULL, NULL, N'Tập đoàn công nghệ và dịch vụ CNTT hàng đầu Việt Nam, môi trường làm việc toàn cầu toàn diện.', CAST(0 AS bit), N'https://img.vietnamworks.com/pictureprofile/vnw/logo_fpt_software.png', NULL, '22222222-2222-2222-2222-222222222222', N'https://fpt-software.com');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'CompanyName', N'CompanySize', N'CoverUrl', N'Description', N'IsVerified', N'LogoUrl', N'ShortDescription', N'UserId', N'Website') AND [object_id] = OBJECT_ID(N'[Companies]'))
    SET IDENTITY_INSERT [Companies] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Benefits', N'CategoryId', N'CompanyId', N'CreatedAt', N'Description', N'ExpirationDate', N'IsNegotiable', N'JobLevel', N'Quantity', N'Requirements', N'SalaryMax', N'SalaryMin', N'Status', N'Title', N'WorkType') AND [object_id] = OBJECT_ID(N'[JobPosts]'))
    SET IDENTITY_INSERT [JobPosts] ON;
INSERT INTO [JobPosts] ([Id], [Benefits], [CategoryId], [CompanyId], [CreatedAt], [Description], [ExpirationDate], [IsNegotiable], [JobLevel], [Quantity], [Requirements], [SalaryMax], [SalaryMin], [Status], [Title], [WorkType])
VALUES ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', N'Mức lương cạnh tranh, thưởng tháng 13 + thưởng hiệu quả dự án. Bảo hiểm FPT Care cao cấp dành riêng cho nhân viên.', 1, '44444444-4444-4444-4444-444444444444', '2026-05-19T08:49:13.9123297Z', N'Phát triển các mô-đun dịch vụ RESTful API, tối ưu truy vấn SQL Server cho hệ thống Core Banking.', '2026-06-21T08:49:13.9123302Z', CAST(0 AS bit), 2, 3, N'Có ít nhất 1-2 năm kinh nghiệm làm việc thực tế với ASP.NET Core, C#, EF Core. Nắm chắc kiến trúc OOP.', 30000000.0, 15000000.0, 1, N'Chuyên Viên Phát Triển Hệ Thống Backend .NET Core', 0),
('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', N'Làm việc theo mô hình Hybrid linh hoạt 2 ngày tại văn phòng. Cơ hội đi Onsite làm việc trực tiếp tại thị trường Nhật Bản.', 1, '44444444-4444-4444-4444-444444444444', '2026-05-20T08:49:13.9123310Z', N'Xây dựng các Dashboard quản trị hệ thống phức tạp, tối ưu hóa tốc độ tải trang Core Web Vitals cho đối tác nước ngoài.', '2026-06-21T08:49:13.9123311Z', CAST(0 AS bit), 3, 2, N'Thành thạo JavaScript/TypeScript, có kinh nghiệm sâu sắc về ReactJS (Hooks, Redux/Context API). Biết Tailwind là điểm cộng.', 35000000.0, 18000000.0, 1, N'Frontend Developer (ReactJS / Tailwind CSS)', 3),
('cccccccc-3333-3333-3333-cccccccccccc', N'Mức lương thỏa thuận kịch trần theo năng lực thực tế. Thưởng cổ phiếu ESOP và trợ cấp thiết bị làm việc Macbook Pro.', 3, '44444444-4444-4444-4444-444444444444', '2026-05-21T08:49:13.9123316Z', N'Thiết kế kiến trúc hệ thống Microservices, thiết lập đường ống CI/CD tự động hóa hạ tầng đám mây AWS.', '2026-06-05T08:49:13.9123316Z', CAST(1 AS bit), 4, 1, N'Có kinh nghiệm sâu với Docker, Kubernetes, Jenkins hoặc GitHub Actions. Sở hữu chứng chỉ AWS là lợi thế lớn.', NULL, NULL, 0, N'[Hỏa Tốc] Cloud DevOps Engineer (AWS / Docker)', 0);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Benefits', N'CategoryId', N'CompanyId', N'CreatedAt', N'Description', N'ExpirationDate', N'IsNegotiable', N'JobLevel', N'Quantity', N'Requirements', N'SalaryMax', N'SalaryMin', N'Status', N'Title', N'WorkType') AND [object_id] = OBJECT_ID(N'[JobPosts]'))
    SET IDENTITY_INSERT [JobPosts] OFF;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260521084915_SeedInitialMockData', N'8.0.27');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Resumes] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

UPDATE [JobPosts] SET [CreatedAt] = '2026-05-19T15:39:24.3765842Z', [ExpirationDate] = '2026-06-21T15:39:24.3765850Z'
WHERE [Id] = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [CreatedAt] = '2026-05-20T15:39:24.3765868Z', [ExpirationDate] = '2026-06-21T15:39:24.3765869Z'
WHERE [Id] = 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [CreatedAt] = '2026-05-21T15:39:24.3765879Z', [ExpirationDate] = '2026-06-05T15:39:24.3765880Z'
WHERE [Id] = 'cccccccc-3333-3333-3333-cccccccccccc';
SELECT @@ROWCOUNT;

GO

UPDATE [Users] SET [CreatedAt] = '2026-05-21T15:39:24.3765685Z'
WHERE [Id] = '11111111-1111-1111-1111-111111111111';
SELECT @@ROWCOUNT;

GO

UPDATE [Users] SET [CreatedAt] = '2026-05-21T15:39:24.3765690Z'
WHERE [Id] = '22222222-2222-2222-2222-222222222222';
SELECT @@ROWCOUNT;

GO

UPDATE [Users] SET [CreatedAt] = '2026-05-21T15:39:24.3765693Z'
WHERE [Id] = '33333333-3333-3333-3333-333333333333';
SELECT @@ROWCOUNT;

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260521153924_AddCreatedAtToResume', N'8.0.27');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

UPDATE [Companies] SET [CompanySize] = N'10,000+ nhân viên', [Description] = N'Tập đoàn công nghệ và dịch vụ CNTT hàng đầu Việt Nam, cung cấp giải pháp chuyển đổi số toàn diện cho các đối tác toàn cầu.', [IsVerified] = CAST(1 AS bit), [ShortDescription] = N'Tập đoàn công nghệ hàng đầu, tiên phong trong chuyển đổi số toàn cầu.'
WHERE [Id] = '44444444-4444-4444-4444-444444444444';
SELECT @@ROWCOUNT;

GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'LocationsId') AND [object_id] = OBJECT_ID(N'[JobLocations]'))
    SET IDENTITY_INSERT [JobLocations] ON;
INSERT INTO [JobLocations] ([JobPostsId], [LocationsId])
VALUES ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 1),
('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 2),
('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 1),
('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 5),
('cccccccc-3333-3333-3333-cccccccccccc', 1);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'LocationsId') AND [object_id] = OBJECT_ID(N'[JobLocations]'))
    SET IDENTITY_INSERT [JobLocations] OFF;
GO

UPDATE [JobPosts] SET [CreatedAt] = '2026-05-19T00:00:00.0000000Z', [ExpirationDate] = '2026-06-21T00:00:00.0000000Z'
WHERE [Id] = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [CreatedAt] = '2026-05-20T00:00:00.0000000Z', [ExpirationDate] = '2026-06-21T00:00:00.0000000Z'
WHERE [Id] = 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [CategoryId] = 1, [CreatedAt] = '2026-05-21T00:00:00.0000000Z', [ExpirationDate] = '2026-06-05T00:00:00.0000000Z'
WHERE [Id] = 'cccccccc-3333-3333-3333-cccccccccccc';
SELECT @@ROWCOUNT;

GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'SkillsId') AND [object_id] = OBJECT_ID(N'[JobSkills]'))
    SET IDENTITY_INSERT [JobSkills] ON;
INSERT INTO [JobSkills] ([JobPostsId], [SkillsId])
VALUES ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 1),
('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 3),
('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 6),
('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 2),
('cccccccc-3333-3333-3333-cccccccccccc', 6);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'SkillsId') AND [object_id] = OBJECT_ID(N'[JobSkills]'))
    SET IDENTITY_INSERT [JobSkills] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Skills]'))
    SET IDENTITY_INSERT [Skills] ON;
INSERT INTO [Skills] ([Id], [Name])
VALUES (7, N'Content Writing'),
(8, N'SEO Marketing'),
(9, N'Corporate Finance'),
(10, N'Negotiation & Sales'),
(11, N'Recruitment'),
(12, N'Communication'),
(13, N'English'),
(14, N'Excel');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Skills]'))
    SET IDENTITY_INSERT [Skills] OFF;
GO

UPDATE [Users] SET [CreatedAt] = '2026-05-21T00:00:00.0000000Z'
WHERE [Id] = '11111111-1111-1111-1111-111111111111';
SELECT @@ROWCOUNT;

GO

UPDATE [Users] SET [CreatedAt] = '2026-05-21T00:00:00.0000000Z'
WHERE [Id] = '22222222-2222-2222-2222-222222222222';
SELECT @@ROWCOUNT;

GO

UPDATE [Users] SET [CreatedAt] = '2026-05-21T00:00:00.0000000Z'
WHERE [Id] = '33333333-3333-3333-3333-333333333333';
SELECT @@ROWCOUNT;

GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'PasswordHash', N'Role', N'Status') AND [object_id] = OBJECT_ID(N'[Users]'))
    SET IDENTITY_INSERT [Users] ON;
INSERT INTO [Users] ([Id], [CreatedAt], [Email], [PasswordHash], [Role], [Status])
VALUES ('22222222-2222-2222-2222-222222222223', '2026-05-21T00:00:00.0000000Z', N'hr@vingroup.net', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 3, 1),
('22222222-2222-2222-2222-222222222224', '2026-05-21T00:00:00.0000000Z', N'hr@shopee.vn', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 3, 1),
('22222222-2222-2222-2222-222222222225', '2026-05-21T00:00:00.0000000Z', N'hr@ey.com', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 3, 1);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'PasswordHash', N'Role', N'Status') AND [object_id] = OBJECT_ID(N'[Users]'))
    SET IDENTITY_INSERT [Users] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'CompanyName', N'CompanySize', N'CoverUrl', N'Description', N'IsVerified', N'LogoUrl', N'ShortDescription', N'UserId', N'Website') AND [object_id] = OBJECT_ID(N'[Companies]'))
    SET IDENTITY_INSERT [Companies] ON;
INSERT INTO [Companies] ([Id], [Address], [CompanyName], [CompanySize], [CoverUrl], [Description], [IsVerified], [LogoUrl], [ShortDescription], [UserId], [Website])
VALUES ('44444444-4444-4444-4444-444444444445', N'Số 7 Đường Bằng Lăng 1, KĐT Vinhomes Riverside, Long Biên, Hà Nội', N'Vingroup', N'10,000+ nhân viên', N'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80', N'Vingroup là một trong những tập đoàn kinh tế tư nhân đa ngành lớn nhất Châu Á, tập trung phát triển với 3 nhóm hoạt động trọng tâm: Công nghệ – Công nghiệp, Thương mại Dịch vụ, Thiện nguyện Xã hội.', CAST(1 AS bit), N'https://img.vietnamworks.com/pictureprofile/vnw/logo_vingroup.png', N'Tập đoàn kinh tế tư nhân đa ngành hàng đầu Việt Nam.', '22222222-2222-2222-2222-222222222223', N'https://vingroup.net'),
('44444444-4444-4444-4444-444444444446', N'Tòa nhà Saigon Centre Tower 2, 67 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh', N'Shopee Vietnam', N'1,000 - 5,000 nhân viên', N'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80', N'Shopee là nền tảng thương mại điện tử hàng đầu tại Đông Nam Á và Đài Loan. Ra mắt năm 2015, Shopee mang đến trải nghiệm mua sắm trực tuyến dễ dàng, an toàn và nhanh chóng.', CAST(1 AS bit), N'https://logodownload.org/wp-content/uploads/2020/09/shopee-logo-1.png', N'Nền tảng thương mại điện tử hàng đầu tại Đông Nam Á.', '22222222-2222-2222-2222-222222222224', N'https://shopee.vn'),
('44444444-4444-4444-4444-444444444447', N'Tầng 8, Tòa nhà CornerStone, 16 Phan Chu Trinh, Hoàn Kiếm, Hà Nội', N'Ernst & Young Vietnam (EY)', N'1,000 - 2,000 nhân viên', N'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80', N'EY là tổ chức hàng đầu thế giới về dịch vụ kiểm toán, thuế, giao dịch tài chính và tư vấn, xây dựng niềm tin vào các thị trường vốn và nền kinh tế toàn cầu.', CAST(1 AS bit), N'https://logodownload.org/wp-content/uploads/2021/03/ey-ernst-young-logo-0.png', N'Một trong bốn hãng kiểm toán lớn nhất thế giới (Big Four).', '22222222-2222-2222-2222-222222222225', N'https://www.ey.com/vi_vn');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'CompanyName', N'CompanySize', N'CoverUrl', N'Description', N'IsVerified', N'LogoUrl', N'ShortDescription', N'UserId', N'Website') AND [object_id] = OBJECT_ID(N'[Companies]'))
    SET IDENTITY_INSERT [Companies] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'SkillsId') AND [object_id] = OBJECT_ID(N'[JobSkills]'))
    SET IDENTITY_INSERT [JobSkills] ON;
INSERT INTO [JobSkills] ([JobPostsId], [SkillsId])
VALUES ('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 12);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'SkillsId') AND [object_id] = OBJECT_ID(N'[JobSkills]'))
    SET IDENTITY_INSERT [JobSkills] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Benefits', N'CategoryId', N'CompanyId', N'CreatedAt', N'Description', N'ExpirationDate', N'IsNegotiable', N'JobLevel', N'Quantity', N'Requirements', N'SalaryMax', N'SalaryMin', N'Status', N'Title', N'WorkType') AND [object_id] = OBJECT_ID(N'[JobPosts]'))
    SET IDENTITY_INSERT [JobPosts] ON;
INSERT INTO [JobPosts] ([Id], [Benefits], [CategoryId], [CompanyId], [CreatedAt], [Description], [ExpirationDate], [IsNegotiable], [JobLevel], [Quantity], [Requirements], [SalaryMax], [SalaryMin], [Status], [Title], [WorkType])
VALUES ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', N'Hoa hồng hấp dẫn theo doanh số, thưởng nóng dự án. Nghỉ dưỡng hàng năm tại các cơ sở Vinpearl.', 5, '44444444-4444-4444-4444-444444444445', '2026-05-18T00:00:00.0000000Z', N'Quản lý và điều hành đội ngũ kinh doanh dự án Vinhomes, hỗ trợ tư vấn khách hàng VIP, thúc đẩy doanh số bán hàng.', '2026-06-21T00:00:00.0000000Z', CAST(0 AS bit), 4, 5, N'Tối thiểu 3 năm kinh nghiệm trong lĩnh vực Bất động sản, kỹ năng đàm phán thuyết phục tốt. Có khả năng chịu áp lực cao.', 50000000.0, 20000000.0, 1, N'Trưởng Nhóm Kinh Doanh Bất Động Sản (Vinhomes)', 0),
('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', N'Môi trường trẻ trung năng động. Trợ cấp ăn trưa, trà chiều miễn phí tại văn phòng Shopee.', 2, '44444444-4444-4444-4444-444444444446', '2026-05-17T00:00:00.0000000Z', N'Nghiên cứu từ khóa, tối ưu hóa on-page/off-page cho website Shopee.vn, theo dõi hiệu quả traffic và thứ hạng công cụ tìm kiếm.', '2026-07-21T00:00:00.0000000Z', CAST(0 AS bit), 2, 2, N'1-2 năm kinh nghiệm làm SEO chuyên sâu, sử dụng thành thạo Google Search Console, Ahrefs, Screaming Frog.', 22000000.0, 12000000.0, 1, N'Chuyên Viên SEO Marketing - Thương Mại Điện Tử', 0),
('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', N'Đào tạo bài bản theo tiêu chuẩn Big 4 toàn cầu. Cơ hội thăng tiến lên Kiểm toán viên chính sau 1-2 năm.', 3, '44444444-4444-4444-4444-444444444447', '2026-05-16T00:00:00.0000000Z', N'Hỗ trợ kiểm toán viên chính thực hiện quy trình kiểm toán tại doanh nghiệp khách hàng, đối chiếu chứng từ sổ sách kế toán.', '2026-06-21T00:00:00.0000000Z', CAST(1 AS bit), 1, 10, N'Sinh viên mới tốt nghiệp hoặc dưới 1 năm kinh nghiệm chuyên ngành Kế toán, Kiểm toán, Tài chính. Tiếng Anh tốt.', NULL, NULL, 1, N'Trợ Lý Kiểm Toán (Audit Assistant)', 0),
('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', N'Thời gian làm việc linh hoạt, 2 ngày hybrid. Bảo hiểm sức khỏe quốc tế.', 4, '44444444-4444-4444-4444-444444444446', '2026-05-20T00:00:00.0000000Z', N'Lập kế hoạch tuyển dụng, tìm kiếm ứng viên qua các kênh, thực hiện phỏng vấn vòng sơ loại cho các vị trí non-tech.', '2026-06-21T00:00:00.0000000Z', CAST(0 AS bit), 2, 2, N'Tối thiểu 1 năm kinh nghiệm tuyển dụng. Kỹ năng giao tiếp và tạo thiện cảm tốt. Ưu tiên ứng viên từng làm headhunter.', 25000000.0, 15000000.0, 1, N'Chuyên Viên Tuyển Dụng (Recruitment Executive)', 3);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Benefits', N'CategoryId', N'CompanyId', N'CreatedAt', N'Description', N'ExpirationDate', N'IsNegotiable', N'JobLevel', N'Quantity', N'Requirements', N'SalaryMax', N'SalaryMin', N'Status', N'Title', N'WorkType') AND [object_id] = OBJECT_ID(N'[JobPosts]'))
    SET IDENTITY_INSERT [JobPosts] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'LocationsId') AND [object_id] = OBJECT_ID(N'[JobLocations]'))
    SET IDENTITY_INSERT [JobLocations] ON;
INSERT INTO [JobLocations] ([JobPostsId], [LocationsId])
VALUES ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', 2),
('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', 1),
('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', 2),
('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', 1);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'LocationsId') AND [object_id] = OBJECT_ID(N'[JobLocations]'))
    SET IDENTITY_INSERT [JobLocations] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'SkillsId') AND [object_id] = OBJECT_ID(N'[JobSkills]'))
    SET IDENTITY_INSERT [JobSkills] ON;
INSERT INTO [JobSkills] ([JobPostsId], [SkillsId])
VALUES ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', 10),
('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', 12),
('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', 13),
('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', 7),
('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', 8),
('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', 13),
('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', 9),
('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', 13),
('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', 14),
('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', 11),
('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', 12);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'SkillsId') AND [object_id] = OBJECT_ID(N'[JobSkills]'))
    SET IDENTITY_INSERT [JobSkills] OFF;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260521161628_SeedMoreCompaniesAndJobs', N'8.0.27');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [JobPosts] ADD [IsHot] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

UPDATE [JobPosts] SET [IsHot] = CAST(1 AS bit)
WHERE [Id] = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [IsHot] = CAST(1 AS bit)
WHERE [Id] = 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [IsHot] = CAST(1 AS bit)
WHERE [Id] = 'aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [IsHot] = CAST(0 AS bit)
WHERE [Id] = 'aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [IsHot] = CAST(0 AS bit)
WHERE [Id] = 'aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [IsHot] = CAST(0 AS bit)
WHERE [Id] = 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
SELECT @@ROWCOUNT;

GO

UPDATE [JobPosts] SET [IsHot] = CAST(0 AS bit)
WHERE [Id] = 'cccccccc-3333-3333-3333-cccccccccccc';
SELECT @@ROWCOUNT;

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260523044906_AddIsHotToJobPost', N'8.0.27');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Companies] ADD [IsLocked] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

UPDATE [Companies] SET [IsLocked] = CAST(0 AS bit)
WHERE [Id] = '44444444-4444-4444-4444-444444444444';
SELECT @@ROWCOUNT;

GO

UPDATE [Companies] SET [IsLocked] = CAST(0 AS bit)
WHERE [Id] = '44444444-4444-4444-4444-444444444445';
SELECT @@ROWCOUNT;

GO

UPDATE [Companies] SET [IsLocked] = CAST(0 AS bit)
WHERE [Id] = '44444444-4444-4444-4444-444444444446';
SELECT @@ROWCOUNT;

GO

UPDATE [Companies] SET [IsLocked] = CAST(0 AS bit)
WHERE [Id] = '44444444-4444-4444-4444-444444444447';
SELECT @@ROWCOUNT;

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260523064219_AddCompanyIsLocked', N'8.0.27');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] ON;
INSERT INTO [Categories] ([Id], [Name])
VALUES (6, N'Thiết kế đồ họa / UI-UX'),
(7, N'Dịch vụ khách hàng / CSKH'),
(8, N'Ngân hàng / Tài chính'),
(9, N'Giáo dục / Đào tạo'),
(10, N'Logistics / Chuỗi cung ứng');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'PasswordHash', N'Role', N'Status') AND [object_id] = OBJECT_ID(N'[Users]'))
    SET IDENTITY_INSERT [Users] ON;
INSERT INTO [Users] ([Id], [CreatedAt], [Email], [PasswordHash], [Role], [Status])
VALUES ('22222222-2222-2222-2222-222222222226', '2026-05-21T00:00:00.0000000Z', N'hr@techcombank.com.vn', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 3, 1),
('22222222-2222-2222-2222-222222222227', '2026-05-21T00:00:00.0000000Z', N'recruitment@vinamilk.com.vn', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 3, 1),
('22222222-2222-2222-2222-222222222228', '2026-05-21T00:00:00.0000000Z', N'careers@grab.com', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 3, 1),
('22222222-2222-2222-2222-222222222229', '2026-05-21T00:00:00.0000000Z', N'jobs@vng.com.vn', N'$2a$11$wK7A6fXN93vL7uX7m1Sze.mO6Pj12Wp8N3Zz9gRzFqZz5xM7m.Tqm', 3, 1);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'PasswordHash', N'Role', N'Status') AND [object_id] = OBJECT_ID(N'[Users]'))
    SET IDENTITY_INSERT [Users] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'CompanyName', N'CompanySize', N'CoverUrl', N'Description', N'IsLocked', N'IsVerified', N'LogoUrl', N'ShortDescription', N'UserId', N'Website') AND [object_id] = OBJECT_ID(N'[Companies]'))
    SET IDENTITY_INSERT [Companies] ON;
INSERT INTO [Companies] ([Id], [Address], [CompanyName], [CompanySize], [CoverUrl], [Description], [IsLocked], [IsVerified], [LogoUrl], [ShortDescription], [UserId], [Website])
VALUES ('44444444-4444-4444-4444-444444444448', N'119 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', N'Techcombank', N'5,000 - 10,000 nhân viên', N'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80', N'Techcombank là một trong những ngân hàng cổ phần lớn nhất Việt Nam và là một trong những ngân hàng hàng đầu ở Châu Á, dẫn đầu về cung cấp các giải pháp tài chính số hóa.', CAST(0 AS bit), CAST(1 AS bit), N'https://upload.wikimedia.org/wikipedia/commons/e/e8/Techcombank_logo.svg', N'Ngân hàng Thương mại Cổ phần Kỹ thương Việt Nam.', '22222222-2222-2222-2222-222222222226', N'https://techcombank.com'),
('44444444-4444-4444-4444-444444444449', N'10 Tân Trào, Tân Phú, Quận 7, TP. Hồ Chí Minh', N'Vinamilk', N'5,000 - 10,000 nhân viên', N'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80', N'Vinamilk là doanh nghiệp sản xuất sữa hàng đầu Việt Nam. Nằm trong top 40 công ty sữa lớn nhất thế giới về doanh thu, thương hiệu Vinamilk được người tiêu dùng tin tưởng lựa chọn.', CAST(0 AS bit), CAST(1 AS bit), N'https://upload.wikimedia.org/wikipedia/commons/2/29/Vinamilk_logo.svg', N'Công ty Cổ phần Sữa Việt Nam - Dinh dưỡng vươn cao Việt Nam.', '22222222-2222-2222-2222-222222222227', N'https://vinamilk.com.vn'),
('44444444-4444-4444-4444-444444444450', N'Tòa nhà Mapletree Business Centre, 1060 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh', N'Grab Vietnam', N'1,000 - 5,000 nhân viên', N'https://images.unsplash.com/photo-1494959764136-6be9eb3c261e?w=1200&auto=format&fit=crop&q=80', N'Grab là siêu ứng dụng hàng đầu Đông Nam Á cung cấp các dịch vụ thiết yếu hàng ngày bao gồm giao nhận, vận chuyển, giao đồ ăn và các dịch vụ tài chính số.', CAST(0 AS bit), CAST(1 AS bit), N'https://freelogopng.com/images/all_img/1655829871grab-logo-png.png', N'Siêu ứng dụng hàng đầu Đông Nam Á về giao nhận và di chuyển.', '22222222-2222-2222-2222-222222222228', N'https://grab.com/vn'),
('44444444-4444-4444-4444-444444444451', N'Z06 Đường số 13, Phường Tân Thuận Đông, Quận 7, TP. Hồ Chí Minh', N'VNG Corporation', N'2,000 - 5,000 nhân viên', N'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80', N'Kiến tạo công nghệ và Phát triển con người. VNG là công ty Internet hàng đầu Việt Nam sở hữu Zalo, Zing MP3 và phát triển mảng game, dịch vụ điện toán đám mây toàn cầu.', CAST(0 AS bit), CAST(1 AS bit), N'https://upload.wikimedia.org/wikipedia/commons/2/22/VNG_logo.svg', N'Công ty công nghệ kỳ lân đầu tiên của Việt Nam.', '22222222-2222-2222-2222-222222222229', N'https://vng.com.vn');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'CompanyName', N'CompanySize', N'CoverUrl', N'Description', N'IsLocked', N'IsVerified', N'LogoUrl', N'ShortDescription', N'UserId', N'Website') AND [object_id] = OBJECT_ID(N'[Companies]'))
    SET IDENTITY_INSERT [Companies] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Benefits', N'CategoryId', N'CompanyId', N'CreatedAt', N'Description', N'ExpirationDate', N'IsHot', N'IsNegotiable', N'JobLevel', N'Quantity', N'Requirements', N'SalaryMax', N'SalaryMin', N'Status', N'Title', N'WorkType') AND [object_id] = OBJECT_ID(N'[JobPosts]'))
    SET IDENTITY_INSERT [JobPosts] ON;
INSERT INTO [JobPosts] ([Id], [Benefits], [CategoryId], [CompanyId], [CreatedAt], [Description], [ExpirationDate], [IsHot], [IsNegotiable], [JobLevel], [Quantity], [Requirements], [SalaryMax], [SalaryMin], [Status], [Title], [WorkType])
VALUES ('aaaaaaaa-6666-6666-6666-aaaaaaaaaaaa', N'Tháng lương 13-15 + thưởng doanh số không giới hạn. Lộ trình thăng tiến rõ ràng trong môi trường chuyên nghiệp.', 8, '44444444-4444-4444-4444-444444444448', '2026-05-19T00:00:00.0000000Z', N'Quản lý danh mục khách hàng doanh nghiệp, thẩm định tín dụng và phát triển quan hệ đối tác kinh doanh.', '2026-06-21T00:00:00.0000000Z', CAST(1 AS bit), CAST(0 AS bit), 2, 5, N'Tốt nghiệp chuyên ngành Tài chính, Ngân hàng, Kinh tế. Kỹ năng phân tích báo cáo tài chính và giao tiếp xuất sắc.', 35000000.0, 18000000.0, 1, N'Chuyên Viên Quan Hệ Khách Hàng Doanh Nghiệp (RM)', 0),
('aaaaaaaa-7777-7777-7777-aaaaaaaaaaaa', N'Môi trường làm việc thuộc top 1 nơi làm việc tốt nhất Việt Nam. Trợ cấp sữa, cơm trưa và BHXH đóng full lương.', 10, '44444444-4444-4444-4444-444444444449', '2026-05-18T00:00:00.0000000Z', N'Giám sát chuỗi cung ứng sữa nguyên liệu và thành phẩm, tối ưu chi phí vận tải và quản trị kho vận.', '2026-07-21T00:00:00.0000000Z', CAST(0 AS bit), CAST(0 AS bit), 2, 2, N'Có kinh nghiệm 2 năm làm việc trong mảng Logistics hoặc SCM. Thành thạo tiếng Anh và Excel nâng cao.', 25000000.0, 15000000.0, 1, N'Nhân Viên Quản Lý Chuỗi Cung Ứng (Logistics Specialist)', 0),
('aaaaaaaa-8888-8888-8888-aaaaaaaaaaaa', N'Môi trường làm việc thuộc top 1 nơi làm việc tốt nhất Việt Nam. Trợ cấp sữa, cơm trưa và BHXH đóng full lương.', 7, '44444444-4444-4444-4444-444444444450', '2026-05-18T00:00:00.0000000Z', N'Giải quyết các khiếu nại, phản hồi của người', '2026-07-21T00:00:00.0000000Z', CAST(0 AS bit), CAST(0 AS bit), 2, 3, N'Có kinh nghiệm 2 năm làm việc trong mảng Logistics hoặc SCM. Thành thạo tiếng Anh và Excel nâng cao.', 16000000.0, 10000000.0, 1, N'Customer Experience Specialist (Chăm sóc Khách hàng)', 0),
('aaaaaaaa-9999-9999-9999-aaaaaaaaaaaa', N'Được làm việc trong môi trường công nghệ hàng đầu Việt Nam. Thỏa sức sáng tạo với các dự án quy mô lớn. Hưởng lương tháng 13 và các phúc lợi hấp dẫn khác.', 4, '44444444-4444-4444-4444-444444444451', '2026-05-17T00:00:00.0000000Z', N'Thiết kế giao diện cho các sản phẩm game và ứng dụng di động của VNG. Tham gia vào toàn bộ quy trình từ wireframe, mockup đến prototyping.', '2026-06-21T00:00:00.0000000Z', CAST(0 AS bit), CAST(0 AS bit), 2, 1, N'Kinh nghiệm 1-2 năm ở vị trí tương đương. Thành thạo Figma, Sketch, Adobe XD. Có portfolio thể hiện rõ phong cách thiết kế.', 20000000.0, 12000000.0, 1, N'UI/UX Designer (Làm việc tại Quận 7)', 0);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Benefits', N'CategoryId', N'CompanyId', N'CreatedAt', N'Description', N'ExpirationDate', N'IsHot', N'IsNegotiable', N'JobLevel', N'Quantity', N'Requirements', N'SalaryMax', N'SalaryMin', N'Status', N'Title', N'WorkType') AND [object_id] = OBJECT_ID(N'[JobPosts]'))
    SET IDENTITY_INSERT [JobPosts] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'LocationsId') AND [object_id] = OBJECT_ID(N'[JobLocations]'))
    SET IDENTITY_INSERT [JobLocations] ON;
INSERT INTO [JobLocations] ([JobPostsId], [LocationsId])
VALUES ('aaaaaaaa-6666-6666-6666-aaaaaaaaaaaa', 2),
('aaaaaaaa-7777-7777-7777-aaaaaaaaaaaa', 1),
('aaaaaaaa-8888-8888-8888-aaaaaaaaaaaa', 1),
('aaaaaaaa-9999-9999-9999-aaaaaaaaaaaa', 1);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'LocationsId') AND [object_id] = OBJECT_ID(N'[JobLocations]'))
    SET IDENTITY_INSERT [JobLocations] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'SkillsId') AND [object_id] = OBJECT_ID(N'[JobSkills]'))
    SET IDENTITY_INSERT [JobSkills] ON;
INSERT INTO [JobSkills] ([JobPostsId], [SkillsId])
VALUES ('aaaaaaaa-6666-6666-6666-aaaaaaaaaaaa', 10),
('aaaaaaaa-6666-6666-6666-aaaaaaaaaaaa', 12),
('aaaaaaaa-7777-7777-7777-aaaaaaaaaaaa', 13),
('aaaaaaaa-7777-7777-7777-aaaaaaaaaaaa', 14),
('aaaaaaaa-8888-8888-8888-aaaaaaaaaaaa', 12),
('aaaaaaaa-8888-8888-8888-aaaaaaaaaaaa', 13),
('aaaaaaaa-9999-9999-9999-aaaaaaaaaaaa', 2),
('aaaaaaaa-9999-9999-9999-aaaaaaaaaaaa', 12);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'JobPostsId', N'SkillsId') AND [object_id] = OBJECT_ID(N'[JobSkills]'))
    SET IDENTITY_INSERT [JobSkills] OFF;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260523102617_UpdateSeedDataAndRelations', N'8.0.27');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

UPDATE [Companies] SET [CoverUrl] = N'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80'
WHERE [Id] = '44444444-4444-4444-4444-444444444444';
SELECT @@ROWCOUNT;

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260523104954_UpdateFptCoverPhoto', N'8.0.27');
GO

COMMIT;
GO

