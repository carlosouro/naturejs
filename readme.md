# NatureJS
![nature-js NPM package information](https://nodei.co/npm/nature-js.png "nature-js NPM package information")

![nature-js travis-CI build](https://travis-ci.org/Odobo/naturejs.svg "nature-js travis-CI build") ![nature-js test coverage](https://coveralls.io/repos/github/Odobo/naturejs/badge.svg?branch=master "nature-js test coverage") ![nature-js bower component](https://badge.fury.io/bo/nature-js.svg "nature-js bower component")



NatureJS is an easy to use Class system for Javascript supporting private, protected and package scopes, and inheritance.
Supported in any Ecma5 compliant javascript environment (node.js or browser).

- - -

## Quick examples:


- - -

### Create a Class:
_var MyCLass = nature.create(definition);_

```JavaScript
var Foo = nature.create(function(pub, prot){

	//constructor
	//prot scope is protected
	prot.construct = function(name){
		prot.name = name;
	}

	pub.present = function(){
		console.log("Hello. My name is "+prot.name+".")
	}

});

var bar = new Foo("John");
bar.present(); //logs "Hello. My name is John."
```

- - -

### Create an instance Factory:
_var myFactory = nature.factory(definition);_

factory() works the same logic create(), but generates a factory function that returns "function" instances (executing prot.scope()), whereas .create() returns regular classes.
Factories can be derived and chained in inheretance or packages just like any Class.

```JavaScript
var testFactory = nature.factory(function(pub, prot){

	//constructor
	prot.construct = function(name){
		prot.name = name;
	}

	pub.present = function(){
		console.log("Hello. My name is "+prot.name+".")
	}

	//prot.scope() - method to be run every time the instance function is called
	prot.scope = function(){
		console.log("JS, the place where functions can be instances")
	}

});

var bar = testFactory("John"); //no "new" constructor needed
bar.present(); //logs "Hello. My name is John."
bar(); //logs "JS, the place where functions can be instances"
```

- - -

### Multiple inheritance:
_var MyCLass = nature.from([ParentN[, ... Parent2], ] Parent1).create(definition);_

```JavaScript
var Bar = nature.from(Foo).create(function(pub, prot){

	pub.greet = function(whom){
		console.log("Hi "+whom+"!. I'm "+prot.name+".");
	}

});

var baz = new Bar("Carlos");
baz.present(); //logs "Hello. My name is Carlos."
baz.greet("Chris"); //logs "Hi Chris! I'm Carlos."
```


_Note: Multiple inheritance is mainly suited for small or, at most, average dependency graphs - if your application has a very complex class structure consider keeping to single inheritance, otherwise you risk running into multiple inheritance issues.
NatureJs, when given the same property declared in multiple inerited parents, will always allow the right-most (ParentN argument) to override.
You've been warned._

- - -

### Non-inheritable private instance scopes:
If you want absolutely private scopes (inheriting classes cannot change), you can use the variety function scope for private static, and the spawn function scope for instance private.

```JavaScript
var Baz = nature.create(function(pub, prot){

	var privateText = "happy!";

	pub.sayHappy = function(){
		console.log("I'm "+privateText+"!");
	}

});
var Qux = nature.from(Baz).create(function(pub, prot){

	var privateText = "angry!";

	pub.sayAngry = function(){
		console.log("I'm "+privateText+"!");
	}

});


var qux = new Qux();
qux.sayAngry(); //logs "I'm angry!"
qux.sayHappy(); //logs "I'm happy!"
```

- - -

### Packages
_var myPackage = nature.createPackage();_

```JavaScript
var pack = nature.createPackage();

var Foo = pack.create(function(pub, prot, unfold){

	prot.bar = "hi!";

});
var Baz = pack.create(function(pub, prot, unfold){

	pub.logProtectedBar = function(obj){

		var instanceProt = unfold(obj); //Note: throws error in case of out of package obj

		console.log( instanceProt.bar );
	}

});


var foo = new Foo();
var baz = new Baz();

baz.logProtectedBar(foo); //logs "hi!"
```

- - -

### SubPackages
_var mySubPackage = pack.createPackage();_

Subpackages can access all the parent packages instances protected scopes.


- - -
### Legal Stuff

MIT license.
See the included LICENSE file for more details.