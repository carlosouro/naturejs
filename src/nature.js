var nature = (function(){

	function resolveInheritance(parents){

		//empty baseline (no parents)
		var definitions = [];

		//recursively resolve inheratance
		recursiveInheretance(parents, definitions);

		return definitions;
	}

	function recursiveInheretance(parents, definitions){

		var i = parents.length, def;
		while(i--){
			def = parents[i];
			if(!def["nature:definition"]){
				//ingore previously resolved dependencies
				if(definitions.indexOf(def)===-1){
					definitions.push(def);
				}
			} else {
				recursiveInheretance(def["nature:definition"], definitions);
			}

		}
	}

	function createClass(args, keys){

		var definitions = resolveInheritance(args);

		var unfold, packageKey, mainDef;

		if (keys){

			//get main method definition
			mainDef = definitions[0];

			//unfold method
			unfold = function(obj){
				if(!obj['nature:protected']) {
					throw new Error("Nature.js: Object package not found.");
				}
				return obj['nature:protected'](keys);
			}

			//reassign new method enclosed with unfold
			definitions[0] = args[args.length-1] = function(pub, priv){
				mainDef.apply(this, [pub, priv, unfold]);
			}

			packageKey = keys[keys.length-1];
		}

		var Class = function(){

			var priv = {}, pub = this, i=definitions.length;

			//create from definitions
			while(i--){
				definitions[i](pub, priv);
			}

			//initialise constructor if it exists
			if(typeof priv.construct === "function"){
				priv.construct.apply(priv, arguments);
			}

			if(packageKey){

				Object.defineProperty(this, "nature:protected", {
				  enumerable: false,
				  configurable: false,
				  writable: false,
				  value: function(keys){
						if(packageKey && keys && keys.indexOf(packageKey)!==-1){
							return priv;
						} else {
							throw new Error("Nature.js: Private access from out of package denied.");
						}
					}
				});
			}

		}

		//save definitions for future inheritance dependencies
		Object.defineProperty(Class, "nature:definition", {
		  enumerable: false,
		  configurable: false,
		  writable: false,
		  value: args
		});

		return Class;

	}

	function createNature(pKeys){

		var locked = false;

		var pack = {

			createPackage : function(){

				var packageKeys = pKeys ? pKeys.slice() : [];

				packageKeys.push({});

				return createNature(packageKeys);
			},

			from : function(){
				var args = [].slice.apply(arguments);
				return {
					create: function(def){

						if(locked) {
							throw new Error("Nature.js: cannot create class on closed package.");
						}

						args.push(def)
						return createClass(args, pKeys);
					}
				}
			},

			create: function(def){

				if(locked) {
					throw new Error("Nature.js: cannot create class on closed package.");
				}

				return createClass([def], pKeys);
			}
		}

		if(pKeys){
			pack.close = function(){
				locked = true;
			}
		}

		return pack;
	}

	return createNature();

})();

if(typeof module !== 'undefined' && module.exports){
	module.exports = nature;
}
