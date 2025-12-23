import React from 'react';
import { useTheme } from '../context/ThemeContext';

/* Polished header with theme controls (crimson / azure) */
export default function Header() {
    const { variant, toggleVariant, setVariant, largeMode, setLargeMode, reducedMotion, setReducedMotion } = useTheme();

    return (
        <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div
                    className="logo-float w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                        background: 'var(--panel)',
                        border: '1px solid rgba(255,255,255,0.04)'
                    }}
                    aria-hidden
                >
                    <svg width="44" height="44" viewBox="0 0 64 64" fill="none" aria-hidden>
                        <defs>
                            <linearGradient id="g1" x1="0" x2="1">
                                <stop offset="0" stopColor="var(--accent-light)" />
                                <stop offset="1" stopColor="var(--accent)" />
                            </linearGradient>
                        </defs>
                        <circle cx="32" cy="20" r="9" fill="url(#g1)" />
                        <path d="M6 48 L30 20 L54 48 Z" fill="var(--panel)" stroke="var(--accent)" strokeWidth="1.6" />
                        <path d="M12 44 L22 30 L34 44" stroke="var(--accent-light)" strokeWidth="0.9" opacity="0.8" fill="none" />
                    </svg>
                </div>

                <div>
                    <div className="text-2xl font-bold tracking-tight">lux-list <span style={{ color: 'var(--accent)' }}>•</span></div>
                    <div className="text-xs text-gray-400">a small family sharing app — a gift from Lawrence</div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme variant controls */}
                <div className="flex items-center gap-2" role="group" aria-label="Theme controls">
                    <button
                        className={`px-2 py-1 rounded border ${variant === 'crimson' ? 'ring-2 ring-offset-1' : 'opacity-70'}`}
                        onClick={() => setVariant('crimson')}
                        aria-pressed={variant === 'crimson'}
                        title="Crimson theme"
                    >
                        Crimson
                    </button>
                    <button
                        className={`px-2 py-1 rounded border ${variant === 'azure' ? 'ring-2 ring-offset-1' : 'opacity-70'}`}
                        onClick={() => setVariant('azure')}
                        aria-pressed={variant === 'azure'}
                        title="Azure theme"
                    >
                        Azure
                    </button>

                    <button
                        className="px-2 py-1 rounded border"
                        onClick={toggleVariant}
                        title="Toggle variant"
                        aria-label="Toggle theme variant"
                    >
                        Toggle
                    </button>
                </div>

                {/* Accessibility quick toggles */}
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={largeMode}
                            onChange={e => setLargeMode(e.target.checked)}
                            aria-label="Large mode"
                        />
                        Large
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={reducedMotion}
                            onChange={e => setReducedMotion(e.target.checked)}
                            aria-label="Reduce motion"
                        />
                        Reduce motion
                    </label>
                </div>
            </div>
        </header>
    );
}