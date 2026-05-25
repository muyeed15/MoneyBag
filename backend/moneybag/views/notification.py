from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from moneybag.models import Notification
from moneybag.pagination import get_page, get_page_size, paginate
from moneybag.serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = (
            Notification.objects.filter(user=request.user)
            .only("id", "message", "is_read", "created_at")
            .order_by("-created_at")
        )
        p = paginate(qs, get_page(request), get_page_size(request))
        return Response(
            {
                "count": p["count"],
                "total_pages": p["total_pages"],
                "page": p["page"],
                "results": NotificationSerializer(p["queryset"], many=True).data,
            }
        )


class NotificationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_notification(self, user, pk):
        try:
            return (
                Notification.objects.filter(user=user)
                .only("id", "message", "is_read", "created_at")
                .get(pk=pk)
            )
        except Notification.DoesNotExist:
            return None

    def get(self, request, pk):
        notification = self._get_notification(request.user, pk)
        if notification is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(NotificationSerializer(notification).data)

    def patch(self, request, pk):
        notification = self._get_notification(request.user, pk)
        if notification is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])

        return Response(NotificationSerializer(notification).data)


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True
        )
        return Response({"marked_read": updated})
