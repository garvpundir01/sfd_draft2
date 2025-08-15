from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    """Object-level permission to only allow owners to access their own records."""
    def has_object_permission(self, request, view, obj):
        return getattr(obj, "user_id", None) == request.user.id
