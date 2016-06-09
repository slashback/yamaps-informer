FROM python:3.4

MAINTAINER Maxim
ADD ./src /app

RUN apt-get update
RUN apt-get install -y nano xvfb iceweasel
RUN pip3 install -r /app/requirements.txt
WORKDIR /app
