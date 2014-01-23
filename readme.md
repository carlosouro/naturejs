# NatureJS

NatureJS is a multiple inheretance mod for Javascript supporting private and static scopes.
Supported in any Ecma5 compliant environment (node.js or client).

Maintained by Carlos Ouro [@c_ouro](https://twitter.com/c_ouro)

- - -

## Introduction

Because most common words used for this are reserved in Ecma5 (eg. private, public, static, protected, class, etc) this "alternate" view of nature and species was created to define the same properties.

- - -

*Glossary:*

* variety - complete class definition
* dna - class instance definition
* kind - public static scope
* bond - protected static scope
* body - public instance scope
* soul - protected instance scope
* soul.birth - constructor method
* variety function scope - private static scope
* spawn function scope - private instance scope

- - -
- - -

## Quick examples:

- - -

### Create a simple object with a private scope:
_var myObject = nature.spawn(dna);_

	var foo = nature.spawn(function(body, soul){
		soul.test = "hello world";
		body.hello = function(){
			return soul.test;
		}
	});

	console.log(foo.hello()); //logs "hello world"


- - -

### Create a Class:
_var MyCLass = nature.species(variety);_

	var Foo = nature.species(function(kind, bond){

		//define static scope stuff
		bond.hello = "hello";
		kind.hello = function(){
			return bond.hello;
		}

		//instance definition (dna)
		this.dna(function(body, soul){

			//constructor
			soul.birth = function(name){
				soul.name = name;
			}

			body.present = function(){
				console.log(bond.hello+". My name is "+soul.name+".")
			}

		});

	});

	console.log(Foo.hello()); //logs "hello"

	var bar = new Foo("John");
	bar.present(); //logs "hello. My name is John."

- - -

### Multiple inheretance:
_var MyCLass = nature.species(variety, [, Parent1[, Parent2[, ... ParentN]]]);_

	var Bar = nature.species(function(kind, bond){

		bond.hello = "hi";

		this.dna(function(body, soul){

			body.greet = function(whom){
				console.log(kind.hello()+" "+whom+"!. I'm "+soul.name+".");
			}

		});

	}, Foo);

	console.log(Bar.hello()); //logs "hi"

	var baz = new Bar("Carlos");
	baz.present(); //logs "hi. My name is Carlos."
	baz.greet("Chris"); //logs "hi Chris! I'm Carlos."



- - -

Note: if you want absolutely private scopes (inheriting classes cannot change), you can use the variety function scope for private static, and the spawn function scope for instance private.

### Non-inheritable private scopes:

	var Baz = nature.species(function(kind, soul){

		//private static variable
		var hello = "hello";

		kind.hello = function(){
			return hello;
		}

		this.dna(function(body, soul){

			var happy = "happy!";

			body.sayHappy = function(){
				console.log(hello+", I'm "+happy+"!");
			}

		})

	});
	var Qux = nature.species(function(kind, soul){
		var hello = "hey";

		this.spawn(function(body, soul){

			var happy = "angry!";

			body.sayAngry = function(){
				console.log(hello+", I'm "+happy+"!");
			}

		})
	}, Baz);


	var qux = new Qux();
	qux.sayAngry(); //logs "hey, I'm angry!"
	qux.sayHappy(); //logs "hello, I'm happy!"