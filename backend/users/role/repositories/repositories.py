from typing import Optional, List
from django.core.exceptions import ObjectDoesNotExist
from users.role.models.models import Role

class RoleRepository:
    def get_by_id(self, role_id: int) -> Optional[Role]:
        try:
            return Role.objects.get(id=role_id)
        except ObjectDoesNotExist:
            return None

    def get_by_name(self, name: str) -> Optional[Role]:
        try:
            return Role.objects.get(name=name)
        except ObjectDoesNotExist:
            return None

    def get_all(self) -> List[Role]:
        return list(Role.objects.all())

    def create(self, name: str, description: str = "") -> Role:
        return Role.objects.create(name=name, description=description)

    def update(self, role: Role, **kwargs) -> Role:
        for key, value in kwargs.items():
            setattr(role, key, value)
        role.save()
        return role

    def delete(self, role: Role) -> None:
        role.delete()
