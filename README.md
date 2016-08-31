# apk-packager
Build and publish your [alpine linux](https://alpinelinux.org) apk packages

[![stability-wip](https://img.shields.io/badge/stability-work_in_progress-lightgrey.svg)][stability]
[![Build Status](https://circleci.com/gh/orangemug/apkbuilder.png?style=shield)][circleci]

[stability]:   https://github.com/orangemug/stability-badges#work-in-progress
[circleci]:    https://circleci.com/gh/orangemug/apkbuilder

Build and host alpine linux apk packages, both locally and publish them to github releases to use externally


## Install
You'll need [docker](https://docker.com) installed, then just run

    $ docker run -v $(pwd):~/ orangemug/apk-packager --help
    0.1.0

You can also install it as an npm package (the prefered method)

    npm install -g orangemug/apk-packager

This will add the `apk-packager` to your `PATH`

    $ apk-packager --version
    0.1.0

Show usage with

    $ apk-packager --help
    Usage: apk-packager <command> [options] [root-dir]

    Commands:
      build    Build packages in ./apk
      publish  Publish packages to github
      web      Generate github pages for the package index

    Options:
      --version, -v  Return the version
      --help, -h     Show help                                             [boolean]

    For more information <https://github.com/orangemug/apk-packager>


## Usage
The `APKBUILD` files live in `./apk/{package_name}/{package_version}`, to build all the packages run

    apk-packager build

To build all versions of a particular package run
    
    apk-packager build [package_name]

To build a specific version of a package run

    apk-packager build [package_name]@[package_version]

The above will build the package to `./packages` with the repository built in `./repository`


### Local repository
To use the local repository run the following where `REPO_PATH` is the path the your local `repository` directory

    apk add \
      --update \
      --allow-untrusted \
      --repository "file://REPO_PATH/repository" \
      <package-name>


### Remote repository
Publish to your 'personal package manager' (github) run

    $ apk-packager publish

This will pick the github repo from the git remote origin and publish to the github releases for that repo

To use the github releases repo

    apk add \
      --update \
      --allow-untrusted \
      --repository 'https://github.com/:user/:repo/releases/download/master' \
      <package-name>



## License
[MIT](LICENSE)
