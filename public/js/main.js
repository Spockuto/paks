$.fn.allchange = function (callback) {
        var me = this;
        var last = "";
        var infunc = function () {
            var text = $(me).val();
            if (text != last) {
                last = text;
                callback();
            }
            setTimeout(infunc, 100);
        }
        setTimeout(infunc, 100);
    };


window.primary = "localhost:3000"
window.secondary = "localhost:8000"
//window.primary =  "eec95e52.ngrok.io"
//window.secondary = "47267495.ngrok.io"
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

$("#email").allchange(function () {
    $("#password").allchange(function () {
        if(allFilled()) {
            $('#outsourcebutton').removeAttr('disabled');
            $('#retrievebutton').removeAttr('disabled');
        }
    });
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

function update(finaldata){
    var count = 0;
    for (var key in finaldata) {
        if (finaldata.hasOwnProperty(key)) {
            var row = "<td> ";
            
            for(var i = 0 ; i < finaldata[key].lengths; i++){
                if(i != finaldata[key].lengths - 1)
                    row+=finaldata[key][i]+ ", ";
                else
                    row+=finaldata[key][i]+ "</td>";
            }
            $("#databody tbody").append("<tr><td>" + finaldata[key].data + "</td>" + row + "</tr>");
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
    
    $('#danger').empty().hide();
    $('#success').empty().hide();

    e.preventDefault();
    var form = $('#register');
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
                var t0 = performance.now();
                var protocol = register(password);
                var t1 = performance.now();
                $.get( "http://" + window.primary + "/protocol/log?state=" + "ClientRegister" + "&time=" +  String(t1 - t0));
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

    $('#danger').empty().hide();
    $('#success').empty().hide();
    $('#image').show();
    e.preventDefault();
    var form = $('#reset');
    var password = $("#passwordold").val();
    var email = $("#email").val();

    if($('#password').val() == $('#password2').val()){
        console.time('state');
        
        var t0 = performance.now();
        var state = states(password);
        var t1 = performance.now();

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
                    //$('#danger').show();
                     $('#image').hide();
                }
            },
            error: function (data){
                $("#danger").append("<p>An error occured in Outsource Server 0 Step 1 (Request)</p>");
                //$('#danger').show();
                $('#image').hide();
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
                    //$('#danger').show();
                    $('#image').hide();
                }
            },
            error: function (data){
                $("#danger").append("<p>An error occured in Outsource Server 1 Step 1 (Request)</p>");
                //$('#danger').show();
                $('#image').hide();
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
            var t2 = performance.now();
            var resetdata = reset(formData);
            var t3 = performance.now();
            $.get( "http://" + window.primary + "/protocol/log?state=" + "ClientReset" + "&time=" +  String(t1 - t0 + t3 - t2));
            console.log(resetdata);
            if(resetdata.result != "Tag 1 Verify Failed" && resetdata.result != "Tag 2 Verify Failed"){
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
                                //$('#danger').show();
                                $('#image').hide();
                            }
                        },
                        error: function (data){
                            $("#danger").append("<p>An error occured in Reset Server 0 Step 2 (Request)</p>");
                            //$('#danger').show();
                            $('#image').hide();
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
                                //$('#danger').show();
                                $('#image').hide();
                            }
                        },
                        error: function (data){
                            $("#danger").append("<p>An error occured in Retrieve Server 1 Step 2 (Request)</p>");
                            //$('#danger').show();
                            $('#image').hide();
                        }
                    });
            if($("#danger").text() == "")
                $("#success").empty().append("<p>Protocol Successful</p>").show();
            else
                $("#danger").empty().append("<p>Please check you credentials</p>").show();
            $('#image').hide();
        }
        else{
            $('#danger').show();
            $("#danger").empty().append("Tag Verification Failed. Either username or password is incorrect");
            $('#image').hide();
        }
    });
        $('#danger').hide();
        $('#image').hide();
    }
    else{
        $('#image').hide();
        $("<p>Passwords dont match.</p>").appendTo("#danger");
        $('#danger').show();
    }
});



$("#outsource").submit(function (e) {
     
    $('#danger').empty().hide();
    $('#success').empty().hide();

    e.preventDefault();
    $('#image1').show(); 
    var tag = $("#tag").val();
    var userdata = $("#data").val();
    var password = $("#password").val();
    var email =  $("#email").val();
    console.time('state');

    var t0 = performance.now();
    var state = states(password);
    var t1 = performance.now();

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
                formData = new Object();
                formData.email = $("#email").val();
                formData.a = state.A;
                formData.smalla = state.a;
                formData.server0 = server0;
                formData.server1 = server1;
                formData.tag = tag;
                formData.data = data;
                console.time('outsource');
                var outsource = outsourced(formData);
                var temp1 = t1 - t0 + outsource.key;
                var temp4 = 0;
                $.get( "http://" + window.primary + "/protocol/log?state=" + "ClientKeyGeneration" + "&time=" +  String(temp1));
                console.timeEnd('outsource');
                
                if(outsource.result != "Tag 1 Verify Failed" && outsource.result != "Tag 2 Verify Failed"){
                    outsource.outsource.forEach(function(outsourcedata){
                        outsourcedata.data.forEach(function(cipherdata){
                            formData = new Object();
                            formData.email = email;
                            formData.c = cipherdata.c;
                            formData.ix = outsourcedata.ix;
                            formData.myuskd = cipherdata.myusk0;
                            formData.salt = outsourcedata.salt0;
                            formData.ctr = cipherdata.ctr;
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
                            formData.ix = outsourcedata.ix;
                            formData.myuskd = cipherdata.myusk1;
                            formData.salt = outsourcedata.salt1;
                            formData.ctr = cipherdata.ctr;
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

                        var temp2  = outsourcedata.outsource;
                        var temp3 = temp1 + temp2;
                        temp4 = temp4 + outsourcedata.outsource;
                        $.get( "http://" + window.primary + "/protocol/log?state=" + "TotalClientOutsourcePerDataAllKeywords" + "&time=" +  String(temp3));
                        $.get( "http://" + window.primary + "/protocol/log?state=" + "ClientOutSourcePerDataAllKeywords" + "&time=" + String(temp2));
                    });
                }
                else{
                    $('#danger').show();
                    $("#danger").append("Tag Verification Failed. Either username or password is incorrect");
                }
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
                $.get( "http://" + window.primary + "/protocol/log?state=" + "TotalClientOutsourceAllDataAllKeywords" + "&time=" +  String(temp1 + temp4));
    });
});

$("#retrieve").submit(function (e) {

    $('#databody tbody').empty();
    $('#danger').empty().hide();
    $('#success').empty().hide();

    e.preventDefault();
    $('#image2').show(); 
    var tag = $("#tag1").val();
    var password = $("#password").val();
    var email = $("#email").val();
    var count = 0;

    console.time('state');
    
    var t0 = performance.now();
    var state = states(password);
    var t1 = performance.now();

    console.log(state);
    console.timeEnd('state');
    var finaldata = new Object();
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
        
        
        formData.smalla = state.a;
        formData.server0 = server0;
        formData.server1 = server1;
        formData.tag = tag.split(",");
        console.log(formData);
        console.time('retrieveState1');
        var retrieve = retrieveState1(formData);
        console.timeEnd('retrieveState1');
        console.log(retrieve);
        var temp1 = t1 - t0 + retrieve.key;
        var temp4 = 0;
        $.get( "http://" + window.primary + "/protocol/log?state=" + "ClientKeyGeneration" + "&time=" + String(temp1));
            
        if(retrieve.result != "Tag 1 Verify Failed" && retrieve.result != "Tag 2 Verify Failed"){
            retrieve.retrieve.forEach(function(retrievedata){
                var result = {};

                formData1 = new Object();
                formData1.email = email;
                formData1.t = retrievedata.t;
                formData1.myuskd = retrievedata.myusk0;
                formData1.salt = retrievedata.salt0;
                
                formData2 = new Object();
                formData2.email = email;
                formData2.t = retrievedata.t;
                formData2.myuskd = retrievedata.myusk1;
                formData2.salt = retrievedata.salt1;    
                    
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
                    //finaldata[tags] = ;
                    result.k = retrievedata.k;
                    result.email = $("#email").val();
                    result.t = retrievedata.t;
                    console.time('retrieveState2');

                    var t2 =  performance.now();
                    var final = retrieveState2(result);
                    var t3 = performance.now();
                    var temp2 = t3 - t2 + retrievedata.retrieve;
                    var temp3 = temp1 + temp2;
                    temp4 =  temp4 + temp2;
                    $.get( "http://" + window.primary + "/protocol/log?state=" + "ClientRetrievalPerKeywordAllData" + "&time=" + String(temp2));
                    $.get( "http://" + window.primary + "/protocol/log?state=" + "TotalClientRetrievalPerKeywordAllData" + "&time=" + String(temp3));

                    console.log(final);
                    var tags = retrievedata.tag;
                    console.timeEnd('retrieveState2');
                    for(var propName in final) {
                        if(final.hasOwnProperty(propName)) {
                            var propValue = final[propName];
                            if(propValue.split(",")[0] == email){
                                var name = propValue.replace(email + "," , "");
                                if(finaldata.hasOwnProperty(name)){
                                    finaldata[name].push(tags);
                                    finaldata[name].lengths++;

                                }
                                else{
                                    finaldata[name] = [tags];
                                    finaldata[name].lengths = 1;
                                    finaldata[name].data = "<a href='http://" + window.primary +"/protocol/download?file=" + name +"'>" + name.substring(0,15) + ".." + re.exec(name)[1] + "</a>";
                                }
                            }
                            else{
                                if(finaldata.hasOwnProperty(propValue)){
                                    finaldata[propValue].push(tags);
                                    finaldata[propValue].lengths++;
                                }
                                else{
                                    finaldata[propValue] = [tags];
                                    finaldata[propValue].lengths = 1;
                                    finaldata[propValue].data = propValue;
                                }
                            }
                        }
                    }
                    if(tag.split(",").pop() == tags){
                        console.log(finaldata);
                         update(finaldata);
                         console.log(finaldata);
                         $("#dataout").show();
                         $.get( "http://" + window.primary + "/protocol/log?state=" + "TotalClientRetrievalAllKeywordAllData" + "&time=" + String(temp1 + temp4));
                    }
                });
            });
        }
        else{
            $("#danger").append("Tag Verification Failed. Either Username or password is incorrect.");
            $('#danger').show();
            $('#image2').hide();
        }
        if($("#danger").text() == "")
            $("#success").empty().append("<p>Protocol Successful</p>").show();
        else
            $("#danger").show();

         //$('#success').show();
        $('#image2').hide(); 
               
    });
    
});