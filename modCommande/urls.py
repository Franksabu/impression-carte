from django.urls import path

from . import views

urlpatterns = [
    # path("dashboard/", views.get_info_dashboard, name="dashboard"),
    path(
        "infocarte/list/",
        views.infocarte_list_data,
        name="infocarte_list_data",
    ),
    path(
        "infocarte/create/",
        views.creer_infocarte,
        name="creer_infocarte",
    ),
    path(
        "infocarte/pdf/<int:pk>/",
        views.printcard_pdf,
        name="printcard_pdf",
    ),
    path("list/adherent/", views.adherent_list, name="adherent_list"),
    path(
        "upload-excel-adherents/",
        views.upload_excel_adherent,
        name="upload_excel_adherent",
    ),
]
