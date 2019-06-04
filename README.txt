This plugin is compatible with chromium and firefox.
The source tree is in lliurex-on-fire/

HOW TO BUILD
This plugin needs the username and private key from the mozilla developer network. As those are sensible data the build process of this package takes two stages.
First Stage)
	Copy the build directory to /tmp and cd into it
	Fill the file passfile with the username and private key
	Build the plugins invoking sudo ./generate_addons.sh
Second stage)
	Return to orig folder
	Copy the tmp generated plugins (inside chromium-plugin and firefox-plugin) to its respective folders
	Build for launchpad as usual (svn-buildpackage or gbp-buildpackage) and dput the changes file.

The shell generate_addons.sh is invoked by the build process and generates both plugins in their respective folders.
Before building the packaga IS MANDATORY to set the correct values for MOZILLA_USER and MOZILLA_KEY in ./passfile. Those values are our own user and secret key from the mozilla developer network.

