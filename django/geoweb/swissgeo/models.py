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
    id = models.IntegerField(primary_key=True)
    geom = models.PointField(srid=4326, null=True)

    class Meta:
        db_table = 'incidents'

    def __str__(self):
        return str(self.id)

class NetworkLine(models.Model):
    id = models.IntegerField(default=0, primary_key=True)  # not line_id !
    geom = models.MultiLineStringField(srid=4326, null=True)

    class Meta:
        db_table = "network_lines"

    def __str__(self):
        return f"Line {self.id}"  # also use id


class Node(models.Model):
    id = models.IntegerField(default=0, primary_key=True)  # not node_id !
    geom = models.PointField(srid=4326, null=True)

    class Meta:
        db_table = "nodes"

    def __str__(self):
        return f"Node {self.id}"  # also use id

