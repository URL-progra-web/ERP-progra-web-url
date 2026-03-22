from datetime import datetime
from typing import Optional

from crm.customer.exceptions import CustomerAlreadyExists, CustomerNotFound
from crm.customer.models.models import Customer
from crm.customer.repositories.repositories import CustomerRepository


class CustomerService:
    def __init__(self, repository: Optional[CustomerRepository] = None):
        self.repository = repository or CustomerRepository()

    def list_customers(
        self,
        search: Optional[str] = None,
        created_from: Optional[datetime] = None,
        created_to: Optional[datetime] = None,
    ):
        return self.repository.list(search=search, created_from=created_from, created_to=created_to)

    def get_customer(self, customer_id: int) -> Customer:
        customer = self.repository.get_by_id(customer_id)
        if not customer:
            raise CustomerNotFound(f'No se encontró el cliente {customer_id}')
        return customer

    def create_customer(self, name: str, phone: str, email: Optional[str] = None, address: Optional[str] = None, customer_type: str = 'RETAIL') -> Customer:
        normalized_name = name.strip()
        normalized_phone = phone.strip()
        if not normalized_name:
            raise ValueError('El nombre no puede estar vacío')
        if not normalized_phone:
            raise ValueError('El teléfono no puede estar vacío')
        if email:
            normalized_email = email.strip().lower()
            if self.repository.get_by_email(normalized_email):
                raise CustomerAlreadyExists('Ya existe un cliente con este correo')
        else:
            normalized_email = None

        existing_phone = self.repository.get_by_phone(normalized_phone)
        if existing_phone:
            raise CustomerAlreadyExists('Ya existe un cliente con este teléfono')

        return self.repository.create(
            name=normalized_name,
            phone=normalized_phone,
            email=normalized_email,
            address=address,
            customer_type=customer_type,
        )

    def update_customer(
        self,
        customer_id: int,
        name: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        address: Optional[str] = None,
        customer_type: Optional[str] = None,
    ) -> Customer:
        customer = self.get_customer(customer_id)
        fields = {}
        if name is not None:
            normalized_name = name.strip()
            if not normalized_name:
                raise ValueError('El nombre no puede estar vacío')
            fields['name'] = normalized_name
        if phone is not None:
            normalized_phone = phone.strip()
            if not normalized_phone:
                raise ValueError('El teléfono no puede estar vacío')
            existing = self.repository.get_by_phone(normalized_phone)
            if existing and existing.id != customer.id:
                raise CustomerAlreadyExists('Ya existe un cliente con este teléfono')
            fields['phone'] = normalized_phone
        if email is not None:
            normalized_email = email.strip().lower() if email else None
            if normalized_email:
                existing = self.repository.get_by_email(normalized_email)
                if existing and existing.id != customer.id:
                    raise CustomerAlreadyExists('Ya existe un cliente con este correo')
            fields['email'] = normalized_email
        if address is not None:
            fields['address'] = address
        if customer_type is not None:
            fields['customer_type'] = customer_type
        if not fields:
            return customer
        return self.repository.update(customer, **fields)

    def delete_customer(self, customer_id: int) -> None:
        customer = self.get_customer(customer_id)
        self.repository.delete(customer)
