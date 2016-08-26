# apk-packager
Continous delivery for your alpine apk packages

[![stability-wip](https://img.shields.io/badge/stability-work_in_progress-lightgrey.svg)][stability]
[![Build Status](https://circleci.com/gh/orangemug/apkbuilder.png?style=shield)][circleci]

[stability]:   https://github.com/orangemug/stability-badges#work-in-progress
[circleci]:    https://circleci.com/gh/orangemug/apkbuilder

Build and host alpine linux apk packages, both locally and publish them to github releases to use externally


## Install
You'll need [docker](https://docker.com) installed, then just run

    $ docker run -v $(pwd):~/ orangemug/apk-packager --help
    0.1.0

You can also install it as an npm package

    npm install -g orangemug/apk-packager

This will add the `apk-packager` to your `PATH`

    $ apk-packager --version
    0.1.0

Show usage with 

    $ apk-packager --help
    Continous delivery for your alpine apk packages

    Usage: apk-packager <command> [opts]

    Options:

      --verbose  Verbose logging

    Commands:

      build      Build packages in ./apk
      publish    Publish packages to github
      gh-pages   Generate github pages for the package index
      info       Get info about the build


## Usage
The `APKBUILD` files live in `./apk/{package_name}/{package_version}`, to build all the packages run

    apk-packager build

To build all versions of a particular package run
    
    apk-packager build [package_name]

To build a specific version of a package run

    apk-packager build [package_name] [package_version]

The above will build the package to `./packages` with the repository built in `./repository`


### Local repository
To use the local repository run the following where `REPO_PATH` is the path the your local `repository` directory

    apk update --allow-untrusted --repository "file://REPO_PATH/repository"

You can then run `apk add [package_name]` to install the packages you just created.


### Remote repository
Publish to your 'personal package manager' (github) run

    $ apk-packager publish
    Publishing 3 packages to 'githib.com/orangemug/apk-example-repo' (master)
    [publishing] vips
    [publishing] vips-docs
    [publishing] vips-dev
    [complete]   vips
    [complete]   vips-docs
    [complete]   vips-dev

    Complete repo published at 'https://github.com/orangemug/apk-example-repo/releases/download/master' to use

      apk add update \
        --allow-untrusted \
        --repository 'https://github.com/orangemug/apk-example-repo/releases/download/master' [package-name]

As the instructions above read just run the following to use your new repo

    apk add \
      --allow-untrusted \
      --repository 'https://github.com/orangemug/apk-example-repo/releases/download/master' \
      hello-world


You can also generate a github pages index

    $ apk-packager gh-pages
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


### Continuous Delivery
To install a CI builder run

    apk setup-ci <service>

Where service one of

 - circle
 - travis
 - semaphore

It'll install the config files in the repository.

The installed config on each commit will

 1. _Build_ the packages
 2. _Publish_ the packages
 3. _Generate_ a github pages site

Theres an example at <https://github.com/orangemug/apk-example-repo>


## License
[MIT](LICENSE)
