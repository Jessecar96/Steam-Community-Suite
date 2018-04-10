// Check page elements to see if this page is impersonating Steam

let steamPageMatches = 0;

// Find Steam's header logo inside #global_header
let globalHeader = document.getElementById("global_header");
if (globalHeader) {
  let headerImages = globalHeader.getElementsByTagName("img");
  for (let i in headerImages) {
    if (headerImages[i].src && headerImages[i].src.match(/steamcommunity-a\.akamaihd\.net\/public\/shared\/images\/header\/globalheader_logo\.png/gi)) {
      console.log("[SCS2] Found header logo");
      steamPageMatches++;
    }
  }
}

// Look for links to Steam's CDN in link tags
let stylesheets = document.getElementsByTagName("link");
for (let i in stylesheets) {
  if (stylesheets[i].href && stylesheets[i].href.match(/steamcommunity-a\.akamaihd\.net\/public\/css/gi)) {
    console.log("[SCS2] Found Steam's css CDN");
    steamPageMatches++;
  }
}

// Look for links to Steam's CDN in script tags
let scripts = document.getElementsByTagName("script");
for (let i in scripts) {
  if (scripts[i].src && scripts[i].src.match(/steamcommunity-a\.akamaihd\.net\/public\/javascript/gi)) {
    console.log("[SCS2] Found Steam's javascript CDN");
    steamPageMatches++;
  }
}

// Look for text in #footerText
let footerText = document.getElementById("footerText");
if (footerText && footerText.innerText.match(/© Valve Corporation\. All rights reserved\./gi)) {
  console.log("[SCS2] Found Steam's footer text");
  steamPageMatches++;
}

// Look for text in #global_action_menu
let globalActionMenu = document.getElementById("global_action_menu");
if (globalActionMenu && globalActionMenu.innerText.match(/Install Steam/gi)) {
  console.log("[SCS2] Found the Install Steam button");
  steamPageMatches++;
}

// Display warnings
if (steamPageMatches >= 2) {

  console.log("[SCS2] Steam page matches: " + steamPageMatches);

  if (window.location.href.match(/(?:http|https):\/\/(?:store.|support.|forums.|api.|media.|www.|staging.|)(?:steamcommunity|steampowered|dota2|steamgames|valvesoftware)\.com/gi)) {
    // Confirmed steam URL
    document.getElementById("global_header").style.borderBottom = "1px solid lightgreen";
  } else {
    // Fake Steam site

    document.body.innerHTML +=
        "<div style='position:absolute;top:0;left:0;height:100%;width:100%;z-index:9999;display:flex;justify-content:center;align-items:center;background-color: rgba(0,0,0,0.6);'>" +
        " <div style='border: 3px solid red;padding: 20px;background: #000000;color: #FFFFFF;text-align: center;'>" +
        "   <div style='font-size: 25px;font-weight: bold;margin-bottom: 20px;'>Danger! This is not an official Valve website.</div>" +
        "   <div style='font-size: 16px;margin-bottom: 5px;'>" +
        "     Logging into this site may result in your Steam account being compromised.<br/>" +
        "     It is reccomended that you close this tab and never return to this site." +
        "   </div>" +
        "   <div style='font-size:12px;color:#AAAAAA;'>Protection provided by [Steam Security Suite]</div>" +
        " </div>" +
        "</div>";
  }

}