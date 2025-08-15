import pytest
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

@pytest.fixture
def client_user():
    user = User.objects.create_user(username="u", password="p")
    client = APIClient()
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client, user

def test_create_category(client_user):
    client, _ = client_user
    resp = client.post(reverse("category-list"), {"name": "Food", "kind": "EXPENSE"}, format='json')
    assert resp.status_code == 201

def test_summary_endpoint(client_user):
    client, user = client_user
    cat = client.post(reverse("category-list"), {"name": "Food", "kind": "EXPENSE"}, format='json').json()
    client.post(reverse("transaction-list"), {
        "category": cat["id"],
        "amount": 25.50,
        "occurred_at": "2025-08-01",
        "description": "Lunch"
    }, format='json')
    resp = client.get(reverse("summary") + "?year=2025&month=8")
    assert resp.status_code == 200
    body = resp.json()
    assert "by_category" in body and "by_month" in body and "budget_progress" in body
