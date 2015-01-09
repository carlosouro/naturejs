# NatureJS
![Travis-CI build](https://travis-ci.org/Odobo/naturejs.svg "Travis-CI build")

NatureJS is an easy to use Class system for Javascript supporting private, protected and package scopes, and inheretance.
Supported in any Ecma5 compliant javascript environment (node.js or browser).

Created and maintained by [Carlos Ouro](https://github.com/carlosouro)

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

### Multiple inheretance:
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


Note: Multiple inheretance is mainly suited for small or, at most, average dependency graphs - if your application has a very complex class structure consider keeping to single inheretance, otherwise you risk running into multiple inheretance issues.
NatureJs, when given the same property declared in multiple inerited parents, will always allow the right-most (ParentN argument) to override.
You've been warned.

- - -

Note: if you want absolutely private scopes (inheriting classes cannot change), you can use the variety function scope for private static, and the spawn function scope for instance private.

### Non-inheritable private instance scopes:

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