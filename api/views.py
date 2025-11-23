from django.contrib.auth.hashers import check_password
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth_utils import extract_token_from_header, get_member_from_token
from .models import ChatMessage, Member, MemberToken
from .serializers import (
    ChatMessageSerializer,
    MemberRegisterSerializer,
    MemberSerializer,
    MessageSerializer,
)


class HelloView(APIView):
    """A simple API endpoint that returns a greeting message."""

    @extend_schema(
        responses={200: MessageSerializer},
        description="Get a hello world message",
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    """Register a new member and return auth token."""

    def post(self, request):
        serializer = MemberRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        member = serializer.save()
        token, _ = MemberToken.objects.get_or_create(member=member)

        response_data = {
            "token": token.key,
            "member": MemberSerializer(member).data,
        }
        return Response(response_data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Login existing member and return auth token."""

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Необходимо указать имя пользователя и пароль."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = Member.objects.get(username=username)
        except Member.DoesNotExist:
            return Response(
                {"detail": "Неверное имя пользователя или пароль."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not check_password(password, member.password):
            return Response(
                {"detail": "Неверное имя пользователя или пароль."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = MemberToken.objects.get_or_create(member=member)

        response_data = {
            "token": token.key,
            "member": MemberSerializer(member).data,
        }
        return Response(response_data, status=status.HTTP_200_OK)


class MeView(APIView):
    """Return current authenticated member based on token."""

    def get(self, request):
        token_key = extract_token_from_header(request)
        member = get_member_from_token(token_key) if token_key else None

        if member is None:
            return Response(
                {"detail": "Токен авторизации отсутствует или недействителен."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChatMessageListCreateView(APIView):
    """List and create group chat messages (authentication required)."""

    def _get_authenticated_member(self, request):
        token_key = extract_token_from_header(request)
        member = get_member_from_token(token_key) if token_key else None
        if member is None:
            return None
        return member

    def get(self, request):
        """Return up to 50 latest chat messages ordered by creation time."""
        member = self._get_authenticated_member(request)
        if member is None:
            return Response(
                {"detail": "Токен авторизации отсутствует или недействителен."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Return up to 50 latest messages, newest last for natural reading order.
        messages_qs = (
            ChatMessage.objects.select_related("member")
            .order_by("created_at")
        )
        messages_qs = messages_qs[max(messages_qs.count() - 50, 0) :]

        serializer = ChatMessageSerializer(messages_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        member = self._get_authenticated_member(request)
        if member is None:
            return Response(
                {"detail": "Токен авторизации отсутствует или недействителен."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = ChatMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        message = ChatMessage.objects.create(
            member=member,
            content=serializer.validated_data["content"],
        )
        response_serializer = ChatMessageSerializer(message)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
