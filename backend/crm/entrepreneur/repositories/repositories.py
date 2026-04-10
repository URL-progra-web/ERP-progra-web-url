from datetime import datetime
from typing import Optional

from django.db.models import Q, QuerySet

from crm.entrepreneur.models.models import Entrepreneur


class EntrepreneurRepository:
    def list(
        self,
        search: Optional[str] = None,
        created_from: Optional[datetime] = None,
        created_to: Optional[datetime] = None,
    ) -> QuerySet:
        qs = Entrepreneur.objects.select_related('user').all()
        if search:
            qs = qs.filter(
                Q(company_name__icontains=search)
                | Q(contact_name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
            )
        if created_from:
            qs = qs.filter(created_at__gte=created_from)
        if created_to:
            qs = qs.filter(created_at__lte=created_to)
        return qs.order_by('-created_at')

    def get_by_id(self, entrepreneur_id: int) -> Optional[Entrepreneur]:
        return Entrepreneur.objects.select_related('user').filter(id=entrepreneur_id).first()

    def get_by_email(self, email: str) -> Optional[Entrepreneur]:
        return Entrepreneur.objects.filter(email__iexact=email).first()

    def get_by_phone(self, phone: str) -> Optional[Entrepreneur]:
        return Entrepreneur.objects.filter(phone__iexact=phone).first()

    def create(self, **fields) -> Entrepreneur:
        return Entrepreneur.objects.create(**fields)

    def update(self, entrepreneur: Entrepreneur, **fields) -> Entrepreneur:
        for attr, value in fields.items():
            setattr(entrepreneur, attr, value)
        entrepreneur.save()
        return entrepreneur

    def delete(self, entrepreneur: Entrepreneur) -> None:
        entrepreneur.delete()
