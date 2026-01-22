import React from 'react';
import {
    Bookmark,
    Rss,
    Check,
} from 'lucide-react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_CATEGORIES } from '@/lib/categories';

const fixedItems = [
    { name: 'My Feed', icon: Rss },
    { name: 'Saved Articles', icon: Bookmark },
];

interface SidebarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    userCategories: string[];
    isOpen?: boolean;
    onClose?: () => void;
    onSettingsClick?: () => void;
}

export const Sidebar = ({
    selectedCategory,
    onCategoryChange,
    userCategories,
    isOpen,
    onClose,
    onSettingsClick
}: SidebarProps) => {
    const personalCategories = ALL_CATEGORIES.filter(cat => userCategories.includes(cat.name));
    const discoverCategories = ALL_CATEGORIES.filter(cat => !userCategories.includes(cat.name));

    const renderNavItems = (items: typeof ALL_CATEGORIES) => (
        <nav className="flex flex-col gap-1">
            {items.map((cat) => (
                <button
                    key={cat.name}
                    onClick={() => {
                        onCategoryChange(cat.name);
                        onClose?.();
                    }}
                    className={cn(
                        "flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-slate-100",
                        selectedCategory === cat.name ? "bg-primary text-white hover:bg-primary/90" : "text-slate-600"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <cat.icon size={18} />
                        {cat.name}
                    </div>
                    {selectedCategory === cat.name && <Check size={14} />}
                </button>
            ))}
        </nav>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-[100] flex w-64 flex-col gap-8 bg-white px-4 py-8 transition-transform duration-300 lg:sticky lg:top-24 lg:z-0 lg:flex lg:h-[calc(100vh-6rem)] lg:translate-x-0 lg:bg-transparent lg:px-0 lg:py-0 overflow-y-auto no-scrollbar",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between lg:hidden">
                    <span className="text-xl font-bold tracking-tight text-primary">
                        Morning <span className="text-accent">Scroll</span>
                    </span>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    >
                        <Check size={20} className="rotate-45" />
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    <div>
                        <h3 className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-muted">
                            Personal
                        </h3>
                        {renderNavItems([...fixedItems, ...personalCategories] as any)}

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    onSettingsClick?.();
                                    onClose?.();
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100"
                            >
                                <Settings size={18} />
                                Settings
                            </button>
                        </div>
                    </div>

                    {discoverCategories.length > 0 && (
                        <div>
                            <h3 className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-muted">
                                Discover
                            </h3>
                            {renderNavItems(discoverCategories)}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};
