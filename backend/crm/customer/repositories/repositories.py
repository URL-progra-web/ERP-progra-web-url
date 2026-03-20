from datetime import datetime
from typing import Optional

from django.db.models import Q, QuerySet

from crm.customer.models.models import Customer


class CustomerRepository:
    def list(
        self,
        search: Optional[str] = None,
        created_from: Optional[datetime] = None,
        created_to: Optional[datetime] = None,
    ) -> QuerySet:
        qs = Customer.objects.all()
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
            )
        if created_from:
            qs = qs.filter(created_at__gte=created_from)
        if created_to:
            qs = qs.filter(created_at__lte=created_to)
        return qs.order_by('-created_at')

    def get_by_id(self, customer_id: int) -> Optional[Customer]:
        return Customer.objects.filter(id=customer_id).first()

    def get_by_email(self, email: str) -> Optional[Customer]:
        return Customer.objects.filter(email__iexact=email).first()

    def get_by_phone(self, phone: str) -> Optional[Customer]:
        return Customer.objects.filter(phone__iexact=phone).first()

    def create(self, **fields) -> Customer:
        return Customer.objects.create(**fields)

    def update(self, customer: Customer, **fields) -> Customer:
        for attr, value in fields.items():
            setattr(customer, attr, value)
        customer.save()
        return customer

    def delete(self, customer: Customer) -> None:
        customer.delete()
