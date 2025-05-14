var idModalEntity = "#modal-entity";
var idTableEntity = "#entity-table";
var idTableauBord = "#tableau-bord";

var clCreateEntity = ".js-create-entity";
var clUpdateEntity = ".js-update-entity";
var clDeleteEntity = ".js-delete-entity";
var clUploadEntity = ".js-upload-entity";
var clValidateEntity = ".js-validate-entity";

var clCreateFormEntity= ".js-entity-create-form";
var clUpdateFormEntity= ".js-entity-update-form";
var clDeleteFormEntity= ".js-entity-delete-form";
var clValidateFormEntity= ".js-entity-validate-form";

/*------ performLoading ------*/
function performLoading (btn, idModal) { 
  
  var successLoadForm = function(data){
    $(idModal + " .modal-content").html(data.html_form).promise().done(function() {
      console.log("successLoadForm");

      if (typeof OnAdresseChanged!= 'undefined') {
        var action = get_action(btn.attr("data-url"));
        //OnAdresseChanged(action); //Load de selected value (Contribuable) OBSOLETE
      }

      if (typeof OnTypeEspaceChanged!= 'undefined') {
        OnTypeEspaceChanged(); //GESTION des contrôle dans l'activité standard form
      }
      
      Helpers.ShowModalEntity();
    });
  };

  $.ajax({
    url: btn.attr("data-url"),
    type: 'get',
    dataType: 'json',
    success: successLoadForm
  });
}

/* Functions */
  var loadForm = function () {
    var btn = $(this);
    Helpers.Loading(btn, idModalEntity);
  };
  
  var saveForm = function () {
    var form = $(this);
    console.log(form);
    var dataToSend = form.serialize();
    console.log(dataToSend);
    var successSaveForm = function(data){
      if (data.form_is_valid) {
        if (typeof data.url_redirect != 'undefined') {
          // Recharger la page entière
          // location.href = data.url_redirect;
        } else {
          // Recharger le contenu de la table
          $(idTableEntity + " tbody").html(data.html_content_list);
          $("#paginator_id").html(data.html_content_paginator);
        }

        //Fermer le pop-up principal
        Helpers.HideModalEntity();
      }
      else {
        Helpers.ShowError(data);
      }
    };

    $.ajax({
      url: form.attr("action"),
      data: form.serialize(),
      type: form.attr("method"),
      dataType: 'json',      
      success: successSaveForm
    });
    return false;
  };

//méthode permettant de detecter l'action en cours : Create, update, validate, delete ...
function get_action(url){
  if (url.indexOf("create") !=-1) {
    return "create"
  }
  if (url.indexOf("update") !=-1) {
    return "update"
  }
  if (url.indexOf("delete") !=-1) {
    return "delete"
  }
  if (url.indexOf("validate") !=-1) {
    return "validate"
  }  
}
/* Binding */

// Create entity
$(clCreateEntity).click(loadForm); 
$(idModalEntity).on("submit", clCreateFormEntity, saveForm);

// Update entity
$(clUpdateEntity).on("click", loadForm); /* Ajouté le 2018-09-24 pour la Gestion des Notifications */
$(idTableEntity).on("click", clUpdateEntity, loadForm);
$(idModalEntity).on("submit", clUpdateFormEntity, saveForm);

// Delete entity
$(idTableEntity).on("click", clDeleteEntity, loadForm);
$(idModalEntity).on("submit", clDeleteFormEntity, saveForm);

// Validate entity
$(idTableEntity).on("click", clValidateEntity, loadForm);

// Upload entity
$(idTableEntity).on("click", clUploadEntity, loadForm);
$(clUploadEntity).on("click", loadForm); /*Ajoute le 2018-12-07 pour UPLOAD HORS TABLE  pas utile hatreto*/

var Helpers = {
  Loading: performLoading,
  MsgBoxOnYesClickedJs: function(){},
  MsgBoxOnNoClickedJs: function(){
    $("#modal-entity").css("opacity","1");
    return false;},
  ShowMessageAlert: function (message, onYesFunction) {
      if (onYesFunction != null) {
        Helpers.MsgBoxOnYesClickedJs = onYesFunction;
      }
      
      $("#avertissement-message").html(message).promise().done(function() {
        $("#modal-avertissement").modal("show").draggable({ handle: ".modal-header" });
      });
  },
  ShowModalEntity: function(){
     $(idModalEntity).css("opacity","1");
    return $(idModalEntity).modal("show");
  },
  HideModalEntity: function(){
    return $(idModalEntity).modal("hide");
  },
  OkErrorOnClickedJs: function(){
    $("#modal-entity").css("opacity","1");
    return $("#modal-erreur").modal("hide");
  },
  ShowError: function (data) {    
       $("#erreur-message").html(data.html_form).promise().done(function() {
          $("#modal-entity").css("opacity","0.75");
          $("#modal-erreur").modal("show").draggable({ handle: ".modal-header" });
       });
  },
  ShowError1: function (data) {    
       $("#erreur-message").html(data.html_form).promise().done(function() {
          $("#modal-entity").css("opacity","0.75");
          $("#modal-erreur1").modal("show").draggable({ handle: ".modal-header" });
       });
  },
  ShowError2: function (data) {    
       $("#erreur-message").html(data.html_form).promise().done(function() {
          $("#modal-entity").css("opacity","0.75");
          $("#modal-erreur2").modal("show").draggable({ handle: ".modal-header" });
       });
  },
  ShowErrorSpecific: function (data) {    
       $("#erreur-message").html(data.message).promise().done(function() {
          $("#modal-entity").css("opacity","0.75");
          $("#modal-erreur").modal("show").draggable({ handle: ".modal-header" });
       });
  },
  ShowModalNotification: function (data) {   
    $("#notification-message").html(data.html_form).promise().done(function() {
      $("#modal-entity").css("opacity","0.75");
      $("#modal-notification").modal("show").draggable({ handle: ".modal-header" });
    });
  },
  ExportTitle: function(){
    //Gestion titre export
    var defaultTitle = 'GDAF';
    var pageTitle = $(".card-title").text();
    if(pageTitle != "")
    {
      defaultTitle = pageTitle;
    }
    return defaultTitle;
  },
  BuildDropdown: function(result, dropdown, emptyMessage, selected_id, text_field, text_field_other='')
  {
      //Methode helpers pour remplir le dropdown
      // Vider le dropdown
      dropdown.html('');

      // Initialiser le dropdown
      dropdown.append('<option value="">' + emptyMessage + '</option>');

      // Test si le résulat n'est pas null
      if(result != '')
      {           

          // Parcourir le résultat et remplir le dropdown
          $.each(result, function(k, v) {
              lib2 = '';
              if (text_field_other!='') {
                lib2 = ' - ' + v[text_field_other];
              }
              if (selected_id != "None" && selected_id >=0 &&  selected_id == v.id) {
                  //Metre le selected value
                  dropdown.append('<option value="' + v.id + '" selected>' + v[text_field] + lib2 + '</option>');
              } else {
                  dropdown.append('<option value="' + v.id + '">' + v[text_field] + lib2 + '</option>');
              }
          });  
      }
  },

//---------------------------------------------
//----------------- DATE PICKER ---------------
//---------------------------------------------
/**
Datetime picker Jquery
selected_id : champs date
init_date: la date par défaut si indiquée
*/
DatePicker: function(selected_id, init_date=null)
{
  if (init_date) { init_date = init_date }
  //else { init_date = 'today'}

  $( "#"+selected_id ).datepicker({
    altField: "#"+selected_id,
    closeText: 'Fermer',
    prevText: 'Précédent',
    nextText: 'Suivant',
    currentText: 'Aujourd\'hui',
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
    dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    weekHeader: 'Sem.',
    dateFormat: 'dd/mm/yy',

    onSelect: function(d,i){
      if(d !== i.lastVal){
        $(this).change();
      }
   }
  }) //.datepicker('setDate', init_date); //.datepicker("setDate", new Date()); //Date default = date du jour
},

  //---------------------------------------------
  //----------------- DATA TABLE ----------------
  //---------------------------------------------
  LoadDataTable: function()
  {
    var table = $(idTableEntity).DataTable({
      "language": {
        "emptyTable": "Aucun enregistrement"
      },
      paging :false,
      bFilter : true,
      ordering : true,
      searching : false,
      info: false,
      targets: 0,
      responsive: true,
      
      dom : 'l<"#action_add_element">frtip',

      "columnDefs": [ 
        {'min-width': '20%', 'targets': 0},
        {'max-width': '20%', 'targets': 0}
      ],
    });

    // Mettre le numéro de ligne sur à la première colonne de chaque tableau (list)
    table.on( 'order.dt search.dt', function () {
        table.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        } );
    } ).draw();

    new $.fn.dataTable.FixedHeader( table );
  },

}


function _ShowConfirmation(pk, url, message){
    $("#modal-entity").css("opacity","0.75");//opactity create, update
    //
    var onYesClicked = function(){
        $("#modal-entity").css("opacity","1");
        
        //confirmer la validation
        _PerformValidate(pk, url);
        
        return true;
    }    
    Helpers.ShowMessageAlert(message, onYesClicked);
}

function _PerformValidate(pk, url){
    $.ajax({
    url : url,
    type : "POST",
    data : {"id" : pk},
    dataType : "json",
    success : function(data){
      //fermer le pop-up principal
      Helpers.HideModalEntity();
      
      //Ouvrir la liste (avec paginator)
      location.href = data.url_redirect; //window.open(data.url_redirect);
      
      //Obsolete
      $(idTableEntity + " tbody").html(data.html_content_list); 
    }
  });
}


//---------------------------------------------
//------- MESSAGE VALIDATION AND PRINT --------
//---------------------------------------------
function _Print_Confirm(pk, url, message)
{
    var form = $(".js-entity-update-form");
    var dataToSend = form.serialize();
    var successSaveForm = function(data){
      if (data.form_is_valid) {
        _ShowConfirmation_Print(pk, url, message);
      }
      else {
        Helpers.ShowError(data);
      }
    };
    $.ajax({
      url: form.attr("action"),
      data: form.serialize(),
      type: form.attr("method"),
      dataType: 'json',      
      success: successSaveForm
    });
}

function _ShowConfirmation_Print(pk, url, message){
    $("#modal-entity").css("opacity","0.75");
    var onYesClicked = function(){
        $("#modal-entity").css("opacity","1");
        
        //confirmer la validation
        _Perform_Print(pk, url);
        
        return true;
    }    
    Helpers.ShowMessageAlert(message, onYesClicked);
}

function _Perform_Print(pk, url){
    $.ajax({
    url : url,
    type : "POST",
    data : {"id" : pk},
    dataType : "json",
    success : function(data){
      if (data.success == 'false') {
        Helpers.ShowError(data);
      } 
      else 
      {
        // Generate and Download PDF sur <a>
        $('#print_card')[0].click();
        
        //fermer le pop-up principal
        Helpers.HideModalEntity();
      }
    }
  });
}

//--------------------------------------------------------------------------------
//--- MESSAGE DE CONFIRMATION PERMETTANT D'EXECUTER LE CLICK D'UN BUTON QUELCONQUE
//--------------------------------------------------------------------------------
function _ExecuteButtonAction(btn_action, message)
{ 
  //Executer le click d'un autre boutton (voir utilisation dans Form Création Note d'imposition)
  $("#modal-entity").css("opacity","0.75");
  
  var onYesClicked = function(){
    $("#modal-entity").css("opacity","1");
    var btn = document.querySelector("#"+btn_action);
    $(btn).click();

    //fermer le pop-up principal
    Helpers.HideModalEntity();
    
    //Ouvrir la liste (avec paginator)
    location.href = data.url_redirect;
    
    return true;
  }

  // Ouvrir la confirmation
  Helpers.ShowMessageAlert(message, onYesClicked);
}

//---------------------------------------------
//-------------- FORMATAGE DES CHAMPS  --------
//---------------------------------------------

//Mettre un champs input text en majiscule
function  To_Majiscule(id_input) {
  var someInput = document.querySelector(id_input);
  someInput.addEventListener('input', function () {
    someInput.value = someInput.value.toUpperCase();
  });
}

//---------------------------------------------
//------ LISTE: RECHERCHE MUTI-CRITERES -------
//---------------------------------------------
$(document).ready(function(){
    $('#btn_search').keypress(function(e){
      if(e.keyCode==13)
        $('#btn_search').click();
    });
});

//---------------------------------------------
//----------------- UPLOAD FILE ---------------
//---------------------------------------------
function getFileUploadName(elt, select) {
  var fn = $(elt).val();
  var filename = fn.match(/[^\\/]*$/)[0]; // remove C:\fakename
  
  $('#'+select).html("<b>"+filename+"</b>");
}

//---------------------------------------------
//---------- MESSAGE FADEIN/FADEOUT -----------
//---------------------------------------------
function ShowMessageFadeIn(msg) {
  $('#message_fade').fadeIn('slow', function(){
     $('#message_fade').html(msg);
     $('#message_fade').delay(5000).fadeOut('slow'); 
  });
}

//---------------------------------------------
//---------- REFRESH DIV PER 5 SECONDS ---------
//---------------------------------------------
setInterval("refresh_div();", 5000); 

function refresh_div(){
  $('#refresh').load(location.href + ' #time');
}

//---------------------------------------------
//-------------- MODAL DRAGGABLE --------------
//---------------------------------------------
$("#modal-entity").draggable({
  handle: ".modal-header"
});

$("#modal-avertissement").draggable({
  handle: ".modal-header"
});

$("#modal-information").draggable({
  handle: ".modal-header"
});

$("#modal-erreur").draggable({
  handle: ".modal-header"
});


/*DATE DU JOUR en FR*/
$.GetDateTodayFr = function() {
  var d = new Date();
  var day = d.getDate();
  var month = d.getMonth() + 1;
  var year = d.getFullYear();
  if (day < 10) {
      day = "0" + day;
  }
  if (month < 10) {
      month = "0" + month;
  }
  var date = day + "/" + month + "/" + year;

  return date;
};

/*DATE NOUVEL AN de l'année en cours en FR*/
$.GetNewYearToDateFr = function() {
  var d = new Date();
  var year = d.getFullYear();
  
  return "01/01/" + year;
};

// ------------------------------------------------------------------------------
// mis a jour des donnees pour affichage des informations des pages -------------
// ------------------------------------------------------------------------------
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


