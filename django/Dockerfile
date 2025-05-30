FROM python:3

ENV PYTHONUNBUFFERED=1

WORKDIR /code

# Copy project files first
COPY . /code/

# Install Python dependencies
RUN pip install -r requirements.txt

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    libproj-dev \
    libfreexl-dev \
    libgdal-dev \
    gdal-bin \
    postgis

# Ensure init.sh is executable
RUN chmod +x /code/init.sh