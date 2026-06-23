using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PINAutokucaAPI.Migrations
{
    /// <inheritdoc />
    public partial class DodajVlasnikaVozila : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Cars",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Cars");
        }
    }
}
