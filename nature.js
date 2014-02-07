var nature = (function(){

	function SpeciesHelpers(){
		this.dnas = [];
	}
	SpeciesHelpers.prototype.spawn = function(dna){
			this.dnas.push(dna);
	}
	function SpawnHelpers(){};

	var nature = {};
	nature.spawn = function(definition){
		var body = {}, soul = {};
		var h = new SpawnHelpers();
		definition.call(h, body, soul);
		return body;
	}

	function resolveInheritance(Variety, parents){

		//empty baseline (no parents)
		var baseline = {
			bond:{},
			sHelper:new SpeciesHelpers()
		};

		//recursively resolve inheratance
		recursiveInheretance(Variety, parents, baseline, []);

		return baseline;
	}

	function recursiveInheretance(Variety, parents, baseline, resolvedList){

		var i = parents.length, def, parentReferences;
		while(i--){
			def = parents[i];
			if(!def["nature:variety"]){
				//ingore previously resolved dependencies
				if(resolvedList.indexOf(def)===-1){
					def.call(baseline.sHelper,Variety,baseline.bond);
					resolvedList.push(def);
				}
			} else {
				recursiveInheretance(Variety, def["nature:variety"], baseline, resolvedList);
			}

		}
	}



	nature.species = function(){

		var baseline;

		var Variety = function(){

			var soul = {}, h = new SpawnHelpers(), body = this;

			//create from dna definitions
			baseline.sHelper.dnas.forEach(function(dna){
				dna.call(h, body, soul);
			});
			//initialise constructor if it exists
			if(typeof soul.birth == "function"){
				soul.birth.apply(body, arguments);
			}

		}

		baseline = resolveInheritance(Variety, arguments);

		//save definitions for future inheritance dependencies
		Object.defineProperty(Variety, "nature:variety", {
		  enumerable: false,
		  configurable: true,
		  writable: true,
		  value: arguments
		});

		return Variety;

	}

	return nature;
})();

if(typeof module !== 'undefined' && module.exports){
	module.exports = nature;
}