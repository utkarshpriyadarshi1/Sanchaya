#!/usr/bin/env bash
# Delegate execution to builder/build.sh
exec "$(dirname "$0")/builder/build.sh" "$@"
