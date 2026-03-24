from drf_spectacular.openapi import AutoSchema

class CustomAutoSchema(AutoSchema):
    def get_tags(self):
        # self.path is typically something like '/api/inventory/transactions/'
        parts = [p for p in self.path.split('/') if p and not p.startswith('{')]
        
        # If it follows our '/api/app_name/router_name/' structure
        if len(parts) >= 3 and parts[0] == 'api':
            app_name = parts[1].capitalize()
            router_name = parts[2].replace('-', ' ').title()
            
            # This creates a combined tag grouping like "Inventory > Transactions"
            return [f"{app_name} > {router_name}"]
            
        return super().get_tags()
