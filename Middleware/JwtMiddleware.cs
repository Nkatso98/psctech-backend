namespace PscTechBackend.Middleware
{
    public sealed class JwtMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // If you had token validation logic, place it here.
            await _next(context);
        }
    }
}
