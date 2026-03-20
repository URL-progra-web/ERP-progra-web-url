from django.core.paginator import Paginator
from rest_framework.response import Response


class PaginationMixin:
    """
    Mixin to provide standard pagination for custom ViewSets.
    """
    def paginate_queryset(self, queryset, serializer_class, request):
        try:
            page = max(1, int(request.query_params.get('page', 1)))
            page_size = min(100, max(1, int(request.query_params.get('page_size', 25))))
        except (TypeError, ValueError):
            page = 1
            page_size = 25

        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        serializer = serializer_class(page_obj.object_list, many=True)

        return Response({
            'results': serializer.data,
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'page': page_obj.number,
            'page_size': page_size,
        })
