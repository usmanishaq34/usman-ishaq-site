interface FormFieldProps {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  error?: string
}

export default function FormField({ label, hint, required, children, error }: FormFieldProps) {
  return (
    <div>
      <label className="mono-pill block mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-ink-muted mb-2 leading-relaxed">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  )
}
