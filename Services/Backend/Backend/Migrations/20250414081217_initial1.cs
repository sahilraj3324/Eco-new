using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class initial1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Username",
                table: "Sellers",
                newName: "storename");

            migrationBuilder.AddColumn<string>(
                name: "hnscode",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "pincode",
                table: "Sellers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "profile_picture",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "hnscode",
                table: "Buyers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "pincode",
                table: "Buyers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "profile_picture",
                table: "Buyers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "storename",
                table: "Buyers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "hnscode",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "pincode",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "profile_picture",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "hnscode",
                table: "Buyers");

            migrationBuilder.DropColumn(
                name: "pincode",
                table: "Buyers");

            migrationBuilder.DropColumn(
                name: "profile_picture",
                table: "Buyers");

            migrationBuilder.DropColumn(
                name: "storename",
                table: "Buyers");

            migrationBuilder.RenameColumn(
                name: "storename",
                table: "Sellers",
                newName: "Username");
        }
    }
}
