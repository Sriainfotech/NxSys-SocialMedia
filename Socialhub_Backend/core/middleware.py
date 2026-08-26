import uuid

from django.conf import settings


class SecurityHeadersMiddleware:
    """Attach security headers to every response."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        response.setdefault("X-Content-Type-Options", "nosniff")
        response.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.setdefault(
            "Permissions-Policy",
            "geolocation=(), camera=(), microphone=(), payment=()",
        )
        response.setdefault(
            "Content-Security-Policy",
            (
                "default-src 'none'; "
                "script-src 'none'; "
                "object-src 'none'; "
                "frame-ancestors 'none';"
            ),
        )
        response.setdefault("X-Frame-Options", "DENY")

        return response


class RequestIDMiddleware:
    """Attach a UUID request-id to every request and echo it in the response.

    Downstream services / log lines can correlate a full request chain using
    this header.  If the client sends ``X-Request-ID`` we use that value;
    otherwise we generate a fresh UUID4.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = (
            request.META.get("HTTP_X_REQUEST_ID")
            or str(uuid.uuid4())
        )
        request.request_id = request_id

        response = self.get_response(request)
        response["X-Request-ID"] = request_id
        return response
