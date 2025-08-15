from django.contrib import admin
from .models import Account, Category, Transaction, Budget

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "type")
    search_fields = ("name",)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "kind")
    list_filter = ("kind",)
    search_fields = ("name",)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount", "category", "occurred_at")
    list_filter = ("category", "occurred_at")
    search_fields = ("description",)

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "category", "month", "limit")
    list_filter = ("month",)
