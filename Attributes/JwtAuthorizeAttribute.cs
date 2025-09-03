using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace PscTechBackend.Attributes
{
    public sealed class JwtAuthorizeAttribute : AuthorizeAttribute
    {
        public JwtAuthorizeAttribute()
        {
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme;
        }

        public JwtAuthorizeAttribute(string policy)
        {
            Policy = policy;
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme;
        }

        public JwtAuthorizeAttribute(string policy, string roles)
        {
            Policy = policy;
            Roles = roles;
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme;
        }
    }
}
