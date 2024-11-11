docker build . -t below-api
docker stop below-api
docker run -d --rm --name below-api -it --network host -v $(pwd)/data:/tmp/api/data/ -v /tmp/sync:/tmp/sync below-api
