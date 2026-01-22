'use client';

import React, { useState, useEffect } from 'react';
import { ALL_CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { Check, ArrowRight } from 'lucide-react';

interface OnboardingProps {
    onComplete: (selectedCategories: string[]) => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already onboarded
        const onboarded = localStorage.getItem('onboarded');
        if (!onboarded) {
            setIsVisible(true);
        }
    }, []);

    const toggleCategory = (name: string) => {
        setSelected(prev =>
            prev.includes(name)
                ? prev.filter(c => c !== name)
                : [...prev, name]
        );
    };

    const handleContinue = () => {
        if (selected.length === 0) return;

        localStorage.setItem('onboarded', 'true');
        localStorage.setItem('userCategories', JSON.stringify(selected));
        onComplete(selected);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="bg-primary px-8 py-10 text-white">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to Morning Scroll</h1>
                    <p className="mt-2 text-slate-200">
                        Select at least one category to personalize your news feed.
                    </p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {ALL_CATEGORIES.filter(c => c.name !== 'Top Stories').map((cat) => {
                            const isSelected = selected.includes(cat.name);
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => toggleCategory(cat.name)}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-200",
                                        isSelected
                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                            : "border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                                        isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                    )}>
                                        <cat.icon size={24} />
                                    </div>
                                    <span className="text-sm font-semibold text-center">{cat.name}</span>

                                    {isSelected && (
                                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-10 flex justify-end">
                        <button
                            onClick={handleContinue}
                            disabled={selected.length === 0}
                            className={cn(
                                "flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold transition-all",
                                selected.length > 0
                                    ? "bg-primary text-white hover:scale-105 hover:bg-primary/90 shadow-lg shadow-primary/25"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            Continue
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
