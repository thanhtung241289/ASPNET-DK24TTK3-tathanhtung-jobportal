using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSeekerProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "SeekerProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Education",
                table: "SeekerProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Experience",
                table: "SeekerProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SkillsSummary",
                table: "SeekerProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "SeekerProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "SeekerProfiles");

            migrationBuilder.DropColumn(
                name: "Education",
                table: "SeekerProfiles");

            migrationBuilder.DropColumn(
                name: "Experience",
                table: "SeekerProfiles");

            migrationBuilder.DropColumn(
                name: "SkillsSummary",
                table: "SeekerProfiles");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "SeekerProfiles");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Companies");
        }
    }
}
