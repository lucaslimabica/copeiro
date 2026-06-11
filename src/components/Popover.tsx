import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
    label: ReactNode;
    children: ReactNode;
    align?: 'left' | 'right';
    buttonClassName?: string;
};

export function Popover({
    label,
    children,
    align = 'right',
    buttonClassName,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    return (
        <div ref={ref} className="relative inline-block">
            <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className={
                    buttonClassName ??
                    'rounded-lg border border-secondary bg-surface px-3 py-1.5 text-xs font-semibold text-main hover:opacity-80 transition-opacity cursor-pointer'
                }
            >
                {label}
            </button>
            {isOpen && (
                <div
                    className={`absolute z-50 mt-2 w-64 rounded-xl border border-border-main bg-surface p-3 shadow-lg ${align === 'right' ? 'right-0' : 'left-0'}`}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
