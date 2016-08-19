script_dir="`pwd`/`dirname $0`/"
root="$script_dir/../../"

IMAGE_ID="alpine-apk-build-env"

# check if it exists
if [ -z "`docker images -a -q $IMAGE_ID`" ]
then
  echo "Not found image, building docker image..."
  docker build $script_dir/../../ -t "$IMAGE_ID"
fi

docker run \
  -t \
  -i \
  -v $root/apk:/home/tmpbuild/apk \
  -v $root/repository:/home/tmpbuild/repository \
  -v $root/packages:/home/tmpbuild/packages \
  -v $root/scripts:/home/tmpbuild/scripts \
  -v $root/Dockerfile:/home/tmpbuild/Dockerfile:ro \
  --user tmpbuild \
  $IMAGE_ID \
  "/home/tmpbuild/scripts/lib/$1 $2 $3 $4 $5"
 
 
