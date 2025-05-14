from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.views import (
    LoginView,
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetView,
)
from django.shortcuts import redirect, render
from django.views.generic import CreateView

from admin_coreui.forms import (
    LoginForm,
    RegistrationForm,
    UserPasswordChangeForm,
    UserPasswordResetForm,
    UserSetPasswordForm,
)


@login_required(login_url="login")
def index(request):
    segments = None
    template = "index.html"
    return render(request, template, {"segments": segments})


# auth
class UserRegistrationView(CreateView):
    template_name = "accounts/register.html"
    form_class = RegistrationForm
    success_url = "/accounts/login/"


class UserLoginView(LoginView):
    template_name = "accounts/login.html"
    form_class = LoginForm


class UserPasswordResetView(PasswordResetView):
    template_name = "accounts/password-reset.html"
    form_class = UserPasswordResetForm


class UserPasswrodResetConfirmView(PasswordResetConfirmView):
    template_name = "accounts/password-reset-confirm.html"
    form_class = UserSetPasswordForm


class UserPasswordChangeView(PasswordChangeView):
    template_name = "accounts/change-password.html"
    form_class = UserPasswordChangeForm


def logout_view(request):
    logout(request)
    return redirect("/accounts/login/")


def custom_404(request, exception):
    return render(request, "404.html", status=404)


def custom_500(request, exception):
    return render(request, "500.html", status=500)
