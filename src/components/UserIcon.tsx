import { useEffect, useState, useRef } from 'react';
import { CircleUserRound, Palette } from 'lucide-react';

// Traduções que já tinhas definido
const translations = {
    en: { light: 'Light', dark: 'Dark', midnight: 'Midnight', label: 'Theme' },
    pt: {
        light: 'Claro',
        dark: 'Escuro',
        midnight: 'Meia-Noite',
        label: 'Tema',
    },
};

const currentLanguage: keyof typeof translations = 'pt';
type Theme = 'light' | 'dark' | 'midnight';

const UserIcon = () => {
    // Controla o pop-up aberto ou não
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // add novos temas aqui
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('copeiro-theme') as Theme;
        return ['light', 'dark', 'midnight'].includes(storedTheme)
            ? storedTheme
            : 'dark';
    });

    // add novos temas aqui também
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'midnight');
        root.classList.add(theme);
        localStorage.setItem('copeiro-theme', theme);
    }, [theme]);

    // Fechar o pop-up automaticamente se user clicar fora dele
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botão do Ícone */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 rounded-full bg-surface flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity focus:outline-hidden"
                aria-label="Menu"
            >
                <CircleUserRound className="text-main" />
            </button>

            {/* Pop-up */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-border-main p-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                    <div className="text-xs font-semibold text-main mb-2 px-1">
                        Menu de Opções
                    </div>

                    {/* Trocar de Tema */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted flex items-center gap-1.5 px-1">
                            <Palette size={14} />
                            {translations[currentLanguage].label}
                        </label>

                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as Theme)}
                            className="w-full bg-surface border border-border-main text-main rounded-lg p-2 
                                       text-xs font-semibold shadow-xs transition-colors duration-200 
                                       focus:outline-hidden focus:ring-2 focus:ring-primary/40 cursor-pointer"
                        >
                            <option value="light">
                                {translations[currentLanguage].light}
                            </option>
                            <option value="dark">
                                {translations[currentLanguage].dark}
                            </option>
                            <option value="midnight">
                                {translations[currentLanguage].midnight}
                            </option>
                        </select>
                    </div>

                    {/* No futuro, podes adicionar mais opções aqui facilmente: */}
                    {/* <hr className="border-border-main my-2" />
                    <button className="w-full text-left text-xs p-2 hover:bg-main/5 rounded-lg text-red-500">
                        Sair da Conta
                    </button> 
                    */}
                </div>
            )}
        </div>
    );
};

export default UserIcon;
