import { useEffect } from 'react'

type ModalProps = {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  footer?: React.ReactNode
}

export default function Modal({ title, children, isOpen, onClose, footer }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation" onMouseDown={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-xl backdrop-blur dark:border-white/10 dark:bg-zinc-950/90"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-white/10">
          <div className="text-base font-extrabold">{title}</div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-lg leading-none text-zinc-700 hover:bg-zinc-200 active:translate-y-px dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        <div className="px-4 py-4 text-sm text-zinc-800 dark:text-white/90">{children}</div>
        {footer ? <div className="border-t border-zinc-200 px-4 py-3 dark:border-white/10">{footer}</div> : null}
      </div>
    </div>
  )
}
