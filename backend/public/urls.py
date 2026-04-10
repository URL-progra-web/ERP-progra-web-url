from django.urls import path

from .views import (
    PublicCategoryListView,
    PublicCategoryTreeView,
    PublicCategoryPathView,
    PublicFiltersView,
    PublicOrderCreateView,
    PublicProductDetailView,
    PublicProductListView,
)

urlpatterns = [
    path('categories/', PublicCategoryListView.as_view(), name='public-categories'),
    path('categories/tree/', PublicCategoryTreeView.as_view(), name='public-categories-tree'),
    path('categories/<int:pk>/path/', PublicCategoryPathView.as_view(), name='public-category-path'),
    path('filters/', PublicFiltersView.as_view(), name='public-filters'),
    path('products/', PublicProductListView.as_view(), name='public-products'),
    path('products/<int:pk>/', PublicProductDetailView.as_view(), name='public-product-detail'),
    path('orders/', PublicOrderCreateView.as_view(), name='public-order-create'),
]
