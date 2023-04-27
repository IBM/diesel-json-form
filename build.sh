#!/usr/bin/env bash
yarn install && \
yarn bomlint && \
yarn --cwd json-form build && \
yarn --cwd sandbox build