from datetime import date
from calendar import monthrange
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .budgets import BudgetViewSet  # NEW


from .models import Account, Category, Transaction, Budget
from .serializers import AccountSerializer, CategorySerializer, TransactionSerializer, BudgetSerializer
from .filters import TransactionFilter

class BaseOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = []
    search_fields = []
    ordering_fields = ["id"]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class AccountViewSet(BaseOwnedViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    search_fields = ["name", "type"]

class CategoryViewSet(BaseOwnedViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ["name", "kind"]

class TransactionViewSet(BaseOwnedViewSet):
    queryset = Transaction.objects.select_related("account", "category").all()
    serializer_class = TransactionSerializer
    filterset_class = TransactionFilter
    search_fields = ["description"]
    ordering_fields = ["occurred_at", "amount", "id"]

class BudgetViewSet(BaseOwnedViewSet):
    queryset = Budget.objects.select_related("category").all()
    serializer_class = BudgetSerializer
    search_fields = ["category__name"]
    ordering_fields = ["month", "limit", "id"]

class SummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_month_bounds(self, year: int, month: int):
        start = date(year, month, 1)
        last_day = monthrange(year, month)[1]
        end = date(year, month, last_day)
        return start, end

    def get(self, request):
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month))
        start, end = self.get_month_bounds(year, month)

        qs = Transaction.objects.filter(user=request.user, occurred_at__range=(start, end))

        by_category = (
            qs.values("category__id", "category__name")
              .annotate(total=Sum("amount"))
              .order_by("category__name")
        )

        by_month = (
            Transaction.objects.filter(user=request.user)
            .annotate(m=TruncMonth("occurred_at"))
            .values("m")
            .annotate(total=Sum("amount"))
            .order_by("m")
        )

        budgets = Budget.objects.filter(user=request.user, month=start)
        spent_by_cat = {
            row["category_id"]: row["total"]
            for row in qs.values("category_id").annotate(total=Sum("amount"))
        }
        budget_progress = [
            {
                "category_id": b.category_id,
                "category_name": b.category.name,
                "limit": float(b.limit),
                "spent": float(spent_by_cat.get(b.category_id, 0) or 0),
                "remaining": float(b.limit) - float(spent_by_cat.get(b.category_id, 0) or 0),
            }
            for b in budgets
        ]

        return Response({
            "by_category": list(by_category),
            "by_month": [
                {"month": row["m"].strftime("%Y-%m"), "total": float(row["total"])} for row in by_month
            ],
            "budget_progress": budget_progress,
        })
