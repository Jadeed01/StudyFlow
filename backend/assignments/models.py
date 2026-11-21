from django.conf import settings
from django.db import models


class Subject(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subjects")
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#6366F1")  # hex code, matches your UI palette

    class Meta:
        unique_together = ("user", "name")

    def __str__(self):
        return self.name


class Category(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)  # e.g. Homework, Project, Lab Report, Essay

    class Meta:
        unique_together = ("user", "name")
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Assignment(models.Model):
    class Priority(models.TextChoices):
        HIGH = "high", "High"
        MEDIUM = "medium", "Medium"
        LOW = "low", "Low"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assignments")
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, related_name="assignments")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="assignments")

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    progress = models.PositiveSmallIntegerField(default=0)  # 0–100

    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["due_date"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # keep status in sync with progress automatically
        if self.progress >= 100:
            self.status = self.Status.COMPLETED
            self.progress = 100
        elif self.progress > 0:
            self.status = self.Status.IN_PROGRESS
        else:
            self.status = self.Status.PENDING
        super().save(*args, **kwargs)


class StudySession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="study_sessions")
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, null=True, blank=True, related_name="study_sessions")
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, related_name="study_sessions")

    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    completed = models.BooleanField(default=False)
    is_suggested = models.BooleanField(default=False)  # True until user accepts a study-plan suggestion

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.subject} — {self.date} {self.start_time}"


class Reminder(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="reminders")
    remind_at = models.DateTimeField()
    sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reminder for {self.assignment.title} at {self.remind_at}"


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        DEADLINE = "deadline", "Deadline"
        REMINDER = "reminder", "Reminder"
        SYSTEM = "system", "System"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, null=True, blank=True, related_name="notifications")
    notification_type = models.CharField(max_length=10, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.message

# Create your models here.
