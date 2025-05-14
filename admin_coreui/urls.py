from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    # Authentication
    path("accounts/login/", views.UserLoginView.as_view(), name="login"),
    path("accounts/register/", views.UserRegistrationView.as_view(), name="register"),
    path(
        "accounts/password-change/",
        views.UserPasswordChangeView.as_view(),
        name="password_change",
    ),
    path(
        "accounts/password-change-done/",
        auth_views.PasswordChangeDoneView.as_view(
            template_name="accounts/password-change-done.html"
        ),
        name="password_change_done",
    ),
    path(
        "accounts/password-reset/",
        views.UserPasswordResetView.as_view(),
        name="password_reset",
    ),
    path(
        "accounts/password-reset-confirm/<uidb64>/<token>/",
        views.UserPasswrodResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path("accounts/login/", views.UserLoginView.as_view(), name="login"),
    path("accounts/register/", views.UserRegistrationView.as_view(), name="register"),
    path(
        "accounts/password-change/",
        views.UserPasswordChangeView.as_view(),
        name="password_change",
    ),
    path(
        "accounts/password-change-done/",
        auth_views.PasswordChangeDoneView.as_view(
            template_name="accounts/password-change-done.html"
        ),
        name="password_change_done",
    ),
    path(
        "accounts/password-reset/",
        views.UserPasswordResetView.as_view(),
        name="password_reset",
    ),
    path(
        "accounts/password-reset-confirm/<uidb64>/<token>/",
        views.UserPasswrodResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path(
        "accounts/password-reset-done/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="accounts/password-reset-done.html"
        ),
        name="password_reset_done",
    ),
    path(
        "accounts/password-reset-complete/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="accounts/password-reset-complete.html"
        ),
        name="password_reset_complete",
    ),
    path("logout/", views.logout_view, name="logout"),
    path(
        "accounts/password-reset-done/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="accounts/password-reset-done.html"
        ),
        name="password_reset_done",
    ),
    path(
        "accounts/password-reset-complete/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="accounts/password-reset-complete.html"
        ),
        name="password_reset_complete",
    ),
    path("logout/", views.logout_view, name="logout"),
]
