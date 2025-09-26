#!/bin/bash
DOCKER_CONTAINER_NAME="caryolite-cli-bot"
DOCKER_IMAGE_NAME="caryolite/cli-bot"
DOCKER_IMAGE_TAG="latest"

docker build \
    $@ -t "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG:-latest}" . || exit
[ "$(docker ps | grep $DOCKER_CONTAINER_NAME)" ] && docker kill ${DOCKER_CONTAINER_NAME} || true
[ "$(docker ps -a | grep $DOCKER_CONTAINER_NAME)" ] && docker rm ${DOCKER_CONTAINER_NAME} || true

docker run \
    -d \
    --name "${DOCKER_CONTAINER_NAME}" \
    --restart=always \
    "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG:-latest}"