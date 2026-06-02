import io

import qrcode
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class QRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        phone = request.user.phone
        data = f"moneybag://pay/{phone}"

        img = qrcode.make(data, box_size=10, border=2)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        return HttpResponse(
            buf.getvalue(),
            content_type="image/png",
            headers={
                "Cache-Control": "no-cache",
                "Content-Disposition": f'inline; filename="qr-{phone}.png"',
            },
        )
