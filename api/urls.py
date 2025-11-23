from django.urls import path

from .views import (
    ChatMessageListCreateView,
    HelloView,
    LoginView,
    MeView,
    RegisterView,
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("chat/messages/", ChatMessageListCreateView.as_view(), name="chat-messages"),
]
