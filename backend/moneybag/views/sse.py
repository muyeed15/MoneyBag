import json
import time

from django.http import StreamingHttpResponse
from django.views import View
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from moneybag.models import Notification


class NotificationStreamView(View):
    def get(self, request):
        auth = JWTAuthentication()
        try:
            result = auth.authenticate(request)
            if result is None:
                return StreamingHttpResponse(status=401)
            user, _ = result
        except (InvalidToken, TokenError):
            return StreamingHttpResponse(status=401)

        last_id = int(request.GET.get("last_id", 0))

        def event_stream():
            nonlocal last_id
            # Flush immediately so the proxy knows the connection is live
            yield ": connected\n\n"
            last_heartbeat = time.time()
            try:
                while True:
                    new = list(
                        Notification.objects.filter(user=user, id__gt=last_id)
                        .order_by("id")
                        .values("id", "message", "is_read", "created_at")
                    )
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
                pass

        response = StreamingHttpResponse(
            event_stream(), content_type="text/event-stream"
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
