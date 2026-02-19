using Microsoft.EntityFrameworkCore.Migrations;

namespace GroceryApi.Migrations
{
    public partial class AddCustomerToSales : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerId",
                table: "Sales",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "Sales",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "Sales",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "CustomerId", table: "Sales");
            migrationBuilder.DropColumn(name: "CustomerName", table: "Sales");
            migrationBuilder.DropColumn(name: "CustomerPhone", table: "Sales");
        }
    }
}
