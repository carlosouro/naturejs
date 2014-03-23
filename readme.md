# NatureJS

NatureJS is an easy to use class mod for Javascript supporting private and package scopes, and inheretance.
Supported in any Ecma5 compliant environment (node.js or client).

Maintained by Carlos Ouro [@c_ouro](https://twitter.com/c_ouro)

- - -

## Quick examples:


- - -

### Create a Class:
_var MyCLass = nature.create(definition);_

```JavaScript
var Foo = nature.create(function(pub, priv){

	//constructor
	priv.construct = function(name){
		priv.name = name;
	}

	pub.present = function(){
		console.log("Hello. My name is "+priv.name+".")
	}

});

var bar = new Foo("John");
bar.present(); //logs "Hello. My name is John."
```

- - -

Note: Multiple inheretance is mainly suited for small or, at most, average dependency graphs - if your application has a very complex class structure consider keeping to single inheretance, otherwise you risk running into classical multiple inheretance issues.
You've been warned.

### Multiple inheretance:
_var MyCLass = nature.from([ParentN[, ... Parent2], ] Parent1).create(definition);_

```JavaScript
var Bar = nature.from(Foo).create(function(pub, priv){

	pub.greet = function(whom){
		console.log("Hi "+whom+"!. I'm "+priv.name+".");
	}

});

var baz = new Bar("Carlos");
baz.present(); //logs "Hello. My name is Carlos."
baz.greet("Chris"); //logs "Hi Chris! I'm Carlos."
```


- - -

Note: if you want absolutely private scopes (inheriting classes cannot change), you can use the variety function scope for private static, and the spawn function scope for instance private.

### Non-inheritable private scopes:

```JavaScript
var Baz = nature.create(function(body, soul){

	var happy = "happy!";

	body.sayHappy = function(){
		console.log("I'm "+happy+"!");
	}

});
var Qux = nature.from(Baz).create(function(body, soul){

	var happy = "angry!";

	body.sayAngry = function(){
		console.log("I'm "+happy+"!");
	}

});


var qux = new Qux();
qux.sayAngry(); //logs "I'm angry!"
qux.sayHappy(); //logs "I'm happy!"
```

- - -

### Packages

TODO: packages documentation