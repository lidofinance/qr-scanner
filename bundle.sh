#!/bin/bash

rm -rf build/
mkdir build

mkdir -p temp
cp -R src/ temp/

inline-script-tags temp/index.html temp/index.html
inline-stylesheets temp/index.html temp/index.html

cp temp/index.html build/

rm -rf temp/
