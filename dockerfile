# Use an official Python runtime as a parent image
FROM python:3.10

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory in the container
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        default-libmysqlclient-dev \
        postgresql-client \  
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install requirements
COPY requirements.txt /code/
RUN pip install --upgrade pip
RUN pip install gunicorn
RUN pip install daphne
RUN pip install Twisted[tls,http2]
RUN pip install -r requirements.txt
ENV PATH="/usr/local/bin:${PATH}"

# Invalidate cache so we always pull the latest code from our Django repo
RUN echo $(date) > /dev/null

# Copy the current directory contents into the container at /code/
COPY App/ /code/
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

# RUN python manage.py migrate --noinput
RUN python manage.py collectstatic --noinput

# Set the commands to run your application
CMD python manage.py migrate && daphne App.asgi:application --bind 0.0.0.0 --port 8000
