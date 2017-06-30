$.getScript("/js/ecc.min.js");
$.getScript("/js/crypto.js");

window.primary = "localhost:3000"
window.secondary = "localhost:8000"

$('#image').hide();
$('#image1').hide();
$('#image2').hide();
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
    
    $('#danger').empty();
    $('#success').empty();

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

                console.time('register');
                var protocol = register(password);
                console.timeEnd('register');

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
                             $("#success").append("<p> Protocol Successfully Done Server 0 </p>");
                        }
                        else{
                            $("#danger").append("<p> An error occured in Server 0 registration (Server) </p>");
                            $('#danger').show();
                        }
                    },
                    error: function (data){
                        $("#danger").append("<p> An error occured in Server 0 registration (Request)</p>");
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
                             $("#success").append("<p> Protocol Successfully Done Server 1 </p>");
                        }
                        else{
                            $("#danger").append("<p>An error occured in Server 1 registration (Server)</p>");
                            $('#danger').show();
                        }
                    },
                    error: function (data){
                        $("#danger").append("<p>An error occured in Server 1 registration (Request)</p>");
                        $('#danger').show();
                    }
                });

                $('#success').show();
                $('#image').hide();
                
            }
            else{
                if(typeof data.message == "string"){
                    $('<p>' + data.message + '</p>').appendTo('#danger');
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
    $('#danger').empty();
    $('#success').empty();


    e.preventDefault();
    $('#image1').show(); 
    var tag = $("#tag").val();
    var userdata = $("#data").val();
    var password = $("#password").val();
    console.time('state');
    var state = states(password);
    console.timeEnd('state');
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
                console.time('outsource');
                var outsource = outsourced(formData);
                console.timeEnd('outsource');
                console.log(outsource);

                if(outsource.result != "Tag 1 Verify Failed" && outsource.result != "Tag 2 Verify Failed"){
                    outsource.data.forEach(function(cipherdata){
                        formData = new Object();
                        formData.email = email;
                        formData.c = cipherdata.c0;
                        formData.ix = outsource.ix0;
                        formData.myuskd = cipherdata.myusk0;
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
                        formData.c = cipherdata.c1;
                        formData.ix = outsource.ix1;
                        formData.myuskd = cipherdata.myusk1;
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
                    });
                }
                else{
                    $("#danger").append("Tag Verification Failed. Dont tryna cheat mate");
                    $('#danger').show();
                }       
                $('#success').show();
                $('#image1').hide();
    });
});

$("#retrieve").submit(function (e) {
    $("#dataout").empty();
    $('#danger').empty();
    $('#success').empty();

    e.preventDefault();
    $('#image2').show(); 
    var tag = $("#tag1").val();
    var password = $("#password1").val();

    console.time('state');
    var state = states(password);
    console.timeEnd('state');
    
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
                    $("#success").append("<p> Retrieve Server 0 Step 1 Succeeded</p>");
                    server0.zd = data.result.zd;
                    server0.myud = data.result.myud;
                    server0.y = data.result.y;
                    server0.salt = data.result.salt;
                }
                else{
                    $("#danger").append("<p>An error occured in Retrieve Server 0 Step 1 (Server)</p>");
                    $('#danger').show();
                }
            },
            error: function (data){
                $("#danger").append("<p>An error occured in Retrieve Server 0 Step 1 (Request)</p>");
                $('#danger').show();
            }
        }),
        $.ajax({
            url : "http://" + window.secondary + "/protocol/state",
            type: "POST",
            data : formData,
            success: function(data){
                if(data.message == "Protocol Succeeded"){
                    $("#success").append("<p> Retrieve Server 1 Step 1 Succeeded</p>");
                    server1.zd = data.result.zd;
                    server1.myud = data.result.myud;
                    server1.y = data.result.y;
                    server1.salt = data.result.salt;
                }
                else{
                    $("#danger").append("<p>An error occured in Retrieve Server 1 Step 1 (Server)</p>");
                    $('#danger').show();
                }
            },
            error: function (data){
                $("#danger").append("<p>An error occured in Retrieve Server 1 Step 1 (Request)</p>");
                $('#danger').show();
            }
        })
    ).then(function(){

            formData.smalla = state.a;
            formData.server0 = server0;
            formData.server1 = server1;
            formData.tag = tag;
            console.time('retrieveState1');
            var retrieve = retrieveState1(formData);
            console.timeEnd('retrieveState1');
            console.log(retrieve);

            if(retrieve.result != "Tag 1 Verify Failed" && retrieve.result != "Tag 2 Verify Failed"){
                var result = {};

                formData1 = new Object();
                formData1.email = email;
                formData1.t = retrieve.t;
                formData1.myuskd = retrieve.myusk0;
                formData1.salt = retrieve.salt0;
                
                formData2 = new Object();
                formData2.email = email;
                formData2.t = retrieve.t;
                formData2.myuskd = retrieve.myusk1;
                formData2.salt = retrieve.salt1;    
                    
                $.when(
                    $.ajax({
                        url : "http://" + window.primary + "/protocol/retrieve",
                        type: "POST",
                        data : formData1,
                        success: function(data){
                            if(data.message == "True"){
                                $("#success").append("<p> Retrieve Server 0 Step 2 Succeeded</p>");
                                result.server0 = data.result;
                            }
                            else{
                                $("#danger").append("<p>An error occured in Retrieve Server 0 Step 2 (Server)</p>");
                                $('#danger').show();
                            }
                        },
                        error: function (data){
                            $("#danger").append("<p>An error occured in Retrieve Server 0 Step 2 (Request)</p>");
                            $('#danger').show();
                        }
                    }),
                    $.ajax({
                        url : "http://" + window.secondary + "/protocol/retrieve",
                        type: "POST",
                        data : formData2,
                        success: function(data){
                            if(data.message == "True"){
                                $("#success").append("<p> Retrieve Server 1 Step 2 Succeeded</p>"); 
                                result.server1 = data.result;        
                            }
                            else{
                                $("#danger").append("<p>An error occured in Retrieve Server 1 Step 2 (Server)</p>");
                                $('#danger').show();
                            }
                        },
                        error: function (data){
                            $("#danger").append("<p>An error occured in Retrieve Server 1 Step 2 (Request)</p>");
                            $('#danger').show();
                        }
                    })
                ).then(function(){
                    result.k = retrieve.k;
                    result.email = window.email;
                    result.t = retrieve.t;
                    console.time('retrieveState2');
                    var final = retrieveState2(result);
                    console.timeEnd('retrieveState2');
                    for(var propName in final) {
                        if(final.hasOwnProperty(propName)) {
                            var propValue = final[propName];
                            $("#dataout").append("<p>"+ propValue +"</p><br>");
                        }
                    }
                    $('#success').show();
                    $('#image2').hide();
                });
            }
            else{
                $("#danger").append("Tag Verification Failed. Dont tryna cheat mate");
                $('#danger').show();
                $('#image2').hide();
            }                
    });
});