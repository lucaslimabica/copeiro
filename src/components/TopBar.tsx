import { NavLink } from 'react-router-dom';
import UserIcon from '@/components/UserIcon';

const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 py-1 relative ${
        isActive 
            ? 'text-main after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full' 
            : 'text-muted hover:text-main'
    }`;

const TopBar = () => {
    return (
        // No mobile a altura passa a ser automática (h-auto) para caber os dois andares
        <header className="h-auto md:h-14 px-4 sm:px-6 bg-surface border-b border-secondary sticky top-0 z-40 backdrop-blur-md bg-surface/90 py-2 md:py-0">
            <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                
                {/* pRMEIRO ANDAR */}
                <div className="flex items-center justify-between w-full md:w-auto">
                    <span className="font-black text-base sm:text-lg tracking-wider bg-linear-to-r from-primary to-main bg-clip-text text-transparent">
                        COPEIRO
                    </span>
                    
                    {/* O UserIcon fica aqui no mobile, colado à direita */}
                    <div className="md:hidden">
                        <UserIcon />
                    </div>
                </div>

                {/* SEGUNDO ANDAR */}
                {/* `overflow-x-auto` garante que se o telemóvel for muito pequeno, o utilizador pode arrastar para o lado sem quebrar o layout */}
                <nav className="flex items-center justify-between md:justify-start gap-4 sm:gap-6 w-full md:w-auto overflow-x-auto no-scrollbar py-1 md:py-0 h-full">
                    <NavLink to="/" className={linkClass}>Home</NavLink>
                    <NavLink to="/jogos" className={linkClass}>Jogos</NavLink>
                    <NavLink to="/palpites" className={linkClass}>Palpites</NavLink>
                    <NavLink to="/ranks" className={linkClass}>Ranks</NavLink>
                    <NavLink to="/selecoes" className={linkClass}>Seleções</NavLink>
                    <NavLink to="/calendario" className={linkClass}>Calendário</NavLink>
                </nav>

                {/* UserIcon para Computador (Escondido no mobile) */}
                <div className="hidden md:flex items-center pl-2 border-l border-secondary/60 h-6">
                    <UserIcon />
                </div>
                
            </div>
        </header>
    );
};

export default TopBar;