
var lliurexUrl="https://mestreacasa.gva.es/web/lliurex/*";

function redirect(requestDetails)
{
	console.log("Redirect: "+requestDetails.url);
	return {
		redirectUrl:requestDetails.url.replace("https","http")
		};
}


chrome.webRequest.onBeforeRequest.addListener(
	redirect,
	{urls: [lliurexUrl]},
	["blocking"]
);
