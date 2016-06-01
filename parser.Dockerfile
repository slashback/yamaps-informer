FROM python:3.4

MAINTAINER Maxim
ADD ./src /app

# Add crontab file in the cron directory
ADD crontab /etc/cron.d/hello-cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/hello-cron

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

RUN apt-get update
RUN apt-get install -y nano xvfb iceweasel cron
RUN pip3 install -r /app/requirements.txt

# RUN /usr/bin/crontab /etc/cron.d/hello-cron
# Run the command on container startup
