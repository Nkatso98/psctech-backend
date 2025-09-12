using Microsoft.EntityFrameworkCore;
using PscTechBackend.Models;

namespace PscTechBackend.Data
{
    public class PscTechDbContext : DbContext
    {
        public PscTechDbContext(DbContextOptions<PscTechDbContext> options) : base(options)
        {
        }

        // Core business tables matching your exact schema
        public DbSet<Institution> Institutions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<InstitutionDetails> InstitutionDetails { get; set; }
        public DbSet<Learner> Learners { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<VoucherRedemption> VoucherRedemptions { get; set; }
        public DbSet<StudyResult> StudyResults { get; set; }
        public DbSet<VoucherAudit> VoucherAudits { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Institution entity (matches actual database schema)
            modelBuilder.Entity<Institution>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
                entity.Property(e => e.District).HasMaxLength(100);
                entity.Property(e => e.Province).HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(500);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(255);
                entity.Property(e => e.Website).HasMaxLength(255);
                entity.Property(e => e.LogoUrl).HasMaxLength(500);
                entity.Property(e => e.SubscriptionPlan).HasMaxLength(20);
                entity.Property(e => e.SubscriptionStatus).HasMaxLength(20);
                entity.Property(e => e.SubscriptionExpiry);
                entity.Property(e => e.MaxUsers);
                entity.Property(e => e.MaxStudents);
                entity.Property(e => e.DatabaseName).IsRequired().HasMaxLength(128);
                entity.Property(e => e.ServerName).IsRequired().HasMaxLength(128);
                entity.Property(e => e.ConnectionString).HasMaxLength(500);
                entity.Property(e => e.IsActive);
                entity.Property(e => e.CreatedAt);
                entity.Property(e => e.UpdatedAt);
                
                entity.HasIndex(e => e.Code).IsUnique();
                entity.HasIndex(e => e.DatabaseName).IsUnique();
            });

            // Configure User entity (matches actual database schema)
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
                entity.Property(e => e.InstitutionId).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.PasswordResetToken).HasMaxLength(255);
                entity.Property(e => e.PasswordResetTokenExpiry);
                entity.Property(e => e.CreatedAt);
                entity.Property(e => e.UpdatedAt);
                
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.InstitutionId);
                entity.HasIndex(e => e.Role);
            });

            // Configure UserProfile entity (matches actual database schema)
            modelBuilder.Entity<UserProfile>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Address).HasMaxLength(500);
                entity.Property(e => e.ProfilePicture).HasMaxLength(500);
                entity.Property(e => e.Preferences).HasMaxLength(500);
                entity.Property(e => e.CreatedAt);
                entity.Property(e => e.UpdatedAt);
                
                entity.HasIndex(e => e.UserId);
            });

            // Configure InstitutionDetails entity (matches psctech_main.institution_details table)
            modelBuilder.Entity<InstitutionDetails>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.InstitutionId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(20);
                entity.Property(e => e.District).HasMaxLength(100);
                entity.Property(e => e.Province).HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(500);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(255);
                entity.Property(e => e.Website).HasMaxLength(255);
                entity.Property(e => e.LogoUrl).HasMaxLength(500);
                entity.Property(e => e.CreatedAt);
                entity.Property(e => e.UpdatedAt);
                
                entity.HasIndex(e => e.InstitutionId);
                entity.HasIndex(e => e.Code);
            });

            // Configure Learner entity (matches psctech_main.learners table)
            modelBuilder.Entity<Learner>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LearnerNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Grade).HasMaxLength(10);
                entity.Property(e => e.InstitutionId).HasMaxLength(50);
                entity.Property(e => e.IsActive);
                entity.Property(e => e.CreatedAt);
                entity.Property(e => e.UpdatedAt);
                
                entity.HasIndex(e => e.LearnerNumber).IsUnique();
                entity.HasIndex(e => e.InstitutionId);
            });

            // Configure Teacher entity (matches psctech_main.teachers table)
            modelBuilder.Entity<Teacher>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EmployeeNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(100);
                entity.Property(e => e.InstitutionId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IsActive);
                entity.Property(e => e.CreatedAt);
                entity.Property(e => e.UpdatedAt);
                
                entity.HasIndex(e => e.EmployeeNumber).IsUnique();
                entity.HasIndex(e => e.InstitutionId);
            });

            // Configure Voucher entity (matches psctech_main.vouchers table)
            modelBuilder.Entity<Voucher>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CodeHash).IsRequired().HasMaxLength(64);
                entity.Property(e => e.CodeSalt).IsRequired().HasMaxLength(32);
                entity.Property(e => e.Denomination).IsRequired();
                entity.Property(e => e.ParentGuardianName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.LearnerCount).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                entity.Property(e => e.InstitutionId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IssuedByUserId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IssuedDate);
                entity.Property(e => e.RedeemedByUserId).HasMaxLength(50);
                entity.Property(e => e.RedeemedDate);
                entity.Property(e => e.ExpiryDate);
                entity.Property(e => e.IsActive);
                entity.Property(e => e.CreatedAt);
                entity.Property(e => e.UpdatedAt);
                
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.InstitutionId);
                entity.HasIndex(e => e.IssuedByUserId);
                entity.Property(e => e.ExpiryDate);
            });

            // Configure VoucherRedemption entity (matches psctech_main.voucher_redemptions table)
            modelBuilder.Entity<VoucherRedemption>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.VoucherId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.UserId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.RedemptionDate);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                entity.Property(e => e.LearnerCount).IsRequired();
                entity.Property(e => e.ParentGuardianName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.ActivationDate);
                entity.Property(e => e.ExpiryDate);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.CreatedAt);
                
                entity.HasIndex(e => e.VoucherId);
                entity.HasIndex(e => e.UserId);
            });

            // Configure VoucherAudit entity (matches psctech_main.voucher_audits table)
            modelBuilder.Entity<VoucherAudit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.VoucherId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Action).IsRequired().HasMaxLength(50);
                entity.Property(e => e.UserId).HasMaxLength(50);
                entity.Property(e => e.Details).HasMaxLength(500);
                entity.Property(e => e.IpAddress).HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasMaxLength(500);
                entity.Property(e => e.CreatedAt);
                
                entity.HasIndex(e => e.VoucherId);
                entity.HasIndex(e => e.UserId);
            });
        }
    }
}
