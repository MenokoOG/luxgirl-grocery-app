import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function AccessibilityPanel() {
    const {
        isDark, toggle,
        highContrast, toggleHighContrast,
        reducedMotion, toggleReducedMotion,
        largeMode, toggleLargeMode,
        resetAll,
        _debug
    } = useTheme();

    const forceApplyNow = () => {
        // small programmatic re-apply in case something blocked the previous effect
        try {
            // re-trigger by toggling twice quickly (harmless) to force effect
            // This technique avoids direct DOM writes from here.
            toggle();
            toggle();
        } catch (e) {
            console.debug('AccessibilityPanel: forceApply err', e);
        }
        // Also log current documentElement.info
        console.debug('AccessibilityPanel: html.className=', document.documentElement.className);
        console.debug('AccessibilityPanel: html.dataset=', document.documentElement.dataset);
        console.debug('AccessibilityPanel: localStorage values:',
            localStorage.getItem('lux_list_dark'),
            localStorage.getItem('lux_list_highContrast'),
            localStorage.getItem('lux_list_reducedMotion'),
            localStorage.getItem('lux_list_largeMode')
        );
    };

    return (
        <div className="card" role="region" aria-labelledby="accessibility-panel-title">
            <div className="flex items-start justify-between">
                <div>
                    <div id="accessibility-panel-title" className="font-semibold">Accessibility</div>
                    <div className="text-xs text-gray-400">Visual & motion preferences — saved locally</div>
                </div>

                <div className="flex gap-2 items-center">
                    <div className="text-xs text-gray-400 text-right">Theme</div>
                    <button
                        className="px-3 py-1 bg-gray-700 rounded"
                        onClick={toggle}
                        aria-pressed={isDark}
                    >
                        {isDark ? 'Dark' : 'Light'}
                    </button>
                </div>
            </div>

            <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">High contrast</div>
                        <div className="text-xs text-gray-400">Higher contrast mode</div>
                    </div>
                    <button
                        className="px-3 py-1 rounded"
                        onClick={toggleHighContrast}
                        aria-pressed={highContrast}
                        style={{ background: highContrast ? 'var(--crimson)' : '#2b3942', color: highContrast ? '#fff' : '#dbe7ef' }}
                    >
                        {highContrast ? 'On' : 'Off'}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">Reduce motion</div>
                        <div className="text-xs text-gray-400">Disable animations</div>
                    </div>
                    <button
                        className="px-3 py-1 rounded"
                        onClick={toggleReducedMotion}
                        aria-pressed={reducedMotion}
                        style={{ background: reducedMotion ? 'var(--crimson)' : '#2b3942', color: reducedMotion ? '#fff' : '#dbe7ef' }}
                    >
                        {reducedMotion ? 'On' : 'Off'}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">Large mode</div>
                        <div className="text-xs text-gray-400">Larger controls & spacing</div>
                    </div>
                    <button
                        className="px-3 py-1 rounded"
                        onClick={toggleLargeMode}
                        aria-pressed={largeMode}
                        style={{ background: largeMode ? 'var(--crimson)' : '#2b3942', color: largeMode ? '#fff' : '#dbe7ef' }}
                    >
                        {largeMode ? 'On' : 'Off'}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">Saved to this browser only</div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-700 rounded" onClick={resetAll}>Reset</button>
                        <button className="px-3 py-1 bg-indigo-700 rounded" onClick={forceApplyNow}>Diagnose / Apply</button>
                    </div>
                </div>

                <div className="mt-2 text-xs text-gray-400">
                    <div><strong>Debug:</strong> html.className: <code>{document.documentElement.className}</code></div>
                    <div>localStorage (lux_list_*): {String(localStorage.getItem('lux_list_dark'))}, {String(localStorage.getItem('lux_list_highContrast'))}, {String(localStorage.getItem('lux_list_reducedMotion'))}, {String(localStorage.getItem('lux_list_largeMode'))}</div>
                </div>
            </div>
        </div>
    );
}