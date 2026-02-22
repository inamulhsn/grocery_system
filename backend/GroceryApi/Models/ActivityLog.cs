using System;
using System.ComponentModel.DataAnnotations;

namespace GroceryApi.Models
{
    public class ActivityLog
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Action { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
        /// <summary>Entity type for revert: Product, Sale, User, SystemSettings.</summary>
        public string EntityType { get; set; }
        /// <summary>Id of the entity (for create/update/delete lookup).</summary>
        public string EntityId { get; set; }
        /// <summary>JSON snapshot to restore (e.g. deleted product or previous settings).</summary>
        public string RevertPayload { get; set; }
        /// <summary>When set, this log was reverted (action undone); keep record but do not allow revert again.</summary>
        public DateTime? RevertedAt { get; set; }
    }
}