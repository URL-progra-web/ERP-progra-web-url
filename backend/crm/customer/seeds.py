from core.seeds import BaseSeeder
from crm.customer.models.models import Customer


class CustomerSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def run(self):
        # Verificar si ya hay clientes del seeder
        # Checkeamos por uno específico del seeder
        if Customer.objects.filter(phone='+51 987654321').exists():
            print("Customers already seeded. Skipping...")
            return

        # Seed Customers - Clientes Minoristas
        retail_customers = [
            {
                'name': 'Juan Pérez García',
                'phone': '+51 987654321',
                'email': 'juan.perez@gmail.com',
                'address': 'Av. Los Alisos 123, San Isidro, Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'María Rodríguez López',
                'phone': '+51 987654322',
                'email': 'maria.rodriguez@gmail.com',
                'address': 'Jr. Las Flores 456, Miraflores, Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Carlos Mendoza Quispe',
                'phone': '+51 987654323',
                'email': 'carlos.mendoza@hotmail.com',
                'address': 'Av. Benavides 789, Surco, Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Ana Fernández Torres',
                'phone': '+51 987654324',
                'email': 'ana.fernandez@outlook.com',
                'address': 'Calle Los Pinos 321, La Molina, Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Luis Vargas Sánchez',
                'phone': '+51 987654325',
                'email': 'luis.vargas@gmail.com',
                'address': 'Jr. Los Laureles 654, San Borja, Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Patricia Huamán Castro',
                'phone': '+51 987654326',
                'email': 'patricia.huaman@yahoo.com',
                'address': 'Av. Javier Prado 987, San Isidro, Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Roberto Silva Ortiz',
                'phone': '+51 987654327',
                'email': 'roberto.silva@gmail.com',
                'address': 'Calle Las Magnolias 159, Jesús María, Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Carmen Rojas Díaz',
                'phone': '+51 987654328',
                'email': 'carmen.rojas@hotmail.com',
                'address': 'Av. Colonial 753, Callao',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Miguel Ángel Morales',
                'phone': '+51 987654329',
                'email': 'miguel.morales@gmail.com',
                'address': 'Jr. Carabaya 852, Cercado de Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Sandra Gutiérrez Vega',
                'phone': '+51 987654330',
                'email': 'sandra.gutierrez@outlook.com',
                'address': 'Av. Petit Thouars 456, Lince, Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Diego Navarro Paredes',
                'phone': '+51 987654341',
                'email': 'diego.navarro@gmail.com',
                'address': 'Av. Brasil 789, Pueblo Libre, Lima',
                'customer_type': 'RETAIL',
            },
            {
                'name': 'Lucia Campos Herrera',
                'phone': '+51 987654342',
                'email': 'lucia.campos@outlook.com',
                'address': 'Jr. Junin 234, Magdalena del Mar, Lima',
                'customer_type': 'RETAIL',
            },
        ]

        # Seed Customers - Clientes Mayoristas
        wholesale_customers = [
            {
                'name': 'Comercial Los Andes SAC',
                'phone': '+51 987654331',
                'email': 'ventas@losandes.com.pe',
                'address': 'Av. Argentina 1234, Cercado de Lima',
                'customer_type': 'WHOLESALE',
            },
            {
                'name': 'Distribuidora Central EIRL',
                'phone': '+51 987654332',
                'email': 'contacto@distribuidoracentral.pe',
                'address': 'Jr. Gamarra 567, La Victoria, Lima',
                'customer_type': 'WHOLESALE',
            },
            {
                'name': 'Importadora del Sur SA',
                'phone': '+51 987654333',
                'email': 'info@importadoradelsur.com',
                'address': 'Av. Aviación 890, San Borja, Lima',
                'customer_type': 'WHOLESALE',
            },
            {
                'name': 'Mercado Norte Mayorista',
                'phone': '+51 987654334',
                'email': 'ventas@mercadonorte.pe',
                'address': 'Av. Túpac Amaru 2345, Independencia, Lima',
                'customer_type': 'WHOLESALE',
            },
        ]

        # Crear clientes minoristas
        for data in retail_customers:
            try:
                customer = Customer.objects.create(**data)
                print(f"Created retail customer: {data['name']}")
            except Exception as e:
                print(f"Retail customer {data['name']} already exists or error: {e}")

        # Crear clientes mayoristas
        for data in wholesale_customers:
            try:
                customer = Customer.objects.create(**data)
                print(f"Created wholesale customer: {data['name']}")
            except Exception as e:
                print(f"Wholesale customer {data['name']} already exists or error: {e}")
