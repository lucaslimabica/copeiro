import UserIcon from '@/components/UserIcon';

const TopBar = () => {
    return (
        <header className="flex items-center justify-between h-14 px-4 text-main bg-surface border-b border-secondary">
            <h3 className="text-md font-bold text-main">Jogos</h3>
            <h3 className="text-md font-bold text-main">Ranks</h3>
            <h3 className="text-md font-bold text-main">Palpites</h3>
            <UserIcon />
        </header>
    );
};

export default TopBar;
