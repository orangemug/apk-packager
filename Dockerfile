FROM alpine

RUN apk add --no-cache alpine-sdk

RUN adduser tmpbuild -D
RUN echo "tmpbuild    ALL = (ALL) NOPASSWD: ALL" >> /etc/sudoers

RUN sudo addgroup tmpbuild abuild
RUN sudo chgrp abuild /var/cache/distfiles
RUN sudo chmod g+w /var/cache/distfiles

RUN su tmpbuild

VOLUME  /home/tmpbuild/
WORKDIR /home/tmpbuild/

