let session = undefined

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse, tab) {
    if (request.cmd === 'saveSession') {
        session = request.message
        sendResponse({ result: `saved session}` })
    }

    if (request.cmd === 'getSession') {
        if (session) sendResponse({ result: 'success', message: session })
        else sendResponse({ result: 'error', message: 'no session available' })
    }

    if (request.cmd === 'removeSession') {
        session = undefined
        sendResponse({ result: `removed session}` })
    } 
    
    else {
        sendResponse({ result: 'error', message: `Invalid 'cmd'` })
    }
    // Note: Returning true is required here!
    //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
    return true
})

