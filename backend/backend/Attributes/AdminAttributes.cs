using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AdminAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var isAdmin = user.FindFirst("IsAdmin")?.Value;
            if (isAdmin != "true")
            {
                context.Result = new ObjectResult("Forbidden")
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }
    }
}