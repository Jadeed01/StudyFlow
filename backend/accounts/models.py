from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    daily_study_hours = models.DecimalField(
        max_digits=4, decimal_places=2, default=3.0,
        help_text="Hours available per day, used for study plan generation"
    )
    dark_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

# Create your models here.
