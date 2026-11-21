from rest_framework import serializers
from .models import Subject, Category, Assignment, StudySession, Reminder, Notification


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "color"]
        read_only_fields = ["id"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]
        read_only_fields = ["id"]


class AssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_color = serializers.CharField(source="subject.color", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id", "subject", "subject_name", "subject_color", "category", "category_name",
            "title", "description", "priority", "status", "progress",
            "due_date", "created_at", "updated_at", "completed_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at", "completed_at"]


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = [
            "id", "assignment", "subject", "date",
            "start_time", "end_time", "completed", "is_suggested",
        ]
        read_only_fields = ["id"]


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ["id", "assignment", "remind_at", "sent"]
        read_only_fields = ["id", "sent"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "assignment", "notification_type", "message", "is_read", "created_at"]
        read_only_fields = ["id", "created_at"]