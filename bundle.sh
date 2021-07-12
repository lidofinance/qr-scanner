#!/bin/bash

rm -rf docs/
mkdir docs

mkdir -p temp
cp -R src/* temp/

inline-script-tags temp/index.html temp/index.html
inline-stylesheets temp/index.html temp/index.html

cp temp/index.html docs/

rm -rf temp/
