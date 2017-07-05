var q = ecc.sjcl.ecc.curves.c384.r;
var g = ecc.sjcl.ecc.curves.c384.G;
/*var h = new ecc.sjcl.ecc.point( 
		ecc.sjcl.ecc.curves.c384,
    	new ecc.sjcl.bn.prime.p384("0xe4f93e8f283d098b0707ccec9db5194d0d343242e13ca63a03f0572904313fd72bf8e01a00df32b59132193769486bae"),
    	new ecc.sjcl.bn.prime.p384("0xe987d92f49cfc2d9442f8b789b60e6849f36af19c3e620cd059c15753674adb77fbb3a2e5f3506980ede294706d29100")
);*/
var h = g.mult(2); 

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

function toHex(str) {
	var hex = '';
	for(var i=0;i<str.length;i++) {
		hex += ''+str.charCodeAt(i).toString(16);
	}
	return "0x" + hex;
}

function register(password){

	//r1,r2,x0,x1 <- Zq*
	var r1 = new ecc.sjcl.bn.random(q, 10);
	var gr1 = g.mult(r1);
	var r2 = new ecc.sjcl.bn.random(q, 10);
	var gr2 = g.mult(r2);
	var x0 = new ecc.sjcl.bn.random(q, 10);
	var x1 = new ecc.sjcl.bn.random(q, 10);

	//k,k0 <- G
	var random = ecc.sjcl.random.randomWords(2,10);
	var k = g.mult(new ecc.sjcl.bn.prime.p384(random[0]));
	var k0 = g.mult(new ecc.sjcl.bn.prime.p384(random[1]));

	while(!k.isValid() || !k0.isValid()){
		random = ecc.sjcl.random.randomWords(2,10);
		k = g.mult(new ecc.sjcl.bn.prime.p384(random[0]));
		k0 = g.mult(new ecc.sjcl.bn.prime.p384(random[1]));
	}

	var x = g.mult(x0.add(x1));
	var xr1 = x.mult(r1);
	var k0Inverse = Point(k0.x.toLocaleString()  + "," + k0.y.mul(-1).toLocaleString());
	var k1 = xr1.toJac().add(k).add(k0Inverse).toAffine();
	var cpi = x.mult2(r2, new ecc.sjcl.bn.prime.p384(toHex(password)), h);

	//unsure about this part
	var mk0 = ecc.sjcl.misc.cachedPbkdf2(k.x.toLocaleString() + "server0" + "1");
	var mk1 = ecc.sjcl.misc.cachedPbkdf2(k.x.toLocaleString() + "server1" + "1");

	var result = new Object();
	result.x0 = x0.toLocaleString();
	result.x1 = x1.toLocaleString();
	result.gr1 = gr1.x.toLocaleString() + ',' + gr1.y.toLocaleString();
	result.gr2 = gr2.x.toLocaleString() + ',' + gr2.y.toLocaleString();
	result.cpi = cpi.x.toLocaleString() + ',' + cpi.y.toLocaleString();
	result.k0 = k0.x.toLocaleString() + ',' + k0.y.toLocaleString();
	result.k1 = k1.x.toLocaleString() + ',' + k1.y.toLocaleString();
	result.mk0 = ecc.sjcl.codec.hex.fromBits(mk0.key) + "," + ecc.sjcl.codec.hex.fromBits(mk0.salt);
	result.mk1 = ecc.sjcl.codec.hex.fromBits(mk1.key) + "," + ecc.sjcl.codec.hex.fromBits(mk1.salt);
	return result;
}

function states(password){
	var a = new ecc.sjcl.bn.random(q, 10);
	var A = g.mult2(a, new ecc.sjcl.bn.prime.p384(toHex(password)), h);
	var result = new Object();
	result.a = a.toLocaleString();
	result.A = A.x.toLocaleString() + ',' + A.y.toLocaleString();
	return result;
}

function outsourced(data){
	var e = new ecc.sjcl.bn.random(ecc.sjcl.ecc.curves.c256.r, 10);
	var Y = Point(data.server0.y);
	var Z0 = Point(data.server0.zd);
	var Z1 = Point(data.server1.zd);
	var myu0 = data.server0.myud;
	var myu1 = data.server1.myud;
	var A = Point(data.a);
	var words  = data.tag.split(',');
	var email = data.email;
	var ix = data.data;

	var Ya = Y.mult(new ecc.sjcl.bn.prime.p384(data.smalla));
	var K = Z0.toJac().add(Z1).add(Ya).toAffine();
	var mk0 = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + "server0" + "1", ecc.sjcl.codec.hex.toBits(data.server0.salt));
	var mk1 = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + "server1" + "1", ecc.sjcl.codec.hex.toBits(data.server1.salt));
	if(Verify(mk0, A.x.toLocaleString()  + Y.x.toLocaleString() + Z0.x.toLocaleString(), myu0) == "True"){
		if(Verify(mk1, A.x.toLocaleString() + Y.x.toLocaleString() + Z1.x.toLocaleString(), myu1) == "True"){

			var mku = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + email + "0" , email);
			var sk0 = ecc.sjcl.misc.cachedPbkdf2(ecc.sjcl.codec.hex.fromBits(mk0) + A.x.toLocaleString() + Y.x.toLocaleString() + "2");
			var sk1 = ecc.sjcl.misc.cachedPbkdf2(ecc.sjcl.codec.hex.fromBits(mk1) + A.x.toLocaleString() + Y.x.toLocaleString() + "2");

			var cipherdata = []
			words.forEach(function(word){
				var t = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + word, word);
				var prp = new ecc.sjcl.cipher.aes(t);
				var v =  ecc.sjcl.codec.hex.fromBits(ecc.sjcl.mode.gcm.encrypt(prp, e.toBits(), "")).substring(0,64);			
				var myuc = Tag(mku, e.toLocaleString() + v + ix);
				var C = e.toLocaleString() + "," + v + "," + myuc;
				var myusk0 = Tag(sk0.key, C + ix);
				var myusk1 = Tag(sk1.key, C + ix);

				var result =  new Object();
 				result.myusk0 = myusk0;
				result.myusk1 = myusk1;
				result.c  = C; 
				cipherdata.push(result);
			});		
			var result =  new Object();		
			result.salt0 = ecc.sjcl.codec.hex.fromBits(sk0.salt);
			result.salt1 = ecc.sjcl.codec.hex.fromBits(sk1.salt);
			result.ix = ix;
			result.data = cipherdata;
			return result;
		}
		else{
			return {result : "Tag 1 Verify Failed"};
		}
	}
	else{
		return {result : "Tag 2 Verify Failed"};
	}
}

function retrieveState1(data){
	var e = new ecc.sjcl.bn.random(ecc.sjcl.ecc.curves.c256.r, 10);
	var Y = Point(data.server0.y);
	var Z0 = Point(data.server0.zd);
	var Z1 = Point(data.server1.zd);
	var myu0 = data.server0.myud;
	var myu1 = data.server1.myud;
	var A = Point(data.a);
	var word  = data.tag;
	var email = data.email;

	var Ya = Y.mult(new ecc.sjcl.bn.prime.p384(data.smalla));
	var K = Z0.toJac().add(Z1).add(Ya).toAffine();
	var mk0 = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + "server0" + "1", ecc.sjcl.codec.hex.toBits(data.server0.salt));
	var mk1 = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + "server1" + "1", ecc.sjcl.codec.hex.toBits(data.server1.salt));

	if(Verify(mk0, A.x.toLocaleString()  + Y.x.toLocaleString() + Z0.x.toLocaleString(), myu0) == "True"){
		if(Verify(mk1, A.x.toLocaleString() + Y.x.toLocaleString() + Z1.x.toLocaleString(), myu1) == "True"){
				var t = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + word, word);
				var sk0 = ecc.sjcl.misc.cachedPbkdf2(ecc.sjcl.codec.hex.fromBits(mk0) + A.x.toLocaleString() + Y.x.toLocaleString() + "2");
				var sk1 = ecc.sjcl.misc.cachedPbkdf2(ecc.sjcl.codec.hex.fromBits(mk1) + A.x.toLocaleString() + Y.x.toLocaleString() + "2");
				var myusk0 = Tag(sk0.key, ecc.sjcl.codec.hex.fromBits(t));
				var myusk1 = Tag(sk1.key, ecc.sjcl.codec.hex.fromBits(t));
				var result =  new Object();
				result.t = ecc.sjcl.codec.hex.fromBits(t);
 				result.myusk0 = myusk0;
				result.myusk1 = myusk1;
				result.salt0 = ecc.sjcl.codec.hex.fromBits(sk0.salt);
				result.salt1 = ecc.sjcl.codec.hex.fromBits(sk1.salt);
				result.k = K.x.toLocaleString() + "," + K.y.toLocaleString();
				return result;
		}
		else{
			return {result : "Tag 1 Verify Failed"};
		}
	}
	else{
		return {result : "Tag 2 Verify Failed"};
	}

}

function retrieveState2(data){	
	var server0 = data.server0;
	var server1 = data.server1;
	var K = Point(data.k);
	var t = data.t;

	var mku = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + data.email + "0" , data.email);
	var result = {};
	var prp, C, v;

	server0.forEach(function(index){
		C = index.c.split(",");
		prp = new ecc.sjcl.cipher.aes(ecc.sjcl.codec.hex.toBits(t));
		v =  ecc.sjcl.codec.hex.fromBits(ecc.sjcl.mode.gcm.encrypt(prp, ecc.sjcl.codec.hex.toBits(C[0]), "")).substring(0,64);

		if(v == C[1] && Verify(mku, C[0] + v + index.ix, C[2]) == "True" ){
			if(result[C[0]]){	
				result[C[0]]+=index.ix;
			}
			else{
				result[C[0]] = index.ix;
			}
		}
	});

	server1.forEach(function(index){
		C = index.c.split(",");
		prp = new ecc.sjcl.cipher.aes(ecc.sjcl.codec.hex.toBits(t));
		v =  ecc.sjcl.codec.hex.fromBits(ecc.sjcl.mode.gcm.encrypt(prp, ecc.sjcl.codec.hex.toBits(C[0]), "")).substring(0,64);

		if(v == C[1] && Verify(mku, C[0] + v + index.ix, C[2]) == "True" ){
			if(!result[C[0]]){	
				result[C[0]] = index.ix;			
			}
		}
	});
	return result;
}

function reset(data){
	var Y = Point(data.server0.y);
	var cpi = Point(data.server0.cpi);
	var gr2 = Point(data.server0.gr2);

	var Z0 = Point(data.server0.zd);
	var Z1 = Point(data.server1.zd);
	var myu0 = data.server0.myud;
	var myu1 = data.server1.myud;
	var email = data.email;
	var oldpassword = data.oldpassword;
	var newpassword = data.newpassword;

	var Ya = Y.mult(new ecc.sjcl.bn.prime.p384(data.smalla));
	var K = Z0.toJac().add(Z1).add(Ya).toAffine();
	var mk0 = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + "server0" + "1", ecc.sjcl.codec.hex.toBits(data.server0.salt));
	var mk1 = ecc.sjcl.misc.pbkdf2(K.x.toLocaleString() + "server1" + "1", ecc.sjcl.codec.hex.toBits(data.server1.salt));

	if(Verify(mk0, Y.x.toLocaleString() + Z0.x.toLocaleString() + gr2.x.toLocaleString() + cpi.x.toLocaleString(), myu0) == "True"){
		if(Verify(mk1, Y.x.toLocaleString() + Z1.x.toLocaleString()+ gr2.x.toLocaleString() + cpi.x.toLocaleString(), myu1) == "True"){
			var rstar = new ecc.sjcl.bn.random(q, 10);
			var hInverse =  Point(h.x.toLocaleString()  + "," + h.y.mul(-1).toLocaleString());
			var hInversePI = hInverse.mult(new ecc.sjcl.bn.prime.p384(toHex(oldpassword)));
			var cpihInversePI = hInversePI.toJac().add(cpi).toAffine();
			var cpistar = cpihInversePI.mult2(rstar, new ecc.sjcl.bn.prime.p384(toHex(newpassword)), h);
			var gr2star = gr2.mult(rstar);
			var myu0 = Tag(mk0, gr2star.x.toLocaleString() + cpistar.x.toLocaleString());
			var myu1 = Tag(mk1, gr2star.x.toLocaleString() + cpistar.x.toLocaleString());
			var result =  new Object();
 			result.myu0 = myu0;
			result.myu1 = myu1;
			result.cpi = cpistar.x.toLocaleString() + "," + cpistar.y.toLocaleString();
			result.gr2 = gr2star.x.toLocaleString() + "," + gr2star.y.toLocaleString();
			return result;
		}
		else{
			return {result : "Tag 1 Verify Failed"};
		}
	}
	else{
		return {result : "Tag 2 Verify Failed"};
	}
}