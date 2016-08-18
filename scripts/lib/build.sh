sudo apk add --update

for dir in ./apk/*/
do
  pkgname="`basename $dir`"

  for vdir in ./$dir/*/
  do
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

        echo "Calculating package checksum..."
        abuild checksum

        echo "Packaging..."
        CHOST=$arch CTARGET=$ctarget abuild -r -K -s "/home/tmpbuild/build-cache/"
      cd $oldpwd
    done
  done
done

for ctarget in "x86_64"
do
  mkdir -p /home/tmpbuild/packages/$ctarget/

  echo "Sym-linking .apk files..."
  for apkpath in /home/tmpbuild/packages/*/$ctarget/*.apk
  do
    ln -s $apkpath /home/tmpbuild/packages/$ctarget/
  done;

  echo "Building index..."
  apk index -o /home/tmpbuild/packages/$ctarget/APKINDEX.tar.gz /home/tmpbuild/packages/*/$ctarget/*.apk
done
