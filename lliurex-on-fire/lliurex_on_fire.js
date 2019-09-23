/**
 * Extension that adds Lliurex mods to Firefox/Chromium
 */

var lliurex_bm_url={'http://wiki.edu.gva.es/lliurex/tiki-index.php':'Wiki de LliureX','http://mestreacasa.gva.es/web/lliurex':'LliureX','http://mestreacasa.gva.es/web/lliurex/forums':'Foro de LliureX'};
var extra_bm_url={'http://mestreacasa.gva.es/web/guest/inicio':'Mestre a casa'};
var gva_tools={'https://itaca.edu.gva.es':'Itaca',
'https://aules.edu.gva.es/moodle':'Aules',
'https://webmail.gva.es':'Webmail',
'http://otrs.edu.gva.es/otrs/customer.pl':'Incidencias',
'https://ovidoc.edu.gva.es':'OVIDOC',
'https://appweb.edu.gva.es/SID':'SID',
'http://www.ceice.gva.es/es/web/centros-docentes/guia-de-centros-docentes':'Guía de Centros',
'https://appweb.edu.gva.es/InventarioWeb':'Inventario TIC',
'https://oficinavirtual.gva.es':'OVICE'
};
var gva_sites={'http://www.ceice.gva.es/es':'Web CEICE',
'https://portal.edu.gva.es/cvtic':'Comunidad CvTIV',
'http://www.ceice.gva.es/es/web/formacion-profesorado':'CEFIREs',
};
var bm_dict={'LliureX':lliurex_bm_url,'Mestre a casa':extra_bm_url,'Utils. GVA':gva_tools,'GVA sites':gva_sites};
var bm_treeNode='';
var max_tries=6;
var bm_tree=[];
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

function checkBookmarks(bm_item)
{
	let bm=bm_item;
	console.log("Lliurex-on-fire: check bm " + bm.id);
	let folder_dict=bm_dict[bm.title];
	for (let [bm_url,bm_name] of Object.entries(folder_dict)){
		console.log("Lliurex-on-fire: check url " + bm_url);
		console.log("Lliurex-on-fire: name " + bm_name);
		chrome.bookmarks.search({'title':bm_name,'url':bm_url},function helper(bmTree){
			if ((bmTree[0]!=null) && (bmTree[0].url!=null))
				chrome.bookmarks.remove(bmTree[0].id)
			bm_data={'title':bm_name,'url':bm_url,'parentId':bm.id,'index':0};
			console.log('create '+bm_data['title']);
			chrome.bookmarks.create(bm_data);
		});
	}
	var query={'title':bm.title};
	chrome.bookmarks.search(query,reload);
}
//function checkBookmarks

function reload(bm_folder)
{
	if (! bm_folder[0])
	{
		if (max_tries)
		{
			max_tries=max_tries-1;
			chrome.runtime.reload();
		}
	}
}
//function reload

function createBookmarksFolder(title)
{
	console.log("Lliurex-on-fire: Add bm folder "+title);
	chrome.bookmarks.getTree(function(tree){
		bookmark_bar_id=""+tree[0].children[0].id;
		bookmark_title=tree[0].children[0].title;
		if (bookmark_bar_id=="menu________")
		{
			console.log("Lliurex-on-fire: Firefox toolbar");
			bookmark_bar_id='toolbar_____';
		}
		console.log("Lliurex-on-fire: Title "+bookmark_title+" id "+bookmark_bar_id);
		query={'title':title,'parentId':bookmark_bar_id};
		bm_folder=chrome.bookmarks.create(query,function(newFolder){checkBookmarks(newFolder)})
		});
}
//function createBookmarksFolder

function processBookmarks(bm_folder)
{
	if (bm_folder[0])
	{
		console.log("Processing "+bm_folder[0])
		checkBookmarks(bm_folder[0]);
	} 

}
//function processBookmarks

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
	return;
}
//function not_resolved

function loadErrorOcurred(details)
{
	//Disabled. Remove "return" to enable
//	return;
	id=details.tabId;
	tabUrl=details.url;
	frameId=details.frameId;
	let domain=new URL(details.url).hostname;
	if((typeof(browser.dns=="object")) && (frameId==0))
	{
		console.log(details);
		try
		{
			console.log("Domain: "+domain);
			browser.dns.resolve(domain,["bypass_cache"]).then(resolved);
		}catch{
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

function getBookmarks(bookmarkItem)
{
	if (bookmarkItem.type="folder")
	{
//		console.log(bookmarkItem);
		if (bookmarkItem.title)
		{
			bm_tree.push(bookmarkItem.title);
		}
		if (bookmarkItem.children)
		{
			for (child of bookmarkItem.children)
			{
				getBookmarks(child);
			}
		}
	}
}

function exploreTree(bookmarkItems)
{
	getBookmarks(bookmarkItems[0]);
	for (name in bm_dict)
	{
		console.log("Checking "+name)
		if (bm_tree.includes(name))
		{
			var query={'title':name};
			chrome.bookmarks.search(query,processBookmarks);
		}else{
			createBookmarksFolder(name);
		}
	}
	console.log(bm_tree);
}

chrome.webRequest.onBeforeRequest.addListener(
	redirect,
	{urls: [lliurexUrl]},
	["blocking"]
);
		
chrome.webNavigation.onErrorOccurred.addListener(
		loadErrorOcurred
	);

var id=0;
console.log("Lliurex-on-fire: Init");
chrome.bookmarks.getTree(exploreTree);
