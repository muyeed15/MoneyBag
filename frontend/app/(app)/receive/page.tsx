import { getMe, getQRCode } from "@/utils/api"
import { Card } from "@/components/ui/Card"
import { PageHeader } from "@/components/ui/PageHeader"

export const dynamic = "force-dynamic"

export default async function ReceivePage() {
  const [user, qrDataUrl] = await Promise.all([
    getMe(),
    getQRCode(),
  ])

  return (
    <div>
      <PageHeader title="Receive" showBack />
      <div className="px-4 py-3 lg:px-6 lg:py-6 mx-auto max-w-lg">
      <Card className="p-8 w-full">
        <div className="flex flex-col items-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Your QR Code" className="h-56 w-56" />
          ) : (
            <div className="h-56 w-56 bg-sage flex items-center justify-center text-navy-muted text-sm">
              Could not load QR code.
            </div>
          )}
          <p className="text-sm text-navy-muted text-center mt-6">
            Ask the sender to scan this QR code to send money to
          </p>
          <p className="text-lg font-bold text-navy text-center mt-1">{user.phone}</p>
        </div>
      </Card>
      </div>
    </div>
  )
}
