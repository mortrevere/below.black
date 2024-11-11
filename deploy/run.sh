docker build . -t below-proxy
docker stop below-proxy
docker run -d --rm --name below-proxy -it --network host -v /etc/letsencrypt/live/www.below.black:/tmp/certs below-proxy
