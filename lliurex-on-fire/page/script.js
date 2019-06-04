var lang=navigator.language;
error={'code':'','text':''};
error.text=document.URL.match(/text=([a-zA-Z\ ]+)/);
error.text=error.text[1];
error.err=document.URL.match(/err=([0-9]+)/);
error.err=error.err[1];
lang=lang.split('-')[0];
switch (lang)
{
	case "es":
		text="<svg viewBox='0 0 70 20'><text x='0' y='15'>¡¡Ooops!!</text></svg><br><h5>No se puede encontrar la p&aacute;gina que buscas.</h5><br>";
		text+="<br>Ocurri&oacute; un error "+error.err+" al cargar la p&aacute;gina.<br>"
		if (error.err=='404')
		{
			text+="Si LliureX Guard est&aacute activo puede que esta p&aacutegina haya sido bloqueada por los filtros.<br>"
		} else {
			text+=error.text+"<br>";
		}
		break;
	case "ca":
		text="<svg viewBox='0 0 65 20'><text x='0' y='15'>Ooops!!</text></svg><br><h5>No pot trobar-se la p&agravegina que busques.</h5><br>";
		text+="<br>S'ha produit un error "+error.err+" en carregar la p&agravegina;.<br>"
		if (error.err=='404')
		{
			text+="Si el LliureX Guard es actiu aquesta p&agrave;gina pot ser estiga bloquejada pels filtres web.<br>"
		} else {
			text+=error.text+"<br>";
		}
 
		break;
	default:
		text="<svg viewBox='0 0 65 20'><text x='0' y='15'>Ooops!!</text></svg><br><h5>We can't find the page you're looking for.</h5><br>";
		text+="<br>There was an error "+error.err+" when loading the page.<br>"
		if (error.err=='404')
		{
			text+="If LliureX Guard is active then this page could have been blocked by the web filters.<br>"
		} else {
			text+=error.text+"<br>";
		}
 
}
document.getElementById("error").innerHTML=text;
