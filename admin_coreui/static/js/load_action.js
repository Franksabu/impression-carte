$(document).ready(function() {
  var currentPage = 1;
  var getCurrentPage = 1;
  var totalPages = 0;

  // recuperation du cookie pour l'envoie du formulaire
  function getCookie(name) {
      var cookieValue = null;
      if (document.cookie && document.cookie !== '') {
          var cookies = document.cookie.split(';');
          for (var i = 0; i < cookies.length; i++) {
              var cookie = jQuery.trim(cookies[i]);
              if (cookie.substring(0, name.length + 1) === (name + '=')) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
  }

  // format de date
  function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', options);
  }

  // recuperation des donnees pardefaut
  function loadlisteclient(page){
      // Afficher le spinner avant de commencer la requête
      $('#preview-1206').show();

      $.ajax({
          url: '/client/data/', // Remplacez par l'URL de votre API
          type: 'GET',
          data: { page: page },
          success: function(data) {
              $('#tableclient tbody').empty();
              totalPages = data.num_pages;

              currentPage = page;
              var rowNum = (page - 1) * 15;

              $.each(data.lst, function(index, liste) {
                  var validated = liste.validated_at !== null ? `<br><span class="badge me-1 bg-success">Valider le ${formatDate(liste.validated_at)} par ${liste.validated_by}</span>`:'<br><span class="badge me-1 bg-warning">En attente de validation</span>' ;
                  var deleted = liste.deleted_at !== null ? `<br><span class="badge me-1 bg-danger">Supprimer le ${formatDate(liste.deleted_at)} par ${liste.deleted_by}</span>`:'' ;
                  var titleUpdate = liste.validated_at !== null ? 'Visuliser info client':'Mise à jour info client' ;
                  var iconUpdate = liste.validated_at !== null ? '<i class="icon cil-folder-open"></i> Visualise info':'<i class="icon cil-pen"></i> Mise à jour' ;
                  var row = `<tr>
                      <td class="text-center">${rowNum + index + 1}</td>
                      <td class="text-center"> <strong>${liste.police}</strong></td>
                      <td>${liste.nom}</td>
                      <td>${liste.telephone}</td>
                      <td>${liste.email}</td>
                      <td>
                        <span class="badge me-1 bg-secondary"> Créer le ${formatDate(liste.created_at)} par ${liste.created_by}</span>
                        ${validated}
                        ${deleted}
                      </td>
                      <td>
                        <div class="dropdown">
                          <button class="btn btn-transparent p-0" type="button" data-coreui-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="icon cil-options"></i>
                          </button>
                          <div class="dropdown-menu dropdown-menu-end">
                            <button type="button" title="${titleUpdate}"
                                class="dropdown-item btn-sm js-update-entity"
                                data-url="/client/update/${liste.id}/"> ${iconUpdate}
                            </button>
                            ${liste.validated_at !== null ? `
                            <a class="dropdown-item" href="/client/detail/${liste.id}/" title="Liste des membres adherent">
                                <i class="icon cil-list"></i> Liste Membre
                            </a>` : '' }
                            ${data.is_superuser ? `<button type="button" title="Invalider info client"
                                class="dropdown-item btn-sm js-unvalidate-entity"
                                data-url="/client/unvalidate/"
                                value="${liste.id}">
                              <i class="icon cil-wrap-text"></i> Invalider
                            </button>
                            <button type="button" title="Retauration info client"
                                class="dropdown-item btn-sm js-restor-entity"
                                data-url="/client/restor/"
                                value="${liste.id}">
                              <i class="icon cil-action-undo"></i> Retauration
                            </button>` : '' }
                          </div>
                        </div>
                      </td>
                  </tr>`;
                  $('#tableclient tbody').append(row);
              });

              updatePagination(currentPage, totalPages);
          },
          error: function(error) {
              console.log(error);
          },
          complete: function() {
              // Masquer le spinner une fois que la requête est terminée (succès ou échec)
              $('#preview-1206').hide();
          }
      });
  }

  // execution des actions
  function perform(url,id,msg,error,object) {
    var csrftoken = getCookie('csrftoken');

    $.ajax({
        type: "POST",
        url: url,
        headers: {"X-CSRFToken": csrftoken},
        data: {'id': id,},
        success: function(response) {
            // Réponse de la requête AJAX
            console.log(response.url_redirect);
            swal("Succès", msg, "success").then(() => {
               //window.location.href = response.url_redirect;
               if(object === "client"){
                    $("#modal-entity").modal("hide");
                    loadlisteclient(currentPage);
               }
            });
        },
        error: function(xhr, status, error) {
            // Erreur de la requête AJAX
            console.log(xhr.responseText);
            console.log(status);
            console.log(error);
            swal("Erreur", error, "error");
        }
    });
  }

  // mis a jour des donnees pour affichage des informations des pages
  function updatePagination(currentPage, totalPages) {
      var pagination = $('#pagination');
      pagination.empty();

      var previousClass = currentPage === 1 ? 'disabled' : '';
      var nextClass = currentPage === totalPages ? 'disabled' : '';

      pagination.append(`<li class="page-item ${previousClass}"><a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a></li>`);

      var startPage = Math.max(1, currentPage - 2);
      var endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
          pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`);
          if (startPage > 2) {
              pagination.append(`<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`);
          }
      }

      for (var i = startPage; i <= endPage; i++) {
          var activeClass = currentPage === i ? 'active' : '';
          pagination.append(`<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
      }

      if (endPage < totalPages) {
          if (endPage < totalPages - 1) {
              pagination.append(`<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`);
          }
          pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`);
      }

      pagination.append(`<li class="page-item ${nextClass}"><a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`);
  }

  // Gestionnaire d'événements pour les liens de pagination
  $(document).on('click', '.page-link', function(e) {
      e.preventDefault(); // Empêche le comportement par défaut du lien
      var page = $(this).data('page'); // Récupère le numéro de page
      if (page && page !== currentPage) { // Vérifie si la page est valide et différente de la page actuelle
        loadlisteclient(page); // Récupère les cotisations pour la page sélectionnée
        getCurrentPage = page //  Récupère le numéro de page en coure
      }
  });

  // Charger la première page de cotisations au démarrage
  loadlisteclient(currentPage);

  // envoie du formulaire de recherche
  $('form').submit(function(event) {
      event.preventDefault(); // Empêcher la soumission du formulaire par défaut

      // Récupérer les données du formulaire
      var formData = $(this).serialize();

      // Récupérer le jeton CSRF
      var csrftoken = getCookie('csrftoken')

      // Envoyer une requête AJAX à votre vue Django
      $.ajax({
          url: '/client/data/',
          type: 'POST',
          data: formData,
          headers: { 'X-CSRFToken': csrftoken },
          success: function(data) {
            $('#tableclient tbody').empty();
            totalPages = data.num_pages;
            currentPage = currentPage;
            var rowNum = (currentPage - 1) * 15;

            $.each(data.lst, function(index, liste) {
                var validated = liste.validated_at !== null ? `<br><span class="badge me-1 bg-success">Valider le ${formatDate(liste.validated_at)} par ${liste.validated_by}</span>`:'<br><span class="badge me-1 bg-warning">En attente de validation</span>' ;
                var deleted = liste.deleted_at !== null ? `<br><span class="badge me-1 bg-danger">Supprimer le ${formatDate(liste.deleted_at)} par ${liste.deleted_by}</span>`:'' ;
                var titleUpdate = liste.validated_at !== null ? 'Visuliser info client':'Mise à jour info client' ;
                var iconUpdate = liste.validated_at !== null ? '<i class="icon cil-folder-open"></i> Visualise info':'<i class="icon cil-pen"></i> Mise à jour' ;
                var row = `<tr>
                    <td class="text-center">${rowNum + index + 1}</td>
                    <td class="text-center"> <strong>${liste.police}</strong></td>
                    <td>${liste.nom}</td>
                    <td>${liste.telephone}</td>
                    <td>${liste.email}</td>
                    <td>
                      <span class="badge me-1 bg-secondary"> Créer le ${formatDate(liste.created_at)} par ${liste.created_by}</span>
                      ${validated}
                      ${deleted}
                    </td>
                    <td>
                      <div class="dropdown">
                        <button class="btn btn-transparent p-0" type="button" data-coreui-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <i class="icon cil-options"></i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end">
                          <button type="button" title="${titleUpdate}"
                              class="dropdown-item btn-sm js-update-entity"
                              data-url="/client/update/${liste.id}/"> ${iconUpdate}
                          </button>
                            ${data.is_superuser ? `<button type="button" title="Invalider info client"
                                class="dropdown-item btn-sm js-unvalidate-entity"
                                data-url="/client/unvalidate/"
                                value="${liste.id}">
                              <i class="icon cil-wrap-text"></i> Invalider
                            </button>
                            <button type="button" title="Retauration info client"
                                class="dropdown-item btn-sm js-restor-entity"
                                data-url="/client/restor/"
                                value="${liste.id}">
                              <i class="icon cil-action-undo"></i> Retauration
                            </button>` : '' }
                        </div>
                      </div>
                    </td>
                </tr>`;
                $('#tableclient tbody').append(row);
            });

            updatePagination(currentPage, totalPages);
          },
          error: function(error) {
            swal("Erreur", "Une error de chargement des donnees", "error");
          },
          complete: function() {
              // Masquer le spinner une fois que la requête est terminée (succès ou échec)
              $('#preview-1206').hide();
          }
      });
  });

  $('#tableclient').on('click', '.js-update-entity', function() {
      var url = $(this).data('url');

      // Récupérer le jeton CSRF depuis les cookies
      var csrftoken = getCookie('csrftoken');

      // Envoyer la requête AJAX
      $.ajax({
            type: "GET",
            url: url,
            headers: {"X-CSRFToken": csrftoken},
            success: function(response) {
                // Assurez-vous que response est correctement formaté
                if (response && response.html_form) {
                          // Injecter le contenu HTML dans la modal
                    $("#modal-entity .modal-content").html(response.html_form);
                    // Afficher la modal
                    $("#modal-entity").modal("show");
                } else {
                    swal("Erreur", "Une erreur se produit lors de chargement du contenu de formulaire.", "error");
                }
            },
            error: function(xhr, status, error) {
                // Erreur de la requête AJAX
                console.log(xhr.responseText);
                console.log(status);
                console.log(error);
                swal("Erreur", "Une erreur se produit lors de chargement du formulaire.", "error");
            }
        });
  });

  $('#tableclient').on('click', '.js-restor-entity', function() {
    var id = $(this).attr('value');
    var url = $(this).data('url');
    var object = $('#object').val();
    var msg = "Le client a été restauré avec succès.";
    var error = "Une erreur s'est produite lors de la restauration.";

    swal({
        title: "Confirmation",
        text: "Etes-vous sûr de restaurer ses informations ?",
        icon: "warning",
        buttons: ["Non", "Oui"],
        dangerMode: true,
    }).then((confirm) => {
        if (confirm) {
            perform(url,id,msg,error,object);
        }
    });
  });

  $('#tableclient').on('click', '.js-unvalidate-entity', function() {
    var id = $(this).attr('value');
    var url = $(this).data('url');
    var object = $('#object').val();
    var msg = "L' objet "+ object +" a été invalider avec succès.";
    var error = "Une erreur s'est produite lors de l'invalidation.";

    swal({
        title: "Confirmation",
        text: "Etes-vous sûr d'invalider ses informations ?",
        icon: "warning",
        buttons: ["Non", "Oui"],
        dangerMode: true,
    }).then((confirm) => {
        if (confirm) {
            perform(url,id,msg,error,object);
        }
    });
  });

  $('.js-submit-form-button').click(function(event) {
        event.preventDefault(); // Empêcher le comportement par défaut du formulaire

        var form = $('.js-entity-update-forms');
        var id = $(this).attr('value');
        var url = "/client/update/"+ id +"/"
        // Sérialiser les données du formulaire
        var formData = form.serialize();

        // Envoyer les données via POST sans changer l'URL
        $.post(url, formData, function(data) {
            // Cacher la modal
            $("#modal-entity").modal("hide");

            // Vider le contenu de la table des clients
            $('#tableclient tbody').empty();

            totalPages = data.num_pages;
            currentPage = 1;

            // Mettre à jour la liste
            loadlisteclient(currentPage)
            // Mettre à jour la pagination
            updatePagination(currentPage, totalPages);

        }).fail(function(xhr, status, error) {
            // En cas d'erreur lors de la requête
            console.log(xhr.responseText);
            console.log(status);
            console.log(error);
            swal("Erreur", "Une erreur s'est produite lors de l'envoi du formulaire.", "error");
        });
    });

  $('.js-button-validate').click(function(event) {
    var id = $(this).attr('value');
    var url = $(this).data('url');
    var object = $('#object').val();
    var msg = "Le client a été  valider avec succès.";
    var error = "Une erreur s'est produite lors de la validation.";

    swal({
        title: "Confirmation",
        text: "Etez-vous sur de vouloire valider ses informations ?",
        icon: "warning",
        buttons: ["Non", "Oui"],
        dangerMode: true,
    }).then((confirm) => {
        if (confirm) {
            perform(url,id,msg,error,object);
        }
      });
    });

  $('.js-button-remove').click(function(event) {
    var id = $(this).attr('value');
    var url = $(this).data('url')
    var object = $('#object').val();
    var msg = "Le client a été  Enlever avec succès.";
    var error = "Une erreur s'est produite lors de l'enlevement.";

    swal({
        title: "Confirmation",
        text: "Etez-vous sur de vouloire enlever ses informations ?",
        icon: "warning",
        buttons: ["Non", "Oui"],
        dangerMode: true,
    }).then((confirm) => {
        if (confirm) {
            perform(url,id,msg,error,object);
        }
    });
  });

  $('.js-button-delete').click(function(event) {
    var id = $(this).attr('value');
    var url = $(this).data('url')
    var object = $('#object').val();
    var msg = "Le client a été  Supprimer avec succès.";
    var error = "Une erreur s'est produite lors de la suppression.";

    swal({
        title: "Confirmation",
        text: "Etez-vous sur de supprimer ses informations ?",
        icon: "warning",
        buttons: ["Non", "Oui"],
        dangerMode: true,
    }).then((confirm) => {
        if (confirm) {
            perform(url,id,msg,error,object);
        }
    });
  });

});

