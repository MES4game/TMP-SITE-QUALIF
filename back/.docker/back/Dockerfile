FROM node:24.14.0-alpine3.23

RUN apk add --no-cache \
	qemu-system-x86_64 \
	qemu-img \
	curl \
	jq \
	coreutils \
	cloud-utils \
	openssh-client \
	python3 py3-pip \
	bash \
	cloud-utils-localds \
    screen

RUN corepack enable pnpm

SHELL [ "bash", "-c" ]

COPY --from=config --chmod=755 bootstrap.sh /vm/bootstrap.sh

WORKDIR /app

COPY --chmod=644 package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

COPY --from=config --chmod=755 entrypoint.sh /docker-entrypoint.sh

EXPOSE 3000
VOLUME /mounted

ENTRYPOINT ["/docker-entrypoint.sh"]
