#This shell generate and signs the chromium and firefox plugins for lliurex-on-fire
#Don't execute!! rules will launch it in the build package step
#!/bin/bash

ADDON=lliurex-on-fire
CHROMIUM_ADDON=lliurex-on-chrome
NODE_MIN_VERSION=6
BASE_DIR=${PWD}
#If the .pem file changes CHROMIUM_ID will change and must be updated "manually"
CHROMIUM_ID=akabjpjncgokcndehhncnbgginikpgdp
CHROMIUM_DIR=${BASE_DIR}/chromium_addon/usr/share/chromium/extensions
CHROME_DIR=${BASE_DIR}/chromium_addon/usr/share/google-chrome/extensions
FIREFOX_DIR=${BASE_DIR}/firefox_addon/usr/lib/firefox/distribution/extensions
BUILD_DIR=${BASE_DIR}"/build"
CHROMIUM_BUILD_DIR=${BUILD_DIR}"/lliurex-on-chrome"
MANIFEST=${ADDON}/manifest.json
CHROMIUM_MANIFEST=${ADDON}/manifest.json_google
FIREFOX_MANIFEST=${ADDON}/manifest.json_mozilla
#Mozilla supports the id key at manifest.json 
MOZILLA_ID=lliurex-on-fire@lliurex.net
MOZILLA_MANIFEST_ID="\"applications\":
 {
  \"gecko\": {
    \"id\":\"${MOZILLA_ID}\"
    }
  }
}"

function get_npm_web
{
	npm list -g web-ext 1>/dev/null
	if [ $? -ne 0 ]
	then
		sudo npm install web-ext
	fi
}

function check_firefox_needs
{
	[ -z $(which npm) ] && echo "Install nodejs (>=6.0) to proceed" && exit 2
	#passfile declares $MOZILLA_USER and $MOZILLA_KEY for addon signing
	source passfile
	if [ -z $MOZILLA_USER ] || [ -z $MOZILLA_KEY ]
	then
		echo "**** ERROR ****"
		echo "Remember to fill MOZILLA_USER and MOZILLA_KEY in passfile"
		exit 1
	fi
			

	rm -fr $BUILD_DIR 2>/dev/null
	#If you want to delete the plugins before generate them uncomment this
	#If generation of any of them fails there will be no plugin in the package
	#rm -fr $CHROMIUM_DIR/*crx 2>/dev/null
	#rm -fr $FIREFOX_DIR/*xpi 2>/dev/null
	NODE_VERSION=$(nodejs -v)
	NODE_VERSION=${NODE_VERSION/v/}
	echo "Using node: $NODE_VERSION"
	if [ ${NODE_VERSION/.*/} -lt $NODE_MIN_VERSION ]
	then
		echo "At least version $NODE_MIN_VERSION.x is needed for nodejs. Your current version is $NODE_VERSION"
		exit 1
	fi
}

function generate_firefox_addon
{
	check_firefox_needs
	get_npm_web
	mkdir -p $BUILD_DIR 2>/dev/null
	mkdir -p $FIREFOX_DIR 2>/dev/null
	cp -R ${BASE_DIR}"/"${ADDON} $BUILD_DIR
	cd $BUILD_DIR
	cp -v $FIREFOX_MANIFEST $MANIFEST
#	sed -i -e '$s/}//' -e 's/[[:space:]]}$/},/' manifest.json
#	echo "$MOZILLA_MANIFEST_ID" >> manifest.json
	cd $ADDON
	web-ext build
	#Remember to fill MOZILLA_USER and MOZILLA_KEY in passfile 
	web-ext sign --api-key=$MOZILLA_USER --api-secret=$MOZILLA_KEY --channel=unlisted
	cd web-ext-artifacts
	mv *xpi ${FIREFOX_DIR}/${MOZILLA_ID}.xpi
	cd ${BASE_DIR}
}

function generate_chromium_addon
{
	CHROMIUM_ADDON_MANIFEST=${CHROMIUM_ADDON}/manifest.json
	rm -vfr $CHROMIUM_BUILD_DIR 2>/dev/null
	mkdir -vp $CHROMIUM_BUILD_DIR 2>/dev/null
	cp -vr ${BASE_DIR}"/"${ADDON}/* $CHROMIUM_BUILD_DIR 
	cp -v ${CHROMIUM_MANIFEST} ${CHROMIUM_BUILD_DIR}
	cd $CHROMIUM_BUILD_DIR
	EXTERNAL_VERSION=$(grep \"version\": ${CHROMIUM_BUILD_DIR}/manifest.json | cut -d '"' -f4)
	#If for any reason there's a need to regenerate the pem file uncomment this lines and refresh CHROMIUM_ID value
#	chromium --pack-extension=${BUILD_DIR}"/"$ADDON
#	rm ./*crx
	chromium --pack-extension=$CHROMIUM_BUILD_DIR --pack-extension-key=${BASE_DIR}/lliurex-on-fire.pem
	mv $BUILD_DIR/*crx $CHROMIUM_DIR
	cd $CHROMIUM_DIR
	mkdir $(basename $CHROMIUM_BUILD_DIR)
	cd $(basename $CHROMIUM_BUILD_DIR)
	#The extension must be distributed unpacked
	unzip ../lliurex-on-chrome.crx
	rm ../lliurex-on-chrome.crx
	cd ..
	#<-- Not working anymore
	#sed -i "s/\"external_version.*/\"external_version\":\"$EXTERNAL_VERSION\"/" ${CHROMIUM_ID}.json
	#cp ${CHROMIUM_ID}.json $CHROME_DIR
	## <--
	cp -r $(basename $CHROMIUM_BUILD_DIR) $CHROME_DIR
	cd ${BASE_DIR}
}

## MAIN ##

BUILD_FOR_CHROMIUM=1
BUILD_FOR_FIREFOX=1
if [ ${#@} -eq 1 ]
then
	case "$1" in
		*chromium)
			BUILD_FOR_FIREFOX=0
			;;
		*firefox)
			BUILD_FOR_CHROMIUM=0
			;;
		*)
			echo "Usage:"
			echo "$0 [chromium|firefox]"
			exit 0
			;;
	esac
fi

if [ $BUILD_FOR_FIREFOX -eq 1 ]
then
	rm -fr $BUILD_DIR 2>/dev/null
	[ ! -z $(which firefox) ] && generate_firefox_addon || echo "Firefox not found at PATH"
fi
if [ $BUILD_FOR_CHROMIUM -eq 1 ]
then
	[ ! -z $(which chromium) ] && generate_chromium_addon 
#	rm -fr $BUILD_DIR 2>/dev/null
fi

