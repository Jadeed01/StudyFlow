from django.contrib import admin
from .models import Subject, Category, Assignment, StudySession, Reminder, Notification

admin.site.register(Subject)
admin.site.register(Category)
admin.site.register(Assignment)
admin.site.register(StudySession)
admin.site.register(Reminder)
admin.site.register(Notification)
# Register your models here.
