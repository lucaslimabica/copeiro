import UserIcon from '@/components/UserIcon';

const TopBar = () => {
    return (
        <header className="flex items-center justify-between h-14 px-4 text-main bg-surface border-b border-border-main">
            <h3 className="text-sm font-bold">Jogos</h3>
            <h3 className="text-sm font-bold">Ranks</h3>
            <h3 className="text-sm font-bold">Palpites</h3>
            <UserIcon />
        </header>
    );
};

export default TopBar;
