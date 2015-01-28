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

	function createClass(args, keys, factoryMode){

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
			definitions[0] = args[args.length-1] = function(pub, prot){
				mainDef.apply(this, [pub, prot, unfold]);
			}

			packageKey = keys[keys.length-1];
		}

		function generateInstance(args, pub, prot){
			var i=definitions.length;

			//create from definitions
			while(i--){
				definitions[i](pub, prot);
			}

			//initialise constructor if it exists
			if(typeof prot.construct === "function"){
				prot.construct.apply(prot, args);
			}

			if(packageKey){

				Object.defineProperty(pub, "nature:protected", {
				  enumerable: false,
				  configurable: false,
				  writable: false,
				  value: function(keys){
						if(packageKey && keys && keys.indexOf(packageKey)!==-1){
							return prot;
						} else {
							throw new Error("Nature.js: Private access from out of package denied.");
						}
					}
				});
			}
		}


		function Nature(){
			var prot = {};
			//in factoryMode our instance is actually a function calling prot.scope
			var instance = factoryMode ? function(){
				if(typeof prot.scope === 'function'){
					return prot.scope.apply(instance, arguments)
				}
			} : this;

			generateInstance(arguments, instance, prot);

			return instance;
		}


		//save definitions for future inheritance dependencies
		Object.defineProperty(Nature, "nature:definition", {
		  enumerable: false,
		  configurable: false,
		  writable: false,
		  value: args
		});

		return Nature;

	}



	function createNature(pKeys){

		var locked = false;

		function generateCreateMethod(deps, isFactory){

			return function create(def){
				if(locked) {
					throw new Error("Nature.js: cannot create class on closed package.");
				}

				deps.push(def);
				return createClass(deps, pKeys, isFactory);
			}
		}

		var pack = {

			createPackage : function createPackage(){

				var packageKeys = pKeys ? pKeys.slice() : [];

				packageKeys.push({});

				return createNature(packageKeys);
			},

			from : function from(){
				var deps = [].slice.apply(arguments);
				return {
					create: generateCreateMethod(deps),
					factory: generateCreateMethod(deps, true)
				}
			},

			create: generateCreateMethod([]),
			factory: generateCreateMethod([], true)
		}

		if(pKeys){
			pack.close = function close(){
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
