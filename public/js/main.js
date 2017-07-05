$.getScript("/js/ecc.min.js");
$.getScript("/js/crypto.js");

window.primary = "localhost:3000"
window.secondary = "localhost:8000"
window.files = "";
var re = /(?:\.([^.]+))?$/;

$('#image').hide();
$('#image1').hide();
$('#image2').hide();
$('#image3').hide();
$('#danger').hide();
$('#success').hide();
$('#dataout').hide();
$('#datain').hide();


$('#upload-input').on('change', function(){
  window.files = $(this).get(0).files; 
  $('#datain').empty();
  for(var i = 0; i < window.files.length; i++){
        $('#datain').append("<p>" + window.files[i].name + "</p>");
    }
  $('#datain').show();
});

$('#password, #email').bind('keyup', function() {
    if(allFilled()) {
        $('#outsourcebutton').removeAttr('disabled');
        $('#retrievebutton').removeAttr('disabled');
    }
});


function allFilled(){
    var empty = false;
    if ($("#email").val() == '') {
        empty = true;
    }
    if ($("#password").val() == '') {
        empty = true;
    }
    if (empty) {
        $('#outsourcebutton').attr('disabled', 'disabled');
        $('#retrievebutton').attr('disabled', 'disabled');
    } else {
        $('#outsourcebutton').removeAttr('disabled');
        $('#retrievebutton').removeAttr('disabled');
    }
}

function toggler(){
    $('.tabletoggle').nextUntil('tr.header').slideToggle(100);
}

function update(finalfuckingdata){
    var count = 0;
    for (var key in finalfuckingdata) {
        if (finalfuckingdata.hasOwnProperty(key)) {
            var row = "<tr><td>&#9830; ";
            
            for(var i = 0 ; i < finalfuckingdata[key].lengths; i++){
                if(i != finalfuckingdata[key].lengths - 1)
                    row+=finalfuckingdata[key][i]+ " &#9830; ";
                else
                    row+=finalfuckingdata[key][i]+ "</td>";
            }
            $("#databody tbody").append(row + "<td>" + finalfuckingdata[key].data + "</td></tr>");
            count++;
            if(count == 4){
                 $("#databody tbody").append("<tr class='tabletoggle'><td colspan='2'><a href='javascript:void(0)' onclick='toggler()'\
                    >Click here for more..</a></td></tr>");
            }
        }
    }
    toggler();
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
                $('#success').text("User Successfully registered");

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
                             ////$("success").append("<p> Protocol Successfully Done Server 0 </p>");
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
                             ////$("success").append("<p> Protocol Successfully Done Server 1 </p>");
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

                //$('#success').show();
                if($("#danger").text() == "")
                    $("#success").empty().append("<p>Protocol Successful</p>").show();
                else
                    $("#danger").show();
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

$("#reset").submit(function (e) {
    
    $('#danger').empty();
    $('#success').empty();

    e.preventDefault();
    var form = $('#reset');
    var password = $("#passwordold").val();
    var email = $("#email").val();

    if($('#password').val() == $('#password2').val()){
        console.time('state');
        var state = states(password);
        console.timeEnd('state');
        var server1 = {};
        var server0 = {};
        formData = new Object();
        formData.email = $("#email").val();
        formData.a = state.A;
        formData.reset = "True";
        $.when(
        $.ajax({
            url : "http://" + window.primary + "/protocol/state",
            type: "POST",
            data : formData,
            success: function(data){
                if(data.message == "Protocol Succeeded"){
                    //$("success").append("<p> Outsource Server 0 Step 1 Succeeded</p>");
                    server0.zd = data.result.zd;
                    server0.myud = data.result.myud;
                    server0.y = data.result.y;
                    server0.salt = data.result.salt;
                    server0.gr2 = data.result.gr2;
                    server0.cpi = data.result.cpi;
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
                    //$("success").append("<p> Outsource Server 1 Step 1 Succeeded</p>");
                    server1.zd = data.result.zd;
                    server1.myud = data.result.myud;
                    server1.y = data.result.y;
                    server1.salt = data.result.salt;
                    server1.gr2 = data.result.gr2;
                    server1.cpi = data.result.cpi;
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
            formData = new Object();
            formData.email = $("#email").val();
            formData.a = state.A;
            formData.smalla = state.a;
            formData.server0 = server0;
            formData.server1 = server1;
            formData.oldpassword = $("#passwordold").val();
            formData.newpassword = $('#password').val();
            console.log(formData);
            var resetdata = reset(formData);
            console.log(resetdata);

                formData1 = new Object();
                formData1.email = email;
                formData1.cpi = resetdata.cpi;
                formData1.gr2 = resetdata.gr2;
                formData1.myud = resetdata.myu0;
                
                formData2 = new Object();
                formData2.email = email;
                formData2.cpi = resetdata.cpi;
                formData2.gr2 = resetdata.gr2;
                formData2.myud = resetdata.myu1;

                    $.ajax({
                        url : "http://" + window.primary + "/protocol/reset",
                        type: "POST",
                        data : formData1,
                        success: function(data){
                            if(data.message == "True"){
                                //$("success").append("<p> Password Updated Successfully</p>");
                            }
                            else{
                                $("#danger").append("<p>An error occured in Reset Server 0 Step 2 (Server)</p>");
                                $('#danger').show();
                            }
                        },
                        error: function (data){
                            $("#danger").append("<p>An error occured in Reset Server 0 Step 2 (Request)</p>");
                            $('#danger').show();
                        }
                    });

                    $.ajax({
                        url : "http://" + window.secondary + "/protocol/reset",
                        type: "POST",
                        data : formData2,
                        success: function(data){
                            if(data.message == "True"){
                                //$("success").append("<p> Password Updated Successfully</p>"); 
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
                    });
        });
        if($("#danger").text() == "")
            $("#success").empty().append("<p>Protocol Successful</p>").show();
        else
            $("#danger").show();
        $('#danger').hide();
    }
    else{
        $('#image').hide();
        $("<p>Passwords dont match.</p>").appendTo("#danger");
        $('#danger').show();
    }
});



$("#outsource").submit(function (e) {
    $('#danger').empty();
    $('#success').empty();

    e.preventDefault();
    $('#image1').show(); 
    var tag = $("#tag").val();
    var userdata = $("#data").val();
    var password = $("#password").val();
    var email =  $("#email").val();
    console.time('state');
    var state = states(password);
    console.timeEnd('state');
    var server0 = {};
    var server1 = {};
    formData = new Object();
    formData.email = $("#email").val();
    formData.a = state.A;
    $.when(
    $.ajax({
        url : "http://" + window.primary + "/protocol/state",
        type: "POST",
        data : formData,
        success: function(data){
            if(data.message == "Protocol Succeeded"){
                //$("success").append("<p> Outsource Server 0 Step 1 Succeeded</p>");
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
                //$("success").append("<p> Outsource Server 1 Step 1 Succeeded</p>");
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
                
                data = [];
                if(userdata){
                    data.push(userdata);
                }
                var FileData = new FormData();
                for(var i = 0; i < window.files.length; i++){
                    data.push(email + "," + window.files[i].name)
                    FileData.append('file', window.files[i], window.files[i].name);
                }
                //console.log(data);
                data.forEach(function(eachdata){
                    var count = 0;
                    formData = new Object();
                    formData.email = $("#email").val();
                    formData.a = state.A;
                    formData.smalla = state.a;
                    formData.server0 = server0;
                    formData.server1 = server1;
                    formData.tag = tag;
                    formData.data = eachdata;
                    console.time('outsource');
                    var outsource = outsourced(formData);
                    console.timeEnd('outsource');
                   // console.log(outsource);

                    if(outsource.result != "Tag 1 Verify Failed" && outsource.result != "Tag 2 Verify Failed"){
                        outsource.data.forEach(function(cipherdata){
                            formData = new Object();
                            formData.email = email;
                            formData.c = cipherdata.c;
                            formData.ix = outsource.ix;
                            formData.myuskd = cipherdata.myusk0;
                            formData.salt = outsource.salt0;
                            formData.isfile = "False";
                          //  console.log(formData);

                            $.ajax({
                                url : "http://" + window.primary + "/protocol/outsource",
                                type: "POST",
                                data : formData,
                                success: function(data){
                                    if(data.message == "True"){
                                        //$("success").append("<p> Outsource Server 0 Step 2 Succeeded</p>");
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
                            formData.c = cipherdata.c;
                            formData.ix = outsource.ix;
                            formData.myuskd = cipherdata.myusk1;
                            formData.salt = outsource.salt1;
                            formData.isfile = "False";

                            $.ajax({
                                url : "http://" + window.secondary + "/protocol/outsource",
                                type: "POST",
                                data : formData,
                                success: function(data){
                                    if(data.message == "True"){
                                        //$("success").append("<p> Outsource Server 1 Step 2 Succeeded</p>");         
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
                        if(count == 1)
                            $("#danger").append("Tag Verification Failed. Dont tryna cheat mate");
                        count++;
                        $('#danger').show();
                    }
                });
                FileData.append('email' , email);
                $.ajax({
                      url: "http://" + window.primary + "/protocol/upload",
                      type: 'POST',
                      data: FileData,
                      processData: false,
                      contentType: false,
                      success: function(data){
                          console.log('upload successful!');
                      }
                });
                $('#danger').hide();
                if($("#danger").text() == "")
                    $("#success").empty().append("<p>Protocol Successful</p>").show();
                else
                    $("#danger").show();
                //$('#success').show();
                $('#image1').hide();
    });
});

$("#retrieve").submit(function (e) {
    $('#databody tbody').empty();
    $('#danger').empty();
    $('#success').empty();

    e.preventDefault();
    $('#image2').show(); 
    var tag = $("#tag1").val();
    var password = $("#password").val();
    var email = $("#email").val();
    var count = 0;

    console.time('state');
    var state = states(password);
    console.log(state);
    console.timeEnd('state');
    var finalfuckingdata = new Object();
    var server0 = {};
    var server1 = {};
    formData = new Object();
    formData.email = $("#email").val();
    formData.a = state.A;
    $.when(
        $.ajax({
            url : "http://" + window.primary + "/protocol/state",
            type: "POST",
            data : formData,
            success: function(data){
                if(data.message == "Protocol Succeeded"){
                    ////$("success").append("<p> Retrieve Server 0 Step 1 Succeeded</p>");
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
                   // //$("success").append("<p> Retrieve Server 1 Step 1 Succeeded</p>");
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
        
        tag.split(",").forEach(function(tags){
            formData.smalla = state.a;
            formData.server0 = server0;
            formData.server1 = server1;
            
            formData.tag = tags;
            console.time('retrieveState1');
            var retrieve = retrieveState1(formData);
            console.timeEnd('retrieveState1');
           // console.log(retrieve);

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
                                    ////$("success").append("<p> Retrieve Server 0 Step 2 Succeeded</p>");
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
                                   // //$("success").append("<p> Retrieve Server 1 Step 2 Succeeded</p>"); 
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
                    //finalfuckingdata[tags] = ;
                    result.k = retrieve.k;
                    result.email = $("#email").val();
                    result.t = retrieve.t;
                    console.time('retrieveState2');
                    var final = retrieveState2(result);
                    //console.log(final);
                    console.timeEnd('retrieveState2');
                    for(var propName in final) {
                        if(final.hasOwnProperty(propName)) {
                            var propValue = final[propName];
                            if(propValue.split(",")[0] == email){
                                var name = propValue.replace(email + "," , "");
                                if(finalfuckingdata.hasOwnProperty(name)){
                                    finalfuckingdata[name].push(tags);
                                    finalfuckingdata[name].lengths++;

                                }
                                else{
                                    finalfuckingdata[name] = [tags];
                                    finalfuckingdata[name].lengths = 1;
                                    finalfuckingdata[name].data = "<a href='http://" + window.primary +"/protocol/download?file=" + name +"'>" + name.substring(0,15) + ".." + re.exec(name)[1] + "</a>";
                                }
                            }
                            else{
                                if(finalfuckingdata.hasOwnProperty(propValue)){
                                    finalfuckingdata[propValue].push(tags);
                                    finalfuckingdata[propValue].lengths++;
                                }
                                else{
                                    finalfuckingdata[propValue] = [tags];
                                    finalfuckingdata[propValue].lengths = 1;
                                    finalfuckingdata[propValue].data = propValue;
                                }
                            }
                        }
                    }
                    if(tag.split(",").pop() == tags){
                        console.log(finalfuckingdata);
                         update(finalfuckingdata);
                         console.log(finalfuckingdata);
                         $("#dataout").show();
                    }
                });
                   
            }
            else{
                if(count == 1)
                    $("#danger").append("Tag Verification Failed. Dont tryna cheat mate");
                count++;
                $('#danger').show();
                $('#image2').hide();
            }

        });

        if($("#danger").text() == "")
            $("#success").empty().append("<p>Protocol Successful</p>").show();
        else
            $("#danger").show();

         //$('#success').show();
        $('#image2').hide();        
    });
    
});