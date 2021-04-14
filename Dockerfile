# To build:
#
#   docker build -t repolinter .
#
# To run against the current directory:
#
#   docker run -t -v $PWD:/src -w /src repolinter
#
# To run against a remote GitHub repository
#
#   docker run -t repolinter --git https://github.com/username/repo.git
#

ARG RUNTIME_DEPS="git libicu-dev perl"
ARG BUILD_DEPS="make build-essential cmake pkg-config zlib1g-dev libcurl4-openssl-dev libssl-dev libldap2-dev libidn11-dev"

FROM ruby:2.6-slim as ruby-deps
ARG RUNTIME_DEPS
ARG BUILD_DEPS

# set to always UTF8
ENV LANG=C.UTF-8

# Install build deps
RUN apt-get update && \
    apt-get install --no-install-recommends -y $RUNTIME_DEPS $BUILD_DEPS && \
    gem update --system --silent

# Install ruby gems
WORKDIR /app
COPY Gemfile* ./
RUN bundle config path vendor/bundle && \
    bundle install --jobs 4 --retry 3

# cleanup
RUN apt-get remove -y $BUILD_DEPS && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

FROM python:3.9-slim as python-deps

# docutils for github-markup
RUN python -m pip install --upgrade pip && \
    pip install docutils

FROM node:lts-slim

# Copy Ruby dependencies
COPY --from=ruby-deps . .
COPY --from=python-deps . .

# Install node_modules
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# move the rest of the project over
COPY . .

# Configure bundler
ENV BUNDLE_GEMFILE=/app/Gemfile
ENV BUNDLE_PATH=/app/vendor/bundle

ENTRYPOINT ["bundle", "exec", "/app/bin/repolinter.js"]
