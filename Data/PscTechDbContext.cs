using Microsoft.EntityFrameworkCore;
using PscTechBackend.Models;

namespace PscTechBackend.Data
{
    public class PscTechDbContext : DbContext
    {
        public PscTechDbContext(DbContextOptions<PscTechDbContext> options) : base(options)
        {
        }

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
            // Add custom model configuration here if needed, but only for properties that exist in your models.
        }
    }
}
