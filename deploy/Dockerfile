FROM nginx:1.27.2

COPY nginx.conf /etc/nginx/nginx.conf
COPY dhparam.pem /tmp/
RUN mkdir /tmp/certs && mkdir /tmp/logs
