import django_filters
from datetime import timedelta, date
from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Subject, Category, Assignment, StudySession, Reminder, Notification
from .serializers import (
    SubjectSerializer, CategorySerializer, AssignmentSerializer,
    StudySessionSerializer, ReminderSerializer, NotificationSerializer,
)
from django.db.models import Avg, Sum, F, ExpressionWrapper, DurationField
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.models import Profile


class UserScopedViewSet(viewsets.ModelViewSet):
    """Base class: every queryset is scoped to the logged-in user,
    and every create auto-attaches that user. Avoids repeating this
    in every viewset below."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SubjectViewSet(UserScopedViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class CategoryViewSet(UserScopedViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class AssignmentFilter(django_filters.FilterSet):
    status = django_filters.BaseInFilter(field_name="status", lookup_expr="in")

    class Meta:
        model = Assignment
        fields = ["status", "priority", "subject", "category"]


class AssignmentViewSet(UserScopedViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AssignmentFilter
    search_fields = ["title", "description"]
    ordering_fields = ["due_date", "priority", "created_at"]
    
    
    
    def perform_create(self, serializer):
        assignment = serializer.save(user=self.request.user)
        remind_at = assignment.due_date - timedelta(hours=24)
        if remind_at > timezone.now():
            Reminder.objects.create(assignment=assignment, remind_at=remind_at)

        Notification.objects.create(
            user=self.request.user,
            assignment=assignment,
            notification_type=Notification.NotificationType.SYSTEM,
            message=f"New assignment added: {assignment.title}",
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == Assignment.Status.COMPLETED and instance.completed_at is None:
            instance.completed_at = timezone.now()
            instance.save(update_fields=["completed_at"])
            Reminder.objects.filter(assignment=instance, sent=False).delete()

            Notification.objects.create(
                user=instance.user,
                assignment=instance,
                notification_type=Notification.NotificationType.SYSTEM,
                message=f"Nice work — you completed {instance.title}! 🎉",
            )


class StudySessionViewSet(UserScopedViewSet):
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["date", "completed", "is_suggested"]


class ReminderViewSet(UserScopedViewSet):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer

    def get_queryset(self):
        return self.queryset.filter(assignment__user=self.request.user)


class NotificationViewSet(UserScopedViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    http_method_names = ["get", "patch", "head", "options"]  # no create/delete from frontend


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        assignments = Assignment.objects.filter(user=user)
        today = date.today()
        week_end = today + timedelta(days=7)

        total = assignments.count()
        due_this_week = assignments.filter(
            due_date__date__gte=today, due_date__date__lte=week_end
        ).exclude(status=Assignment.Status.COMPLETED).count()
        in_progress = assignments.filter(status=Assignment.Status.IN_PROGRESS).count()
        completed = assignments.filter(status=Assignment.Status.COMPLETED).count()
        completion_rate = round((completed / total) * 100) if total else 0

        today_sessions = StudySession.objects.filter(
            user=user, date=today, completed=True
        )
        study_minutes_today = 0
        for s in today_sessions:
            start = timezone.datetime.combine(today, s.start_time)
            end = timezone.datetime.combine(today, s.end_time)
            study_minutes_today += int((end - start).total_seconds() / 60)

        return Response({
            "total_assignments": total,
            "due_this_week": due_this_week,
            "in_progress": in_progress,
            "completion_rate": completion_rate,
            "study_time_today_minutes": study_minutes_today,
        })


DURATION_BY_PRIORITY = {"high": 45, "medium": 30, "low": 20}


class StudyPlanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            profile = user.profile
            available_minutes = int(profile.daily_study_hours * 60)
        except Profile.DoesNotExist:
            available_minutes = 180  # 3 hour fallback if no profile yet

        pending = Assignment.objects.filter(
            user=user
        ).exclude(status=Assignment.Status.COMPLETED).order_by("due_date")

        priority_rank = {"high": 0, "medium": 1, "low": 2}
        pending = sorted(pending, key=lambda a: (priority_rank.get(a.priority, 3), a.due_date))

        suggestions = []
        remaining = available_minutes
        current_time = timezone.now().replace(hour=16, minute=0, second=0, microsecond=0)  # 4 PM start, adjust as needed

        for assignment in pending:
            if remaining <= 0:
                break
            duration = DURATION_BY_PRIORITY.get(assignment.priority, 30)
            if duration > remaining:
                continue

            end_time = current_time + timedelta(minutes=duration)
            suggestions.append({
                "assignment_id": assignment.id,
                "assignment_title": assignment.title,
                "subject_id": assignment.subject_id,
                "subject_name": assignment.subject.name if assignment.subject else None,
                "date": current_time.date().isoformat(),
                "start_time": current_time.time().isoformat(timespec="minutes"),
                "end_time": end_time.time().isoformat(timespec="minutes"),
                "duration_minutes": duration,
                "priority": assignment.priority,
            })

            current_time = end_time
            remaining -= duration

        return Response(suggestions)