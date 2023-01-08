/**
 * Renders the plugin in a new tab or window
 * 
 * @param {string} target - Whether to render the plugin in a tab or window
 */
export const popOut = (target: 'tab' | 'window') => {
    if (target === 'tab') {
        chrome.tabs.create({
            url: `${window.location.href}?popout=true`,
        });
    }
    else {
        chrome.windows.create({
            url: `${window.location.href}?popout=true`,
            type: "popup",
            width: 1024,
            height: 768,
        });
    }
}

/**
 * Returns a boolean indicating if the plugin is in a popped out state
 * 
 * @returns boolean
 */
export const inPopOut = () => {
    return window.location.href.includes('popout=true')
}