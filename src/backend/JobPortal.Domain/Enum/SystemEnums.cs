// File: JobPortal.Domain/Enums/SystemEnums.cs
namespace JobPortal.Domain.Enums;

public enum UserRole { Admin = 1, Seeker = 2, Employer = 3 }
public enum UserStatus { Active = 1, Inactive = 2, Locked = 3 }
public enum Gender { Male = 1, Female = 2, Other = 3 }

public enum JobLevel { Intern, Fresher, Junior, Senior, Manager }
public enum WorkType { FullTime, PartTime, Remote, Hybrid, Freelance }
public enum JobStatus { Pending, Published, Expired, Rejected }

public enum ApplicationStatus { New, Viewed, Contacted, Interviewing, Offered, Rejected }