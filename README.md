# apkbuilder
Build packages for alpine


## Install



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
