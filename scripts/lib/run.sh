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
  -v $root:/home/tmpbuild/ \
  --user tmpbuild \
  $IMAGE_ID \
  "`cat $script_dir/$1`"
