from users.role.repositories.repositories import RoleRepository
from users.role.services.services import RoleService
from users.user.repositories.repositories import UserRepository
from users.user.services.services import UserService

class UserContainer:
    def __init__(self):
        self.role_repository = RoleRepository()
        self.role_service = RoleService(repository=self.role_repository)
        
        self.user_repository = UserRepository()
        self.user_service = UserService(
            repository=self.user_repository,
            role_service=self.role_service
        )

# Global container instance
user_container = UserContainer()
