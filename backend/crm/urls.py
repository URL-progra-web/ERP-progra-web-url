from django.urls import include, path

urlpatterns = [
    path('customers/', include('crm.customer.urls')),
]
