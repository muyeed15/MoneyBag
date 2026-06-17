import math

from django.conf import settings


def get_page(request) -> int:
    try:
        return max(1, int(request.query_params.get("page", 1)))
    except (ValueError, TypeError):
        return 1


def get_page_size(request) -> int:
    try:
        requested = int(request.query_params.get("page_size", settings.PAGE_SIZE))
        return max(1, min(requested, settings.PAGE_SIZE_MAX))
    except (ValueError, TypeError):
        return settings.PAGE_SIZE


def paginate(queryset, page: int, page_size: int) -> dict:
    count = queryset.count()
    total_pages = max(1, math.ceil(count / page_size))
    page = max(1, min(page, total_pages))
    return {
        "count": count,
        "total_pages": total_pages,
        "page": page,
        "queryset": queryset[(page - 1) * page_size : page * page_size],
    }
