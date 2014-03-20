//START TESTS

//definitions

//Regular class
var Class1 = nature.create(function(pub, priv){

	priv.construct = function(){
		pub.args = arguments;
	}

	priv.test = {};
	pub.test = {};

	pub.pubTest = function(){
		return pub.test;
	}
	pub.privTest = function(){
		return priv.test;
	}
});

//2nd level class
var Class2 = nature.from(Class1).create(function(pub, priv){
	var superConstruct = priv.construct;
	priv.construct = function(){
		superConstruct.apply(priv, arguments);
		priv.abc = "abc";
	}
	var superPrivTest = pub.privTest;
	pub.privTest = function(){
		return typeof superPrivTest() == "object" && priv.abc=="abc";
	}
});

//3rd level class
var Class3 = nature.from(Class2).create(function(pub, priv){

	priv.extra = 3;

	var superPrivTest = pub.privTest;
	pub.privTest = function(){

		return superPrivTest() && priv.extra==3;

	}

});

//4th level class - w/ multiple inheretance
var Class4Extra = nature.create(function(pub, priv){
	priv.multipleExtra = 4;
})
var Class4 = nature.from(Class3, Class4Extra).create(function(pub, priv){

	pub.test4 = function(){
		return priv.extra == 3 && priv.multipleExtra==4;
	}

});


//Package tests
var pack = nature.createPackage();

var PackClass1 = pack.create(function(pub, priv){
	pub.setTestPack = function(a){
		priv.testPack = "test";
	}
});

var PackClass2 = pack.from(Class4).create(function(pub, priv, unfold){
	pub.testPack = function(obj){
		return unfold(obj).testPack==="test";
	}
});

pack.close();

//other package
var pack2 = nature.createPackage();

var Class5 = pack2.from(PackClass2).create(function(){})


//subpackage
var pack3 = pack.createPackage();

var Class6 = pack3.from(PackClass2).create(function(){})


//tests
var assertions = {};
function assert(topic, assertion){
	assertions[topic] = assertion;
}


//create pub
var a = new Class1("foo", "bar");
var b = new Class1();
assert("Create spawn", a instanceof Class1 && a.args[0]=="foo" && a.args[1]=="bar" && b!=a);

//test pub
assert("pub", a.test==a.pubTest() && b.test!=a.test);

//test priv
assert("priv", a.privTest()!=b.privTest());


//INHERETANCE
var c = new Class2("foo", "bar");
assert("Create inherited spawn", c instanceof Class2 && c.args[0]=="foo" && c.args[1]=="bar");

//test pub
assert("inherited pub", c.test==c.pubTest() && c.test!=a.test);

//test priv
assert("inherited priv", c.privTest() );


//2ND LEVEL INHERETANCE
var d = new Class3("foo", "bar");
assert("Create 2nd level inherited spawn", d instanceof Class3 && d.args[0]=="foo" && d.args[1]=="bar");

//test pub
assert("2nd level inherited pub", d.test==d.pubTest() && d.test!=c.test);

//test priv
assert("2nd level inherited priv", d.privTest());

//3RD LEVEL INHERETANCE
var e = new Class4("foo", "bar");
assert("level 3: Create multiple inherited spawn", e instanceof Class4 && e.args[0]=="foo" && e.args[1]=="bar");

//test pub
assert("level 3: inherited multiple pub", e.test==e.pubTest() && e.test!=c.test);

//test own methods - pub
assert("level 3: own pub", e.test4());


//PACKAGE TESTS
var f = new PackClass1();
f.setTestPack();
var g = new PackClass2();

//test cross private access
assert("package: cross private access", g.testPack(f));

//test package is locked
var passed = false;
try{
	pack.create(function(){}); //should throw an error
} catch(e){
	passed = e.message === "Nature.js: cannot create class on closed package.";
}
assert("package: successful lock", passed);

//out of package, no access
var h = new Class5();

//h can't access f priv
var passed = false;
try{
	h.testPack(f); //should throw an error
} catch(e){
	passed = e.message === "Nature.js: Private access from out of package denied.";
}
assert("package: child Class can't access parent's package", passed);

//g can't access h priv
var passed = false;
try{
	g.testPack(a); //should throw an error
} catch(e){
	passed = e.message === "Nature.js: Object package not found.";
}
assert("package: child Class does not belong to any package", passed);

//subpackage tests
var l = new Class6();
assert("subpackage: can access parent package", l.testPack(f));



//export to node.js
if(typeof module !== 'undefined' && module.exports){
	module.exports = assertions;
}