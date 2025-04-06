FROM alpine:3.21.3
LABEL \
	maintainer="cytopia <cytopia@everythingcli.org>" \
	repo="https://github.com/cytopia/docker-eslint"

RUN set -eux \
	&& apk add --no-cache \
		nodejs-current \
		npm

ARG VERSION=latest
RUN set -eux \
	&& if [ ${VERSION} = "latest" ]; then \
		npm install -g @eslint/js typescript typescript-eslint jiti eslint eslint-config-hardcore eslint-plugin-promise typescript-eslint eslint-plugin-functional; \
	else \
		npm install -g eslint@^${VERSION}.0.0; \
	fi \
	\
	&& /usr/local/lib/node_modules/eslint/bin/eslint.js --version | grep -E '^v?[0-9]+'

ENV NODE_PATH=/usr/local/lib/node_modules
# RUN set -eux && ln -sf /usr/local/lib/node_modules/eslint/bin/eslint.js /usr/bin/eslint
RUN set -eux && cp /usr/local/lib/node_modules/eslint/bin/eslint.js /usr/bin/eslint

COPY ./config /config

WORKDIR /data
ENTRYPOINT ["eslint"]

CMD ["--help"]

