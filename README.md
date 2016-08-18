# apkbuilder
Build packages for alpine


## Install
You'll need [docker](https://docker.com) and [git](https://git-scm.com) installed, then just clone

    git clone git@github.com:orangemug/apkbuilder.git

You'll then be able to run the scripts, which will build / run in images in docker containers


## Usage
Build all files

    ./scripts/build

To build a particular files
    
    ./scripts/build [apk-path]

This will create a package index file in

    ./packages/x86_64/APKINDEX.tar.gz

To install from this repo use

    apk add --repository "file://$(pwd)/packages" [pkg-name]


## License
[MIT](LICENSE)
