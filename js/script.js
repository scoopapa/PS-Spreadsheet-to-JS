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
		}
		var insertProperty = function (str, propName, propValue) {
			var propToReplace = "{{" + propName + "}}";
			str = str
				.replace(new RegExp(propToReplace, "g"), propValue);
			return str;
		}
		// Page Load Functions
		var loadMainMenu = function () {
			showLoading("#current-page");
			currentPage = "main-menu"
			ajaxUtils.sendGetRequest( "html/main-menu.html", changePage, false );
		}
		var loadInputSelectPkmn = function() {
			showLoading("#current-page");
			currentPage = "data-input-select-pkmn";
			ajaxUtils.sendGetRequest( "html/data-input-select-pkmn.html", function(rStr){
				ajaxUtils.sendGetRequest( "html/data-input-select-pkmn-item.html", function(r){
					var buf = ""
					for (var key in data.inputTypes) {
						item = r;
						item = insertProperty(item, "id", key);
						item = insertProperty(item, "label", data.inputTypes[key]);
						item = insertProperty(item, "checked", settings.dataInputTypes[key] ? "checked" : "");
						buf += item;
					}
					changePage( insertProperty( rStr, "content", buf ));
				}, false  );
			}, false  );
		}
		var loadInputPkmn = function() {
			showLoading("#current-page");
			currentPage = "html/data-input-pkmn.html";
			ajaxUtils.sendGetRequest( "html/data-input-pkmn.html", function(rStr){
				ajaxUtils.sendGetRequest( "html/data-column-input.html", function(r){
					var buf = ""
					for (var key in data.inputTypes) {
						if (!settings.dataInputTypes[key]) continue;
						item = r;
						item = insertProperty(item, "id", key);
						item = insertProperty(item, "type", data.inputTypes[key]);
						buf += item;
					}
					changePage( insertProperty( rStr, "content", buf ));
				}, false );
			}, false );
		}
		var loadOutputPkmn = function() {
			if (currentPage = "data-input-pkmn") {
				var columns = document.getElementsByTagName("textarea");
				for (var column of columns) {
					if (typeof(data.inputData[column.id]) !== "string") return;
					data.inputData[column.id] = column.value;
				}
			}
			showLoading("#current-page");
			currentPage = "pkmn-output";
			var dexStr = window.getPokedexJS();
			ajaxUtils.sendGetRequest( "html/pkmn-output.html", function(rStr){
				changePage( insertProperty( rStr, "dexData", dexStr ));
			}, false );
		}
		// Button Code
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
				if (e.target.parentElement.id === "button-main-pkmn") {
					loadInputSelectPkmn();
					return;
				}
			}
			// Data type select checkboxes
			if (currentPage === "data-input-select-pkmn") {
				for (var key in settings.dataInputTypes) {
					if (e.target.id === key || (e.target.lastChild !== null && e.target.lastChild.id === key)) {			
						settings.dataInputTypes[key] = document.getElementById(key).checked;
						return;
					}
				}
			}
			// Back and Submit buttons
			if (e.target.id === "home-button") loadMainMenu();
			if (e.target.id === "input-settings-button") loadInputPkmn();
			if (e.target.id === "submit-pkmn-info-button") loadOutputPkmn();
		})
		
		// Init
		loadMainMenu();
	}
);