using System;

namespace PscTechBackend.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
    }
}
