var settings = {};
settings.dex = {
	columnInput: true,
	useDefaultTier: "fakeOnly", // possible values are "fakeOnly", "all", and "none"
	defaultTier: "OU",
	defaultDoublesTier: "DOU",
	dexIndent: 1,
	learnsetsIndent: 1,
	scriptsIndent: 1,
};
settings.dex.dataInputTypes = {};
for (var iType in data.inputTypes) {
	settings.dex.dataInputTypes[iType] = false;
}
for (var iType of ["name", "types", "abilities", "stats"]) {
	settings.dex.dataInputTypes[iType] = true;
}