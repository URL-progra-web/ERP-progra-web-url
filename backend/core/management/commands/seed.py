from django.core.management.base import BaseCommand
from django.utils.module_loading import import_string
from django.conf import settings

# Import containers for DI
from users.container import user_container
from inventory.container import inventory_container

class Command(BaseCommand):
    help = 'Run database seeders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--seeder',
            type=str,
            help='Specify a specific seeder class to run (e.g., users.seeds.UserSeeder)',
        )

    def get_seeder_factories(self):
        """Mapping of seeder paths to their DI factories."""
        return {
            'users.seeds.UserSeeder': lambda: import_string('users.seeds.UserSeeder')(
                role_service=user_container.role_service,
                user_service=user_container.user_service
            ),
            'inventory.uom.seeds.UomSeeder': lambda: import_string('inventory.uom.seeds.UomSeeder')(
                uom_service=inventory_container.uom_service,
                conv_service=inventory_container.uom_conversion_service
            ),
        }

    def handle(self, *args, **options):
        seeder_path = options.get('seeder')
        factories = self.get_seeder_factories()

        if seeder_path:
            self.run_seeder(seeder_path, factories)
        else:
            global_seeders = getattr(settings, 'GLOBAL_SEEDERS', [
                'users.seeds.UserSeeder',
                'inventory.uom.seeds.UomSeeder',
            ])
            for path in global_seeders:
                self.run_seeder(path, factories)

        self.stdout.write(self.style.SUCCESS('Successfully finished seeding'))

    def run_seeder(self, seeder_path, factories):
        self.stdout.write(f'Running seeder: {seeder_path}')
        try:
            if seeder_path in factories:
                seeder = factories[seeder_path]()
            else:
                seeder_class = import_string(seeder_path)
                seeder = seeder_class()
                
            seeder.run()
            self.stdout.write(self.style.SUCCESS(f'Finished {seeder_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error running {seeder_path}: {e}'))
            import traceback
            traceback.print_exc()
