import { Search, X } from 'lucide-react';

type InputBuscaProps = {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
};

export function InputBuscaJogos({ value, onChange, placeholder = "Buscar seleção" }: InputBuscaProps) {
    return (
        <div className="relative w-full max-w-md mx-auto mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                <Search className="h-4 w-4" />
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 pl-10 pr-10 bg-base border border-secondary rounded-xl text-sm text-main placeholder-muted/60 focus:outline-none focus:border-primary transition-colors"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-main transition-colors cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}