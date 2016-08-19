set -e 

usage () {
  echo "usage: $0 [pkg_name] [version]"
  echo ""
  echo "Build an APK from the directory './apk/{pkg_name}/{version}', passing no options will build all packages"
  echo ""
  echo "Options:"
  echo "  -v  show version"
  echo "  -h  show help"
}

VERSION="0.1.0"

dirname=""
dry_run="0"
while getopts "vhd?" opt; do
  case $opt in
    'd')  dry_run="1"
          ;;
    'v')  echo $VERSION
          exit 0
          ;;
    'h')  # it's always useful to provide some help 
          usage
          exit 0 
          ;;
    ':')  echo "Error: -$OPTARG requires an argument" 
          usage
          exit 1
          ;;
    '?')  echo "Error: unknown option -$OPTARG" 
          usage
          exit 1
          ;;
  esac
done
shift $(( $OPTIND - 1 ))

opt_package="$1"
opt_version="$2"


echo "Updating package cache"
if [ $dry_run -gt "0" ];
then
  echo "Dry run enabled: skipping"
else
  sudo apk add --update
fi

skipped=0
built=0

for vdir in ./apk/*/*
do
    if [ -n $opt_package -a $vdir != ./apk/$opt_package/* ];
    then
      echo "A Skipping: $vdir (incorrect package)"
      skipped=1
      continue
    fi

    if [ -n $opt_version -a $vdir != ./apk/$opt_package/$opt_version ];
    then
      echo "Skipping: $vdir (incorrect version)"
      skipped=1
      continue
    fi

    arch="`abuild -A`"
    # for ctarget in "x86" "x86_64" "armhf"
    for ctarget in "x86_64"
    do
      pkgversion=`basename $vdir`
      echo "Building: $pkgname@$pkgversion ($ctarget)..."

      oldpwd=`pwd`
      cd $vdir
        # verify the package version matches the name of the directory
        pkgdefver="`. ./APKBUILD; echo $pkgver`" 
        if [ "$pkgversion" != $pkgdefver ];
        then
          echo "APKBUILD package version does not match directory name (\"$pkgversion\" != \"$pkgdefver\")"
          exit 1
        fi

        built=1

        echo "Calculating package checksum..."
        if [ $dry_run -gt "0" ];
        then
          echo "Dry run enabled: skipping"
        else
          echo "foo"
          # abuild checksum
        fi

        echo "Calculating package checksum..."
        if [ $dry_run -gt "0" ];
        then
          echo "Dry run enabled: skipping"
        else
          echo "foo"
          # CHOST=$arch CTARGET=$ctarget abuild -r -K -s "/home/tmpbuild/build-cache/"
        fi

        echo "Packaging..."
      cd $oldpwd
    done
done

if [ $built -lt "1" -a $skipped -gt "0" ];
then
  echo $opt_version
  echo "No matches for filter '$opt_package@${opt_version:-"*"}'"
  exit 1
fi


echo "Calculating package checksum..."
if [ $dry_run -gt "0" ];
then
  echo "Dry run enabled: skipping"
else
  for ctarget in "x86_64"
  do
    mkdir -p /home/tmpbuild/repository/$ctarget/

    echo "Sym-linking .apk files from ./packages directory"
    for apkpath in /home/tmpbuild/packages/*/$ctarget/*.apk
    do
      sym_to_path="/home/tmpbuild/repository/$ctarget/`basename $apkpath`"
      if [ -f $sym_to_path ];
      then
        echo "removing: $sym_to_path"
        rm "/home/tmpbuild/repository/$ctarget/`basename $apkpath`"
      fi
      echo "linking: $sym_to_path"
      ln -s $apkpath /home/tmpbuild/repository/$ctarget/
    done;

    echo "Building index..."
    apk index -o /home/tmpbuild/repository/$ctarget/APKINDEX.tar.gz /home/tmpbuild/repository/$ctarget/*.apk
  done
fi
