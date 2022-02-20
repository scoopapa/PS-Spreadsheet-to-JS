(function(global) {
	var sepChars = ['/',',','\t','\\.','\\\\',':',';', '\s-', '-\s'];
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
		str = str.toLowerCase().replace(/\s/g, '').replace(/-/g, '');
		if (str) for( var c of removeChars) str = str.replace(new RegExp(c, "g"), '');
		if (str) for( var c of sepChars) str = str.replace(new RegExp(c, "g"), '');
		return str;
	};
	var parseMoveFunctions = { // list of functions to get stringified values for each moves.js property
		setIDs: function(pData) { // gets a list of pokemon ids for the exported code
			var ids = data.inputData.name.split('\n');
			var inputRow = pData.inputRow;
			if (ids[0]) {
				for (var i in ids) {
					ids[i] = toID(ids[i]);
					if (!ids[i]) delete ids[i];
					else inputRow[ids[i]] = i;
				}
			} else { // if name list is not given, create dummy ids based on the first property that has data
				for (var key in settings.dex.dataInputTypes) {
					var arr = data.inputData[key].split('\n');
					if (arr[0]) {
						for (var i in arr) {
							let j = Number(i) + 1;
							ids[i] = "pkmn" + j;
							if (!arr[i]) delete ids[i];
							else inputRow[ids[i]] = i;
						}
						break;
					}
				}
			}
			pData.ids = ids;
		},
		// parsing functions
		name: function(name) {
			return '"' + name.trim() + '"';
		},
		type: function(type) {
			return '"' + type.trim() + '"';
		},
		accuracy: function(acc) {
			if (!Number(acc) || Number(acc) > 100) return "true";
			acc = acc.replace(/[a-z]/g, '').replace('%', '').trim();
			return acc;
		},
		basePower: function(BP) {
			if (!Number(BP)) return "true";
			return BP.replace(/[a-z]/g, '').trim();
		},
		powerPoints: function(PP) {
			PP = PP.replace(/[a-z]/g, '').trim();
			PP = Number(PP);
			if (PP % 5 === 0) return PP;
			if ((PP * 0.625) % 1 === 0) return PP * 0.625;
			return PP;
		},
		category: function(category) {
			return '"' + category.trim() + '"';
		},
		priority: function(priority) {
			return "0";
		},
		secondary: function(priority) {
			return "null";
		},
		flags: function(flags) {
			
		}
	};
	var parseDexColumn = function(key, ids) {
		var arr = data.inputData[key].split('\n'); // separate each input into an array by newline char, then parse each element individually
		var obj = {};
		for (let i in ids) {
			// if (arr[i]) for( var c of removeChars) arr[i] = arr[i].replace(new RegExp(c, "g"), '');
			if (arr[i]) obj[ids[i]] = parseMoveFunctions[key](arr[i]);
		};
		return obj;
	};
	global.parseDexInputs = function() {
		var parsedData = {};
		parsedData.num = {};
		parsedData.inputRow = {};
		for (var iType in data.inputTypes) {
			parsedData[iType] = {};
		}
		parseMoveFunctions.setIDs(parsedData);
		var ids = parsedData.ids
		for (var key in settings.dex.dataInputTypes) {
			if (settings.dex.dataInputTypes[key]) parsedData[key] = parseDexColumn(key, ids);
		}
		return parsedData;
	};

	var outputStr = {
		num: "num",
		name: "name",
		accuracy: "accuracy",
		basePower: "basePower",
		category: "category",
		powerPoints: "pp",
		priority: "priority",
		flags: "flags",
		secondary: "secondary",
		target: "target",
		type: "type",
	};
	var outputProps =  [
		'num', 'name', 'accuracy', 'basePower', 'category', 'powerPoints', 'priority', 'flags', 'secondary', 'target', 'type'
	];
	var newLine = function(str, indent) {
		var buf = "";
		for (var i = 1; i <= indent; i++) buf += '\t';
		return buf + str + '\n';
	};
	//moves.ts
	global.get1MoveJS = function(id, pData){
		var indent = settings.dex.movesIndent;
		var buf = "";
		if (!id) return buf;
		buf += newLine(`// Not Implemented`, indent);
		// id and open bracket
		buf += newLine(`${id}: {`, indent);
		// inherit
		// if (id in data.dexInfo) buf += newLine(`inherit: true,`, indent + 1);
		for (var key of outputProps) {
			if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) {
				buf += newLine(`${outputStr[key]}: ${pData[key][id]},`, indent + 1);
			}
		}
		buf += newLine(`},`, indent);
		return buf
	}
	global.getMovesJS = function( pData = global.parseDexInputs() ) {
		var indent = settings.dex.movesIndent;
		var buf = "";
		for (var id of pData.ids) {
			buf += get1MoveJS(id, pData);
		}
		return buf;
	}
})(window);