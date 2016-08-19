# apkbuilder
Build packages for alpine


## Install
You'll need [docker](https://docker.com) and [git](https://git-scm.com) installed, then just clone

    git clone git@github.com:orangemug/apkbuilder.git

You'll then be able to run the scripts, which will build / run in images in docker containers


## Usage
The APKBUILD files live in `./apk/{package_name}/{package_version}`, to build all the packages run

    ./scripts/build

To build all versions of a particular package run
    
    ./scripts/build [package_name]

To build a specific version of a package run

    ./scripts/build [package_name] [package_version]

The above will build the package to `./packages` with the repository built in `./repository`

To install from this repo use

    apk add --update --repository "file://$(pwd)/repository" [package_name]


## License
[MIT](LICENSE)
