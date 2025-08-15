import django_filters as df
from .models import Transaction

class TransactionFilter(df.FilterSet):
    date_from = df.DateFilter(field_name="occurred_at", lookup_expr="gte")
    date_to = df.DateFilter(field_name="occurred_at", lookup_expr="lte")
    min_amount = df.NumberFilter(field_name="amount", lookup_expr="gte")
    max_amount = df.NumberFilter(field_name="amount", lookup_expr="lte")

    class Meta:
        model = Transaction
        fields = ["category", "account", "date_from", "date_to", "min_amount", "max_amount"]
