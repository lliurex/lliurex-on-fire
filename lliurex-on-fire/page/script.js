var lang=navigator.language;
switch (lang)
{
	case lang.startsWith("es"):
		text="<h1>Ooops!!</h1><br><h5>We can't find the page you're looking for.</h5><br>";
		text+="<br>There was an error trying to load the page.<br>"
		text+="If LliureX Guard is active then this page could have been blocked by the web filters.<br>"
		break;
	case lang.startsWith("ca"):
		text="<h1>Ooops!!</h1><br><h5>We can't find the page you're looking for.</h5>";
		text+="<br>There was an error trying to load the page.<br>"
		text+="If LliureX Guard is active then this page could have been blocked by the web filters.<br>"

		break;
	default:
		text="<h1>Ooops!!</h1><br><h5>We can't find the page you're looking for.</h5>";
		text+="<br>There was an error trying to load the page.<br>"
		text+="If LliureX Guard is active then this page could have been blocked by the web filters.<br>"
}
document.getElementById("error").innerHTML=text;
