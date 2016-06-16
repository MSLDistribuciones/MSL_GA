/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var usuarioEnSesion = null;

function onLoad(){
    haySession();
}

function mostrarMensaje(response){
    var errorMessage = response.split("|");
    $( "#AlertPanel" ).dialog({
        title: errorMessage[1],
        resizable: false,
        modal: true,
        autoOpen: false,
        show: {
          effect: "fade",
          duration: 1000
        },
        hide: {
          effect: "fade",
          duration: 1000
        },
        open:function(){
            $(this).html("<span class=\"ui-icon ui-icon-alert\" style=\"float:left; margin:0 7px 20px 0;\"></span>" + errorMessage[2]);
        },
        buttons: {
          "Aceptar": function() {
            $( this ).dialog( "close" );
          }
        }
    });
    $("#AlertPanel").dialog("open");
}

function cargarUsuarios(){
    $.ajax({
        url: "/MSL_GestionDeActividades/Operaciones",
        type: "POST",
        data: {accion: "getListaUsuarios"},
        success:function(response){
            if(response.match("^error")){
                mostrarMensaje(response);
            }else{
                var usuarios = response.split("|");
                $("#usuario").html("<option></option>");
                $("#listaConsultores").html("<option></option>");
                for(var i = 0; i < usuarios.length; i = i + 1){
                    var usuario = usuarios[i].split("¨");
                    $("#usuario").html($("#usuario").html() + "<option value=\"" + usuario[0] + "\">" + usuario[1] + "</option>");
                    $("#listaConsultores").html($("#listaConsultores").html() + "<option value=\"" + usuario[0] + "\">" + usuario[1] + "</option>");
                }
            }
        }
    });
}

function login(){
    $.ajax({
        url: "/MSL_GestionDeActividades/Operaciones",
        type: "POST",
        data: {accion: "login", usuario: $("#usuario").val(), clave: $("#clave").val()},
        success:function(response){
            if(response.match("^error")){
                mostrarMensaje(response);
            }else{
                usuarioEnSesion = response.split("|");
                $("#LoginPanel").hide();
                if(usuarioEnSesion[4].match("administrador")){
                    initAdministrador();
                    $("#administrador").fadeIn();
                }else if(usuarioEnSesion[4].match("pm")){
                    $("#pm").fadeIn();
                }else if(usuarioEnSesion[4].match("consultor")){
                    $("#consultor").fadeIn();
                }
            }
        }
    });
}

function loginOnEnter(e){
    if(e.which === 13) {
        login();
    }
}

function haySession(){
    $.ajax({
        url: "/MSL_GestionDeActividades/Operaciones",
        type: "POST",
        data: {accion: "haySesion"},
        success:function(response){
            if(response.match("^error")){
                mostrarMensaje(response);
            }else{
                if(response.match("^usuario")){
                    usuarioEnSesion = response.split("|");
                    if(usuarioEnSesion[1].match("none")){
                        cargarUsuarios();
                        $("#LoginPanel").fadeIn();
                        $("#usuario").selectmenu();
                    }else{
                        if(usuarioEnSesion[4].match("administrador")){
                            initAdministrador();
                            $("#administrador").fadeIn();
                        }else if(usuarioEnSesion[4].match("pm")){
                            $("#pm").fadeIn();
                        }else if(usuarioEnSesion[4].match("consultor")){
                            $("#consultor").fadeIn();
                        }
                    }
                }
            }
        }
    });
}

function logout(){
    $.ajax({
        url: "/MSL_GestionDeActividades/Operaciones",
        type: "POST",
        data: {accion: "logout"},
        success:function(response){
            if(response.match("^error")){
                mostrarMensaje(response);
            }else{
                if(usuarioEnSesion[4].match("administrador")){
                    $("#administrador").hide();
                }else if(usuarioEnSesion[4].match("pm")){
                    $("#pm").hide();
                }else if(usuarioEnSesion[4].match("consultor")){
                    $("#consultor").hide();
                }
                usuarioEnSesion = null;
                location.reload();
            }
        }
    });
}

function initAdministrador(){
    cargarUsuarios();
    cargarClientes();
    cargarTipoActividades();
    $("#botonEditarActividad").hide();
    $("#botonCancelarActividad").hide();
    $("#acordeonAdmin").accordion();
    $("#listaConsultores").selectmenu({
        change: function(event, data){
            actividadesDelConsultor();
            cancelarEditarActividad();
        }
    });
    $("#jornada").selectmenu();
    $("#listaClientes").selectmenu();
    $("#tipoActividad").selectmenu();
    $("#fechaActividad").datepicker({
        dateFormat: 'dd-mm-yy',
        onSelect: function(){
            actividadesDelConsultor();
            resetFormularioActividades();
        }
    });
}

function cargarClientes(){
    $.ajax({
        url: "/MSL_GestionDeActividades/Operaciones",
        type: "POST",
        data: {accion: "getListaClientes"},
        success:function(response){
            if(response.match("^error")){
                mostrarMensaje(response);
            }else{
                var clientes = response.split("|");
                for(var i = 0; i < clientes.length; i = i + 1){
                    var cliente = clientes[i];
                    $("#listaClientes").html($("#listaClientes").html() + "<option value=\"" + cliente + "\">" + cliente + "</option>");
                }
            }
        }
    });
}

function cargarTipoActividades(){
    $.ajax({
        url: "/MSL_GestionDeActividades/Operaciones",
        type: "POST",
        data: {accion: "getListaTipoActividades"},
        success:function(response){
            if(response.match("^error")){
                mostrarMensaje(response);
            }else{
                var TipoActividades = response.split("|");
                for(var i = 0; i < TipoActividades.length; i = i + 1){
                    var tipoActividad = TipoActividades[i].split("¨");
                    $("#tipoActividad").html($("#tipoActividad").html() + "<option value=\"" + tipoActividad[0] + "\">" + tipoActividad[1] + "</option>");
                }
            }
        }
    });
}

function actividadesDelConsultor(){
    if($("#listaConsultores").val() !== ""){
        $.ajax({
            url: "/MSL_GestionDeActividades/Operaciones",
            type: "POST",
            data: {accion: "getListaActividadesDeConsultor", consultor: $("#listaConsultores").val(), fecha: $("#fechaActividad").val()},
            success:function(response){
                if(response.match("^error")){
                    mostrarMensaje(response);
                }else{
                    $("#listaActividades").html(response);
                }
            }
        });
    }
}

function agregarActividadAConsultor(){
    if($("#listaConsultores").val() !== "" && $("#jornada").val() !== "" && $("#listaClientes").val() !== "" && $("#panelTipoActividad").val() !== ""){
        $.ajax({
            url: "/MSL_GestionDeActividades/Operaciones",
            type: "POST",
            data: {accion: "agregarActividadAConsultor", 
                consultor: $("#listaConsultores").val(), 
                fecha: $("#fechaActividad").val(),
                jornada: $("#jornada").val(),
                cliente: $("#listaClientes").val(),
                tipoActividad: $("#tipoActividad").val(),
                descripcion: $("#descripcion").val()},
            success:function(response){
                if(response.match("^error")){
                    mostrarMensaje(response);
                }else{
                    $("#listaActividades").html(response);
                }
            }
        });
    }else{
        mostrarMensaje("error|Seleccione Todos los Datos|Es necesario que el consultor, la jornada, el ciente y el tipo de actividad sean seleccionadas");
    }
}

function selecionarActividad(idActividad, consultor, fecha, jornada, cliente, tipoActividad, descripcion){
    $("#idActividad").val(idActividad);
    
    $("#listaConsultores").val(consultor);
    $("#listaConsultores").selectmenu("refresh");
    
    var valFecha = fecha.split("-");
    $('#fechaActividad').datepicker("setDate", new Date(valFecha[2], valFecha[1] - 1, valFecha[0]));
    
    $("#jornada").val(jornada);
    $("#jornada").selectmenu("refresh");
    
    $("#listaClientes").val(cliente);
    $("#listaClientes").selectmenu("refresh");
    
    $("#tipoActividad").val(tipoActividad);
    $("#tipoActividad").selectmenu("refresh");
    
    $("#descripcion").val(descripcion);
    
    $("#botonAgregarActividad").hide();
    $("#botonEditarActividad").show();
    $("#botonEliminarActividad").show();
    $("#botonCancelarActividad").show();
}

function resetFormularioActividades(){
    $("#idActividad").val("");
    
    $("#jornada").val("");
    $("#jornada").selectmenu("refresh");
    
    $("#listaClientes").val("");
    $("#listaClientes").selectmenu("refresh");
    
    $("#tipoActividad").val("");
    $("#tipoActividad").selectmenu("refresh");
    
    $("#descripcion").val("");
    
    $("#botonEditarActividad").hide();
    $("#botonEliminarActividad").hide();
    $("#botonCancelarActividad").hide();
    $("#botonAgregarActividad").show();
}

function cancelarEditarActividad(){
    $("#idActividad").val("");
    
    $('#fechaActividad').datepicker("setDate", new Date());
    
    $("#jornada").val("");
    $("#jornada").selectmenu("refresh");
    
    $("#listaClientes").val("");
    $("#listaClientes").selectmenu("refresh");
    
    $("#tipoActividad").val("");
    $("#tipoActividad").selectmenu("refresh");
    
    $("#descripcion").val("");
    
    $("#botonEditarActividad").hide();
    $("#botonEliminarActividad").hide();
    $("#botonCancelarActividad").hide();
    $("#botonAgregarActividad").show();
}

function deshabilitarActividadAConsultor(){
    if($("#listaConsultores").val() !== "" && $("#jornada").val() !== "" && $("#listaClientes").val() !== "" && $("#panelTipoActividad").val() !== ""){
        $.ajax({
            url: "/MSL_GestionDeActividades/Operaciones",
            type: "POST",
            data: {accion: "deshabilitarActividad", 
                idActividad: $("#idActividad").val(),
                consultor: $("#listaConsultores").val(), 
                fecha: $("#fechaActividad").val(),
                jornada: $("#jornada").val(),
                cliente: $("#listaClientes").val(),
                tipoActividad: $("#tipoActividad").val(),
                descripcion: $("#descripcion").val()},
            success:function(response){
                if(response.match("^error")){
                    mostrarMensaje(response);
                }else{
                    $("#listaActividades").html(response);
                    resetFormularioActividades();
                }
            }
        });
    }else{
        mostrarMensaje("error|Seleccione Todos los Datos|Es necesario que el consultor, la jornada, el ciente y el tipo de actividad sean seleccionadas");
    }
}