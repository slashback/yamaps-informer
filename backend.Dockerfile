FROM python:3.4

MAINTAINER Maxim
ADD ./src /app

EXPOSE 8085
RUN pip3 install -r /app/requirements.txt
