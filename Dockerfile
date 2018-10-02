FROM ruby:2.5 as ruby-deps

ENV BUILD_DEPS cmake pkg-config libicu-dev zlib1g-dev libcurl4-openssl-dev libssl-dev

RUN apt-get update && \
    apt-get install --no-install-recommends -y $BUILD_DEPS && \
    gem install licensee github-linguist && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get remove -y $BUILD_DEPS
# TODO: also remove unneeded transient dependencies

FROM node:latest

# Copy Ruby dependencies
COPY --from=ruby-deps . .

# Copy ENV from Ruby image
ENV GEM_HOME /usr/local/bundle
ENV BUNDLE_PATH="$GEM_HOME"
ENV PATH $GEM_HOME/bin:$BUNDLE_PATH/gems/bin:$PATH

RUN which licensee
RUN which github-linguist

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

ENTRYPOINT ["node", "/app/bin/repolinter.js"]
