
/**
 * Fetch tabs based on the provided options
 * 
 * @param {chrome.tabs.QueryInfo} options - Options to query tabs
 * @returns {Promise<chrome.tabs.Tab[]>} - Tabs that match the provided query options
 */
export const tabsQuery = (
    options: chrome.tabs.QueryInfo
): Promise<chrome.tabs.Tab[]> => {
    return new Promise((resolve) => {
        try {
            chrome.tabs.query(options, (tabs: any[]) => {
                resolve(tabs)
            })
        } catch(e) {
            console.log('Could not get tabs')
            return []
        }
    })
}
