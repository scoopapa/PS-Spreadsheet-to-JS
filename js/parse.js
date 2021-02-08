(function(global) {
	var sepChars = ['/',',','\t','/.','\\\\',':',';'];
	var removeChars = ['\\*','&','$','@','!','#','\\(','\\)','\\{','\\}','\\[','\\]','~','`','~','"',"'","none","---","----","-----"];
	var arrFromStr = function(str) { // Turns strings separated by chars in sepChars into arrays
		for( var c of sepChars ) str = str.replace(new RegExp(c, "g"), '|');
		var arr = str.split('|');
		for (var i in arr) {
			if (!arr[i]) {
				delete arr[i];
				continue;
			}
			arr[i] = arr[i].trim();
			arr[i].replace(arr[i].charAt(0), arr[i].charAt(0).toUpperCase());
			arr = arr.filter(function(el) {
				if (el.replace(/\s/g, '') === '') return false;;
				if (toID(el) === '' && isNaN(el)) return false;
				if (el) return true;
				return false;
			})
		}
		return arr;
	};
	var toID = function(str) {
		str = str.toLowerCase().replace(/\s/g, '');
		if (str) for( var c of removeChars) str = str.replace(new RegExp(c, "g"), '');
		if (str) for( var c of sepChars) str = str.replace(new RegExp(c, "g"), '');
		return str;
	};
	var parseDexFunctions = { // list of functions to get stringified values for each pokedex.js property
		getIDs: function() { // gets a list of pokemon ids for the exported code
			var ids = data.inputData.name.split('\n');
			if (ids[0]) {
				for (let i in ids) {
					ids[i] = toID(ids[i]);
					if (!ids[i]) delete ids[i];
				}
			} else { // if name list is not given, create dummy ids based on the first property that has data
				for (var key in settings.dex.dataInputTypes) {
					var arr = data.inputData[key].split('\n');
					if (arr[0]) {
						for (let i in arr) {
							let j = Number(i) + 1;
							ids[i] = "pkmn" + j;
							if (!arr[i]) delete ids[i];
						}
						break;
					}
				}
			}
			return ids;
		},
		// parsing functions
		name: function(name) {
			return name.trim();
		},
		types: function(types) {
			var typeArr = arrFromStr(types);
			var buf = '["' + typeArr[0] + '"';
			if (typeArr[1]) buf += ', "' + typeArr[1] +'"';
			buf += ']';
			return buf;
		},
		abilities: function(abilities) {
			abilities = abilities.replace(/hidden ability/i, '');
			abilities = abilities.replace(/(HA)/g, '');
			var abilArr = arrFromStr(abilities);
			if (abilArr.length === 2) {// if there are only two abilities, the last one is the hidden ability
				abilArr = [abilArr[0], "", abilArr[1]];
			}
			var buf = '{0: "' + abilArr[0] + '"';
			if (abilArr[1]) buf += ', 1: "' + abilArr[1] +'"';
			if (abilArr[2]) buf += ', H: "' + abilArr[2] +'"';
			buf += '}';
			return buf;
		},
		stats: function(stats) {
			stats = stats.replace(/[a-z]/g, '');
			var statArr = arrFromStr(stats);
			var buf = '{hp: ' + statArr[0];
			if (statArr[1]) buf += ', atk: ' + statArr[1];
			if (statArr[2]) buf += ', def: ' + statArr[2];
			if (statArr[3]) buf += ', spa: ' + statArr[3];
			if (statArr[4]) buf += ', spd: ' + statArr[4];
			if (statArr[5]) buf += ', spe: ' + statArr[5];
			buf += '}';
			return buf;
		},
		// moveAdditions and moveRemovals return arrays instead of strings
		moveAdditions: function(moveStr) {
			var arr = arrFromStr(moveStr);
			for (var i in arr) arr[i] = toID(arr[i]);
			return arr;
		},
		moveRemovals: function(moveStr) {
			var arr = arrFromStr(moveStr);
			for (var i in arr) arr[i] = toID(arr[i]);
			return arr;
		},
		weight: function(weight) {
			return weight.replace(/[a-z]/g, '').trim();
		},
		height: function(height) {
			return height.replace(/[a-z]/g, '').trim();
		},
		evos: function(evos) {
			var evoArr = arrFromStr(evos);
			var buf = '["' + evoArr[0] + '"';
			for (var i = 1; i<= evoArr.length; i++) {
				if (evoArr[i]) buf += ', "' + evoArr[i] +'"';
			};
			buf += ']';
			return buf;
		},
		prevo: function(prevo) {
			rPrevo = arrFromStr(prevo);
			return rPrevo[0].trim();
		},
		gender: function(toReturn) {
			
		},
		eggGroups: function(eG) {
			var eArr = arrFromStr(eG);
			var buf = '["' + eArr[0] + '"';
			for (var i = 1; i<= eArr.length; i++) {
				if (eArr[i]) buf += ', "' + eArr[i] +'"';
			};
			buf += ']';
			return buf;
		},
	};
	var parseDexColumn = function(key, ids) {
		var arr = data.inputData[key].split('\n'); // separate each input into an array by newline char, then parse each element individually
		var obj = {};
		for (let i in ids) {
			if (arr[i]) for( var c of removeChars) arr[i] = arr[i].replace(new RegExp(c, "g"), '');
			if (arr[i]) obj[ids[i]] = parseDexFunctions[key](arr[i]);
		};
		return obj;
	};
	var processData = function(pData) { // takes parsed data and figures out forme changes
		
	};
	global.parseDexInputs = function() {
		var parsedData = {
			name: {},
			types: {},
			abilities: {},
			stats: {},
			moveAdditions: {},
			moveRemovals: {},
			weight: {},
			height: {},
			evos: {},
			prevo: {},
			gender: {},
			eggGroups: {},
		};
		var ids = parseDexFunctions.getIDs();
		parsedData.ids = ids;
		for (var key in settings.dex.dataInputTypes) {
			if (settings.dex.dataInputTypes[key]) parsedData[key] = parseDexColumn(key, ids);
		}
		return parsedData;
	};

	var outputStr = {
		inherit: "inherit",
		num: "num",
		name: "name",
		types: "types",
		gender: "genderRatio",
		stats: "baseStats",
		abilities: "abilities",
		height: "heightm",
		weight: "weightkg",
		color: "color",
		prevo: "prevo",
		evos: "evos",
		eggGroups: "eggGroups",
	};
	var getOutputProps = function() {
		return [
			'num', 'name', 'types', 'gender', 'stats', 'abilities',
			'height', 'weight', 'color', 'prevo', 'evos', 'eggGroups'
		];
	};
	var newLine = function(str, indent) {
		var buf = "";
		for (var i = 1; i <= indent; i++) buf += '\t';
		return buf + str + '\n';
	};
	global.getPokedexJS = function(pData){
		var indent = settings.dex.dexIndent;
		if (!pData) pData = global.parseDexInputs();
		var toOutput = getOutputProps();
		var buf = "";
		for (var id of pData.ids) {
			// id and open bracket
			buf += newLine(`${id}: {`, indent);
			// inherit
			buf += newLine(`inherit: true,`, indent + 1);
			for (var key of toOutput) {
				if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) {
					buf += newLine(`${outputStr[key]}: ${pData[key][id]},`, indent + 1);
				}
			}
			buf += newLine(`},`, indent);
		}
		return buf;
	}
	global.getLearnsetsJS = function(pData) {
		var indent = settings.dex.learnsetsIndent;
		if (!pData) pData = global.parseDexInputs();
		var buf = "";
		for (var id of pData.ids) {
			// id and open bracket
			buf += newLine(`${id}: {`, indent);
			buf += newLine("learnset: {", indent + 1)
			// inherit
			buf += newLine(`inherit: true,`, indent + 2);
			var key = "moveAdditions";
			if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) {
				for (var moveid of pData[key][id]) {
					buf += newLine(`${moveid}: ["8L1"],`, indent + 2);
				}
			}
			key = "moveRemovals";
			if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) {
				for (var moveid of pData[key][id]) {
					buf += newLine(`${moveid}: null,`, indent + 2);
				}
			}
			buf += newLine(`},`, indent + 1);
			buf += newLine(`},`, indent);
		}
		return buf;
	}
	global.getScriptsJS = function(pData) {
		var indent = settings.dex.scriptsIndent;
		if (!pData) pData = global.parseDexInputs();
		var buf = "";
		for (var id of pData.ids) {
			var name = pData.name[id] ? pData.name[id] : id;
			buf += newLine(`// ${name}`, indent);
			var key = "moveAdditions";
			if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) {
				for (var moveid of pData[key][id]) {
					buf += newLine(`this.modData("Learnsets", "${id}").learnset.${moveid} = ["8L1"];`, indent);
				}
			}
			key = "moveRemovals";
			if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) {
				for (var moveid of pData[key][id]) {
					buf += newLine(`delete this.modData('Learnsets', '${id}').learnset.${moveid};`, indent);
				}
			}
		}
		return buf;
	}
})(window);