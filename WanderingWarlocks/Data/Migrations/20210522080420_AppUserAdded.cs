﻿using Microsoft.EntityFrameworkCore.Migrations;

namespace WanderingWarlocks.Data.Migrations
{
    public partial class AppUserAdded : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Kills",
                table: "AspNetUsers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Kills",
                table: "AspNetUsers");
        }
    }
}
