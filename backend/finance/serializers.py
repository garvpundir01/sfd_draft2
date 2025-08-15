from rest_framework import serializers
from .models import Account, Category, Transaction, Budget

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ["id", "name", "type"]

    def create(self, validated_data):
        return Account.objects.create(user=self.context["request"].user, **validated_data)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "kind"]

    def create(self, validated_data):
        return Category.objects.create(user=self.context["request"].user, **validated_data)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "account", "category", "description", "amount", "occurred_at"]

    def create(self, validated_data):
        return Transaction.objects.create(user=self.context["request"].user, **validated_data)

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Budget
        fields = ["id", "category", "category_name", "month", "limit"]

    def validate(self, attrs):
        if attrs["month"].day != 1:
            attrs["month"] = attrs["month"].replace(day=1)
        return attrs

    def create(self, validated_data):
        return Budget.objects.create(user=self.context["request"].user, **validated_data)
