#!/bin/bash
#
# Copyright The Linux Foundation All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
set -e

function clearContainers() {
  CONTAINER_IDS=$(docker ps -a | awk '($2 ~ /dev-peer.*.cargoguard.*/) {print $1}')
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    echo "---- No containers available for deletion ----"
  else
    docker rm -f $CONTAINER_IDS
  fi
}

function removeUnwantedImages() {
  DOCKER_IMAGE_IDS=$(docker images | awk '($1 ~ /dev-peer.*.cargoguard.*/) {print $3}')
  if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
    echo "---- No images available for deletion ----"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

cd ../base
echo y | ./base.sh down
clearContainers
removeUnwantedImages