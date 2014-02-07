//START TESTS

//definitions
var object1 = nature.spawn(function(body, soul){
	soul.test = function(){
		return body.token;
	}
	body.token = {};
	body.test = function(){
		return soul.test();
	}
});

var Class1 = nature.species(function(kind, bond){

	bond.test = {};
	kind.test = {};

	this.spawn(function(body, soul){

		soul.birth = function(){
			body.args = arguments;
		}

		soul.test = {};
		body.test = {};

		body.kindTest = function(){
			return kind.test;
		}
		body.bodyTest = function(){
			return body.test;
		}
		body.bondTest = function(){
			return bond.test;
		}
		body.soulTest = function(){
			return soul.test;
		}
	});

});

var Class2 = nature.species(function(){
	this.spawn(function(body, soul){
		var superBirth = soul.birth;
		soul.birth = function(){
			superBirth.apply(soul, arguments);
			soul.abc = "abc";
		}
		var superSoulTest = body.soulTest;
		body.soulTest = function(){
			return {s:superSoulTest(), c:soul.abc};
		}
	});
}, Class1);

var Class3 = nature.species(function(){
	this.spawn(function(body, soul){

		soul.extra = 3;

		var superSoulTest = body.soulTest;
		body.soulTest = function(){
			var result = superSoulTest();
			result.e = soul.extra;
			return result;
		}

	});
}, Class2, Class1);

var Class4 = nature.species(function(kind, bond){

	bond.test4 = true;
	kind.test4 = function(){
		return bond.test4;
	}

	this.spawn(function(body, soul){

		body.test4 = function(){
			return soul.extra == 3;
		}

	});

}, Class3);




//tests
var assertions = {};
function assert(topic, assertion){
	assertions[topic] = assertion;
}

//check object
assert("Object mode", object1.test()==object1.token);

//create body
var a = new Class1("foo", "bar");
var b = new Class1();
assert("Create spawn", a instanceof Class1 && a.args[0]=="foo" && a.args[1]=="bar" && b!=a);

//test kind
assert("kind", Class1.test==a.kindTest());

//test bond
assert("bond", a.bondTest()==b.bondTest());

//test body
assert("body", a.test==a.bodyTest() && b.test!=a.test);

//test soul
assert("soul", a.soulTest()!=b.soulTest());


//INHERETANCE
var c = new Class2("foo", "bar");
assert("Create inherited spawn", c instanceof Class2 && c.args[0]=="foo" && c.args[1]=="bar");

//test kind
Class2.test="aaa"
assert("inherited kind", Class2.test==c.kindTest() && Class2.test!=Class1.test);

//test bond
assert("inherited bond", a.bondTest()!=c.bondTest());

//test body
assert("inherited body", c.test==c.bodyTest() && c.test!=a.test);

//test soul
var cTest = c.soulTest();
assert("inherited soul", typeof cTest.s == "object" && cTest.c=="abc");


//MULTIPLE INHERETANCE
var d = new Class3("foo", "bar");
assert("Create multiple inherited spawn", d instanceof Class3 && d.args[0]=="foo" && d.args[1]=="bar");

//test kind
Class3.test="aaaa";
assert("inherited multiple kind", Class3.test==d.kindTest() && Class3.test!=Class1.test);

//test bond
assert("inherited multiple bond", c.bondTest()!=d.bondTest());

//test body
assert("inherited multiple body", d.test==d.bodyTest() && d.test!=c.test);

//test soul
var dTest = d.soulTest();
assert("inherited multiple soul", typeof dTest.s == "object" && dTest.c=="abc" && dTest.e==3);

//3rd level inheratance
var e = new Class4("foo", "bar");
assert("level 3: Create multiple inherited spawn", e instanceof Class4 && e.args[0]=="foo" && e.args[1]=="bar");

//test kind
Class4.test="aaaa";
assert("level 3: inherited multiple kind", Class4.test==e.kindTest() && Class4.test!=Class1.test);

//test body
assert("level 3: inherited multiple body", e.test==e.bodyTest() && e.test!=c.test);

//test own methods - kind
assert("level 3: own kind", Class4.test4());

//test own methods - body
assert("level 3: own body", e.test4());



//export to node.js
if(typeof module !== 'undefined' && module.exports){
	module.exports = assertions;
}