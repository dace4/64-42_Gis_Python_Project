#! /bin/bash

export DJANGO_SUPERUSER_EMAIL=admin@admin.com
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_PASSWORD=admin

  python geoweb/manage.py makemigrations admin
  python geoweb/manage.py migrate admin 
  python geoweb/manage.py migrate auth 
  python geoweb/manage.py migrate contenttypes 
  python geoweb/manage.py migrate sessions 

if python geoweb/manage.py createsuperuser --noinput ; then
   
  echo "we export"
  export PGPASSWORD='admin' 
  shp2pgsql -I -s 4326:4326 cantons/cantons.shp cantons | psql -h db -p 5432 -d postgres -U postgres 

  python geoweb/manage.py createsuperuser --noinput
  python geoweb/manage.py migrate swissgeo --fake
else 
  echo "no export"

fi

python geoweb/manage.py runserver 0.0.0.0:8000
