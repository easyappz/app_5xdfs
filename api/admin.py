from django.contrib import admin

from .models import ChatMessage, Member, MemberToken


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "created_at")
    search_fields = ("username",)
    ordering = ("id",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "member", "short_content", "created_at")
    list_select_related = ("member",)
    search_fields = ("content", "member__username")
    ordering = ("created_at",)

    def short_content(self, obj):
        content = obj.content
        if len(content) > 50:
            return f"{content[:47]}..."
        return content

    short_content.short_description = "content"


@admin.register(MemberToken)
class MemberTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "member", "key", "created_at")
    list_select_related = ("member",)
    search_fields = ("key", "member__username")
    ordering = ("-created_at",)
