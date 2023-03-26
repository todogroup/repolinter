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
FROM node:bullseye

ARG RUNTIME_DEPS="git libicu-dev perl python3 ruby-full locales patch ruby-dev"
ARG BUILD_DEPS="make autoconf automake python3-pip curl liblzma-dev build-essential cmake pkg-config zlib1g-dev libcurl4-openssl-dev libssl-dev libldap2-dev libidn11-dev"
ARG NODE_VERSION="lts/fermium"

## Image Building ##

# update image
RUN apt-get update && apt-get -y upgrade

# Install APT deps
RUN apt-get install --no-install-recommends -y $BUILD_DEPS $RUNTIME_DEPS

# Install Bundler
RUN gem install bundler

# Link python3 as default
RUN ln -sf /usr/bin/python3 /usr/bin/python; \
  ln -sf /usr/bin/pip3 /usr/bin/pip;

# Configure Git
RUN git config --global user.name "repolinter docker" && \
  git config --global user.email "repolinter@docker.container"

## Language Dependencies ##

WORKDIR /app

# Install ruby gems
COPY Gemfile* ./
RUN bundle config path vendor/bundle && \
  bundle install --jobs 4 --retry 3

# docutils for github-markup
RUN python -m pip install --upgrade pip && \
  pip install docutils

# Install node_modules
COPY package*.json ./
RUN npm install --production

# cleanup
RUN apt-get remove -y $BUILD_DEPS && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/*

# move the rest of the project over
COPY . .

# Configure bundler
ENV BUNDLE_GEMFILE=/app/Gemfile
ENV BUNDLE_PATH=/app/vendor/bundle

ENTRYPOINT ["bundle", "exec", "/app/bin/repolinter.js"]
