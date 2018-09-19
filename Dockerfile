
#
# To build:
#
# docker build -t repolinter .
#
# To run, either of these will work:
#
# docker run -t -v LOCAL_DIR:/app repolinter /app
#
# docker run -t repolinter --git https://github.com/username/repo.git
#
# Sample run:
#
#    docker build -t repolinter . && docker run -t -v $(pwd):/app repolinter --git https://github.com/comcast/ssh-to

FROM debian:jessie-slim

RUN apt-get update && apt-get install -y curl \
	&& curl -sL https://deb.nodesource.com/setup_8.x | bash - \
	&& apt-get install -y nodejs git

#
# Do this to install the repolinter in the image.
#
RUN npx repolinter || true

ENTRYPOINT [ "npx", "repolinter" ]


