var data = { // loaded dynamically
	dexInfo: null,
	learnsetsInfo: null,
};
data.inputTypes = { // data.inputTypes, data.inputData, settings.dataInputTypes, and parsedData inside of global.parseDexInputs should have the same keys
	name: "Name",
	types: "Types",
	abilities: "Abilities",
	stats: "Stats",
	moveAdditions: "Movepool Additions",
	moveRemovals: "Movepool Removals",
	weight: "Weight",
	height: "Height",
	evos: "Evos",
	prevo: "Prevo",
	gender: "Gender",
	eggGroups: "Egg Groups",
	tier: "Tier",
	doublesTier: "Doubles Tier",
};
data.inputData = {};
for (var iType in data.inputTypes) {
	console.log(iType);
	data.inputData[iType] = "";
}
console.log(data.inputData);
data.regions = {
	kanto: {
		iden: ["kanto", "kantonese", "kantan", "kantonian", "kantoan", "kantonan", "kantish"],
		name: "Kanto",
	},
	jhoto: {
		iden: ["jhoto", "jhotonese", "jhotan", "jhotoan", "jhotonan", "jhotish", "jhotonian", "jhotovian"],
		name: "Jhoto",
	},
	hoenn: {
		iden: ["hoenn", "hoennese", "hoenese", "hoennian", "hoenian", "hoennish", "hoenish"],
		name: "Hoenn",
	},
	sinnoh: {
		iden: ["sinnoh", "sinnish", "sinnoan", "sinnohan", "sinnonian", "sinnosian", "sinnan", "sinnonese", "sinnoese",],
		name: "Sinnoh",
	},
	unova: {
		iden: ["unova", "unovan"],
		name: "Unova",
	},
	kalos: {
		iden: ["kalos","kalosian", "kalosan"],
		name: "Kalos",
	},
	alola: {
		iden: ["alola", "alolan"],
		name: "Alola",
	},
	galar: {
		iden: ["galar", "galarian"],
		name: "Galar",
	},
};