/**
 * Extension that adds Lliurex mods to Firefox/Chromium
 */

var lliurex_bm_url={
	'https://mestreacasa.gva.es/web/lliurex/forums':'Foro de LliureX',
	'https://portal.edu.gva.es/appsedu/':'AppsEdu',
	'https://wiki.edu.gva.es/lliurex/tiki-index.php':'Wiki de LliureX',
	'https://portal.edu.gva.es/lliurex/va/':' Blog de LliureX',
	'https://portal.edu.gva.es/lliurex/va/':'LliureX',
};
var extra_bm_url={
	'https://portal.edu.gva.es/aules/es/inicio/':'Aules'
};
var gva_tools={
	'http://www.ceice.gva.es/va/web/centros-docentes/guia-de-centros-docentes':'Guía de Centros',
	'https://oficinavirtual.gva.es':'OVICE',
	'https://ovidoc.edu.gva.es':'OVIDOC',
	'https://portal.edu.gva.es/sai/':'SAI',
	'https://portal.edu.gva.es/biblioedu/':'BiblioEdu',
	'https://portal.edu.gva.es/portal/va/inici/':'PortalEdu',
	'https://itaca.edu.gva.es/':'Itaca',
};
var gva_sites={
	'http://www.ceice.gva.es/es/web/formacion-profesorado':'CEFIREs',
	'https://portal.edu.gva.es/itedugva/va':'ITEDU',
	'http://www.ceice.gva.es/es':'Web CEICE',
};
var bm_dict={'LliureX':lliurex_bm_url,'Aules':extra_bm_url,'Utils. GVA':gva_tools,'GVA sites':gva_sites};
var bm_remove=['Mestre a casa'];
var max_tries=6;
var bm_tree=[];
var query="";
var bookmark_bar_id=0;
var bookmark_title='';


/* Search providers for firefox must be on https. The lliurex forum is on http so we need to redirect the "fake" search provider to the "real" url */
var lliurexUrl="https://mestreacasa.gva.es/web/lliurex/*";

function redirect(requestDetails)
{
	console.log("Redirect: "+requestDetails.url);
	return {
		redirectUrl:requestDetails.url.replace("https","http")
		};
}
//function redirect

function resolved(record)
{
	let ip=record.addresses[0];
	console.log(record);
	record=null;
	if (ip=="169.254.254.254")
	{
		updating=chrome.tabs.update(id,{
			active:true,
			url: "page/index.html?text="+tabUrl
	});

	}
}
//function resolved

function not_resolved(record)
{
	console.log("Not resolved");
	console.log(record);
	return;
}
//function not_resolved

function loadErrorOcurred(details)
{
	console.log("LOAD ERROR");
	//Disabled. Remove "return" to enable
//	return;
	id=details.tabId;
	let tabUrl=details.url;
	if (tabUrl.startsWith("moz"))
	{
		return;
	}
	console.log(tabUrl);
	let frameId=details.frameId;
	let domain=new URL(details.url).hostname;
	if((typeof(chrome.dns=="object")) && (frameId==0))
	{
		console.log(details);
		try
		{
			console.log("Domain: "+domain);
			chrome.dns.resolve(domain,["bypass_cache"]).then(resolved);
		}catch{
			console.log(details.rul);
			not_resolved(details.url);
		};
	}else{
		console.log("Fetching: "+details.url);
		if (frameId==0)
		{
			fetch(domain).then(resolved);
		}
	}
}
//function loadErrorOcurred

function reload(bm_folder)
{
	console.log("Reload: "+bm_folder)
	if (! bm_folder[0])
	{
		if (max_tries)
		{
			max_tries=max_tries-1;
			//chrome.runtime.reload();
		}
	}
}
//function reload

function checkBookmarks(bm_item)
{
	let bm=bm_item;
	console.log(bm_item[0]);
	console.log("Lliurex-on-fire: check bm " + bm_item);
	let folder_dict=bm_dict[bm.title];
	console.log("Debug checkBookamrks -->");
	console.log(folder_dict);
	console.log("Was: "+bm.title);
	
	console.log("Debug checkBookamrks --<");
	for (let [bm_url,bm_name] of Object.entries(folder_dict)){
			console.log("1: "+bm_url);
			console.log("2: "+bm_name);
			chrome.bookmarks.search({'title':bm_name,'url':bm_url}).then(function helper(bmTree){
				if (bm_name!=null)
				{
					var bm_data={'title':bm_name,'url':bm_url,'parentId':bm.id,'index':0};
					console.log('create '+bm_data['title']);
					console.log('parentId: '+bm.id);
					try
					{
						chrome.bookmarks.create(bm_data);
					} catch {
						not_resolved(bm_data['title']);
					}
				}
			})
	}
	query={'title':bm.title};
	console.log("Q: "+query.title);
	chrome.bookmarks.search(query,reload);
}
//function checkBookmarks

function createBookmarksFolder(title)
{
	console.log("Lliurex-on-fire: Adding bm folder "+title);
	chrome.bookmarks.getTree(function(tree){
		console.log("Tree");
		console.log(tree);
		var bookmark_bar_id=""+tree[0].children[0].id;
		var bookmark_title=tree[0].children[0].title;
		if (bookmark_bar_id=="menu________")
		{
			console.log("Lliurex-on-fire: Browser toolbar");
			bookmark_bar_id='toolbar_____';
		}
		console.log("Lliurex-on-fire: Title "+bookmark_title+" id "+bookmark_bar_id);
		query={'title':title,'parentId':bookmark_bar_id};
		try
		{
			chrome.bookmarks.create(query,checkBookmarks)
		} catch {
			not_resolved(query["title"]);
		}

	});
	console.log("Processed");
}
//function createBookmarksFolder

function findBookmarkFolderByName(name, callback) {
	if (name.length==0)
		return;
	chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
		function search(nodes) {
			for (let node of nodes) {
				if (node.title === name && node.children) {
					callback(node.id);
					return true; 
				}
				if (node.children) {
					if (search(node.children)) {
						return true;
					}
				}
			}
			return false; // Not found
		}
		search(bookmarkTreeNodes);
	});
}
//function findBookmarkFolderByName

function removeBookmarkFolder(folderId) {
	chrome.bookmarks.getChildren(folderId, function(children) {
		 if (children.length === 0) {
			try
			{
				chrome.bookmarks.remove(folderId, function() {
					console.log('Removed '+folderId);
				});
			} catch {
				not_resolved("Err removing standalone "+folderId);
			}
		} else {
			let count = children.length;
			children.forEach(child => {
				if (child.url) {
					try
					{
						chrome.bookmarks.remove(child.id, function() {
							count--;
							if (count === 0) {
								try
								{
									chrome.bookmarks.remove(folderId, function() {
										console.log('Removed parent '+folderId);
									 });
								} catch {
									not_resolved("Err removing parent "+folderId);
								}
							}
						});
					} catch {
						not_resolved("Err removing last "+folderId);
					}
				} else {
					removeBookmarkFolder(child.id);
				}
			})
		}
	});
}
//function removeBookmarkFolder

function removeFolderByName(name) {
	findBookmarkFolderByName(name, function(folderId) {
		if (folderId) {
			removeBookmarkFolder(folderId);
		} else {
			console.log('Folder not found');
		}
	});
}
//function removeFolderByName

/*chrome.webRequest.onBeforeRequest.addListener(
	redirect,
	{urls: [lliurexUrl]},
	["blocking"]
);*/
		
chrome.webNavigation.onErrorOccurred.addListener(
		loadErrorOcurred
	);


self.addEventListener('install', (event) => {
	main
});

self.addEventListener('activate', (event) => {
	main
});


function main()
{
	console.log("Processing...");
	for (let idx in bm_remove)
	{
		removeFolderByName(bm_remove[idx]);
	}
	for (let name in bm_dict)
	{
		removeFolderByName(name);
	}
	for (let name in bm_dict)
		createBookmarksFolder(name);
}

var id=0;
var name="";
console.log("Lliurex-on-fire: Init");
main();
