from django.contrib import admin

# Register your models here.
from .models import City, Hospital, Canton

admin.site.register(City)
admin.site.register(Hospital) 
admin.site.register(Canton, admin.ModelAdmin)
