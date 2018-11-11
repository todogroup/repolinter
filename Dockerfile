# To build:
#
#   docker build -t repolinter .
#
# To run against the current directory:
#
#   docker run -t -v $PWD:/src repolinter
#
# To run against a remote GitHub repository
#
#   docker run -t repolinter --git https://github.com/username/repo.git
#
FROM ruby:2.5.1-slim as ruby-deps

ENV RUNTIME_DEPS git libicu57
ENV BUILD_DEPS make build-essential cmake pkg-config libicu-dev zlib1g-dev libcurl4-openssl-dev libssl-dev

RUN apt-get update && \
    apt-get install --no-install-recommends -y $RUNTIME_DEPS $BUILD_DEPS && \
    gem install --no-document licensee github-linguist && \
    apt-get remove -y $BUILD_DEPS && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*


FROM node:10-slim

# Copy Ruby dependencies
COPY --from=ruby-deps . .

# Copy ENV from Ruby image
ENV GEM_HOME /usr/local/bundle
ENV BUNDLE_PATH="$GEM_HOME"
ENV PATH $GEM_HOME/bin:$BUNDLE_PATH/gems/bin:$PATH

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

ENTRYPOINT ["node", "/app/bin/repolinter.js"]
