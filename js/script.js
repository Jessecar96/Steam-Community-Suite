// SteamID converter
(function(){"use strict";var a=function(a){return a!==void 0?null!==this.IsCommunityID(a)?this.SetCommunityID(a):null!==this.IsSteam2(a)?this.SetSteam2(a):this.SetAccountID(a):this};a.prototype={AccountID:0,IsCommunityID:function(a){return"string"!=typeof a?null:a.match(/^7656119([0-9]{10})$/)},IsSteam2:function(a){return"string"!=typeof a?null:a.match(/^STEAM_0:([0-1]):([0-9]+)$/)},SetAccountID:function(a){if("number"==typeof a)this.AccountID=a;else{if("string"!=typeof a||isNaN(a))return!1;this.AccountID=parseInt(a,10)}return this},SetCommunityID:function(a){if(a=this.IsCommunityID(a),null===a)return!1;a=a[0].substring(7);var b=a%2;return a=(a-b-7960265728)/2,this.AccountID=a<<1|b,this},SetSteam2:function(a){return a=this.IsSteam2(a),null===a?!1:(this.AccountID=a[2]<<1|a[1],this)},GetCommunityID:function(){return"7656119"+(7960265728+this.AccountID)},GetSteam2:function(){return"STEAM_0:"+(1&this.AccountID)+":"+(this.AccountID>>1)},GetSteam3:function(){return"[U:1:"+this.AccountID+"]"},GetAccountID:function(){return this.AccountID}},"object"==typeof module&&module&&"object"==typeof module.exports?module.exports=a:window.SteamID=a})();

// Variables
var safe_domains = [];
var bad_domains = [];
var ignore_domains = [];
var remembered_domains = [];
var valve_test_site = false;
var r_valid_steam_url = /(?:http|https):\/\/(?:store.|support.|forums.|api.|media.|www.|staging.|)(?:steamcommunity|steampowered|dota2|steamgames|valvesoftware)\.com/;
var r_phishing_url = /(https?:\/\/|\/\/|www?.\.)\S*?[sz][tf][ea].?[mnru]..?.?[mnruv][mnruv]?..?.?[jiltf][jiltf][yi]\.\S+/i;

function inject_script(str, run) {
	if(run || run == undefined){
		var script = document.createElement('script');
		script.textContent = '(' + str + ')();';
		document.body.appendChild(script);
	}else{
		var script = document.createElement('script');
		script.textContent = str;
		document.body.appendChild(script);
	}
}

function log(str) {
	console.log('%cSCS%c '+str, 'background: #222; color: #bada55;padding:2px;', "background:transparent;color:black;");
}

function getElementByXpath(path) {
	return document.evaluate(path, document, null, 9, null).singleNodeValue;
}

function parse_url(url) {
	var parser = document.createElement('a');
	parser.href = url;
	return parser;
}

function open_in_new_tab(url) {
	var win=window.open(url, '_blank');
	win.focus();
}

function show_steam_alert(title, str) {
	inject_script("function(){ShowAlertDialog(\""+title+"\", \""+str+"\");}");
}

function open_url_copy(sid) {
	ShowAlertDialog('Static Profile URL', "<b>Press Ctrl + C</b><br/><br/><div class='gray_bevel for_text_input'><input class='dynInput copythistext' type='text' size='70' value='http://steamcommunity.com/profiles/"+sid+"/' ></div>");
	document.getElementsByClassName("copythistext")[0].focus();
	document.getElementsByClassName("copythistext")[0].select();
}

function update_domains() {
	if(typeof g_whiteListedDomains != "undefined"){
		var steam_safe_domains = g_whiteListedDomains;
		g_whiteListedDomains = steam_safe_domains.concat(safe_domains);
		safe_domains = safe_domains.concat(steam_safe_domains);
	}
}

function run_community_market() {
	var rows = document.getElementsByClassName("market_listing_row");
	if(rows && g_rgAppContextData[440] != undefined){ // Only support TF2
		for (var i = rows.length - 1; i >= 0; i--) {
			var row = rows[i];
			var listingId = row.id.replace("listing_","");
			var listing = g_rgListingInfo[listingId];
			var name = row.querySelectorAll(".market_listing_item_name_block")[0];
			var avatarUrl = row.querySelectorAll(".playerAvatar img")[0].src;
			name.innerHTML += "<br/><a target='_blank' href='http://backpack.tf/item/"+listing.asset.id+"'>Backpack.tf</a>, <a target='_blank' href='https://www.google.com/searchbyimage?site=search&image_url="+avatarUrl+"&q=site:steamcommunity.com/id/ OR site:steamcommunity.com/profiles/'>Search Google by avatar</a>";
			name.style.marginTop = "13px";
		};
	}
}


// Check Footer Elements
if(document.getElementById("footer_spacer") != null && getElementByXpath('//*[@id="footer"]/div') != null && document.getElementsByClassName("valve_links").length > 0){
	valve_test_site = true;
}

// Check for links to styles
var ValveStyles = document.getElementsByTagName("link");
for (var i = ValveStyles.length - 1; i >= 0; i--) {
	if(ValveStyles[i].href.match(/http(s|):\/\/(?:cdn.|)steamcommunity.com\/public\/(shared)?/)){
		valve_test_site = true;
	}
};

// Check for links to JavaScript
var ValveScripts = document.getElementsByTagName("script");
for (var i = ValveScripts.length - 1; i >= 0; i--) {
	if(ValveScripts[i].src.match(/http(?:s|):\/\/(?:support.|cdn.|)(?:steamcommunity|steampowered).com(?:\/public\/(shared)|includes)?/)){
		valve_test_site = true;
	}
};

// Check for images (old phishing sites)
var ValveImages = document.getElementsByTagName("img");
for (var i = ValveImages.length - 1; i >= 0; i--) {
	if(ValveImages[i].src.match(/http(?:s|):\/\/(?:steamcommunity|steampowered).com\/public\/images\/trans/)){
		valve_test_site = true;
	}
};

if(window.localStorage){
	if(window.localStorage['rememberedDomains']){
		remembered_domains = JSON.parse(window.localStorage['rememberedDomains']);
		inject_script("var remembered_domains = "+JSON.stringify(remembered_domains)+";", false);
	}
}

var parsed = "http://"+parse_url(window.location.href).hostname;
var frag   = parsed.replace(/[^.]*\.(?=\w+\.\w+$)/, '').replace("http://","");

if(valve_test_site || bad_domains.indexOf(frag) != -1 || window.location.href.match(r_valid_steam_url)){

	inject_script(open_url_copy.toString(), false);
	inject_script(parse_url.toString(), false);

	$.getJSON("https://jes.re/steam_resources.js", function parse_domains(data) {
		safe_domains = data.safe_domains;
		bad_domains = data.bad_domains;
		ignore_domains = data.ignore_domains;

		inject_script("var safe_domains = " + JSON.stringify(safe_domains) + ";", false);
		inject_script(update_domains.toString());

		log("Loaded JSON");


		if(window.location.href.match(r_valid_steam_url) !== null){

			// External styles
			$("body").append("<link rel=\"stylesheet\" type=\"text/css\" href=\"//jes.re/steam.css\" />");

			// Green bar
			if(document.getElementById("global_header") != null)
				document.getElementById("global_header").style.borderBottom = "2px solid green";

			if(window.location.href.match(/(\/id\/|\/profiles\/)/i) !== null){

				var UserSID   = new SteamID(document.documentElement.outerHTML.match(/steamid"\:"(.+)","personaname/)[1]),
					SteamID64 = UserSID.GetCommunityID();

				// Comments script fix
				var scr = document.documentElement.outerHTML.match(/InitializeCommentThread\((.*)\);/g);
				eval(scr);

				// Emote script fix
				var scr = document.documentElement.outerHTML.match(/new CEmoticonPopup\( (.*)'\) \);/g);
				eval(scr);

				// Remove "show more" button
				var summary = document.documentElement.outerHTML.match(/","summary":"(.+)"};/i)[1];
				summary = JSON.parse("[\"" + summary + "\"]");
				summary = summary[0];
				if(document.getElementsByClassName("profile_summary").length > 0)
					document.getElementsByClassName("profile_summary")[0].innerHTML = summary;

				// SteamIDs to profile
				var ProfileSteamIDS = document.createElement("div");
				ProfileSteamIDS.innerHTML = "<b>Community ID:</b> <a style='color:#898989;text-decoration:underline;' href='javascript:void(0);' onclick=\"SteamCommunitySuite.OpenURLCopy('"+UserSID.GetCommunityID()+"')\" >"+UserSID.GetCommunityID()+"</a><br/><b>Steam 2:</b> "+UserSID.GetSteam2()+"<br/><b>Steam 3:</b> "+UserSID.GetSteam3()+"<br/><br/>";
				document.body.appendChild(ProfileSteamIDS);
				var ProfileName = document.getElementsByClassName("header_real_name")[0];
				if(ProfileName != undefined){
					ProfileName.insertBefore(ProfileSteamIDS, ProfileName.firstChild);
				}else{
					var ProfileHeaderSummary = document.getElementsByClassName("profile_header_summary")[0];
					var PrivateProfileInfo = document.getElementsByClassName("profile_private_info")[0];
					ProfileHeaderSummary.insertBefore(ProfileSteamIDS, PrivateProfileInfo);
				}

				// SteamRep
				var SRBox =  '<div class="community-links"><div class="profile_recentgame_header profile_leftcol_header links-header"><h2>Community Links</h2><div class="links-container"></div></div></div>';
					SRBox += '<div class="sr-status"><div class="profile_recentgame_header profile_leftcol_header links-header rep-header"><h2><a target="_blank" href="http://steamrep.com/profiles/'+SteamID64+'" >SteamRep Status</a></h2><div class="reputation-content"><img src="https://i.imgur.com/rSFZZgI.gif" alt="Loading"/> Loading Rep...</div></div></div>';

				// Prepend boxes to profile
				document.getElementsByClassName("profile_leftcol")[0].innerHTML = SRBox + document.getElementsByClassName("profile_leftcol")[0].innerHTML;

				// Community Links
				var links_container = document.getElementsByClassName("links-container")[0];
				links_container.style.fontSize = "14px";
				links_container.innerHTML  = "";
				links_container.innerHTML += "Backpack: <a target='_blank' href='http://tf2b.com/tf2/"+SteamID64+"'>TF2B</a> | <a target='_blank' href='http://backpack.tf/profiles/"+SteamID64+"'>backpack.tf</a> | <a target='_blank' href='http://tf2items.com/profiles/"+SteamID64+"'>TF2Items</a> | <a target='_blank' href='http://optf2.com/tf2/user/"+SteamID64+"'>OPTF2</a><br/>";
				links_container.innerHTML += "Trading: <a target='_blank' href='http://bazaar.tf/profiles/"+SteamID64+"'>bazaar.tf</a> | <a target='_blank' href='http://www.tf2outpost.com/user/"+SteamID64+"'>TF2 Outpost</a> | <a target='_blank' href='http://scrap.tf/profile/"+SteamID64+"'>Scrap.TF</a> | <a target='_blank' href='http://dispenser.tf/id/"+SteamID64+"'>dispenser.tf</a><br/>";
				links_container.innerHTML += "Misc: <a target='_blank' href='http://rep.tf/"+SteamID64+"'>Rep.TF</a> | <a target='_blank' href='http://tf2r.com/user/"+SteamID64+".html'>TF2R</a> | <a target='_blank' href='http://dota2lounge.com/profile?id="+SteamID64+"'>Dota 2 Lounge</a> | <a target='_blank' href='http://csgolounge.com/profile?id="+SteamID64+"'>CS:GO Lounge</a><br/>";

				// SteamRep
				var srequest = new XMLHttpRequest();
				srequest.onreadystatechange = function () {
					if (srequest.readyState == 4 && srequest.status == 200) {
						var steamrep = JSON.parse(srequest.responseText);
						steamrep = steamrep.steamrep;
						var fullrep = (steamrep.reputation.full=="") ? "No special reputation." : steamrep.reputation.full;
						document.getElementsByClassName("reputation-content")[0].innerHTML = fullrep;

						if(steamrep.reputation.full.indexOf("SCAMMER") != -1){
							document.getElementsByClassName("rep-header")[0].style.backgroundColor = "rgba(255, 0, 0, 0.25)";
							document.getElementsByClassName("rep-header")[0].style.border = "2px solid red";
							document.getElementsByClassName("profile_header_bg_texture")[0].style.border = "2px solid red";
							document.getElementsByClassName("profile_content")[0].style.border = "2px solid red";
							document.getElementsByClassName("profile_content")[0].style.borderTop = "none";
						}else if(steamrep.reputation.full.indexOf("CAUTION") != -1){
							document.getElementsByClassName("rep-header")[0].style.backgroundColor = "rgba(201, 129, 0, 0.25)";
						}else if(steamrep.reputation.full.indexOf("ADMIN") != -1){
							document.getElementsByClassName("rep-header")[0].style.backgroundColor = "rgba(0, 201, 40, 0.25)";
							document.getElementsByClassName("rep-header")[0].style.border = "2px solid green";
							document.getElementsByClassName("profile_header_bg_texture")[0].style.border = "2px solid green";
							document.getElementsByClassName("profile_content")[0].style.border = "2px solid green";
							document.getElementsByClassName("profile_content")[0].style.borderTop = "none";
						}else if(steamrep.reputation.full.indexOf("TRUSTED") != -1){
							document.getElementsByClassName("rep-header")[0].style.backgroundColor = "rgba(0, 201, 177, 0.25)";
						}else if(steamrep.reputation.full.indexOf("MIDDLEMAN") != -1){
							document.getElementsByClassName("rep-header")[0].style.backgroundColor = "rgba(0, 201, 177, 0.25)";
						}else if(steamrep.reputation.full.indexOf("DONATOR") != -1){
							document.getElementsByClassName("rep-header")[0].style.backgroundColor = "rgba(0, 105, 201, 0.25)";
						}
					}
				};
				srequest.open('GET', "https://steamrep.com/api/beta3/reputation/" + SteamID64 + "?json=1", true);
				srequest.send();

			}else if(window.location.href.indexOf("/linkfilter/?url=") != -1){

				// Link filter
				var url = document.getElementsByClassName("url")[0].innerText;
				var parsed = "http://"+parse_url(url).hostname,
					frag   = parsed.replace(/[^.]*\.(?=\w+\.\w+$)/, '').replace("http://","").replace("https://","");
				var container = document.getElementsByClassName("warningExplanation")[0];

				// functions for it
				function scs_remember_site(url) {
					var parsed = "http://"+parse_url(url).hostname,
						frag   = parsed.replace(/[^.]*\.(?=\w+\.\w+$)/, '').replace("http://","").replace("https://","");
					remembered_domains.push(frag);
					if(window.localStorage){
						window.localStorage['rememberedDomains'] = JSON.stringify(remembered_domains);
					}
					window.location = url;
				}
				function scs_never_ask(url) {
					if(window.localStorage){
						window.localStorage['neverAskAgain'] = true;
					}
					window.location = url;
				}
				inject_script(scs_remember_site.toString(), false);
				inject_script(scs_never_ask.toString(), false);

				if(window.localStorage['neverAskAgain'] && document.querySelectorAll(".friendlyInterstital > .warningSign").length >= 1){
					container.innerHTML = "<div style='font-size:26px;text-align:center;'>Redirecting...</div>";
					window.location = url;
				}else if(remembered_domains.indexOf(frag) != -1){
					// Go!
					container.innerHTML = "<div style='font-size:26px;text-align:center;'>Site already remembered.<br/><br/>Redirecting...</div>";
					window.location = url;
				}else{
					if(document.querySelectorAll(".friendlyInterstital > .warningSign").length >= 1){
						var ButtonContainer = document.getElementById("warningActions");
						ButtonContainer.innerHTML += "<a style=\"margin-top:8px;\" onclick=\"scs_remember_site('"+url+"')\" id=\"rememberButton\" href=\"javascript:void(0);\" class=\"btn_grey_white_innerfade btn_medium\"><span>Continue & Never ask me again for this domain</span></a>";
						ButtonContainer.innerHTML += "<a style=\"margin-top:8px;\" onclick=\"scs_never_ask('"+url+"')\" id=\"rememberButton2\" href=\"javascript:void(0);\" class=\"btn_grey_white_innerfade btn_medium\"><span>Continue & Never ask again for any domain</span></a><br/><small>Phishing sites will always be blocked no matter what option you use.</small>";
					}
				}
			}else if(window.location.href.indexOf("/market/") != -1){
				// Community market
				inject_script(run_community_market.toString());
			}

			// Remove ugly link hosts
			var elements = document.getElementsByClassName("bb_link_host");
			for (var i = elements.length - 1; i >= 0; i--) {
				elements[i].parentNode.removeChild(elements[i]);
			};

			// Auto check market thing
			if(document.getElementById("market_buynow_dialog_accept_ssa") != undefined){
				document.getElementById("market_buynow_dialog_accept_ssa").checked = true;
			}

			log("Verified valve site");
		}else{
			var parsed = "http://" + parse_url(window.location.href).hostname;
			var frag   = parsed.replace(/[^.]*\.(?=\w+\.\w+$)/, '').replace("http://","");
			if(ignore_domains.indexOf(frag) == -1){
				log("Fake valve site");
				var fake_site_box = "";
				fake_site_box += "<div id=\"steam_blocked_modal\" style=\"font-family:Arial,sans-serif !important;display:block;opacity:1 !important;background:rgba(0,0,0,.8);z-index:999999;position:fixed;top:0px;left:0px;width:100%;height:100%;\">";
				fake_site_box += "   <div style=\"display:block;opacity:1 !important;box-shadow: 0px 0px 6px #000 inset;z-index:99999;width:600px;margin:auto;margin-top:300px;text-align:center;color:#FFF;border:5px solid #000;border-color:red;background:rgba(255,0,0,.4);padding:30px;font-size:16px;border-radius:12px;\">";
				fake_site_box += "       <h1 style='font-family:Arial,sans-serif !important;color:#FFF !important;font-size:30px !important;font-weight:bold !important;'>DANGER!</h1>This is <b>NOT</b> an official Valve website!<br/>";
				fake_site_box += "       This is most likely a phishing attempt and you should get out now!<br/><br/>";
				fake_site_box += "       <span style=\"font-size:12px;\">Alternatively, If you <i>really</i> want to see this site <a href=\"#\" onclick=\"document.getElementById('steam_blocked_modal').style.display='none';\" >click here.</a><br/>If you think this is incorrect <a href='mailto:jessecar96+suite@gmail.com?Subject=Steam%20Community%20Suite%20Report'>report it to me here</a></span>";
				fake_site_box += "   </div>";
				fake_site_box += "</div>";
				document.body.innerHTML += fake_site_box;
			}else{
				log("Ignored domain");
			}
		}

		// Steam Trades & Offers
		if(window.location.href.indexOf("steamcommunity.com/tradeoffer/new/") != -1 || window.location.href.indexOf("steamcommunity.com/trade/") != -1){

			log("In Trade UI");

			// Dump page button
			document.getElementById("inventory_box").getElementsByClassName("trade_box_contents")[0].getElementsByClassName("trade_rule")[0].insertAdjacentHTML('beforebegin',"<a style='position: relative;left: 299px;top: 7px;' class='pagecontrol_element pagebtn' href='javascript:dump_page_to_trade();' >Dump page</a>");

			function dump_page_to_trade() {
				var InvPage = document.getElementById("inventory_"+g_steamID+"_"+g_ActiveInventory.appid+"_2").getElementsByClassName("inventory_page")[parseInt(document.getElementById('pagecontrol_cur').innerHTML - 1)];
				InvPage = InvPage.children;
				for (var i = InvPage.length - 1; i >= 0; i--) {
					if(InvPage[i].style.display != "none"){
						var x = InvPage[i].querySelectorAll("a");
						for (var f = x.length - 1; f >= 0; f--) {
							if(x[f].href != undefined && x[f].href.indexOf("steamcommunity.com") == -1) continue;
							MoveItemToTrade(InvPage[i]);
						};
					}
				};
			}
			inject_script(dump_page_to_trade.toString(), false);
		}

		log("Loaded");

	});

} // end valve_test_site