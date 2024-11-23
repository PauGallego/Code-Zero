import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface QRScannerProps {
  onClose: () => void
}

export default function QRScanner({ onClose }: QRScannerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl relative">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
          <X size={24} />
        </Button>
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Camera feed would go here</p>
        </div>
      </div>
    </div>
  )
}

