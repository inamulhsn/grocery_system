using Microsoft.EntityFrameworkCore.Migrations;

namespace GroceryApi.Migrations
{
    public partial class AddBarcodeValueToProduct : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BarcodeValue",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BarcodeValue",
                table: "Products");
        }
    }
}
