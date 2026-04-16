from datetime import datetime
from typing import Optional

from crm.entrepreneur.exceptions import EntrepreneurAlreadyExists, EntrepreneurNotFound
from crm.entrepreneur.models.models import Entrepreneur
from crm.entrepreneur.repositories.repositories import EntrepreneurRepository
from users.user.models.models import User


class EntrepreneurService:
    def __init__(self, repository: Optional[EntrepreneurRepository] = None):
        self.repository = repository or EntrepreneurRepository()

    def list_entrepreneurs(
        self,
        search: Optional[str] = None,
        created_from: Optional[datetime] = None,
        created_to: Optional[datetime] = None,
    ):
        return self.repository.list(search=search, created_from=created_from, created_to=created_to)

    def get_entrepreneur(self, entrepreneur_id: int) -> Entrepreneur:
        entrepreneur = self.repository.get_by_id(entrepreneur_id)
        if not entrepreneur:
            raise EntrepreneurNotFound(f'No se encontró el emprendedor {entrepreneur_id}')
        return entrepreneur

    def create_entrepreneur(
        self,
        company_name: str,
        contact_name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> Entrepreneur:
        normalized_company = company_name.strip()
        normalized_contact = contact_name.strip()
        
        if not normalized_company:
            raise ValueError('El nombre de la empresa no puede estar vacío')
        if not normalized_contact:
            raise ValueError('El nombre del contacto no puede estar vacío')

        # Validar unicidad de email si se proporciona
        if email:
            normalized_email = email.strip().lower()
            if self.repository.get_by_email(normalized_email):
                raise EntrepreneurAlreadyExists('Ya existe un emprendedor con este correo')
        else:
            normalized_email = None

        # Validar unicidad de phone si se proporciona
        if phone:
            normalized_phone = phone.strip()
            if self.repository.get_by_phone(normalized_phone):
                raise EntrepreneurAlreadyExists('Ya existe un emprendedor con este teléfono')
        else:
            normalized_phone = None

        # Validar que el user existe si se proporciona
        user = None
        if user_id:
            user = User.objects.filter(id=user_id).first()
            if not user:
                raise ValueError(f'No se encontró el usuario {user_id}')

        return self.repository.create(
            company_name=normalized_company,
            contact_name=normalized_contact,
            phone=normalized_phone,
            email=normalized_email,
            user=user,
        )

    def update_entrepreneur(
        self,
        entrepreneur_id: int,
        company_name: Optional[str] = None,
        contact_name: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> Entrepreneur:
        entrepreneur = self.get_entrepreneur(entrepreneur_id)
        fields = {}

        if company_name is not None:
            normalized_company = company_name.strip()
            if not normalized_company:
                raise ValueError('El nombre de la empresa no puede estar vacío')
            fields['company_name'] = normalized_company

        if contact_name is not None:
            normalized_contact = contact_name.strip()
            if not normalized_contact:
                raise ValueError('El nombre del contacto no puede estar vacío')
            fields['contact_name'] = normalized_contact

        if phone is not None:
            if phone:
                normalized_phone = phone.strip()
                existing = self.repository.get_by_phone(normalized_phone)
                if existing and existing.id != entrepreneur.id:
                    raise EntrepreneurAlreadyExists('Ya existe un emprendedor con este teléfono')
                fields['phone'] = normalized_phone
            else:
                fields['phone'] = None

        if email is not None:
            if email:
                normalized_email = email.strip().lower()
                existing = self.repository.get_by_email(normalized_email)
                if existing and existing.id != entrepreneur.id:
                    raise EntrepreneurAlreadyExists('Ya existe un emprendedor con este correo')
                fields['email'] = normalized_email
            else:
                fields['email'] = None

        if user_id is not None:
            if user_id:
                user = User.objects.filter(id=user_id).first()
                if not user:
                    raise ValueError(f'No se encontró el usuario {user_id}')
                fields['user'] = user
            else:
                fields['user'] = None

        if not fields:
            return entrepreneur

        return self.repository.update(entrepreneur, **fields)

    def delete_entrepreneur(self, entrepreneur_id: int) -> None:
        entrepreneur = self.get_entrepreneur(entrepreneur_id)
        self.repository.delete(entrepreneur)
