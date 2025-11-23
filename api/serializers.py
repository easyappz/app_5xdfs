from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from .models import ChatMessage, Member


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ("id", "username", "created_at")
        read_only_fields = ("id", "username", "created_at")


class MemberRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, max_length=128)

    class Meta:
        model = Member
        fields = ("username", "password")

    def validate_username(self, value):
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Пользователь с таким именем уже существует.",
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        hashed_password = make_password(password)
        member = Member.objects.create(password=hashed_password, **validated_data)
        return member


class ChatMessageSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ("id", "content", "created_at", "member")
        read_only_fields = ("id", "created_at", "member")
