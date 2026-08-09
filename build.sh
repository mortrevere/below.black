rm -rf build
docker run --rm -u $(id -u):$(id -g) -v "$(pwd)":/jinjapocalypse jinjapocalypse
find build -type f -name '*.yaml' -delete
