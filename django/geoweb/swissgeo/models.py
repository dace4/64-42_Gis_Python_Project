from django.contrib.gis.db import models

# Create your models here.
class City(models.Model):    
   city_name = models.CharField(max_length=100)

   class Meta:
        verbose_name_plural = "cities"

   def __str__(self):
        return self.city_name


class Hospital(models.Model): 
   hospital_name = models.CharField(max_length=100)    
   pub_date = models.DateTimeField('date published')    
   city = models.ForeignKey(City, on_delete=models.CASCADE)


class Canton(models.Model):       
     gid=models.IntegerField(default=0,primary_key=True)
     name=models.CharField(max_length=200)        
     geom=models.MultiPolygonField(srid=4326,null=True)            
     
     class Meta:        
        db_table = "cantons"            
     
     def __str__(self):        
        return self.name
     
class House(models.Model):    
    house_id = models.IntegerField(default=0, primary_key=True)
    name = models.CharField(max_length=100)
    geom = models.MultiPolygonField(srid=4326, null=True)    
      
    def __str__(self):        
        return f"House{self.house_id}"
    class Meta:        
        db_table = "houses"

class Incident(models.Model):
    incident_id = models.IntegerField(default=0, primary_key=True)
    name = models.CharField(max_length=100)
    severity = models.CharField(max_length=50)
    geom = models.PointField(srid=4326, null=True)

    def __str__(self):
        return f"Incident: {self.name} ({self.severity})"

    class Meta:
        db_table = "incidents"
