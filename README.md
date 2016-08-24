# apk-cd
Continous delivery for your alpine apk packages

[![stability-unstable](https://img.shields.io/badge/stability-unstable-yellow.svg)][stability]
[![Build Status](https://circleci.com/gh/orangemug/apkbuilder.png?style=shield)][circleci]

[stability]:   https://github.com/orangemug/stability-badges#unstable
[circleci]:    https://circleci.com/gh/orangemug/apkbuilder

Build and host alpine linux apk packages, both locally and publish them to github releases to use externally


## Install
You'll need [docker](https://docker.com) installed, then just run

    $ docker run -v $(pwd):~/ orangemug/apk-cd --help
    0.1.0

You can also install it as an npm package

    npm install -g orangemug/apk-cd

This will add the `apk-cd` to your `PATH`

    $ apk-cd --version
    0.1.0

Show usage with 

    $ apk-cd --help
    Continous delivery for your alpine apk packages

    Usage: apk-cd <command> [opts]

    Options:

      --verbose  Verbose logging

    Commands:

      build      Build packages in ./apk
      publish    Publish packages to github
      gh-pages   Generate github pages for the package index
      info       Get info about the build


## Usage
The `APKBUILD` files live in `./apk/{package_name}/{package_version}`, to build all the packages run

    apk-cd build

To build all versions of a particular package run
    
    apk-cd build [package_name]

To build a specific version of a package run

    apk-cd build [package_name] [package_version]

The above will build the package to `./packages` with the repository built in `./repository`


### Local repository
To use the local repository run the following where `REPO_PATH` is the path the your local `repository` directory

    apk update --allow-untrusted --repository "file://REPO_PATH/repository"

You can then run `apk add [package_name]` to install the packages you just created.


### Remote repository
Publish to your 'personal package manager' (github) run

    $ apk-cd publish
    Publishing 3 packages to 'githib.com/orangemug/apk-test' (master)
    [publishing] vips
    [publishing] vips-docs
    [publishing] vips-dev
    [complete]   vips
    [complete]   vips-docs
    [complete]   vips-dev

    Complete repo published at 'https://github.com/orangemug/apk-test/releases/download/master' to use

      apk add update \
        --allow-untrusted \
        --repository 'https://github.com/orangemug/apk-test/releases/download/master'
      apk add [package_name]

As the instructions above read just run the following to use your new repo

    apk add update \
      --allow-untrusted \
      --repository 'https://github.com/orangemug/apk-test/releases/download/master'

You can also generate a github pages index

    $ apk-cd gh-pages
    checkout [gh-pages]
    cleaing [gh-pages]
    assets: ./public
    verify: github[vips] Checking
    verify: github[vips] Ok
    build: ./master/vips.html
    build: ./master/index.html
    build: ./index.html
    complete (101ms)
    checkout [master]


### Continuous Integration
There a full example at [orangemug/apk-pkgs](github.com/orangemug/apk-pkgs) if you look at the `circle.yml`

    build:
      - apk-cd build
    deploy:
      - apk-cd publish
      - apk-cd gh-pages

On each commit it'll

 1. _Build_ the packages
 2. _Publish_ the packages
 3. _Generate_ a github pages site

You can see the completed site at <http://orangemug.github.io/apk-pkgs>



## License
[MIT](LICENSE)
