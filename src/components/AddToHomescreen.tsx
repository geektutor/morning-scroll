import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToHomescreenProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddToHomescreen = ({ isOpen, onClose }: AddToHomescreenProps) => {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    }, []);

    if (!isOpen || isStandalone) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-xl shadow-primary/20">
                        <PlusSquare size={40} />
                    </div>

                    <h2 className="mb-2 text-2xl font-bold text-slate-800">Install App</h2>
                    <p className="mb-8 text-slate-600">
                        Add Morning Scroll to your home screen for the best experience.
                    </p>

                    <div className="rounded-2xl bg-slate-50 p-6 text-left">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                            {isIOS ? 'iOS Instructions' : 'Android Instructions'}
                        </h3>

                        {isIOS ? (
                            <ol className="flex flex-col gap-4 text-sm font-medium text-slate-700">
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">1</span>
                                    <span>Tap the <Share size={16} className="mx-1 inline" /> Share button below</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">2</span>
                                    <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                                </li>
                            </ol>
                        ) : (
                            <ol className="flex flex-col gap-4 text-sm font-medium text-slate-700">
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">1</span>
                                    <span>Tap the browser menu (three dots)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">2</span>
                                    <span>Select <strong>Add to Home Screen</strong> or <strong>Install App</strong></span>
                                </li>
                            </ol>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-8 w-full rounded-full bg-primary py-4 font-bold text-white transition-transform hover:scale-105 active:scale-95"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};
