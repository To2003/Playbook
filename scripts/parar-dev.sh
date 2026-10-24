#!/bin/sh
# Corta cualquier `next dev` / `next start` que haya quedado corriendo.
for p in /proc/[0-9]*; do
  c=$(tr '\0' ' ' < "$p/cmdline" 2>/dev/null)
  case "$c" in
    *next-server*|*"bin/next dev"*|*"bin/next start"*) kill "${p#/proc/}" 2>/dev/null ;;
  esac
done
exit 0
