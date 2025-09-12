using Microsoft.EntityFrameworkCore.Migrations;

namespace PscTechBackend.Migrations
{
    public partial class AddPasswordFieldsToUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add PasswordHash column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordHash')
                BEGIN
                    ALTER TABLE [dbo].[Users] ADD [PasswordHash] NVARCHAR(255) NOT NULL DEFAULT ''
                END
            ");

            // Add PasswordResetToken column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordResetToken')
                BEGIN
                    ALTER TABLE [dbo].[Users] ADD [PasswordResetToken] NVARCHAR(255) NULL
                END
            ");

            // Add PasswordResetTokenExpiry column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordResetTokenExpiry')
                BEGIN
                    ALTER TABLE [dbo].[Users] ADD [PasswordResetTokenExpiry] DATETIME2 NULL
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove the columns if they exist
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordHash')
                BEGIN
                    ALTER TABLE [dbo].[Users] DROP COLUMN [PasswordHash]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordResetToken')
                BEGIN
                    ALTER TABLE [dbo].[Users] DROP COLUMN [PasswordResetToken]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordResetTokenExpiry')
                BEGIN
                    ALTER TABLE [dbo].[Users] DROP COLUMN [PasswordResetTokenExpiry]
                END
            ");
        }
    }
}









