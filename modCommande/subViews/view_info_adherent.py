import os
from pathlib import Path
import re
import shutil
from django.db import transaction
from django.urls import reverse
from PrintCard import settings
from modCommande.errors import ErrorsHelpers, OperationsHelpers
from modCommande.subForms.form_info_carte import InfoCarteForm
from modCommande.subModels.model_adherent import InfoCarte
from modCommande.templates import adherentTemplate
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from django.http import HttpResponse, JsonResponse
from django.db.models import Q
from django.core.paginator import Paginator
from datetime import datetime
from django.utils import timezone
import pandas as pd
from django.template.loader import get_template
from django.utils.dateformat import format as date_format
import logging

logger = logging.getLogger(__name__)  # Get a logger for this module


def creer_infocarte(request):
    if request.method == "POST":
        form = InfoCarteForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            data = {
                "form_is_valid": True,
                "messages": f"La carte a été créée avec succès.",
                "url_redirect": reverse("adherent_list"),
            }
            return JsonResponse(data)
        else:
            # Form is invalid, errors will be passed to the template
            messages.error(
                request,
                "Des erreurs sont présentes dans le formulaire. Veuillez les corriger.",
            )
    else:
        form = InfoCarteForm()

    return render(request, adherentTemplate.create, {"form": form})


def adherent_list(request):
    request.session["url_list"] = request.get_full_path()

    return render(request, adherentTemplate.liste)


def get_list_by_criteria(request):
    # Récupération de toutes les cartes
    lst = InfoCarte.objects.all().order_by("id")

    # Récupération des paramètres de filtrage
    date_debut = request.GET.get("date_debut")
    date_fin = request.GET.get("date_fin")
    nom_adherent = request.GET.get("nom")
    numero_carte = request.GET.get("numero_carte")

    # Filtrage par nom d'adhérent (nom ou prénom)
    if nom_adherent:
        lst = lst.filter(
            Q(nom__icontains=nom_adherent) | Q(prenom__icontains=nom_adherent)
        )
    if numero_carte:
        lst = lst.filter(Q(numero_carte=numero_carte))
    # Filtrage par date
    if date_debut and date_fin:
        try:
            # Validation et conversion des dates
            date_debut = datetime.strptime(date_debut, "%Y-%m-%d")
            date_fin = datetime.strptime(date_fin, "%Y-%m-%d")
            lst = lst.filter(created_at__date__range=[date_debut, date_fin])
        except ValueError:
            return JsonResponse(
                {
                    "error": "Les dates fournies ne sont pas valides.",
                    "details": "Le format attendu est YYYY-MM-DD.",
                },
                status=400,
            )

    return lst


def get_context(request):
    # Récupérer la liste filtrée avec pagination
    lst = get_list_by_criteria(request)

    # Pagination
    page_number = request.GET.get("page", 1)
    paginator = Paginator(lst, 15)  # Ajustez le nombre d'éléments par page
    page_obj = paginator.get_page(page_number)

    def safe_date(dt, fmt="Y/m/d"):
        """Renvoie la date formatée ou une chaîne vide si la date est None."""
        return date_format(dt, fmt) if dt else ""

    # Préparation des données pour la réponse JSON
    data = {
        "lst": [
            {
                "id": liste.id,
                "photo_file": (liste.photo_file.url if liste.photo_file else None),
                "client_nom": liste.client_nom,
                "genre": liste.get_genre_display(),  # Utilisation de `get_<field>_display()` pour récupérer l'affichage du choix
                "impressions_count": liste.impressions_count,
                "membre": liste.get_membre_display(),
                "numero_police": liste.numero_police,
                "statut_impression": liste.statut_impression,
                "patient_contribution": liste.patient_contribution,
                "ticket_moderateur": liste.ticket_moderateur,
                "numero_carte": liste.numero_carte,
                "prenom": liste.prenom,
                "date_naissance": liste.date_naissance,
                "validite": f"{liste.validite_debut.strftime('%d/%m/%Y')}-{liste.validite_fin.strftime('%d/%m/%Y')}",
                "date_commande": liste.created_at.strftime("%d/%m/%Y à %H:%M:%S"),
                "created_at": liste.created_at.strftime("%d/%m/%Y à %H:%M:%S"),
                "created_at_formatted": liste.created_at.strftime("%Y-%m-%d"),
                "nom_complet": f"{liste.nom} {liste.prenom}",
            }
            for liste in page_obj
        ],
        "num_pages": paginator.num_pages,
        "current_page": page_obj.number,
    }
    return data


def infocarte_list_data(request):
    data = get_context(request)
    return JsonResponse(data, safe=False)


@csrf_exempt
def upload_excel_adherent(request):
    if request.method == "POST" and request.FILES.get("fichier_excel"):
        fichier = request.FILES["fichier_excel"]

        try:
            df = pd.read_excel(fichier)
            # Vérifier que les colonnes nécessaires existent
            required_columns = [
                "nom",
                "prenom",
                "date_naissance",
                "numero_carte",
                "numero_police",
            ]
            missing_cols = [col for col in required_columns if col not in df.columns]

            if missing_cols:
                return JsonResponse(
                    {
                        "success": False,
                        "message": f"Colonnes manquantes dans le fichier: {', '.join(missing_cols)}",
                    },
                    status=400,
                )
            erreurs = []
            lignes_valides = []
            photo_base_dir = settings.BASE_DIR
            media_photo_dir = (
                Path(settings.MEDIA_ROOT) / "photo"
            )  # Chemin de destination

            # Créer le répertoire de destination s'il n'existe pas
            media_photo_dir.mkdir(parents=True, exist_ok=True)
            # Vérifier les numéros de carte existants en une seule requête
            numeros_existants = set(
                InfoCarte.objects.values_list("numero_carte", flat=True)
            )

            def format_date(cell):
                if pd.isna(cell):
                    return None
                try:
                    dt = pd.to_datetime(cell, dayfirst=True, errors="raise")
                    if dt.month < 1 or dt.month > 12 or dt.day < 1 or dt.day > 31:
                        return None
                    return dt.strftime("%Y-%m-%d")
                except Exception:
                    return None

            def safe_get(row, column, default=""):
                """Récupère une valeur de ligne en toute sécurité"""
                try:
                    val = row[column] if column in row else default
                    return val if not pd.isna(val) else default
                except Exception:
                    return default

            # Phase 1 : validation
            for index, row in df.iterrows():
                try:
                    row_dict = row.to_dict()
                    numero_carte = str(safe_get(row_dict, "numero_carte", "")).strip()
                    # Vérifier l'unicité du numéro de carte
                    if numero_carte in numeros_existants:
                        erreurs.append(
                            f"Numéro de carte déjà existant: {numero_carte} (ligne {index + 2})"
                        )
                        continue

                    numeros_existants.add(
                        numero_carte
                    )  # Ajouter à l'ensemble pour éviter les doublons dans le fichier

                    # Validation des champs obligatoires
                    nom = str(safe_get(row_dict, "nom", "")).strip()
                    if not nom:
                        erreurs.append(f"Nom manquant à la ligne {index + 2}")
                        continue

                    prenom = str(safe_get(row_dict, "prenom", "")).strip()
                    if not numero_carte:
                        erreurs.append(
                            f"Numéro de carte manquant pour '{nom}' (ligne {index + 2})"
                        )
                        continue

                    numero_police = safe_get(row_dict, "numero_police", 0)
                    try:
                        numero_police = str(int(float(numero_police)))
                    except (ValueError, TypeError):
                        erreurs.append(
                            f"Numéro de police invalide pour '{nom}' (ligne {index + 2})"
                        )
                        continue

                    date_naissance = format_date(safe_get(row_dict, "date_naissance"))
                    if date_naissance is None:
                        erreurs.append(
                            f"Date de naissance invalide pour '{nom}' (ligne {index + 2})"
                        )
                        continue

                    validite_debut = format_date(safe_get(row_dict, "validite_debut"))
                    validite_fin = format_date(safe_get(row_dict, "validite_fin"))
                    # Gestion de la photo
                    photo_path = str(safe_get(row_dict, "photo_file", "")).strip()
                    new_photo_path = ""
                    if photo_path and str(photo_path).strip():
                        photo_path = str(photo_path).strip()
                        # Construire le chemin complet source
                        try:
                            source_path = Path(photo_path)
                            if not source_path.is_absolute():
                                source_path = photo_base_dir / source_path.name

                            if source_path.exists():
                                filename = os.path.basename(photo_path)
                                new_photo_path = f"photo/{filename}"
                                destination_path = media_photo_dir / filename

                                try:
                                    shutil.copy2(
                                        str(source_path), str(destination_path)
                                    )
                                except Exception as e:
                                    erreurs.append(
                                        f"Erreur copie photo {nom}: {str(e)}"
                                    )
                                    new_photo_path = ""
                            else:
                                erreurs.append(
                                    f"Photo introuvable pour {nom}: {source_path}"
                                )
                                new_photo_path = ""
                        except Exception as e:
                            erreurs.append(f"Erreur traitement photo {nom}: {str(e)}")
                            new_photo_path = ""

                    # Préparation des données pour l'import
                    validated_data = {
                        "nom": nom,
                        "prenom": prenom,
                        "date_naissance": date_naissance,
                        "genre": int(safe_get(row_dict, "genre", 0)),
                        "membre": int(safe_get(row_dict, "membre", 0)),
                        "client_nom": str(safe_get(row_dict, "client_nom", "")).strip(),
                        "numero_carte": numero_carte,
                        "numero_police": numero_police,
                        "validite_debut": validite_debut,
                        "validite_fin": validite_fin,
                        "categorie": int(safe_get(row_dict, "categorie", 1)),
                        "photo_file": new_photo_path,
                        "ticket_moderateur": re.sub(
                            r"([a-zàâäéèêëîïôöûüç])([A-Z])",
                            r"\1\n  \2",
                            str(safe_get(row_dict, "ticket_moderateur", ""))
                            .replace("\r\n", "\n")
                            .replace("\r", "\n"),
                        ),
                        "patient_contribution": str(
                            safe_get(row_dict, "patient_contribution", "")
                        )
                        .replace(", ", "\n")
                        .replace("; ", "\n"),
                    }

                    lignes_valides.append(validated_data)

                except Exception as e:
                    erreurs.append(
                        f"Erreur de validation à la ligne {index + 2}: {str(e)}"
                    )
                    continue

            if erreurs:
                return JsonResponse(
                    {
                        "success": False,
                        "message": f"{len(erreurs)} erreurs détectées lors de la validation.",
                        "erreurs": erreurs[
                            :10
                        ],  # Limite à 10 erreurs pour éviter une réponse trop longue
                    },
                    status=400,
                )

            # Phase 2 : enregistrement (transactionnel)
            with transaction.atomic():
                lignes_importees = 0
                for data in lignes_valides:
                    InfoCarte.objects.create(**data)
                    lignes_importees += 1

            return JsonResponse(
                {
                    "success": True,
                    "message": f"{lignes_importees} lignes importées avec succès.",
                    "lignes_erreurs": len(erreurs),
                    "redirect_url": "/commandes/list/adherent/",
                }
            )

        except Exception as e:
            return JsonResponse(
                {
                    "success": False,
                    "message": f"Erreur lors de l'import : {str(e)}",
                },
                status=500,
            )

    return JsonResponse(
        {"success": False, "message": "Aucun fichier fourni ou méthode non autorisée."},
        status=400,
    )


def printcard_pdf(request, pk):
    try:
        infocarte = get_object_or_404(InfoCarte, pk=pk)
        if infocarte.categorie == 1:
            bg_filename = "cartejaune.png"
        elif infocarte.categorie == 2:
            bg_filename = "carteverte.png"
        else:
            bg_filename = "default_bg.png"
        bg_img_path = os.path.join(
            settings.STATIC_ROOT, "assets", "img", "bg_img", bg_filename
        )

        # S'assurer que le chemin est accessible pour WeasyPrint
        if not os.path.exists(bg_img_path):
            # Essayer le chemin de développement
            bg_img_path = os.path.join(
                settings.BASE_DIR, "static", "assets", "img", "bg_img", bg_filename
            )
        context = {
            "infocarte": infocarte,
            "bg_img": f"file://{bg_img_path}",
        }
        # Charger le modèle HTML
        template = get_template("template_adherent/carte.html")
        html = template.render(context)

        # Conversion en PDF
        response = HttpResponse(content_type="application/pdf")
        timestamp = timezone.now().strftime("%Y%m%d-%H%M%S")
        filename = f"carte-{infocarte.numero_carte}-{timestamp}.pdf"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        # Utiliser WeasyPrint (alternative plus fiable à xhtml2pdf)
        from weasyprint import HTML

        HTML(string=html, base_url=request.build_absolute_uri("/")).write_pdf(response)

        # Incrémenter le compteur d'impressions
        infocarte.increment_impressions()
        if infocarte.statut_impression == InfoCarte.STATUT_NON_IMPRIME:
            infocarte.statut_impression = InfoCarte.STATUT_IMPRIME
            infocarte.save(update_fields=["statut_impression", "impressions_count"])
        else:
            infocarte.save(update_fields=["impressions_count"])

        return response

    except Exception as e:
        logger.exception(f"Erreur lors de la génération du PDF: {str(e)}")
        return HttpResponse("Erreur lors de la génération du PDF", status=500)
