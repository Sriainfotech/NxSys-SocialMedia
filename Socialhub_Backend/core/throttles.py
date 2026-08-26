from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Max 10 login attempts per minute per IP."""
    scope = "login"


class RegisterRateThrottle(AnonRateThrottle):
    """Max 5 registrations per hour per IP."""
    scope = "register"


class TokenRefreshRateThrottle(AnonRateThrottle):
    """Max 30 refresh calls per minute per IP."""
    scope = "token_refresh"


class SocialConnectRateThrottle(UserRateThrottle):
    """Max 20 OAuth connect starts per hour per user."""
    scope = "social_connect"


class PostCreateRateThrottle(UserRateThrottle):
    """Max 50 post-create requests per hour per user."""
    scope = "post_create"


class PasswordResetRateThrottle(AnonRateThrottle):
    """Max 5 password-reset requests per hour per IP."""
    scope = "password_reset"
