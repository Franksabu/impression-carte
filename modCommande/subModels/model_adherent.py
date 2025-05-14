from django.utils import timezone
from django.db import models
from modCommande.paths import PathsHelpers


def path_photo(instance, filename):
    return PathsHelpers.path_and_rename(instance, filename, PathsHelpers.PHOTO_FOLDER)


class InfoCarte(models.Model):
    # Constantes pour les catégories
    CATEGORIE_1 = 1
    CATEGORIE_2 = 2
    CHOIX_CATEGORIE = [
        (CATEGORIE_1, "Première catégorie"),
        (CATEGORIE_2, "Deuxième catégorie"),
    ]

    # Constantes pour le sexe
    SEXE_FEMININ = 0
    SEXE_MASCULIN = 1
    CHOIX_SEXE = [
        (SEXE_FEMININ, "Féminin"),
        (SEXE_MASCULIN, "Masculin"),
    ]

    # Constantes pour le type de membre
    MEMBRE_PRINCIPAL = 0
    MEMBRE_FEMME = 1
    MEMBRE_ENFANT = 2
    MEMBRE_MARI = 3
    CHOIX_MEMBRE = [
        (MEMBRE_PRINCIPAL, "Principal"),
        (MEMBRE_FEMME, "Femme"),
        (MEMBRE_ENFANT, "Enfant"),
        (MEMBRE_MARI, "Mari"),
    ]

    # Statut d'impression
    STATUT_NON_IMPRIME = "non_imprimé"
    STATUT_IMPRIME = "imprimé"
    STATUT_IMPRESSION_CHOICES = [
        (STATUT_NON_IMPRIME, "Non Imprimé"),
        (STATUT_IMPRIME, "Imprimé"),
    ]

    statut_impression = models.CharField(
        max_length=20, choices=STATUT_IMPRESSION_CHOICES, default=STATUT_NON_IMPRIME
    )
    impressions_count = models.PositiveIntegerField(default=0, null=True, blank=True)

    client_nom = models.CharField(max_length=255, blank=True)
    nom = models.CharField(max_length=255, blank=True)
    prenom = models.CharField(max_length=255, blank=True)
    genre = models.PositiveSmallIntegerField(choices=CHOIX_SEXE)
    membre = models.PositiveSmallIntegerField(choices=CHOIX_MEMBRE)
    numero_carte = models.CharField(max_length=255, blank=True, unique=True)
    numero_police = models.CharField(max_length=255, blank=True)
    validite_debut = models.DateField(blank=True)
    validite_fin = models.DateField(blank=True)
    categorie = models.IntegerField(choices=CHOIX_CATEGORIE)
    date_naissance = models.DateField(blank=True)
    photo_file = models.ImageField(upload_to=path_photo, max_length=255, blank=True)
    ticket_moderateur = models.CharField(max_length=255, blank=True)
    patient_contribution = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    validated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-id",)
        indexes = [
            models.Index(fields=["numero_police"]),
            models.Index(fields=["numero_carte"]),
            models.Index(fields=["statut_impression"]),
        ]

    def __str__(self):
        return f"Carte {self.nom} - {self.prenom}"

    def increment_impressions(self):
        self.impressions_count += 1
        self.save(update_fields=["impressions_count"])

    def est_valide(self):
        """Retourne True si la carte est actuellement valide."""
        today = timezone.now().date()
        return self.validite_debut <= today <= self.validite_fin
