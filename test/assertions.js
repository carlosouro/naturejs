//START TESTS
var vm = require('vm');
var fs = require('fs');
var path = require("path");
var assert = require('assert');

//blanket to test nature.js file coverage
if(process.env.YOURPACKAGE_COVERAGE) require('blanket')({"data-cover-only":'src/nature.js'});

describe('nature.js', function(){

	var nature;

	it('has no syntax errors',function(done){
		 nature = require('../src/nature.js');
		 done();
	});

	it('loads in a zero globals environment (browser safe)', function(done){
		fs.readFile(path.join(__dirname, '../src/nature.js'), {encoding:'utf8'}, function(err, data){
			if(err) throw err;
			var ret = vm.runInNewContext('"use strict";'+data+';nature;', {}, 'nature.evaluated.js');
			var checkConsistency = true, el;
			for(el in nature){
				if(typeof nature[el] !== typeof ret[el]){
					checkConsistency = false;
					break;
				}
			}
			assert(checkConsistency, 'evaluated object not consistent');
			done();
		})

	});


	//Class variables needed for the tests
	var Class1,Factory1,Class2,Class3,MultipleIh3rdExtra,Factory2,pack,PackClass1,PackFactory1,pack2,Factory3,pack3,Class6;
	var test1ClassFunction;

	//instances used in the tests
	var a,b,c,d,e,f,g,l,m,n;

	describe('basics', function(){

		it('#create(Class1) spawns a new class', function(){

			test1ClassFunction = function(pub, prot){

				prot.construct = function(){
					pub.args = arguments;
				}

				prot.scope = function(){
					return pub;
				}

				prot.test = {};
				pub.test = {};

				pub.pubTest = function(){
					return pub.test;
				}

				pub.pubTestWithArgs = function(args) {
					console.log(args);
					return undefined;
				}


				pub.privTest = function(){
					return prot.test;
				}
			}
			//Regular class
			Class1 = nature.create(test1ClassFunction);

			a = new Class1("foo", "bar");
			b = new Class1();

			assert(a instanceof Class1, "instanceof");
			assert(a.args[0]=="foo", "constructor argument 1");
			assert(a.args[1]=="bar", "constructor argument 2");
			assert(b!=a, "2 instances are not the same");
			assert(typeof b.args[0] === 'undefined', "undefined arguments");
		})

		it('instance has consistent public variables', function(){
			//test pub
			assert(a.test==a.pubTest() && b.test!=a.test, "public properties");
		})

		it('instance has consistent private variables', function(){
			//test pub
			assert(a.privTest()!=b.privTest(), "private properties");
		})

	})

	describe('factories', function(){

		it('#factory(Factory1) spawns a new factory', function(){

			//Regular class
			Factory1 = nature.factory(test1ClassFunction);

			l = Factory1("foo", "bar");
			m = Factory1();

			assert(typeof l === "function", "instance is a function");
			assert(l.args[0]=="foo", "constructor argument 1");
			assert(l.args[1]=="bar", "constructor argument 2");
			assert(m!=l, "2 instances are not the same");
			assert(typeof m.args[0] === 'undefined', "undefined arguments");
		})

		it('instance has consistent public variables', function(){
			//test pub
			assert(l.test==l.pubTest() && m.test!=l.test, "public properties");
		})

		it('instance has consistent private variables', function(){
			//test pub
			assert(l.privTest()!=m.privTest(), "private properties");
		})

		it('instance() is prot.scope()', function(){
			//test pub
			console.log("test: ", l(), l)
			assert(l()===l, "prot.scope()===pub");
		})
	})

	describe('inheretance (1st level)', function(){

		it('#from(Factory1).create(Class2) spawns inhereted class',function(){

			//2nd level class
			Class2 = nature.from(Factory1).create(function(pub, prot){
				var superConstruct = prot.construct;
				prot.construct = function(){
					superConstruct.apply(prot, arguments);
					prot.abc = "abc";
				}
				var superPrivTest = pub.privTest;
				pub.privTest = function(){
					return typeof superPrivTest() == "object" && prot.abc=="abc";
				}
			});

			c = new Class2("foo", "bar");
			assert(c instanceof Class2 && c.args[0]=="foo" && c.args[1]=="bar", "consistent inherited spawn");
		})

		it('instance inherits public scope', function(){
			assert(c.test==c.pubTest() && c.test!=a.test, "consistent inherited public scope");
		})

		it('instance inherits private scope', function(){
			assert(c.privTest(), "consistent inherited private scope");
		})
	})

	describe('inheretance (2nd level)', function(){

		it('#from(Class2).create(Class3) spawns inherited class (2nd level)',function(){

			//3rd level class
			Class3 = nature.from(Class2).create(function(pub, prot){

				prot.extra = 3;

				var superPrivTest = pub.privTest;
				pub.privTest = function(){

					return superPrivTest() && prot.extra==3;

				}

			});

			d = new Class3("foo", "bar");
			assert(d instanceof Class3 && d.args[0]=="foo" && d.args[1]=="bar", "consistent inherited spawn");
		})

		it('instance inherits public scope', function(){
			assert(d.test==d.pubTest() && d.test!=c.test, "consistent inherited public scope");
		})

		it('instance inherits private scope', function(){
			assert(d.privTest(), "consistent inherited private scope");
		})
	})

	describe('multiple inheretance (3rd level)', function(){

		it('#from(Class3, OtherClass).factory(Factory2) spawns multiple inhereted factory (3rd level)',function(){

			//4th level class - w/ multiple inheretance
			MultipleIh3rdExtra = nature.create(function(pub, prot){
				prot.multipleExtra = 4;
			})
			Factory2 = nature.from(Class3, MultipleIh3rdExtra).factory(function(pub, prot){

				pub.test4 = function(){
					return prot.extra == 3 && prot.multipleExtra==4;
				}

			});

			e = Factory2("foo", "bar");
			assert(typeof e === "function" && e.args[0]=="foo" && e.args[1]=="bar", "consistent multiple inherited spawn");
		})

		it('instance inherits public scope', function(){
			assert(e.test==e.pubTest() && e.test!=c.test, "consistent inherited public scope");
		})

		it("instance inherits from multiple classes",function(){
			assert(e.test4(), "consistent multiple inheritance");
		});

		it('instance inherits private scope', function(){
			assert(e.privTest(), "consistent inherited private scope");
		})

		it('instance() is prot.scope()', function(){
			//test pub
			assert(e()===e, "prot.scope()===pub");
		})
	})

	describe('packages',function(){
		it('#createPackage().create() spawns pack classes - pack.from(Factory2).create(PC1)', function(){
			//PACKAGE TESTS
			pack = nature.createPackage();

			PackClass1 = pack.create(function(pub, prot){
				pub.setTestPack = function(a){
					prot.testPack = "test";
				}
			});

			PackFactory1 = pack.from(Factory2).factory(function(pub, prot, unfold){

				prot.scope = function(){
					return 5;
				};

				pub.testPack = function(obj){
					return unfold(obj).testPack==="test";
				}
			});

			f = new PackClass1();
			g = PackFactory1();
		})

		it('instance allows for cross-private access within package instances', function(){
			f.setTestPack();
			assert(g.testPack(f), "cross-private access");
		})

		it('package.close() correctly locks .create()', function(){

			pack.close();

			//test package is locked
			var passed = false;
			try{
				pack.create(function(){}); //should throw an error
			} catch(e){
				passed = e.message === "Nature.js: cannot create class on closed package.";
			}
			assert(passed, "successful lock error");
		})

		it('package.close() correctly locks from().create()', function(){

			pack.close();

			//test package is locked
			var passed = false;
			try{
				pack.from(Class1).create(function(){}); //should throw an error
			} catch(e){
				passed = e.message === "Nature.js: cannot create class on closed package.";
			}
			assert(passed, "successful lock error");
		})

		it("instance does not allow any cross-private access from instances from classes unrelated to the package", function(){
			//g can't access h priv
			var passed = false;
			try{
				g.testPack(a); //should throw an error
			} catch(e){
				passed = e.message === "Nature.js: Object package not found.";
			}
			assert(passed, "package: child Class does not belong to any package");
		})

		it("#from(PackageClass).create() instance, through it's parent methods, allows for cross-private access with instances from classes inhereted from the package", function(){

			pack2 = nature.createPackage();

			Factory3 = pack2.from(PackFactory1).factory(function(pub, prot, unfold){

				delete prot.scope;

				pub.testPack2 = function(obj){
					return unfold(obj).testPack==="test";
				}
			})

			h = Factory3();
			assert(h.testPack(f), "child Class inherited package methods private package access");
		})

		it("instance does not allow for cross-private access with instances from classes inhereted from the package in overriden/new methods", function(){
			//h can't access f priv in it's own methods
			var passed = false;
			try{
				h.testPack2(f); //should throw an error
			} catch(e){
				passed = e.message === "Nature.js: Private access from out of package denied.";
			}
			assert(passed, "child Class no access to parent package objects in it's own methods");
		})

		it("overriding prot.scope works", function(){
			//h can't access f priv in it's own methods
			assert(g() === 5, "g() should be 5");
		})

		it("delete prot.scope; works", function(){
			//h can't access f priv in it's own methods
			assert(typeof h() === 'undefined', "h() should return undefined");
		})

	})

	describe('package inheretance',function(){

		it('pack.createPackage().create() spawns instances', function(){

			//subpackage of pack1
			pack3 = pack.createPackage();

			Class6 = pack3.from(PackFactory1).create(function(pub, prot, unfold){
				pub.testPack2 = function(obj){
					return unfold(obj).testPack==="test";
				}
			})

			l = new Class6();
		})

		it("should result in valid inheritance hierarchies", function(){
			var alpha = nature.create(function (pub, prot) {
				pub.aFunction = function () {}
			})

			var bravo = nature.from(alpha).create(function (pub, prot) {
				pub.bFunction =  function () {}
			})

			var charlie = nature.create(function () {})

			var delta = nature.from(alpha).create(function () {})

			var bravoInstance = new bravo()
			var charlieInstance = new charlie()
			var deltaInstance = new delta()
			
			assert(bravoInstance.aFunction !== undefined, "bravoInstance: should inherit the method")
			assert(deltaInstance.bFunction === undefined, "deltaInstance: should inherit from alpha, but not bravo")
			assert(charlieInstance.aFunction === undefined, "charlieInstance: has no inheritance, should not inherit the method")
		})

		it("instance allows, through it's parent methods, cross-private inheretance to parent package instances", function(){
			assert(l.testPack2(f), "subpackage: can access private scope on instances of parent package");
		})
	})

})
