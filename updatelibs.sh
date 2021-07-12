#!/bin/bash

rm -rf src/lib/
mkdir src/lib
wget https://cdnjs.cloudflare.com/ajax/libs/webrtc-adapter/3.3.3/adapter.min.js -O ./src/lib/adapter.min.js
wget https://cdnjs.cloudflare.com/ajax/libs/vue/2.1.10/vue.min.js -O ./src/lib/vue.min.js

# fixed to latest build from master
# https://github.com/schmich/instascan/commit/b0f9519f2dd2a6661e67066d6ed678e621dd5ce2
wget https://github.com/schmich/instascan-builds/blob/36ad50f009718fafa78ac09aa275fe6430106360/instascan.min.js?raw=true -O ./src/lib/instascan.min.js
wget https://github.com/nodeca/pako/blob/2.0.3/dist/pako.min.js?raw=true -O ./src/lib/pako.min.js