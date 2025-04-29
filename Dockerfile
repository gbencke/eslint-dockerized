FROM alpine:3.21.3
LABEL \
	maintainer="cytopia <cytopia@everythingcli.org>" \
	repo="https://github.com/cytopia/docker-eslint"

RUN set -eux \
	&& apk add --no-cache \
		nodejs-current \
		npm

RUN set -eux && npm install -g \
         @eslint/js@9.24.0 \
         typescript@5.8.3 \
         eslint-formatter-compact \
         eslint-formatter-unix \
         typescript-eslint@8.29.0 \
         jiti@2.4.2 \
         eslint@9.24.0 \
         eslint-config-hardcore@47.0.1\
         eslint-plugin-promise@7.2.1 \
         @eslint-react/eslint-plugin \
         eslint-plugin-functional@9.0.1 && /usr/local/lib/node_modules/eslint/bin/eslint.js --version | grep -E '^v?[0-9]+'

ENV NODE_PATH=/usr/local/lib/node_modules
RUN set -eux && cp /usr/local/lib/node_modules/eslint/bin/eslint.js /usr/bin/eslint

COPY ./config /config

WORKDIR /data
ENTRYPOINT ["eslint"]

CMD ["--help"]

