from modCommande.subModels.model_adherent import InfoCarte
from django import forms


class InfoCarteForm(forms.ModelForm):
    class Meta:
        model = InfoCarte
        fields = [
            "client_nom",
            "nom",
            "prenom",
            "genre",
            "membre",
            "numero_carte",
            "numero_police",
            "validite_debut",
            "validite_fin",
            "categorie",
            "date_naissance",
            "photo_file",
            "ticket_moderateur",
            "patient_contribution",
        ]
        widgets = {
            "validite_debut": forms.DateInput(attrs={"type": "date"}),
            "validite_fin": forms.DateInput(attrs={"type": "date"}),
            "date_naissance": forms.DateInput(attrs={"type": "date"}),
        }
        
        def clean_numero_carte(self):
            numero_carte = self.cleaned_data.get("numero_carte")
            if InfoCarte.objects.filter(numero_carte=numero_carte).exists():
                raise forms.ValidationError("Ce numéro de carte existe déjà.")
            return numero_carte
