# finance/budgets.py
from datetime import datetime
from django.utils import timezone
from rest_framework import serializers, viewsets, permissions
from .models import Budget


def _first_of_month(d):
    # d is a date
    return d.replace(day=1)


class BudgetSerializer(serializers.ModelSerializer):
    # Make month optional on input; we’ll default it in the viewset.
    month = serializers.DateField(required=False)
    # User should come from the request, not the client.
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Budget
        fields = ["id", "user", "category", "month", "limit"]
        read_only_fields = ["user"]


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all().select_related("user", "category")
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show budgets for the logged-in user
        user = self.request.user
        if user and user.is_authenticated:
            return super().get_queryset().filter(user=user)
        return Budget.objects.none()

    def _coerce_month(self, raw):
        """
        Accepts:
          - None -> default to current month (first day)
          - 'YYYY-MM' -> turn into 'YYYY-MM-01'
          - 'YYYY-MM-DD' -> parsed as-is
        Returns a date.
        """
        if not raw:
            return _first_of_month(timezone.localdate())
        if isinstance(raw, str):
            # Support <input type="month"> style 'YYYY-MM'
            if len(raw) == 7 and raw[4] == "-":
                raw = f"{raw}-01"
            try:
                return datetime.fromisoformat(raw).date().replace(day=1)
            except Exception:
                return _first_of_month(timezone.localdate())
        # if already a date, normalize to first
        try:
            return _first_of_month(raw)
        except Exception:
            return _first_of_month(timezone.localdate())

    def perform_create(self, serializer):
        month = self._coerce_month(self.request.data.get("month"))
        serializer.save(user=self.request.user, month=month)

    def perform_update(self, serializer):
        # Preserve user; normalize month if provided (or keep existing)
        month_raw = self.request.data.get("month", None)
        if month_raw is None:
            serializer.save(user=self.request.user)
        else:
            serializer.save(user=self.request.user, month=self._coerce_month(month_raw))
