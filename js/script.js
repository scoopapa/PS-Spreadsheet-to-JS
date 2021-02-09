var currentPage = "";
document.addEventListener("DOMContentLoaded",
	function (event) {
		// Helper Functions
		var insertHtml = function (selector, html) {
			  var targetElem = document.querySelector(selector);
			  targetElem.innerHTML = html;
		};
		var showLoading = function (selector) {
			  var html = "<div class='loading'>";
			  html += "<img src='img/ajax-loader.gif'></div>";
			  insertHtml(selector, html);
		};
		var changePage = function (html) {
			document.querySelector("#current-page").innerHTML = html;
		};
		var insertProperty = function (str, propName, propValue) {
			var propToReplace = "{{" + propName + "}}";
			str = str
				.replace(new RegExp(propToReplace, "g"), propValue);
			return str;
		};
		// Page Load Functions
		var loadMainMenu = function () {
			showLoading("#current-page");
			currentPage = "main-menu"
			ajaxUtils.sendGetRequest( "html/main-menu.html", changePage, false );
		};
		var loadInputSelectPkmn = function() {
			showLoading("#current-page");
			currentPage = "data-input-select-pkmn";
			ajaxUtils.sendGetRequest( "html/data-input-select-pkmn.html", function(rStr){
				ajaxUtils.sendGetRequest( "html/data-input-select-pkmn-item.html", function(r){
					var buf = "";
					rStr = insertProperty(rStr, "column", settings.dex.columnInput ? "checked" : "");
					rStr = insertProperty(rStr, "single", !settings.dex.columnInput ? "checked" : "");
					rStr = insertProperty(rStr, "all", settings.dex.useDefaultTier === "all" ? "checked" : "");
					rStr = insertProperty(rStr, "fake", settings.dex.useDefaultTier === "fakeOnly" ? "checked" : "");
					rStr = insertProperty(rStr, "none", settings.dex.useDefaultTier === "none" ? "checked" : "");
					rStr = insertProperty(rStr, "tier", settings.dex.defaultTier);
					rStr = insertProperty(rStr, "doublesTier", settings.dex.defaultDoublesTier);
					for (var key in data.inputTypes) {
						item = r;
						item = insertProperty(item, "id", key);
						item = insertProperty(item, "label", data.inputTypes[key]);
						item = insertProperty(item, "checked", settings.dex.dataInputTypes[key] ? "checked" : "");
						buf += item;
					}
					changePage( insertProperty( rStr, "content", buf ));
				}, false  );
			}, false  );
		};
		var loadInputPkmn = function() {
			var iStyle = settings.dex.columnInput ? "column" : "single";
			showLoading("#current-page");
			currentPage = "data-" + iStyle + "-input-main";
			ajaxUtils.sendGetRequest( "html/" + currentPage + ".html", function(rStr){
				rStr = insertProperty(rStr, "Spreadsheet", settings.dex.columnInput ? "Spreadsheet " : "");
				ajaxUtils.sendGetRequest( "html/data-" + iStyle + "-input.html", function(r){
					var buf = "";
					for (var key in data.inputTypes) {
						if (!settings.dex.dataInputTypes[key]) continue;
						item = r;
						item = insertProperty(item, "id", key);
						item = insertProperty(item, "type", data.inputTypes[key]);
						item = insertProperty(item, "text", data.inputData[key]);
						buf += item;
					}
					rStr = insertProperty(rStr, "content", buf);
					if (iStyle === "single") {
						ajaxUtils.sendGetRequest( "html/data-single-pkmn.html", function(r){
							var pData = window.parseDexInputs();
							buf = "";
							for (var id of pData.ids) {
								if (!id) continue;
								item = r;
								item = insertProperty(item, "name", pData.name[id]);
								buf += item;
							}
							changePage( insertProperty( rStr, "pokemon", buf ));
						}, false );
					} else {
						changePage(rStr);
					}
				}, false );
			}, false );
		};
		var loadOutputPkmn = function() {
			showLoading("#current-page");
			currentPage = "pkmn-output";

			var isDexData = false;
			var isLearnData = false;
			var isFormatsData = true;
			for (var key in settings.dex.dataInputTypes) {
				if (settings.dex.dataInputTypes[key] && (key === "moveAdditions" || key === "moveRemovals")) isLearnData = true;
				else if (settings.dex.dataInputTypes[key] && key !== "name") isDexData = true;
			}
			if (!isDexData && !isLearnData) isDexData = true;
			var doOutput = function() {
				ajaxUtils.sendGetRequest( "html/pkmn-output.html", function(rStr){
					var pData = window.parseDexInputs(pData);
					var dexStr = isDexData ? window.getPokedexJS(pData) : "";
					var learnsetStr = isLearnData ? window.getLearnsetsJS(pData) : "";
					var scriptsStr = isLearnData ? window.getScriptsJS(pData) : "";
					var formatsDataStr = isDexData ? window.getFormatsDataJS(pData) : "";
					
					ajaxUtils.sendGetRequest( "html/pkmn-output-item.html", function(r){
						var buf = ""
						if (isDexData) {
							buf += insertProperty( r, "id", "pokedex-js" );
							buf = insertProperty( buf, "title", "pokedex.ts");
							buf = insertProperty( buf, "jsData", dexStr );
						}
						if (learnsetStr !== "") {
							buf += insertProperty( r, "id", "learnsets-js" );
							buf = insertProperty( buf, "title", "learnsets.ts");
							buf = insertProperty( buf, "jsData", learnsetStr );
						}
						if (scriptsStr !== "") {
							buf += insertProperty( r, "id", "scripts-js" );
							buf = insertProperty( buf, "title", "scripts.ts");
							buf = insertProperty( buf, "jsData", scriptsStr );
						}
						if (formatsDataStr !== "") {
							buf += insertProperty( r, "id", "formats-data-js" );
							buf = insertProperty( buf, "title", "formats-data.ts" );
							buf = insertProperty( buf, "jsData", formatsDataStr );
						}
						rStr = insertProperty( rStr, "content", buf )
						changePage(rStr);
					}, false );
				}, false );
			}
			if (!data.dexInfo) {
				ajaxUtils.sendGetRequest( "js/data/pokedex.js", function(r){
					data.dexInfo = r;
					doOutput();
				}, true ); 
			} else {
				doOutput();
			}
		};
		// Button Code
		var saveInputData = function(page = "", row = -1) {
			var tagN = page === "data-column-input-main" ? "textarea" : "input"; // handles column and single input
			if (page) {
				var fields = document.getElementsByTagName(tagN);
				for (var field of fields) {
					if (typeof(data.inputData[field.id]) !== "string") return;
					if (page === "data-single-input-main") {
						if (field.value) {
							if (row === -1) data.inputData[field.id] += '\n' + field.value;
						}
					} else {
						data.inputData[field.id] = field.value;
					}
				}
			}
		};
		var saveInputSettings = function(page = "") {
			if (page !== "data-input-select-pkmn") return;
			var fields = document.getElementsByTagName("input");
			for (var field of fields) {
				if (field.id === "default-tier-input") settings.dex.defaultTier = field.value;
				if (field.id === "default-doubles-tier-input") settings.dex.defaultDoublesTier = field.value;
			}
			document.cookie = JSON.stringify( settings );
		}
		// Header Bar Buttons
		document.getElementById("home-link").addEventListener( "click", function(e){
			loadMainMenu();
		})
		// Content Buttons
		document.getElementById("current-page").addEventListener( "click", function(e){
			if (!e.target) return;
			if (!e.target.parentElement) return;
			// Main Menu
			if (currentPage === "main-menu") {
				if (e.target.parentElement.id === "button-input-settings") loadInputSelectPkmn();
				if (e.target.parentElement.id === "button-data-enter") loadInputPkmn();
				if (e.target.parentElement.id === "button-code-output") loadOutputPkmn();
				return;
			}
			// Data type select checkboxes
			if (currentPage === "data-input-select-pkmn") {
				for (var key in settings.dex.dataInputTypes) {
					if (e.target.id === key || (e.target.lastChild !== null && e.target.lastChild.id === key)) {			
						settings.dex.dataInputTypes[key] = document.getElementById(key).checked;
						return;
					}
				}
				// Radio buttons
				var id = "radio-column-dex";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) settings.dex.columnInput = true;
				id = "radio-single-dex";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) settings.dex.columnInput = false;
				var id = "radio-tier-all";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) 
					settings.dex.useDefaultTier = "all";
				id = "radio-tier-fake";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) 
					settings.dex.useDefaultTier = "fakeOnly";
				var id = "radio-tier-none";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) 
					settings.dex.useDefaultTier = "none";
			}
			// Back and Submit buttons
			if (e.target.id === "home-button") {
				saveInputSettings(currentPage);
				loadMainMenu();
			}
			if (e.target.id === "default-settings-button") {
				loadDefaultSettings();
				loadInputSelectPkmn();
			}
			if (e.target.id === "input-settings-button") {
				saveInputSettings(currentPage);
				loadInputPkmn();
			}
			if (e.target.id === "submit-single-pkmn-button") {
				saveInputData(currentPage);
				loadInputPkmn();
			}
			if (e.target.id === "submit-pkmn-final-button") {
				saveInputData(currentPage);
				loadOutputPkmn();
			}
			if (e.target.id === "input-style-column") {
				settings.dex.columnInput = true;
				saveInputData(currentPage);
				loadInputPkmn();
			}
			if (e.target.id === "input-style-single") {
				settings.dex.columnInput = false;
				saveInputData(currentPage);
				loadInputPkmn();
			}
		})
		
		// Init
		loadMainMenu();
		if (document.cookie) settings = JSON.parse( document.cookie );
	}
);