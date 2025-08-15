from rest_framework import serializers
from .models import Account, Category, Transaction, Budget


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ["id", "name", "type"]

    def create(self, validated_data):
        # Ensure the owner is the authenticated user
        return Account.objects.create(user=self.context["request"].user, **validated_data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "kind"]

    def create(self, validated_data):
        return Category.objects.create(user=self.context["request"].user, **validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    # Friendly names for table display (read-only)
    category_name = serializers.CharField(source="category.name", read_only=True)
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "description",
            "amount",
            "occurred_at",
            "category",      # FK id
            "category_name", # friendly name
            "account",       # FK id (nullable)
            "account_name",  # friendly name
        ]

    def create(self, validated_data):
        # Force ownership to request.user
        return Transaction.objects.create(user=self.context["request"].user, **validated_data)

    def update(self, instance, validated_data):
        # Preserve ownership on updates
        validated_data["user"] = self.context["request"].user
        return super().update(instance, validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    # Helpful for budget listings and summary screens
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Budget
        fields = ["id", "category", "category_name", "month", "limit"]

    def validate(self, attrs):
        # Normalize month to first of month if the user provided another day
        month = attrs.get("month")
        if month and month.day != 1:
            attrs["month"] = month.replace(day=1)
        return attrs

    def create(self, validated_data):
        return Budget.objects.create(user=self.context["request"].user, **validated_data)
