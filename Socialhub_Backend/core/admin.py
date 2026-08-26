from django.contrib import admin
from django.utils.html import format_html
from .models import Post, SocialAccount, OAuthState, PostingSchedule


def _masked(value, visible=4):
    """Show only the last `visible` chars of a sensitive string."""
    if not value:
        return "—"
    hidden = max(0, len(value) - visible)
    return format_html('<span title="sensitive">{}…{}</span>', "•" * min(hidden, 8), value[-visible:])


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display = (
        "id", "user", "platform", "account_label",
        "platform_username", "account_id", "expires_at", "created_at",
    )
    search_fields = ("user__username", "user__email", "account_id", "platform_username", "account_label")
    list_filter = ("platform", "created_at")
    ordering = ("-created_at",)

    # Raw tokens excluded from the change form — update via API only.
    exclude = ("access_token", "refresh_token")
    readonly_fields = (
        "masked_access_token", "masked_refresh_token",
        "created_at", "updated_at",
    )

    fieldsets = (
        (None, {
            "fields": ("user", "platform", "account_type", "account_label",
                       "platform_username", "account_id"),
        }),
        ("Tokens (read-only preview)", {
            "classes": ("collapse",),
            "fields": ("masked_access_token", "masked_refresh_token", "expires_at"),
        }),
        ("Metadata", {
            "classes": ("collapse",),
            "fields": ("metadata",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )

    @admin.display(description="Access token")
    def masked_access_token(self, obj):
        return _masked(obj.access_token)

    @admin.display(description="Refresh token")
    def masked_refresh_token(self, obj):
        return _masked(obj.refresh_token)


@admin.register(OAuthState)
class OAuthStateAdmin(admin.ModelAdmin):
    list_display = ("id", "platform", "user", "state", "expires_at", "used_at", "created_at")
    search_fields = ("user__username", "state")
    list_filter = ("platform", "used_at")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "id", "user", "status", "scheduled_time",
        "get_target_accounts_count", "published_at", "created_at",
    )
    search_fields = ("user__username", "content", "celery_task_id")
    list_filter = ("status", "created_at", "published_at")
    ordering = ("-created_at",)
    readonly_fields = (
        "created_at", "updated_at", "platform_results",
        "celery_task_id", "deleted_at",
    )

    def get_queryset(self, request):
        # Show soft-deleted posts in admin using the unfiltered manager
        return Post.all_objects.all()

    @admin.display(description="Accounts")
    def get_target_accounts_count(self, obj):
        return len(obj.target_accounts) if obj.target_accounts else 0


@admin.register(PostingSchedule)
class PostingScheduleAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "get_day_of_week_display", "time")
    list_filter = ("day_of_week", "user")
    search_fields = ("user__username",)
    ordering = ("user", "day_of_week", "time")
