var settings = {};
var loadDefaultSettings = function() {
	settings.dex = {
		columnInput: true,
		movesIndent: 1,
		initNum: 1001,
	};
	settings.dex.dataInputTypes = {};
	for (var iType in data.inputTypes) {
		settings.dex.dataInputTypes[iType] = false;
	}
	for (var iType of ["name", "type", "accuracy", "basePower", "powerPoints", "category"]) {
		settings.dex.dataInputTypes[iType] = true;
	}
};
loadDefaultSettings();