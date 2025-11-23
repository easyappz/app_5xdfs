from __future__ import annotations

import secrets

from django.db import models


def generate_token_key() -> str:
    """Generate a secure random token key."""
    return secrets.token_hex(20)


class Member(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return self.username


class ChatMessage(models.Model):
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        content_preview = self.content
        if len(content_preview) > 50:
            content_preview = f"{content_preview[:47]}..."
        return f"{self.member.username}: {content_preview}"


class MemberToken(models.Model):
    key = models.CharField(max_length=40, unique=True)
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="tokens",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Token for {self.member.username}"

    def save(self, *args, **kwargs):  # type: ignore[override]
        if not self.key:
            self.key = generate_token_key()
        return super().save(*args, **kwargs)
