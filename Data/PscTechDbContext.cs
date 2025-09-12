using Microsoft.EntityFrameworkCore;
using PscTechBackend.Models;

namespace PscTechBackend.Data
{
    public class PscTechDbContext : DbContext
    {
        public PscTechDbContext(DbContextOptions<PscTechDbContext> options) : base(options) { }

        public DbSet<Institution> Institutions => Set<Institution>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
        public DbSet<InstitutionDetails> InstitutionDetails => Set<InstitutionDetails>();
        public DbSet<Learner> Learners => Set<Learner>();
        public DbSet<Teacher> Teachers => Set<Teacher>();
        public DbSet<Voucher> Vouchers => Set<Voucher>();
        public DbSet<VoucherRedemption> VoucherRedemptions => Set<VoucherRedemption>();
        public DbSet<VoucherAudit> VoucherAudits => Set<VoucherAudit>();
        public DbSet<StudyResult> StudyResults => Set<StudyResult>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ---------- Institution ----------
            modelBuilder.Entity<Institution>(e =>
            {
                e.ToTable("Institutions");
                e.HasKey(i => i.Id);

                e.Property(i => i.Name).IsRequired().HasMaxLength(255);
                e.Property(i => i.Code).IsRequired().HasMaxLength(50);
                e.HasIndex(i => i.Code).IsUnique();

                e.Property(i => i.Email).HasMaxLength(255);
                e.Property(i => i.Phone).HasMaxLength(20);
                e.Property(i => i.Address).HasMaxLength(500);

                e.Property(i => i.IsActive).HasDefaultValue(true);
                e.Property(i => i.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                e.Property(i => i.UpdatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // ---------- User ----------
            modelBuilder.Entity<User>(e =>
            {
                e.ToTable("Users");
                e.HasKey(u => u.Id);

                e.Property(u => u.Username).IsRequired().HasMaxLength(100);
                e.Property(u => u.Email).IsRequired().HasMaxLength(255);
                e.HasIndex(u => u.Email).IsUnique();
                e.HasIndex(u => u.Username).IsUnique();

                e.Property(u => u.PasswordHash).IsRequired();
                e.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
                e.Property(u => u.LastName).IsRequired().HasMaxLength(100);
                e.Property(u => u.Role).IsRequired().HasMaxLength(50);

                e.HasOne<Institution>()
                 .WithMany()
                 .HasForeignKey(u => u.InstitutionId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.Property(u => u.IsActive).HasDefaultValue(true);
                e.Property(u => u.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                e.Property(u => u.UpdatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // ---------- UserProfile ----------
            modelBuilder.Entity<UserProfile>(e =>
            {
                e.ToTable("UserProfiles");
                e.HasKey(p => p.Id);

                e.HasOne<User>()
                 .WithMany()
                 .HasForeignKey(p => p.UserId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.Property(p => p.FirstName).HasMaxLength(100);
                e.Property(p => p.LastName).HasMaxLength(100);
                e.Property(p => p.Phone).HasMaxLength(20);
                e.Property(p => p.Address).HasMaxLength(500);

                e.Property(p => p.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                e.Property(p => p.UpdatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // ---------- InstitutionDetails ----------
            modelBuilder.Entity<InstitutionDetails>(e =>
            {
                e.ToTable("InstitutionDetails");
                e.HasKey(d => d.Id);

                e.HasOne<Institution>()
                 .WithMany()
                 .HasForeignKey(d => d.InstitutionId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.Property(d => d.DatabaseName).HasMaxLength(128);
                e.Property(d => d.ServerName).HasMaxLength(128);

                e.Property(d => d.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                e.Property(d => d.UpdatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // ---------- Learner ----------
            modelBuilder.Entity<Learner>(e =>
            {
                e.ToTable("Learners");
                e.HasKey(l => l.Id);

                e.Property(l => l.FirstName).IsRequired().HasMaxLength(100);
                e.Property(l => l.LastName).IsRequired().HasMaxLength(100);
                e.Property(l => l.Grade).HasMaxLength(10);

                e.HasOne<Institution>()
                 .WithMany()
                 .HasForeignKey(l => l.InstitutionId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.Property(l => l.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                e.Property(l => l.UpdatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // ---------- Teacher ----------
            modelBuilder.Entity<Teacher>(e =>
            {
                e.ToTable("Teachers");
                e.HasKey(t => t.Id);

                e.Property(t => t.FirstName).IsRequired().HasMaxLength(100);
                e.Property(t => t.LastName).IsRequired().HasMaxLength(100);

                e.HasOne<Institution>()
                 .WithMany()
                 .HasForeignKey(t => t.InstitutionId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.Property(t => t.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                e.Property(t => t.UpdatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // ---------- Voucher ----------
            modelBuilder.Entity<Voucher>(e =>
            {
                e.ToTable("Vouchers");
                e.HasKey(v => v.Id);

                e.Property(v => v.VoucherCode).IsRequired().HasMaxLength(32);
                e.HasIndex(v => v.VoucherCode).IsUnique();

                e.Property(v => v.Currency).IsRequired().HasMaxLength(10);
                e.Property(v => v.Status).IsRequired().HasMaxLength(20);
                e.Property(v => v.ParentGuardianName).HasMaxLength(200);

                e.HasOne<Institution>().WithMany().HasForeignKey(v => v.InstitutionId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>().WithMany().HasForeignKey(v => v.IssuedByUserId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne<User>().WithMany().HasForeignKey(v => v.RedeemedByUserId).OnDelete(DeleteBehavior.Restrict);

                e.Property(v => v.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                e.Property(v => v.UpdatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // ---------- VoucherRedemption ----------
            modelBuilder.Entity<VoucherRedemption>(e =>
            {
                e.ToTable("VoucherRedemptions");
                e.HasKey(r => r.Id);

                e.HasOne<Voucher>().WithMany().HasForeignKey(r => r.VoucherId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne<User>().WithMany().HasForeignKey(r => r.RedeemedByUserId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne<Institution>().WithMany().HasForeignKey(r => r.InstitutionId).OnDelete(DeleteBehavior.Restrict);

                e.Property(r => r.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // ---------- VoucherAudit ----------
            modelBuilder.Entity<VoucherAudit>(e =>
            {
                e.ToTable("VoucherAudits");
                e.HasKey(a => a.Id);

                e.HasOne<Voucher>().WithMany().HasForeignKey(a => a.VoucherId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne<User>().WithMany().HasForeignKey(a => a.PerformedByUserId).OnDelete(DeleteBehavior.Restrict);

                e.Property(a => a.Action).IsRequired().HasMaxLength(50);
                e.Property(a => a.MetadataJson).HasColumnType("text");

                e.Property(a => a.PerformedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // ---------- StudyResult ----------
            modelBuilder.Entity<StudyResult>(e =>
            {
                e.ToTable("StudyResults");
                e.HasKey(s => s.Id);

                e.Property(s => s.Subject).IsRequired().HasMaxLength(100);
                e.Property(s => s.Grade).HasMaxLength(10);

                e.Property(s => s.Answers).HasColumnType("text");
                e.Property(s => s.Recommendations).HasColumnType("text");
                e.Property(s => s.WeakAreas).HasColumnType("text");

                e.HasOne<User>().WithMany().HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);

                e.Property(s => s.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                e.Property(s => s.UpdatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });
        }
    }
}
