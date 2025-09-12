using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace PscTechBackend.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class JwtAuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string[] _roles;

        public JwtAuthorizeAttribute(params string[] roles)
        {
            _roles = roles;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Check if user is authenticated
            var userId = context.HttpContext.Items["UserId"];
            if (userId == null)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Check if user has required role
            if (_roles != null && _roles.Length > 0)
            {
                var userRole = context.HttpContext.Items["UserRole"]?.ToString();
                if (string.IsNullOrEmpty(userRole) || !_roles.Contains(userRole))
                {
                    context.Result = new ForbidResult();
                    return;
                }
            }
        }
    }
}









