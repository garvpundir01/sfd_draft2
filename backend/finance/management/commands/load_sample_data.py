from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from finance.models import Account, Category, Transaction, Budget
from datetime import date
import random

class Command(BaseCommand):
    help = "Create a demo user with sample finance data"

    def handle(self, *args, **kwargs):
        User = get_user_model()
        user, _ = User.objects.get_or_create(username="demo")
        user.set_password("demo1234")
        user.save()

        acct, _ = Account.objects.get_or_create(user=user, name="Checking", type=Account.Type.CHECKING)

        groceries, _ = Category.objects.get_or_create(user=user, name="Groceries", kind=Category.Kind.EXPENSE)
        rent, _ = Category.objects.get_or_create(user=user, name="Rent", kind=Category.Kind.EXPENSE)
        salary, _ = Category.objects.get_or_create(user=user, name="Salary", kind=Category.Kind.INCOME)

        month_start = date.today().replace(day=1)
        Budget.objects.get_or_create(user=user, category=groceries, month=month_start, limit=500)
        Budget.objects.get_or_create(user=user, category=rent, month=month_start, limit=1200)

        Transaction.objects.all().filter(user=user).delete()
        for day in range(1, 28, 3):
            Transaction.objects.create(
                user=user,
                account=acct,
                category=groceries,
                description="Groceries",
                amount=random.randint(10, 80),
                occurred_at=month_start.replace(day=day),
            )
        Transaction.objects.create(
            user=user, account=acct, category=rent, description="Monthly rent", amount=1200, occurred_at=month_start
        )
        for m in range(1, 7):
            d = date.today().replace(month=m if m <= 12 else 12, day=1)
            Transaction.objects.create(
                user=user, account=acct, category=salary, description="Paycheck", amount=-3000, occurred_at=d
            )

        self.stdout.write(self.style.SUCCESS("Demo data loaded. Username: demo / Password: demo1234"))
