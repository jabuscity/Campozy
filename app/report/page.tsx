import { ReportForm } from '@/components/report-form'

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6 lg:mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="text-xl font-black text-primary">!</span>
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-neutral-900 uppercase tracking-tight">Report Utility Issue</h1>
            <p className="text-xs lg:text-sm text-neutral-500">Report an issue</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 p-4 sm:p-6">
          <ReportForm />
        </div>
      </div>
    </div>
  )
}
