#!/usr/bin/env bash
set -euo pipefail

# Elimina todos los productos y variantes desde Django dentro del contenedor backend
docker compose run --rm backend python manage.py shell -c "
from products.product.models.models import Product
from products.variant.models.models import ProductVariant

print('Deleting ProductVariant objects...')
ProductVariant.objects.all().delete()
print('Deleting Product objects...')
Product.objects.all().delete()
print('Done.')
"
