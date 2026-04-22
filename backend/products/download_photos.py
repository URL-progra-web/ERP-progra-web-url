#!/usr/bin/env python3

import time
import requests
from pathlib import Path

MEDIA_PRODS = Path("/app/media/products")
MEDIA_VARS = Path("/app/media/product_variants")

prod_urls = [
    ("01_camiseta.jpg", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"),
    ("02_camiseta_dryfit.jpg", "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400"),
    ("03_camiseta_oversized.jpg", "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400"),
    ("04_jeans.jpg", "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"),
    ("05_pantalon_deportivo.jpg", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400"),
    ("06_shorts.jpg", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400"),
    ("07_zapatillas_running.jpg", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"),
    ("08_zapatillas_urban.jpg", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400"),
    ("09_sandalias.jpg", "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400"),
    ("10_smartphone.jpg", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"),
    ("11_iphone.jpg", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"),
    ("12_laptop.jpg", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"),
    ("13_tablet.jpg", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400"),
    ("14_audifonos.jpg", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"),
    ("15_bolso_tote.jpg", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400"),
    ("16_mochila.jpg", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"),
    ("17_reloj.jpg", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"),
    ("18_gafas.jpg", "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400"),
    # billetera cuero premium (URL anterior fallaba)
    ("19_billetera.jpg", "https://picsum.photos/seed/billetera-premium/400"),
    ("20_sabanas.jpg", "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400"),
]

var_urls = [
    ("var_camiseta_blanca.jpg", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"),
    # camiseta negra y derivados (usa picsum para evitar 404)
    ("var_camiseta_negra.jpg", "https://picsum.photos/seed/camiseta-negra/400"),
    ("var_jeans_azul.jpg", "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"),
    ("var_pantalon_negro.jpg", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400"),
    ("var_zapatillas_blancas.jpg", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"),
    ("var_zapatillas_negras.jpg", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400"),
    # teléfonos por color
    ("var_smartphone_negro.jpg", "https://picsum.photos/seed/smartphone-negro/400"),
    ("var_smartphone_blanco.jpg", "https://picsum.photos/seed/smartphone-blanco/400"),
    ("var_iphone_negro.jpg", "https://picsum.photos/seed/iphone-negro/400"),
    ("var_iphone_blanco.jpg", "https://picsum.photos/seed/iphone-blanco/400"),
    ("var_tablet_negra.jpg", "https://picsum.photos/seed/tablet-negra/400"),
    # laptop y bolsos
    ("var_laptop_gris.jpg", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"),
    ("var_bolso_cafe.jpg", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400"),
    ("var_mochila_negra.jpg", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"),
    # audífonos
    ("var_audifonos_negro.jpg", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"),
    # sandalias premium por color
    ("var_sandalias_premium_cafe.jpg", "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400"),
    ("var_sandalias_premium_negras.jpg", "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400"),
    # zapatillas urban por color
    ("var_zapatillas_urban_negras.jpg", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400"),
    ("var_zapatillas_urban_blancas.jpg", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"),
    # reloj por color
    ("var_reloj_negro.jpg", "https://picsum.photos/seed/reloj-negro/400"),
    ("var_reloj_blanco.jpg", "https://picsum.photos/seed/reloj-blanco/400"),
    # gafas por color (urls anteriores daban 404)
    ("var_gafas_negro.jpg", "https://picsum.photos/seed/gafas-negro/400"),
    ("var_gafas_cafe.jpg", "https://picsum.photos/seed/gafas-cafe/400"),
    ("var_gafas_gris.jpg", "https://picsum.photos/seed/gafas-gris/400"),
    # billetera oscura compartida
    ("var_billetera_oscura.jpg", "https://picsum.photos/seed/billetera-oscura/400"),
]


def download_image(url: str, filepath: Path, retries: int = 3) -> bool:
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            filepath.write_bytes(response.content)
            if filepath.stat().st_size > 1000:
                return True
            print(f"Attempt {attempt + 1}: file too small for {filepath.name}")
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1)
    print(f"Error downloading {filepath.name}")
    return False


def main():
    MEDIA_PRODS.mkdir(parents=True, exist_ok=True)
    MEDIA_VARS.mkdir(parents=True, exist_ok=True)

    print("Downloading product images...")
    for filename, url in prod_urls:
        filepath = MEDIA_PRODS / filename
        if filepath.exists() and filepath.stat().st_size > 1000:
            print(f"{filename} already exists, skipping")
            continue
        print(f"Downloading {filename}...")
        if download_image(url, filepath):
            print(f"Saved {filename}")
        else:
            print(f"Failed to download {filename}")

    print("Downloading variant images...")
    for filename, url in var_urls:
        filepath = MEDIA_VARS / filename
        if filepath.exists() and filepath.stat().st_size > 1000:
            print(f"{filename} already exists, skipping")
            continue
        print(f"Downloading {filename}...")
        if download_image(url, filepath):
            print(f"Saved {filename}")
        else:
            print(f"Failed to download {filename}")

    print("Done downloading images")


if __name__ == "__main__":
    main()
