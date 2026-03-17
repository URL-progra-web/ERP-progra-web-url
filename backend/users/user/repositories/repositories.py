from typing import Optional, List
from django.core.exceptions import ObjectDoesNotExist
from users.user.models.models import User
from users.role.models.models import Role

class UserRepository:
    def get_by_id(self, user_id: int) -> Optional[User]:
        try:
            return User.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return None

    def get_by_email(self, email: str) -> Optional[User]:
        try:
            return User.objects.get(email=email)
        except ObjectDoesNotExist:
            return None

    def get_filtered(self, search: str = None, role_id: int = None, is_active: bool = None):
        qs = User.objects.select_related('role').all()
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=search) | Q(email__icontains=search))
        if role_id is not None:
            qs = qs.filter(role_id=role_id)
        if is_active is not None:
            qs = qs.filter(is_active=is_active)
        return qs

    def get_all(self) -> List[User]:
        return list(User.objects.select_related('role').all())

    def create(self, name: str, role: Role, email: str = None, password_hash: str = None) -> User:
        return User.objects.create(
            name=name,
            role=role,
            email=email,
            password_hash=password_hash
        )

    def update(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            setattr(user, key, value)
        user.save()
        return user

    def delete(self, user: User) -> None:
        user.delete()
