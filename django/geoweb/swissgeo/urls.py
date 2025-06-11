from django.urls import path
from . import views

urlpatterns = [    
    path('', views.index, name='index'),
    path('city/', views.cities, name='cities'),
    path('city/<int:city_id>', views.city, name='city'), 
    path('cantons/<str:canton_name>', views.canton, name='canton'),
    path('cantons.json', views.cantonsjson, name='cantonsjson'),
    path('cantons', views.cantons, name='cantons'),
    path('houses.json', views.housesjson, name='housesjson'),
    path('incidents.json', views.incidentsjson, name='incidentsjson'),
    path('nodes.json', views.nodesjson, name='nodesjson'),
    path('network_lines.json', views.networklinesjson, name='networklinesjson'),

]
