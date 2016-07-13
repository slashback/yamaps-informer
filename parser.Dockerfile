FROM python:3.4

MAINTAINER Maxim
ADD ./src /app

WORKDIR /usr/local/share
ADD ./dist /usr/local/share/
# RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 
WORKDIR /usr/local/share
RUN tar xjf phantomjs-2.1.1-linux-x86_64.tar.bz2
RUN ln -s /usr/local/share/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/share/phantomjs
RUN ln -s /usr/local/share/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs
RUN ln -s /usr/local/share/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/bin/phantomjs 
RUN pip3 install -r /app/requirements.txt
WORKDIR /app
