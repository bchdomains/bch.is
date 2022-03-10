FROM node:16
RUN echo 14 \
  && git clone https://github.com/bchdomains/bch.is.git \
  && cd bch.is && yarn && ENV=prod yarn build
WORKDIR /bch.is
CMD ENV=prod yarn start
