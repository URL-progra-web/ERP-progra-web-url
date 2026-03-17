import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Define the Bounded Contexts and their domains (tables)
APPS = {
    'users': ['role', 'user'],
    'crm': ['entrepreneur', 'customer'],
    'products': ['category', 'product', 'size', 'color', 'variant'],
    'inventory': ['uom', 'uom_conversion', 'business_unit', 'transaction_type', 'transaction'],
    'orders': ['payment_method', 'order_status', 'order', 'order_item', 'order_history', 'order_item_history', 'receipt', 'receipt_adjustment']
}

# The architectural layers for each domain
LAYERS = ['models', 'repositories', 'services', 'apis', 'serializers']

def create_layer(layer_path, layer_name):
    layer_path.mkdir(parents=True, exist_ok=True)
    # Create an empty __init__.py to make it a package
    (layer_path / '__init__.py').touch()
    
    # Create the specific file for the layer
    file_name = f"{layer_name}.py" if layer_name != 'models' else f"{layer_name}.py" # Assuming models.py, services.py
    if layer_name == 'apis':
        file_name = 'views.py'
        
    file_path = layer_path / file_name
    if not file_path.exists():
        file_path.touch()


def generate_structure():
    apps_dir = BASE_DIR
    
    for app_name, domains in APPS.items():
        app_path = apps_dir / app_name
        app_path.mkdir(parents=True, exist_ok=True)
        # Root files for the Django App
        (app_path / '__init__.py').touch()
        (app_path / 'apps.py').write_text(f"from django.apps import AppConfig\n\nclass {app_name.capitalize()}Config(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = '{app_name}'\n")
        
        # Root models.py (will import specific models later)
        (app_path / 'models.py').touch()
        
        # Root urls.py
        (app_path / 'urls.py').touch()
        
        for domain in domains:
            domain_path = app_path / domain
            domain_path.mkdir(parents=True, exist_ok=True)
            (domain_path / '__init__.py').touch()
            
            for layer in LAYERS:
                layer_path = domain_path / layer
                create_layer(layer_path, layer)
            
            # Additional domain-specific files
            (domain_path / 'urls.py').touch()
            (domain_path / 'exceptions.py').touch()

if __name__ == '__main__':
    generate_structure()
    print("Screaming Architecture structure generated successfully!")
