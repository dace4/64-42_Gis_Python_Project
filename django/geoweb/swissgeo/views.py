from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

def index(request):    
   return HttpResponse("Hi there this is Switzerland")

from .models import City, Canton, House, Incident, Node, NetworkLine

from django.template import loader

def cities(request):    
   top_cities=City.objects.order_by('-city_name')[:3]      
   template= loader.get_template('swissgeo/cities.html')    
   context = { 'top_cities':top_cities, } 
   return HttpResponse(template.render(context,request))

from django.http import Http404


def city(request,city_id):    
   try:         
      city=City.objects.get(pk=city_id)    
   except City.DoesNotExist:        
      raise Http404("City not found!!") 
   return render(request,'swissgeo/city.html',{'city':city})

def canton(request,canton_name):            
  cantons=Canton.objects.filter(name=canton_name)    
  return render(request,'swissgeo/canton.html',
                {'cantonobj':cantons[0]})


from django.core.serializers import serialize

def cantonsjson(request):    
   cantons=Canton.objects.all()    
   ser=serialize('geojson',cantons,
                 geometry_field='geom',
                 fields=('name',))          
   return HttpResponse(ser)

def cantons(request):      
   context ={    }        
   return render(request,
     'swissgeo/cantons.html',context)

# Houses
def housesjson(request):
   houses = House.objects.all()
   ser = serialize('geojson', houses,
                   geometry_field='geom',
                   fields=('house_id','name',))
   return HttpResponse(ser)

# Incidents
def incidentsjson(request):
    incidents = Incident.objects.all()
    ser = serialize('geojson', incidents, geometry_field='geom', fields=('incident_id',))
    return HttpResponse(ser, content_type='application/json')

# Nodes
def nodesjson(request):
    nodes = Node.objects.all()
    ser = serialize('geojson', nodes, geometry_field='geom', fields=('id',))
    return HttpResponse(ser, content_type='application/json')

# Network Lines
def networklinesjson(request):
    network_lines = NetworkLine.objects.all()
    ser = serialize('geojson', network_lines, geometry_field='geom', fields=('id',))
    return HttpResponse(ser, content_type='application/json')

# views.py

from django.shortcuts import render

def map_view(request):
    return render(request, 'swissgeo/map.html')
