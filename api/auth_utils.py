from __future__ import annotations

from typing import Optional

from .models import Member, MemberToken


def extract_token_from_header(request) -> Optional[str]:
    """Extract token value from Authorization header in format: 'Token <key>'."""
    auth_header = request.META.get("HTTP_AUTHORIZATION", "").strip()
    if not auth_header:
        return None

    prefix = "Token "
    if not auth_header.startswith(prefix):
        return None

    return auth_header[len(prefix) :].strip() or None


def get_member_from_token(token_key: str) -> Optional[Member]:
    """Resolve token key to a Member instance, or None if invalid."""
    if not token_key:
        return None

    try:
        token = MemberToken.objects.select_related("member").get(key=token_key)
    except MemberToken.DoesNotExist:
        return None

    return token.member
