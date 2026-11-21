from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    SubjectViewSet, CategoryViewSet, AssignmentViewSet,
    StudySessionViewSet, ReminderViewSet, NotificationViewSet,
    DashboardStatsView, StudyPlanView,
)

router = DefaultRouter()
router.register("subjects", SubjectViewSet, basename="subject")
router.register("categories", CategoryViewSet, basename="category")
router.register("assignments", AssignmentViewSet, basename="assignment")
router.register("study-sessions", StudySessionViewSet, basename="study-session")
router.register("reminders", ReminderViewSet, basename="reminder")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = router.urls + [
    path("dashboard-stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("study-plan/", StudyPlanView.as_view(), name="study-plan"),
]