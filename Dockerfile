FROM alpine

RUN apk add --no-cache \
  alpine-sdk \
  nodejs \
  git

RUN adduser tmpbuild -D
RUN echo "tmpbuild    ALL = (ALL) NOPASSWD: ALL" >> /etc/sudoers

RUN sudo addgroup tmpbuild abuild
RUN sudo chgrp abuild /var/cache/distfiles
RUN sudo chmod g+w /var/cache/distfiles

USER tmpbuild

WORKDIR /home/tmpbuild/

COPY ./bin ./bin
COPY ./package.json ./package.json

RUN ["npm", "install"]
