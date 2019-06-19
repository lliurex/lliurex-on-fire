var lang=navigator.language;
error={'code':'','text':''};
lang=lang.split('-')[0];
error.text=document.URL.match(/text=([a-zA-Z:\/\.\ ]+)/);
error.text=error.text[1];
switch (lang)
{
	case "es":
		text="<h5>Esta p&aacute;gina est&aacute; bloqueada por el administrador.</h5><br>";
		text+="Si tienes cualquier problema o duda contacta con el administrador del sistema<br><br>";
		text+="<strong>Dominio bloqueado: </strong>"+error.text+"<br>";
		break;
	case "ca":
		text="<h5>Esta p&aacute;gina est&aacute; bloquejada per l'administrador.</h5><br>";
		text+="Si tens qualsevol problema o dubte contacta amb el administrador del sistema<br><br>";
		text+="<strong>Domini bloquejat: </strong>"+error.text+"<br>";
		break;
	default:
		text="<h5>This page is blocked by the administrator.</h5><br>";
		text+="If you have nay question please contact the system administrator<br><br>";
		text+="<strong>Blocked domain: </strong>"+error.text+"<br>";
		break;
 
}
document.getElementById("error").innerHTML=text;
