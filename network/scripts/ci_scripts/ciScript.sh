#!/bin/bash -e
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# exit on first error

Parse_Arguments() {
  while [ $# -gt 0 ]; do
    case $1 in
      --byfn_eyfn_Tests)
        byfn_eyfn_Tests
        ;;
      --cargoguard_Tests)
        cargoguard_Tests
        ;;
    esac
    shift
  done
}

# run byfn,eyfn tests
byfn_eyfn_Tests() {

  echo
  echo "  ____   __   __  _____   _   _           _____  __   __  _____   _   _  "
  echo " | __ )  \ \ / / |  ___| | \ | |         | ____| \ \ / / |  ___| | \ | | "
  echo " |  _ \   \ V /  | |_    |  \| |  _____  |  _|    \ V /  | |_    |  \| | "
  echo " | |_) |   | |   |  _|   | |\  | |_____| | |___    | |   |  _|   | |\  | "
  echo " |____/    |_|   |_|     |_| \_|         |_____|   |_|   |_|     |_| \_| "

  ./byfn_eyfn.sh
}
# run fabcar tests
cargoguard_Tests() {

  echo " #############################"
  echo "npm version ------> $(npm -v)"
  echo "node version ------> $(node -v)"
  echo " #############################"

  echo
  echo " CARGOGUARD

  ./cargoguard.sh
}

Parse_Arguments $@
