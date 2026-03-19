from faker import Faker

class BaseSeeder:
    """Base class for all seeders."""
    
    def __init__(self):
        self.faker = Faker()

    def run(self):
        """Main method to execute the seeder logic."""
        raise NotImplementedError("Seeders must implement run() method")
