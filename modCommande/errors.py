from django.http import JsonResponse
from django.template.loader import render_to_string

from modCommande.subModels.model_adherent import InfoCarte
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone


class ErrorsHelpers:
    @staticmethod
    def show(request, form):
        """Affiche les erreurs de formulaire."""
        context = {"form": form}
        return ErrorsHelpers._json_response("layouts/error.html", context, request)

    @staticmethod
    def show_message(request, message):
        """Affiche un message d'erreur personnalisé."""
        context = {"message": message}
        url_redirect = request.session.get("url_list")
        return ErrorsHelpers._json_response(
            "layouts/error_message.html",
            context,
            request,
            url_redirect=url_redirect,
            error=message,
        )

    @staticmethod
    def _json_response(template, context, request, url_redirect=None, error=False):
        """Génère un JsonResponse basé sur le template et le contexte fournis."""
        data = {
            "html_form": render_to_string(template, context, request=request),
            "error": error,
            "message": context.get("message", ""),
        }
        if url_redirect:
            data["url_redirect"] = url_redirect
        return JsonResponse(data)


class OperationsHelpers:
    def execute_action(request, action, form):
        """
        Setting the user on create validate
        """
        # try:
        # with transaction.atomic():
        obj = form.save(commit=False)
        user = User.objects.get(pk=request.user.id) 

        if action == "create":
            if not isinstance(obj, InfoCarte):
                obj.created_by = user

        obj.save()

        # except IntegrityError as e:
        #     return str(e)

        return None
