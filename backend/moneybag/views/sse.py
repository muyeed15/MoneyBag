import json
import logging
import time

from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from moneybag.models import Notification

logger = logging.getLogger(__name__)


class NotificationStreamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            last_id = int(request.GET.get("last_id", 0))
        except (ValueError, TypeError):
            last_id = 0

        user = request.user

        def event_stream():
            nonlocal last_id
            logger.info("SSE connected for user=%s last_id=%s", user.phone, last_id)
            yield ": connected\n\n"
            last_heartbeat = time.time()
            try:
                while True:
                    try:
                        new = list(
                            Notification.objects.filter(user=user, id__gt=last_id)
                            .order_by("id")
                            .values("id", "message", "is_read", "created_at")
                        )
                    except Exception as e:
                        logger.error("SSE query error for user=%s: %s", user.phone, e)
                        yield f"event: error\ndata: {json.dumps({'detail': 'Query failed'})}\n\n"
                        time.sleep(5)
                        continue

                    for notif in new:
                        last_id = notif["id"]
                        payload = json.dumps(
                            {
                                "id": notif["id"],
                                "message": notif["message"],
                                "is_read": notif["is_read"],
                                "created_at": notif["created_at"].isoformat(),
                            }
                        )
                        yield f"event: notification\ndata: {payload}\n\n"

                    now = time.time()
                    if now - last_heartbeat >= 15:
                        yield ": heartbeat\n\n"
                        last_heartbeat = now

                    time.sleep(2)
            except GeneratorExit:
                logger.info("SSE disconnected for user=%s", user.phone)

        response = StreamingHttpResponse(
            event_stream(), content_type="text/event-stream"
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
