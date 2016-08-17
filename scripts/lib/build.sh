sudo apk add --update

for dir in ./apk/*/
do
  pkgname="`basename $dir`"

  for vdir in ./$dir/*/
  do
    arch="`abuild -A`"
    for ctarget in "x86" "x86_64" "armhf"
    # for ctarget in "x86_64"
    do
      pkgversion=`basename $vdir`
      echo "Building: $pkgname@$pkgversion ($ctarget)"

      oldpwd=`pwd`
      cd $vdir
        # verify the package version matches the name of the directory
        pkgdefver="`. ./APKBUILD; echo $pkgver`" 
        if [ "$pkgversion" != $pkgdefver ];
        then
          echo "Invalid"
          exit 1
        fi

        # Build
        abuild checksum && CHOST=$arch CTARGET=$ctarget abuild -r -K -s "/home/tmpbuild/build-cache/"
      cd $oldpwd
    done
  done
done

for ctarget in "x86_64"
do
  apk index -o /home/tmpbuild/packages/$ctarget/APKINDEX.unsigned.tar.gz /home/tmpbuild/packages-tmp/*/$ctarget/*.apk
done

