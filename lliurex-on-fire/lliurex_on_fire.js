/**
 * Extension that adds Lliurex mods to Firefox/Chromium
 */

var bm_folder_name='LliureX';
var lliurex_bm_url={'http://wiki.lliurex.net/Inicio':'Wiki de LliureX','http://mestreacasa.gva.es/web/lliurex':'LliureX','http://mestreacasa.gva.es/web/lliurex/forums':'Foro de LliureX'};
var lliurex_bm_url_arr=Object.keys(lliurex_bm_url);
var extra_bm_url={'http://mestreacasa.gva.es/web/guest/inicio':'Mestre a casa'};
var extra_bm_url_arr=Object.keys(extra_bm_url);
var bm_treeNode=''
var max_tries=6

function actionLog(e)
{
	console.log("Lliurex-on-fire: "+e);
}

function createBookmark(bm_item_tree,name,url,folder_id)
{
	if (bm_item_tree[0]==null)
	{
		bm_data={'title':name,'url':url,'parentId':folder_id,'index':0};
		var bm=chrome.bookmarks.create(bm_data);
	}
}

function checkBookmarks(bm_item)
{
	console.log("Lliurex-on-fire: check bm");
	folder_id=bm_item.id;
	lliurex_bm_url_arr.forEach(function loop(url){
		var query={'url':url};
		var name=lliurex_bm_url[query['url']];
		var search=chrome.bookmarks.search(query,
					function helper(bm_item_tree){
							createBookmark(bm_item_tree,name,url,folder_id);
					});
	},this);
	extra_bm_url_arr.forEach(function loop(url){
		var query={'url':url}
		var name=extra_bm_url[query['url']];
		var search=chrome.bookmarks.search(query,
					function helper(bm_item_tree){
							createBookmark(bm_item_tree,name,url,folder_id);
					});
	},this);
	var query={'title':bm_folder_name};
	search=chrome.bookmarks.search(query,reload);
}

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

function createBookmarksFolder(title)
{
	console.log("Lliurex-on-fire: Add bm folder");
	var bookmark_bar_id=0;
	var bookmark_title='';
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

function processBookmarks(bm_folder)
{
	if (bm_folder[0])
	{
		checkBookmarks(bm_folder[0]);
	} else {
		console.log("Lliurex-on-fire: Listener");
//		browser.bookmarks.onCreated.addListener(function(){createBookmarksFolder('Lliurex')});
		createBookmarksFolder('LliureX');
	}

}

var search='';
var query={'title':bm_folder_name};
console.log("Lliurex-on-fire: Init");
search=chrome.bookmarks.search(query,processBookmarks);

