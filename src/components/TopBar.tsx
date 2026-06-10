import UserIcon from '@/components/UserIcon';

const TopBar = () => {
    return (
        <header className="flex items-center justify-between h-14 px-4 text-main bg-surface border-b border-border-main">
            <h1 className="text-sm font-bold">Jogos</h1>
            <h1 className="text-sm font-bold">Ranks</h1>
            <h1 className="text-sm font-bold">Palpites</h1>
            <UserIcon />
        </header>
    );
};

export default TopBar;