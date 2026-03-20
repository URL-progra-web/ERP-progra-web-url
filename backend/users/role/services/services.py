from typing import Optional, List
from users.role.models.models import Role
from users.role.repositories.repositories import RoleRepository

class RoleService:
    def __init__(self, repository: RoleRepository = None):
        self.repository = repository or RoleRepository()

    def get_role(self, role_id: int) -> Optional[Role]:
        return self.repository.get_by_id(role_id)

    def get_role_by_name(self, name: str) -> Optional[Role]:
        return self.repository.get_by_name(name)

    def list_roles(self) -> List[Role]:
        return self.repository.get_all()

    def create_role(self, name: str, description: str = "") -> Role:
        existing_role = self.repository.get_by_name(name)
        if existing_role:
            raise ValueError(f"El rol '{name}' ya existe.")
        return self.repository.create(name=name, description=description)

    def update_role(self, role_id: int, **kwargs) -> Role:
        role = self.get_role(role_id)
        if not role:
            raise ValueError(f"No se encontró el rol con id {role_id}.")
        return self.repository.update(role, **kwargs)
