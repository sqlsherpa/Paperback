mkdir -p build
mkdir -p build/res

cp res/atlas.png build/res/atlas.png

cat \
	src/linalg.js \
	src/mesh.js \
	src/image.js \
	src/papertexture.js \
	src/cards.js \
	src/textureloader.js \
	src/resources.js \
	src/renderer.js \
	src/entity.js \
	src/cardentity.js \
	src/ambientocclusion.js \
	src/game.js \
	src/actions.js \
	src/sceneloader.js \
	src/scenes.js \
	src/main.js \
	> build/paper.js


# cp build/paper.js build/paper.compact.js
node shrinkit.js build/paper.js > build/paper.compact.js


 ./node_modules/uglify-es/bin/uglifyjs build/paper.compact.js \
 	--compress --screw-ie8 --mangle toplevel -c --beautify --mangle-props regex='/^_/;' \
 	-o build/paper.min.beauty.js

./node_modules/uglify-es/bin/uglifyjs build/paper.compact.js \
	--compress --screw-ie8 --mangle toplevel --mangle-props regex='/^_/;' \
	-o build/paper.min.js


rm -f build/paper.zip

sed -e '/GAME_SOURCE/{r build/paper.min.js' -e 'd}' src/html-template.html > build/index.html
powershell Compress-Archive -Path build/index.html, build/res/ -CompressionLevel Optimal -DestinationPath build/paper.zip