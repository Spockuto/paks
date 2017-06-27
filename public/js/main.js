$.getScript("/js/ecc.min.js");
$.getScript("/js/crypto.js");

window.primary = "localhost:3000"
window.secondary = "localhost:8000"

$('#image').hide();
$('#danger').hide();
$('#success').hide();

if(!$('#message').text()){
    $('#message').hide();
}
if(!$('#user').text()){
    $('#user').hide();
}
else{
    window.username = $('#user').text();
}
if(!$('#email').text()){
    $('#email').hide();
}
else{
    window.email = $('#email').text();
}

$("#register").submit(function (e) {
    e.preventDefault();
    var form = $('#register');
    var username = $("#username").val();
    var password = $("#password").val();
    var email = $("#em").val();
    $.ajax({
        type: form.attr('method'),
        url: "http://" + window.primary + form.attr('action'),
        data: form.serialize(),
        cache: false,
        beforeSend: function(){
            $('#image').show();
        },
        success: function (data) {
            if(data.success == "True"){
                $('#success').text("User Successfully registered <br>");
                var protocol = register(password);
                formData = new Object();
                formData.email = email;
                formData.xd = protocol.x0;
                formData.gr1 = protocol.gr1;
                formData.gr2 = protocol.gr2;
                formData.cpi = protocol.cpi;
                formData.kd = protocol.k0;
                formData.mkd = protocol.mk0;

                $.ajax({
                    url : "http://" + window.primary + "/protocol/register",
                    type: "POST",
                    data : formData,
                    success: function(data){
                        if(data.message == "True"){
                             $("#success").append("Protocol Successfully Done Server 0 <br>");
                        }
                        else{
                            $("#danger").append("An error occured in Server 0 registration (Server)");
                            $('#danger').show();
                        }
                    },
                    error: function (data){
                        $("#danger").append("An error occured in Server 0 registration (Request)");
                        $('#danger').show();
                    }
                });

                formData = new Object();
                formData.email = email;
                formData.xd = protocol.x1;
                formData.gr1 = protocol.gr1;
                formData.gr2 = protocol.gr2;
                formData.cpi = protocol.cpi;
                formData.kd = protocol.k1;
                formData.mkd = protocol.mk1;

                $.ajax({
                    url : "http://" + window.secondary + "/protocol/register",
                    type: "POST",
                    data : formData,
                    success: function(data){
                        if(data.message == "True"){
                             $("#success").append("Protocol Successfully Done Server 1 <br> ");
                        }
                        else{
                            $("#danger").append("An error occured in Server 1 registration (Server)");
                            $('#danger').show();
                        }
                    },
                    error: function (data){
                        $("#danger").append("An error occured in Server 1 registration (Request)");
                        $('#danger').show();
                    }
                });

                $('#success').show();
                $('#image').hide();
                
            }
            else{
                if(data.message.length == 1){
                    $('<p>' + data.message.msg + '</p>').appendTo('#danger');
                }
                else{
                    data.message.forEach(function(index){
                        $('<p>' + index.msg + '</p>').appendTo('#danger');
                    });
                }
                $('#danger').show();
                $('#image').hide();
            }
        },
        error: function (data) {
        $('#image').hide();
        $("<p>An error occured in Main registration (Request)</p>").appendTo("danger");
        $('#danger').show();
        },
    });
});

$("#outsource").submit(function (e) {
    e.preventDefault();
    $('#image').show(); 
    var tag = $("#tag").val();
    var userdata = $("#data").val();
    var password = $("#password").val();

    var state = states(password);
    var server0 = {};
    var server1 = {};
    formData = new Object();
    formData.email = window.email;
    formData.a = state.A;
    $.when(
    $.ajax({
        url : "http://" + window.primary + "/protocol/state",
        type: "POST",
        data : formData,
        success: function(data){
            if(data.message == "Protocol Succeeded"){
                $("#success").append("<p> Outsource Server 0 Step 1 Succeeded</p>");
                server0.zd = data.result.zd;
                server0.myud = data.result.myud;
                server0.y = data.result.y;
                server0.salt = data.result.salt;
            }
            else{
                $("#danger").append("<p>An error occured in Outsource Server 0 Step 1 (Server)</p>");
                $('#danger').show();
            }
        },
        error: function (data){
            $("#danger").append("<p>An error occured in Outsource Server 0 Step 1 (Request)</p>");
            $('#danger').show();
        }
    }),
    $.ajax({
        url : "http://" + window.secondary + "/protocol/state",
        type: "POST",
        data : formData,
        success: function(data){
            if(data.message == "Protocol Succeeded"){
                $("#success").append("<p> Outsource Server 1 Step 1 Succeeded</p>");
                server1.zd = data.result.zd;
                server1.myud = data.result.myud;
                server1.y = data.result.y;
                server1.salt = data.result.salt;
            }
            else{
                $("#danger").append("<p>An error occured in Outsource Server 1 Step 1 (Server)</p>");
                $('#danger').show();
            }
        },
        error: function (data){
            $("#danger").append("<p>An error occured in Outsource Server 1 Step 1 (Request)</p>");
            $('#danger').show();
        }
    })
    ).then(function(){

                formData.smalla = state.a;
                formData.server0 = server0;
                formData.server1 = server1;
                formData.tag = tag;
                formData.data = userdata;
                var outsource = outsourced(formData);
                
                formData = new Object();
                formData.email = email;
                formData.c = outsource.c;
                formData.ix = outsource.ix;
                formData.myuskd = outsource.myusk0;
                formData.salt = outsource.salt0;

                $.ajax({
                    url : "http://" + window.primary + "/protocol/outsource",
                    type: "POST",
                    data : formData,
                    success: function(data){
                        if(data.message == "True"){
                            $("#success").append("<p> Outsource Server 0 Step 2 Succeeded</p>");
                        }
                        else{
                            $("#danger").append("<p>An error occured in Outsource Server 0 Step 2 (Server)</p>");
                            $('#danger').show();
                        }
                    },
                    error: function (data){
                        $("#danger").append("<p>An error occured in Outsource Server 0 Step 2 (Request)</p>");
                        $('#danger').show();
                    }
                });

                formData = new Object();
                formData.email = email;
                formData.c = outsource.c;
                formData.ix = outsource.ix;
                formData.myuskd = outsource.myusk1;
                formData.salt = outsource.salt1;

                $.ajax({
                    url : "http://" + window.secondary + "/protocol/outsource",
                    type: "POST",
                    data : formData,
                    success: function(data){
                        if(data.message == "True"){
                            $("#success").append("<p> Outsource Server 1 Step 2 Succeeded</p>");         
                        }
                        else{
                            $("#danger").append("<p>An error occured in Outsource Server 1 Step 2 (Server)</p>");
                            $('#danger').show();
                        }
                    },
                    error: function (data){
                        $("#danger").append("<p>An error occured in Outsource Server 1 Step 2 (Request)</p>");
                        $('#danger').show();
                    }
                });    
                $('#success').show();
                $('#image').hide();
    });
});


