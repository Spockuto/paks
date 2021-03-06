var ecc = require('eccjs');
var q = ecc.sjcl.ecc.curves.c384.r;
var g = ecc.sjcl.ecc.curves.c384.G;
var h = new ecc.sjcl.ecc.point( 
		ecc.sjcl.ecc.curves.c384,
    	new ecc.sjcl.bn.prime.p384("0xe4f93e8f283d098b0707ccec9db5194d0d343242e13ca63a03f0572904313fd72bf8e01a00df32b59132193769486bae"),
    	new ecc.sjcl.bn.prime.p384("0xe987d92f49cfc2d9442f8b789b60e6849f36af19c3e620cd059c15753674adb77fbb3a2e5f3506980ede294706d29100")
);

var express = require('express');
var router = express.Router();
var Register = require('../models/register');
var Storage = require('../models/storage');
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var now = require("performance-now");

var logger = fs.createWriteStream('log.txt', {
  flags: 'a'
})

function ServerRetryStrategy(err, response, body){
  return err || !body;
}

var request = require('requestretry').defaults({ json: true, 
												 method: "POST", 
												 maxAttempts: 5,
												 retryStrategy: ServerRetryStrategy });

function Tag(key, string){
	var hmac = new ecc.sjcl.misc.hmac(ecc.sjcl.codec.hex.fromBits(key), ecc.sjcl.hash.sha256);
	return ecc.sjcl.codec.hex.fromBits(hmac.encrypt(string));
}

function Verify(key, string, encrypted) {
	var hmac = new ecc.sjcl.misc.hmac(ecc.sjcl.codec.hex.fromBits(key), ecc.sjcl.hash.sha256);
	if(String(ecc.sjcl.codec.hex.fromBits(hmac.encrypt(string))) == String(encrypted))
		return "True";
	else 
		return "False";	
}

function Point(string){
	return new ecc.sjcl.ecc.point( ecc.sjcl.ecc.curves.c384, 
		     new ecc.sjcl.bn.prime.p384(string.split(",")[0]),
		     new ecc.sjcl.bn.prime.p384(string.split(",")[1]));
}

function IV(email, ctr){
	return ecc.sjcl.hash.sha256.hash(email + String(ctr));
}

router.post('/register', function(req, res){
	var xd = req.body.xd;
	var gr1 = req.body.gr1;
	var gr2 = req.body.gr2;
	var cpi = req.body.cpi;
	var kd = req.body.kd;
	var mkd = req.body.mkd;
	var email = req.body.email;

	var newRegister = new Register({
			email : email,
			xd : xd,
			gr1 : gr1,
			gr2 : gr2,
			cpi : cpi,
			kd : kd,
			mkd : mkd
		});
		Register.RegisterUser(newRegister, function(err, register){
			if(err) {
				throw err;
				res.json({message : "False"});
			}
			console.log(register);
		});
		res.json({message : "True"});
});

router.post('/reset', function(req, res){
	console.time('reset');
	var email = req.body.email;
	var cpi = Point(req.body.cpi);
	var gr2 = Point(req.body.gr2);
	var myud = req.body.myud;
	Register.getRegisterByEmail(email, function(err, register){
   		if(err) throw err;
   		if(!register){
   			res.json({message : 'Unknown User'});
   		}
   		else{
   			var mkd =  register.mkd.split(",")[0];
   			if(Verify(ecc.sjcl.codec.hex.toBits(mkd),gr2.x.toLocaleString() + cpi.x.toLocaleString(), myud) == "True"){
   				var id = register._id;
   				var newRegister = new Register({
					_id : id,
					gr2 : req.body.gr2,
					cpi : req.body.cpi
				});
				Register.ResetUser(newRegister, function(err, register){
					if(err) {
						throw err;
						res.json({message : "False"});
					}
					console.timeEnd("reset");
					console.log(register);
				});
				res.json({message : "True"});
   			}
   			else{
   				console.timeEnd("reset");
				res.json({message : 'Tag Verification Failed'});
   			}
   		}
   	});
});

router.post('/state', function(req, res){
	console.time("state");

	var email = req.body.email;
	
	var t0 = now();
	var A = Point(req.body.a);
	var sd = new ecc.sjcl.bn.random(q, 10);
	var yd = new ecc.sjcl.bn.random(q, 10);
	var Yd = g.mult(yd);
	var t1 = now();

	Register.getRegisterByEmail(email, function(err, register){
   		if(err) throw err;
   		if(!register){
   			res.json({message : 'Unknown User'});
   		}
   		else{
   			var t2 = now();

   			var kd = Point(register.kd);
   			var gr1 = Point(register.gr1);
   			var gr2 = Point(register.gr2);
   			var cpi = Point(register.cpi);

   			var xd =  new ecc.sjcl.bn.prime.p384(register.xd);
   			var mkd =  register.mkd.split(",")[0];

			var Rd =  gr2.mult(yd);
			var hash = ecc.sjcl.codec.hex.fromBits(ecc.sjcl.hash.sha256.hash(Yd.x.toLocaleString() + Rd.x.toLocaleString()));
			var cd = g.mult2(sd , new ecc.sjcl.bn.prime.p384(hash) , h);
			
			var t3 = now();

			var success = myCache.set(register.gr1, cd.x.toLocaleString() + ',' + cd.y.toLocaleString());
			
			success = myCache.set(register.gr2, {
				yd :  Yd.x.toLocaleString() + ',' + Yd.y.toLocaleString(),
				rd :  Rd.x.toLocaleString() + ',' + Rd.y.toLocaleString(),
				sd :  sd.toLocaleString()
			});
			var c1d = yrs1d = {};
			request({	uri : "http://" + res.locals.secondary + "/protocol/cache",
						body: { 'key' : register.gr1 }},
    				  	function (error, response, body) {
        			   		if (!error && response.statusCode == 200) {
 								var c1d = Point(body);
 								request({ uri : "http://" + res.locals.secondary + "/protocol/cache",
								body: { 'key' : register.gr2}},
    							function (error, response, body) {
        							if (!error && response.statusCode == 200) {	
        								
        								var t4 = now();

        								var Y1d = Point(body.yd);
        								var R1d = Point(body.rd);
        								var s1d =  new ecc.sjcl.bn.prime.p384(body.sd);
        								var hash1d = ecc.sjcl.codec.hex.fromBits(ecc.sjcl.hash.sha256.hash(Y1d.x.toLocaleString() + R1d.x.toLocaleString()));
        								var c1dComputed = g.mult2(s1d , new ecc.sjcl.bn.prime.p384(hash1d) , h);
        								if(c1d.x.toLocaleString() == c1dComputed.x.toLocaleString() && c1d.y.toLocaleString() == c1dComputed.y.toLocaleString()){
        									var Y = Yd.toJac().add(Y1d).toAffine();
        									var R = Rd.toJac().add(R1d).toAffine();
        									var gr1R = gr1.toJac().add(R).toAffine();
        									var gr1Rxd = gr1R.mult(xd);
 											var gr1RInverse = Point(gr1Rxd.x.toLocaleString()  + "," + gr1Rxd.y.mul(-1).toLocaleString());
 											var AInverse = Point(A.x.toLocaleString()  + "," + A.y.mul(-1).toLocaleString());
 											var cpiAInverse = cpi.toJac().add(AInverse).toAffine();
 											var cpiAInverseyd = cpiAInverse.mult(yd);
 											var Zd = kd.toJac().add(cpiAInverseyd).add(gr1RInverse).toAffine();
 											var result = new Object();
 											if(req.body.reset == "True"){
 												var myud = Tag(ecc.sjcl.codec.hex.toBits(mkd), Y.x.toLocaleString() + Zd.x.toLocaleString() + 
 													gr2.x.toLocaleString() +  cpi.x.toLocaleString());
 												result.cpi = cpi.x.toLocaleString() + ',' + cpi.y.toLocaleString();
 												result.gr2 = gr2.x.toLocaleString() + ',' + gr2.y.toLocaleString();
 											}
 											else{
 												var myud = Tag(ecc.sjcl.codec.hex.toBits(mkd), A.x.toLocaleString() + Y.x.toLocaleString() + Zd.x.toLocaleString());
 											}

 											var t5 = now();
 											
 											logger.write("ServerKeyGeneration------" + String( t1 - t0 + t3 - t2 + t5 - t4) +"\n");
 											myCache.set(email + "key", {time : t1 - t0 + t3 - t2 + t5 - t4 });
											result.myud = myud;
											result.y = Y.x.toLocaleString() + ',' + Y.y.toLocaleString();
											result.zd = Zd.x.toLocaleString() + ',' + Zd.y.toLocaleString();
											result.salt = register.mkd.split(",")[1];
											console.timeEnd("state");
											res.json({message :'Protocol Succeeded',
													  result : result});

											success = myCache.set(mkd,{
													A : req.body.a,
													Y : result.y
											});

        								}	
        								else{
        									console.timeEnd("state");
        									res.json({message :'Protocol Failed'});
        								}
        							}
								});
 							}	
 						});			
   			}
	});

});	

router.post('/outsource', function(req, res){
	console.time("outsource");
	var t0 = now();
	var C = req.body.c;
	var ix = req.body.ix;
	var myuskd = req.body.myuskd;
	var salt = req.body.salt;
	var email = req.body.email;
	var ctr = req.body.ctr;

	Register.getRegisterByEmail(email, function(err, register){
   		if(err) throw err;
   		if(!register){

   			res.json({message : 'Unknown User'});
   			console.timeEnd("outsource");
   		}
   		else{
   			var mkd =  register.mkd.split(",")[0];
   			var cache = myCache.get(mkd);
   			var A = Point(cache.A);
   			var Y = Point(cache.Y);
   			var skd = ecc.sjcl.misc.pbkdf2(mkd + A.x.toLocaleString() + Y.x.toLocaleString() + "2" , ecc.sjcl.codec.hex.toBits(salt));
   			if(Verify(skd, C + ix, myuskd) == "True"){
   				var t1 = now();
   				if(myCache.get(email + "outsource"))
   					var cache = myCache.set(email + "outsource", {time : t1 - t0 + myCache.get(email + "outsource").time});
   				else
   					var cache = myCache.set(email + "outsource", {time : t1 - t0});

   				logger.write("ServerOutSourcePerKeywordPerData------" + String(t1 - t0) +"\n");
   				logger.write("AdditiveServerOutSourcePerKeywordPerData------" + String(myCache.get(email + "outsource").time) +"\n");
   				logger.write("TotalAdditiveServerOutSourcePerKeywordPerData------" + String(myCache.get(email + "outsource").time + myCache.get(email + "key").time) +"\n");
   				var newStorage = new Storage({
					email : email,
					c : C,
					ix : ix,
					ctr : ctr	
				});
				Storage.StorageUser(newStorage, function(err, register){
					if(err) {
						throw err;
						console.timeEnd("outsource");
						res.json({message : "Storage Failed"});
					}
					console.log(register);
					console.timeEnd("outsource");
				});
				res.json({message : "True"});
			}
			else{
				console.timeEnd("outsource");
				res.json({message : 'Tag Verification Failed'});
			}
   		}
   	});
});


router.post('/retrieve', function(req, res){
	console.time("retrieve");

	var t0 = now();
	
	var t = req.body.t;
	var myuskd = req.body.myuskd;
	var salt = req.body.salt;
	var email = req.body.email;

	Register.getRegisterByEmail(email, function(err, register){
   		if(err) throw err;
   		if(!register){
   			console.timeEnd("retrieve");
   			res.json({message : 'Unknown User'});
   		}
   		else{
   			var mkd =  register.mkd.split(",")[0];
   			var cache = myCache.get(mkd);
   			var A = Point(cache.A);
   			var Y = Point(cache.Y);
   			var skd = ecc.sjcl.misc.pbkdf2(mkd + A.x.toLocaleString() + Y.x.toLocaleString() + "2" , ecc.sjcl.codec.hex.toBits(salt));
   			if(Verify(skd, t, myuskd) == "True"){
				Storage.getStorageByEmail(email, function(err, register){
					if(err) throw err;
					if(!register){
						console.timeEnd("retrieve");
   						res.json({message : 'Unknown User'});
   					}
   					result = [];
   					register.forEach(function(index){
   						var C = index.c.split(",");
   						var prp = new ecc.sjcl.cipher.aes(ecc.sjcl.codec.hex.toBits(t));
						var v =  ecc.sjcl.codec.hex.fromBits(ecc.sjcl.mode.gcm.encrypt(prp, ecc.sjcl.codec.hex.toBits(C[0]), IV(email, index.ctr))).substring(0,64);
						if( v == C[1]){
							result.push({c : index.c, ix : index.ix, ctr : index.ctr});
						}     
                    });
                    var t1 = now();
                    if(myCache.get(email + "retrieve"))
   						var cache = myCache.set(email + "retrieve", {time : t1 - t0 + myCache.get(email + "retrieve").time});
   					else
   						var cache = myCache.set(email + "retrieve", {time : t1 - t0});
   					logger.write("ServerRetrievePerKeywordAllData------" + String(t1 - t0) +"\n");
   					logger.write("AdditiveServerRetrievePerKeywordAllData------" + String(myCache.get(email + "retrieve").time) +"\n");
   					logger.write("TotalAdditiveServerRetrievePerKeywordAllData------" + String(myCache.get(email + "retrieve").time + myCache.get(email + "key").time) +"\n");
                    console.timeEnd("retrieve");
					res.json({message : "True", result : result});
				});
				
			}
			else{
				console.timeEnd("retrieve");
				res.json({message : 'Tag Verification Failed'});
			}
   		}
   	});
});

router.post('/cache', function(req, res){
	res.json(myCache.get(req.body.key));
});

router.post('/upload', function(req, res){
  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.uploadDir = path.join(__dirname, '/uploads');
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });
  form.on('end', function() {
    res.end('success');
  });
  form.parse(req);
});

router.get('/download', function(req, res){
  var file = __dirname + '/uploads/'+ req.query.file;
  res.download(file);
});

router.get('/log', function(req, res){
	logger.write(req.query.state + "------" + req.query.time +"\n");
	res.json({});
})

module.exports = router;