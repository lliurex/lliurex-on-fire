This plugin is compatible with chromium and firefox.
The source tree is in lliurex-on-fire/

HOW TO BUILD
This plugin needs the username and private key from the mozilla developer network. As those are sensible data the build process of this package takes two stages.
First Stage)
	Fill the file passfile with the username and private key
	Edit debian/rules and uncomment the override that invokes the generate_addons shell
	Build the package with dpkg-buildpackage -us -uc -rfakeroot. This will generate both addons (mozilla and chromium)
Second stage)
	Empty the passfile info.
	Comment the override in debian/rules
	Build for launchpad as usual (svn-buildpackage or gbp-buildpackage) and dput the changes file.

The shell generate_addons.sh is invoked by the build process and generates both plugins in their respective folders.
Before building the packaga IS MANDATORY to set the correct values for MOZILLA_USER and MOZILLA_KEY in ./passfile. Those values are our own user and secret key from the mozilla developer network.

