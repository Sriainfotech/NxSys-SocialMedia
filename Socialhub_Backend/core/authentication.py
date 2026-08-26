from django.middleware.csrf import CsrfViewMiddleware
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication

try:
    from drf_spectacular.extensions import OpenApiAuthenticationExtension

    class CookieJWTAuthenticationScheme(OpenApiAuthenticationExtension):
        target_class = "core.authentication.CookieJWTAuthentication"
        name = "cookieAuth"

        def get_security_definition(self, auto_schema):
            return {
                "type": "apiKey",
                "in": "cookie",
                "name": "access_token",
                "description": "JWT access token stored in an HttpOnly cookie (set automatically on login).",
            }
except ImportError:
    pass

_csrf_middleware = CsrfViewMiddleware(get_response=lambda r: None)


class CookieJWTAuthentication(JWTAuthentication):
    """Read the JWT access token from the HttpOnly cookie instead of
    the Authorization header. Falls back to the header so existing
    API clients (e.g. mobile apps) still work.

    When authenticating via cookie, CSRF is enforced on unsafe methods
    (POST, PUT, PATCH, DELETE) — same behaviour as DRF SessionAuthentication.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get("access_token")
        if raw_token is None:
            return super().authenticate(request)
        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception:
            return None

        self._enforce_csrf(request)
        return self.get_user(validated_token), validated_token

    def _enforce_csrf(self, request):
        if request.method in ("GET", "HEAD", "OPTIONS", "TRACE"):
            return
        if _csrf_middleware.process_view(request, None, (), {}) is not None:
            raise PermissionDenied("CSRF token missing or incorrect.")
