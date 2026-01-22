import React, { useState, useEffect } from 'react';
import { ALL_CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { Check, ArrowRight, LayoutGrid, List, X } from 'lucide-react';

interface PreferencesModalProps {
    isOpen: boolean;
    onClose?: () => void;
    onComplete: (selectedCategories: string[], viewPreference: 'grid' | 'list') => void;
    initialCategories?: string[];
    initialViewPreference?: 'grid' | 'list';
}

export const PreferencesModal = ({
    isOpen,
    onClose,
    onComplete,
    initialCategories = [],
    initialViewPreference = 'grid'
}: PreferencesModalProps) => {
    const [selected, setSelected] = useState<string[]>(initialCategories);
    const [viewPreference, setViewPreference] = useState<'grid' | 'list'>(initialViewPreference);

    useEffect(() => {
        if (isOpen) {
            setSelected(initialCategories);
            setViewPreference(initialViewPreference);
        }
    }, [isOpen, initialCategories, initialViewPreference]);

    const toggleCategory = (name: string) => {
        setSelected(prev =>
            prev.includes(name)
                ? prev.filter(c => c !== name)
                : [...prev, name]
        );
    };

    const handleSave = () => {
        if (selected.length === 0) return;

        localStorage.setItem('onboarded', 'true');
        localStorage.setItem('userCategories', JSON.stringify(selected));
        localStorage.setItem('viewPreference', viewPreference);

        onComplete(selected, viewPreference);
        onClose?.();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="flex h-full max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

                {onClose && (
                    <div className="absolute right-6 top-6 z-10">
                        <button
                            onClick={onClose}
                            className="rounded-full bg-black/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/20"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                <div className="shrink-0 bg-primary px-8 py-8 text-white">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customize Your Feed</h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-200">
                        Personalize your reading experience by selecting your preferred layout and interests.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="flex flex-col gap-8 sm:gap-10">

                        {/* View Preference Section */}
                        <section>
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                                1. Choose Layout
                            </h3>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <button
                                    onClick={() => setViewPreference('grid')}
                                    className={cn(
                                        "group flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all",
                                        viewPreference === 'grid'
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-100">
                                        <LayoutGrid size={24} />
                                    </div>
                                    <span className="text-sm font-semibold">Grid View</span>
                                </button>

                                <button
                                    onClick={() => setViewPreference('list')}
                                    className={cn(
                                        "group flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all",
                                        viewPreference === 'list'
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-100">
                                        <List size={24} />
                                    </div>
                                    <span className="text-sm font-semibold">List View</span>
                                </button>
                            </div>
                        </section>

                        {/* Categories Section */}
                        <section>
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                                2. Select Topics
                            </h3>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {ALL_CATEGORIES.filter(c => c.name !== 'Top Stories').map((cat) => {
                                    const isSelected = selected.includes(cat.name);
                                    return (
                                        <button
                                            key={cat.name}
                                            onClick={() => toggleCategory(cat.name)}
                                            className={cn(
                                                "group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-3 sm:p-4 transition-all",
                                                isSelected
                                                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                    : "border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-colors",
                                                isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                            )}>
                                                <cat.icon size={18} className="sm:w-5 sm:h-5" />
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-center">{cat.name}</span>

                                            {isSelected && (
                                                <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                                                    <Check size={10} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-slate-50 p-4 sm:p-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={selected.length === 0}
                        className={cn(
                            "flex items-center gap-2 rounded-full px-6 py-3 sm:px-8 text-base sm:text-lg font-bold transition-all",
                            selected.length > 0
                                ? "bg-primary text-white hover:scale-105 hover:bg-primary/90 shadow-lg shadow-primary/25"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        Save Preferences
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
