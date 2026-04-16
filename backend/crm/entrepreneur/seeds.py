from core.seeds import BaseSeeder
from crm.entrepreneur.models.models import Entrepreneur


class EntrepreneurSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def run(self):
        # Verificar si ya hay emprendedores del seeder
        # Checkeamos por uno específico del seeder
        if Entrepreneur.objects.filter(company_name='Fashion House S.A.').exists():
            print("Entrepreneurs already seeded. Skipping...")
            return

        # Seed Entrepreneurs
        entrepreneurs_data = [
            {
                'company_name': 'Fashion House S.A.',
                'contact_name': 'María González',
                'phone': '+51 999888777',
                'email': 'contacto@fashionhouse.com',
            },
            {
                'company_name': 'Tech Solutions Peru',
                'contact_name': 'Carlos Rodríguez',
                'phone': '+51 988777666',
                'email': 'ventas@techsolutions.pe',
            },
            {
                'company_name': 'Sport Center',
                'contact_name': 'Ana Martínez',
                'phone': '+51 977666555',
                'email': 'info@sportcenter.com',
            },
            {
                'company_name': 'Home & Deco',
                'contact_name': 'Luis Fernández',
                'phone': '+51 966555444',
                'email': 'ventas@homeanddeco.pe',
            },
            {
                'company_name': 'Calzado Premium',
                'contact_name': 'Patricia Vargas',
                'phone': '+51 955444333',
                'email': 'contacto@calzadopremium.com',
            },
        ]

        for data in entrepreneurs_data:
            try:
                entrepreneur = Entrepreneur.objects.create(**data)
                print(f"Created entrepreneur: {data['company_name']}")
            except Exception as e:
                print(f"Entrepreneur {data['company_name']} already exists or error: {e}")
