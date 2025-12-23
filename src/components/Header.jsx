import React, { useEffect, useState } from 'react';

/**
 * Header
 *
 * - Controls theme (light / dark) and accessibility toggles.
 * - Stores settings in localStorage keys:
 *    theme -> 'light' | 'dark'
 *    largeMode -> '1' | '0'
 *    highContrast -> '1' | '0'
 *    reducedMotion -> '1' | '0'
 *
 * - Applies classes to document.documentElement:
 *    'light' | 'dark'
 *    'large-mode'
 *    'high-contrast'
 *    'reduced-motion'
 *
 * Props:
 *  - user (optional): current user object (for display)
 *  - onSignOut (optional): function to sign the user out
 */

const LS = {
    THEME: 'theme',
    LARGE: 'largeMode',
    CONTRAST: 'highContrast',
    REDUCED: 'reducedMotion'
};

function readBool(lsKey) {
    return localStorage.getItem(lsKey) === '1';
}

function writeBool(lsKey, val) {
    localStorage.setItem(lsKey, val ? '1' : '0');
}

export default function Header({ user, onSignOut }) {
    const [theme, setTheme] = useState(localStorage.getItem(LS.THEME) || 'dark');
    const [largeMode, setLargeMode] = useState(readBool(LS.LARGE));
    const [highContrast, setHighContrast] = useState(readBool(LS.CONTRAST));
    const [reducedMotion, setReducedMotion] = useState(readBool(LS.REDUCED));

    // Apply classes to <html> when states change
    useEffect(() => {
        const html = document.documentElement;
        // Theme
        html.classList.remove('light', 'dark');
        html.classList.add(theme === 'light' ? 'light' : 'dark');
        localStorage.setItem(LS.THEME, theme);

        // Large mode
        if (largeMode) html.classList.add('large-mode'); else html.classList.remove('large-mode');
        writeBool(LS.LARGE, largeMode);

        // High contrast
        if (highContrast) html.classList.add('high-contrast'); else html.classList.remove('high-contrast');
        writeBool(LS.CONTRAST, highContrast);

        // Reduced motion (also set prefers-reduced-motion class)
        if (reducedMotion) html.classList.add('reduced-motion'); else html.classList.remove('reduced-motion');
        writeBool(LS.REDUCED, reducedMotion);
    }, [theme, largeMode, highContrast, reducedMotion]);

    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    const toggleLarge = () => setLargeMode(prev => !prev);
    const toggleContrast = () => setHighContrast(prev => !prev);
    const toggleReduced = () => setReducedMotion(prev => !prev);

    return (
        <header className="w-full border-b border-[#132029] bg-gradient-to-r from-transparent to-transparent">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gradient-to-br from-[#0b0e13] to-[#07121a] shadow-sm">
                            <span className="text-crimson font-bold select-none">LG</span>
                        </div>
                        <div>
                            <div className="text-lg font-semibold leading-tight">LuxGirl Grocery</div>
                            <div className="text-xs text-gray-400">Personal grocery sharing — family first</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1" />

                <nav className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-pressed={theme === 'light'}
                            aria-label="Toggle light / dark theme"
                            className="px-3 py-1 rounded border border-transparent hover:border-[#213244] transition"
                            title="Toggle light / dark"
                        >
                            {theme === 'light' ? 'Light' : 'Dark'}
                        </button>

                        <button
                            type="button"
                            onClick={toggleLarge}
                            aria-pressed={largeMode}
                            aria-label="Toggle large mode"
                            className="px-3 py-1 rounded border border-transparent hover:border-[#213244] transition"
                            title="Toggle large accessible mode"
                        >
                            {largeMode ? 'Large' : 'Normal'}
                        </button>

                        <button
                            type="button"
                            onClick={toggleContrast}
                            aria-pressed={highContrast}
                            aria-label="Toggle high contrast"
                            className="px-3 py-1 rounded border border-transparent hover:border-[#213244] transition"
                            title="Toggle high contrast"
                        >
                            HC
                        </button>

                        <button
                            type="button"
                            onClick={toggleReduced}
                            aria-pressed={reducedMotion}
                            aria-label="Toggle reduced motion"
                            className="px-3 py-1 rounded border border-transparent hover:border-[#213244] transition"
                            title="Reduce motion"
                        >
                            RM
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <div className="text-sm text-gray-300 hidden sm:block">{user.displayName || user.email}</div>
                                {typeof onSignOut === 'function' ? (
                                    <button onClick={onSignOut} className="px-3 py-1 bg-red-700 rounded text-white" aria-label="Sign out">Sign out</button>
                                ) : (
                                    <button className="px-3 py-1 bg-red-700 rounded text-white" aria-label="Signed in">Signed in</button>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-gray-400">Not signed in</div>
                        )}
                    </div>
                </nav>
            </div>

            {/* Small-screen accessibility panel (stacked, visible) */}
            <div className="sm:hidden border-t border-[#0f1720] bg-[#07121a] px-4 py-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                        <button onClick={toggleTheme} className="px-2 py-1 rounded text-sm">Theme</button>
                        <button onClick={toggleLarge} className="px-2 py-1 rounded text-sm">Large</button>
                        <button onClick={toggleContrast} className="px-2 py-1 rounded text-sm">HC</button>
                        <button onClick={toggleReduced} className="px-2 py-1 rounded text-sm">RM</button>
                    </div>
                    <div className="text-xs text-gray-400">Accessibility</div>
                </div>
            </div>
        </header>
    );
}