import { getMe, getQRCode } from "@/utils/api"
import { BackButton } from "@/components/ui/BackButton"

export const dynamic = "force-dynamic"

export default async function ReceivePage() {
  const [user, qrDataUrl] = await Promise.all([
    getMe(),
    getQRCode(),
  ])

  return (
    <div className="px-4 lg:px-8 py-6 max-w-md mx-auto">
      <div className="bg-white border border-sage-mid p-8">
        <div className="flex flex-col items-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Your QR Code" className="h-56 w-56" />
          ) : (
            <div className="h-56 w-56 bg-sage flex items-center justify-center text-navy-muted text-sm">
              Could not load QR code.
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-navy-muted text-center mt-4">
        Ask the sender to scan this QR code to send money to
      </p>
      <p className="text-lg font-bold text-navy text-center mt-1">{user.phone}</p>
    </div>
  )
}
