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

		//establish baseline
		var i = parents.length, def;
		while(--i>=0){
			def = parents[i]["nature:variety"] || parents[i];
			def.call(baseline.sHelper,Variety,baseline.bond);
		}

		return baseline;
	}
	nature.species = function(definition){

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

		//save definition for future inheritance dependencies
		Object.defineProperty(Variety, "nature:variety", {
		  enumerable: false,
		  configurable: true,
		  writable: true,
		  value: definition
		});

		return Variety;

	}

	return nature;
})();

if(typeof module !== 'undefined' && module.exports){
	module.exports = nature;
}