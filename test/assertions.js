//START TESTS
var vm = require('vm');
var fs = require('fs');
var path = require("path");
var assert = require('assert');

//blanket to test nature.js file coverage
require('blanket')({"data-cover-only":'src/nature.js'});

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
	var Class1,Class2,Class3,Class4Extra,Class4,pack,PackClass1,PackClass2,pack2,Class5,pack3,Class6;

	//instances used in the tests
	var a,b,c,d,e,f,g,l;

	describe('basics', function(){

		it('#create() spawns a new class', function(){

			//Regular class
			Class1 = nature.create(function(pub, priv){

				priv.construct = function(){
					pub.args = arguments;
				}

				priv.test = {};
				pub.test = {};

				pub.pubTest = function(){
					return pub.test;
				}

				pub.pubTestWithArgs = function(args) {
					console.log(args);
					return undefined;
				}


				pub.privTest = function(){
					return priv.test;
				}
			});

			a = new Class1("foo", "bar");
			b = new Class1();

			assert(a instanceof Class1 && a.args[0]=="foo" && a.args[1]=="bar" && b!=a && typeof b.args[0] === 'undefined', "consistent class spawning");
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

	describe('inheretance (1st level)', function(){

		it('#from().create() spawns inhereted class',function(){

			//2nd level class
			Class2 = nature.from(Class1).create(function(pub, priv){
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

		it('#from(InheritedClass).create() spawns inherited class (2nd level)',function(){

			//3rd level class
			Class3 = nature.from(Class2).create(function(pub, priv){

				priv.extra = 3;

				var superPrivTest = pub.privTest;
				pub.privTest = function(){

					return superPrivTest() && priv.extra==3;

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

		it('#from(2ndLevelInerited, AnotherClass).create() spawns multiple inhereted class (3rd level)',function(){

			//4th level class - w/ multiple inheretance
			Class4Extra = nature.create(function(pub, priv){
				priv.multipleExtra = 4;
			})
			Class4 = nature.from(Class3, Class4Extra).create(function(pub, priv){

				pub.test4 = function(){
					return priv.extra == 3 && priv.multipleExtra==4;
				}

			});

			e = new Class4("foo", "bar");
			assert(e instanceof Class4 && e.args[0]=="foo" && e.args[1]=="bar", "consistent multiple inherited spawn");
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
	})

	describe('packages',function(){
		it('#createPackage().create() spawns pack classes', function(){
			//PACKAGE TESTS

			pack = nature.createPackage();

			PackClass1 = pack.create(function(pub, priv){
				pub.setTestPack = function(a){
					priv.testPack = "test";
				}
			});

			PackClass2 = pack.from(Class4).create(function(pub, priv, unfold){
				pub.testPack = function(obj){
					return unfold(obj).testPack==="test";
				}
			});

			f = new PackClass1();
			g = new PackClass2();
		})

		it('instance allows for cross-private access within package instances', function(){
			f.setTestPack();
			assert(g.testPack(f), "cross-private access");
		})

		it('package.close() correctly locks packages (.create())', function(){

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

		it('package.close() correctly locks packages (from().create())', function(){

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

			Class5 = pack2.from(PackClass2).create(function(pub, priv, unfold){
				pub.testPack2 = function(obj){
					return unfold(obj).testPack==="test";
				}
			})

			h = new Class5();
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

	})

	describe('package inheretance',function(){

		it('pack.createPackage().create() spawns instances', function(){

			//subpackage of pack1
			pack3 = pack.createPackage();

			Class6 = pack3.from(PackClass2).create(function(pub, priv, unfold){
				pub.testPack2 = function(obj){
					return unfold(obj).testPack==="test";
				}
			})

			l = new Class6();
		})

		it("instance allows, through it's parent methods, cross-private inheretance to parent package instances", function(){
			assert(l.testPack2(f), "subpackage: can access private scope on instances of parent package");
		})
	})

})