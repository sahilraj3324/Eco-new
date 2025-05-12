using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class init2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Gstnumber",
                table: "Buyers");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Buyers");

            migrationBuilder.DropColumn(
                name: "Password",
                table: "Buyers");

            migrationBuilder.DropColumn(
                name: "Photo",
                table: "Buyers");

            migrationBuilder.DropColumn(
                name: "Pincode",
                table: "Buyers");

            migrationBuilder.RenameColumn(
                name: "address",
                table: "Buyers",
                newName: "Address");

            migrationBuilder.RenameColumn(
                name: "Phonenumber",
                table: "Buyers",
                newName: "PhoneNumber");

            migrationBuilder.RenameColumn(
                name: "UserType",
                table: "Buyers",
                newName: "Username");

            migrationBuilder.RenameColumn(
                name: "Tradename",
                table: "Buyers",
                newName: "PasswordHash");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "Buyers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "Buyers",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "Buyers",
                newName: "Phonenumber");

            migrationBuilder.RenameColumn(
                name: "Address",
                table: "Buyers",
                newName: "address");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "Buyers",
                newName: "UserType");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Buyers",
                newName: "Tradename");

            migrationBuilder.AlterColumn<long>(
                name: "Phonenumber",
                table: "Buyers",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Buyers",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "Gstnumber",
                table: "Buyers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Buyers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "Buyers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Photo",
                table: "Buyers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Pincode",
                table: "Buyers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
