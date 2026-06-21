import BulkPortraitUploadForm from '@/components/portraits/BulkPortraitUploadForm'

export default function BulkPortraitPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100 mb-1">Bulk Upload — Art & Portraits</h1>
      <p className="text-sm text-gray-500 mb-6">Multiple images select karo, har ek ka title set karo, fir ek saath save karo</p>
      <BulkPortraitUploadForm />
    </div>
  )
}