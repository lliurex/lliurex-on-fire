/**
 * Extension that adds Lliurex mods to Firefox/Chromium
 */

var lliurex_bm_url={'http://wiki.lliurex.net/Inicio':'Wiki de LliureX','http://mestreacasa.gva.es/web/lliurex':'LliureX','http://mestreacasa.gva.es/web/lliurex/forums':'Foro de LliureX'};
var extra_bm_url={'http://mestreacasa.gva.es/web/guest/inicio':'Mestre a casa'};
var gva_tools={'https://itaca.edu-gva.es':'Itaca',
'https://aules.edu.gva.es/moodle':'Aules',
'https://webmail.gva.es':'Webmail',
'http://otrs.edu.gva.es/otrs/customer.pl':'Incidencias',
'https://ovidoc.edu.gva.es':'OVIDOC',
'https://appweb.edu.gva.es/SID':'SID',
'http://www.ceice.gva.es/es/web/centros-docentes/guia-de-centros-docentes':'Guía de Centros',
'https://appweb.edu.gva.es/InventarioWeb':'Inventario TIC',
'https://oficinavirtual.gva.es':'OVICE'
};
var gva_sites={'https://www.ceice.gva.es/es':'Web CEICE',
'https://portal.edu.gva.es/cvtic':'Comunidad CvTIV',
'http://www.ceice.gva.es/es/web/formacion-profesorado':'CEFIREs',
'http://google.es':'Wiki'
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
	var bm_folder_id=bm_item.id;
	var bm_folder=bm_item.title;
	console.log(bm_item)
	console.log("Lliurex-on-fire: check bm" + bm_folder);
	var folder_dict=bm_dict[bm_folder];
	for (let [bm_url,bm_name] of Object.entries(folder_dict)){
		console.log("Lliurex-on-fire: check url " + bm_url);
		console.log("Lliurex-on-fire: name " + bm_name);
		chrome.bookmarks.search({'url':bm_url},function helper(bmTree){
			if (bmTree[0]==null){
				bm_data={'title':bm_name,'url':bm_url,'parentId':bm_folder_id,'index':0};
				console.log('create '+bm_data['title']);
				chrome.bookmarks.create(bm_data);
			}
		});
	}
	var query={'title':bm_folder};
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
	console.log("Processing "+bm_folder)
	if (bm_folder[0])
	{
		checkBookmarks(bm_folder[0]);
	} 

}
//function processBookmarks

function resolved(record)
{
	console.log("Fetch error");
	if (record.status==200)
	{
		return;
	}
	console.log(record);
	updating=chrome.tabs.update(id,{
			active:true,
			url: "page/index.html?err="+record.status+"&text="+record.statusText
	});
}
//function resolved

function not_resolved(record)
{
	console.log(record);
	console.log("***");
	updating=chrome.tabs.update(id,{
			active:true,
			url: "page/index.html?err=404&text=page could not be loaded"
	});
}
//function not_resolved

function loadErrorOcurred(details)
{
	console.log(details);
	if ((details.url).startsWith("about"))
	{
		return;
	}
	console.log("Valid: "+details.url);
	id=details.tabId;
	fetch(details.url).then(resolved,not_resolved);
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
			search=chrome.bookmarks.search(query,processBookmarks);
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
