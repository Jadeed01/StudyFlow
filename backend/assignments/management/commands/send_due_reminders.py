from django.core.management.base import BaseCommand
from django.utils import timezone
from assignments.models import Reminder, Notification


class Command(BaseCommand):
    help = "Converts due Reminders into Notifications and marks them sent."

    def handle(self, *args, **options):
        due_reminders = Reminder.objects.filter(
            sent=False, remind_at__lte=timezone.now()
        ).select_related("assignment", "assignment__user")

        count = 0
        for reminder in due_reminders:
            assignment = reminder.assignment
            Notification.objects.create(
                user=assignment.user,
                assignment=assignment,
                notification_type=Notification.NotificationType.DEADLINE,
                message=f"'{assignment.title}' is due soon ({assignment.due_date.strftime('%b %d, %I:%M %p')})",
            )
            reminder.sent = True
            reminder.save(update_fields=["sent"])
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Created {count} notification(s) from due reminders."))