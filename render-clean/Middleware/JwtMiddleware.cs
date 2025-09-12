using Microsoft.AspNetCore.Http;

namespace PscTechBackend.Middleware
{
    public sealed class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        public JwtMiddleware(RequestDelegate next) { _next = next; }
        public Task InvokeAsync(HttpContext context) => _next(context);
    }
}
