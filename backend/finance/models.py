# finance/models.py
from django.conf import settings
from django.db import models


class Account(models.Model):
    class Type(models.TextChoices):
        CASH = "CASH", "Cash"
        CHECKING = "CHECKING", "Checking"
        SAVINGS = "SAVINGS", "Savings"
        CREDIT = "CREDIT", "Credit Card"
        INVESTMENT = "INVESTMENT", "Investment"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="accounts",
    )
    name = models.CharField(max_length=100)
    type = models.CharField(
        max_length=20,
        choices=Type.choices,
        default=Type.CHECKING,
    )

    def __str__(self):
        return f"{self.name} ({self.type})"


class Category(models.Model):
    class Kind(models.TextChoices):
        EXPENSE = "EXPENSE", "Expense"
        INCOME = "INCOME", "Income"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    name = models.CharField(max_length=100)
    kind = models.CharField(
        max_length=10,
        choices=Kind.choices,
        default=Kind.EXPENSE,
    )

    class Meta:
        unique_together = ("user", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Transaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    account = models.ForeignKey(
        'Account',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
    )
    category = models.ForeignKey(
        'Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
    )
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    occurred_at = models.DateField()

    class Meta:
        ordering = ["-occurred_at", "-id"]

    def __str__(self):
        sign = "-" if self.amount < 0 else ""
        return f"{self.description or 'Transaction'} {sign}${abs(self.amount)} on {self.occurred_at}"


class Budget(models.Model):
    """
    Per-user, per-category, per-month budget.
    Use the first day of the month for `month` (e.g., 2025-08-01).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="budgets",
    )
    category = models.ForeignKey(
        'Category',
        on_delete=models.CASCADE,
        related_name="budgets",
    )
    month = models.DateField(help_text="Use first day of month, e.g., 2025-08-01")
    limit = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ("user", "category", "month")
        ordering = ["-month"]

    def __str__(self):
        return f"{self.user} • {self.category.name} • {self.month:%Y-%m} • ${self.limit}"
