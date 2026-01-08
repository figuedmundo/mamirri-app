#!/usr/bin/env bash

LENGTH=${1:-16}
TYPE=${2:-"human"}

case $TYPE in
  "hex")
    openssl rand -hex "$((LENGTH/2))"
    ;;
  "alpha")
    LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c "$LENGTH"
    echo ""
    ;;
  "human")
    LC_ALL=C tr -dc '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ' < /dev/urandom | head -c "$LENGTH"
    echo ""
    ;;
  *)
    exit 1
    ;;
esac
