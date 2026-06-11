import { NavLink } from 'react-router-dom';
import UserIcon from '@/components/UserIcon';

const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-md font-bold ${isActive ? 'text-main underline underline-offset-4' : 'text-muted hover:text-main'}`;

const TopBar = () => {
    return (
        <header className="flex items-center justify-between h-14 px-4 text-main bg-surface border-b border-secondary">
            <NavLink to="/jogos" className={linkClass}>
                Jogos
            </NavLink>
            <NavLink to="/ranks" className={linkClass}>
                Ranks
            </NavLink>
            <NavLink to="/palpites" className={linkClass}>
                Palpites
            </NavLink>
            <UserIcon />
        </header>
    );
};

export default TopBar;
