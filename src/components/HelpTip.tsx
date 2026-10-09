import { useEffect, useId, useState } from 'react';

/** Compact help that works on hover, keyboard focus, and tap. */
export default function HelpTip({ label, children }: { label: string; children: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return <span className="help-tip" data-open={open}>
    <button type="button" className="help-tip-trigger" aria-label={`Help: ${label}`} aria-describedby={id} aria-expanded={open} aria-controls={id} title={children} onClick={() => setOpen(value => !value)}>i</button>
    <span id={id} className="help-tip-content" role="tooltip">{children}</span>
  </span>;
}
