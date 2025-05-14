import json

from django.http import JsonResponse
from django.shortcuts import render


# def get_info_dashboard(request):
#     """
#     Retourne le nombre total de commandes et le nombre total de cartes imprimées en JSON.
#     """
#     # response = commande_list_data(request)
#     try:
#         detail_commandes = json.loads(
#             response.content
#         )  # Convertir JsonResponse en dictionnaire
#         total_commandes = detail_commandes.get("total_commandes", 0)
#         total_commandes = detail_commandes.get("total_commandes", 0)
#         total_detailcommandes = detail_commandes.get("total_detailcommandes", 0)
#     except json.JSONDecodeError:
#         total_commandes = 0
#         total_commandes = detail_commandes.get("total_commandes", 0)
#         # total_cartes_imprimees = CarteImprime.objects.count()
#     return JsonResponse(
#         {
#             "total_commandes": total_commandes,
#             "total_detailcommandes": total_detailcommandes,
#             # "total_cartes_imprimees": total_cartes_imprimees,
#         }
#     )
