#This shell generate and signs the chromium and firefox plugins for lliurex-on-fire
#Don't execute!! rules will launch it in the build package step
#!/bin/bash

ADDON=lliurex-on-fire
NODE_MIN_VERSION=6
BASE_DIR=${PWD}
#If the .pem file changes CHROMIUM_ID will change and must be updated "manually"
CHROMIUM_ID=akabjpjncgokcndehhncnbgginikpgdp
CHROMIUM_DIR=${BASE_DIR}/chromium_addon/usr/share/chromium/extensions
CHROME_DIR=${BASE_DIR}/chromium_addon/usr/share/google-chrome/extensions
FIREFOX_DIR=${BASE_DIR}/firefox_addon/usr/lib/firefox/distribution/extensions
BUILD_DIR=${BASE_DIR}"/build"
#Mozilla supports the id key at manifest.json 
MOZILLA_ID=lliurex-on-fire@lliurex.net
MOZILLA_MANIFEST_ID="\"applications\":
 {
  \"gecko\": {
    \"id\":\"${MOZILLA_ID}\"
    }
  }
}"
#passfile declares $MOZILLA_USER and $MOZILLA_KEY for addon signing
source passfile
if [ -z $MOZILLA_USER ] || [ -z $MOZILLA_KEY ]
then
	echo "**** ERROR ****"
	echo "Remember to fill MOZILLA_USER and MOZILLA_KEY in passfile"
	exit 1
fi
		

function get_npm_web
{
	npm list -g web-ext 1>/dev/null
	if [ $? -ne 0 ]
	then
		sudo npm install web-ext
	fi
}

function generate_chromium_addon
{
	mkdir -p $BUILD_DIR 2>/dev/null
	mkdir -p $CHROMIUM_DIR 2>/dev/null
	cp -r ${BASE_DIR}"/"${ADDON} $BUILD_DIR 
	cd $BUILD_DIR
	EXTERNAL_VERSION=$(grep \"version\": ${ADDON}/manifest.json | cut -d '"' -f4)
	#If for any reason there's a need to regenerate the pem file uncomment this lines and refresh CHROMIUM_ID value
#	chromium-browser --pack-extension=${BUILD_DIR}"/"$ADDON
#	rm ./*crx
	chromium-browser --pack-extension=${BUILD_DIR}"/"$ADDON --pack-extension-key=${BASE_DIR}/lliurex-on-fire.pem
	mv $BUILD_DIR/*crx $CHROMIUM_DIR
	cd $CHROMIUM_DIR
	sed -i "s/\"external_version.*/\"external_version\":\"$EXTERNAL_VERSION\"/" ${CHROMIUM_ID}.json
	cp ${CHROMIUM_ID}.json $CHROME_DIR
	cp *.crx $CHROME_DIR
	cd ${BASE_DIR}
}

function generate_firefox_addon
{
	get_npm_web
	mkdir -p $BUILD_DIR 2>/dev/null
	mkdir -p $FIREFOX_DIR 2>/dev/null
	cp -R ${BASE_DIR}"/"${ADDON} $BUILD_DIR
	cd $BUILD_DIR"/"${ADDON}
	sed -i -e '$s/}//' -e 's/[[:space:]]}$/},/' manifest.json
	echo "$MOZILLA_MANIFEST_ID" >> manifest.json
	web-ext build
	#Remember to fill MOZILLA_USER and MOZILLA_KEY in passfile 
	web-ext sign --api-key=$MOZILLA_USER --api-secret=$MOZILLA_KEY
	cd web-ext-artifacts
	mv *xpi ${FIREFOX_DIR}/${MOZILLA_ID}.xpi
	cd ${BASE_DIR}
}

rm -fr $BUILD_DIR 2>/dev/null
#If you want to delete the plugins before generate them uncomment this
#If generation of any of them fails there will be no plugin in the package...
#rm -fr $CHROMIUM_DIR/*crx 2>/dev/null
#rm -fr $FIREFOX_DIR/*xpi 2>/dev/null
NODE_VERSION=$(nodejs -v)
echo "Using node: $NODE_VERSION"
if [ ${NODE_VERSION:1:1} -lt $NODE_MIN_VERSION ]
then
	echo "At least version $NODE_MIN_VERSION.x is needed for nodejs. Your current version is $NODE_VERSION"
	exit 1
fi
[ -z $(which npm) ] && echo "Install nodejs (>=6.0) to proceed" && exit 2
[ ! -z $(which chromium-browser) ] && generate_chromium_addon 
rm -fr $BUILD_DIR 2>/dev/null
[ ! -z $(which firefox) ] && generate_firefox_addon 
rm -fr $BUILD_DIR 2>/dev/null

