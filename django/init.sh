#!/bin/bash

cd /code

# Set Django superuser credentials
export DJANGO_SUPERUSER_EMAIL=admin@admin.com
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_PASSWORD=admin

# Run migrations for Django system apps
python geoweb/manage.py makemigrations admin
python geoweb/manage.py migrate admin 
python geoweb/manage.py migrate auth 
python geoweb/manage.py migrate contenttypes 
python geoweb/manage.py migrate sessions 

# Create superuser and import geodata if successful
if python geoweb/manage.py createsuperuser --noinput ; then
   echo "Creating superuser and importing geodata..."
   export PGPASSWORD='admin' 
   shp2pgsql -I -s 4326:4326 cantons/cantons.shp cantons | psql -h db -p 5432 -d postgres -U postgres 
   python geoweb/manage.py migrate swissgeo --fake
else 
   echo "Superuser creation failed"
fi

# Start Django development server
python geoweb/manage.py runserver 0.0.0.0:8000