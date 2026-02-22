using Microsoft.EntityFrameworkCore.Migrations;

namespace GroceryApi.Migrations
{
    public partial class AddCustomersSuppliersTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // if tables already exist (e.g. you created them manually), drop them first
            migrationBuilder.Sql("DROP TABLE IF EXISTS \"Suppliers\";");
            migrationBuilder.Sql("DROP TABLE IF EXISTS \"Customers\";");

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Email = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Address = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    MobileNumber = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    WhatsAppNumber = table.Column<string>(type: "text", nullable: false, defaultValue: "")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Email = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Address = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    MobileNumber = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    WhatsAppNumber = table.Column<string>(type: "text", nullable: false, defaultValue: "")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Suppliers");

            migrationBuilder.DropTable(
                name: "Customers");
        }
    }
}
