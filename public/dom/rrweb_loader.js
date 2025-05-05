/**
 * Core recording functionality - Ready for extraction and injection into other pages
 */
(function() {
    // ===== Console Log Interception =====
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
    };

    let isRecording = false;
    let parentOrigin = '*'; // Replace with specific origin in production

    function overrideConsole() {
        console.log = function() {
            originalConsole.log.apply(console, arguments);
            if (isRecording) {
                sendConsoleLog('log', Array.from(arguments));
            }
        };
        
        console.warn = function() {
            originalConsole.warn.apply(console, arguments);
            if (isRecording) {
                sendConsoleLog('warn', Array.from(arguments));
            }
        };
        
        console.error = function() {
            originalConsole.error.apply(console, arguments);
            if (isRecording) {
                sendConsoleLog('error', Array.from(arguments));
            }
        };
        
        console.info = function() {
            originalConsole.info.apply(console, arguments);
            if (isRecording) {
                sendConsoleLog('info', Array.from(arguments));
            }
        };
        
        console.debug = function() {
            originalConsole.debug.apply(console, arguments);
            if (isRecording) {
                sendConsoleLog('debug', Array.from(arguments));
            }
        };
    }

    function restoreConsole() {
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
        console.info = originalConsole.info;
        console.debug = originalConsole.debug;
    }

    function sendConsoleLog(level, args) {
        try {
            // Serialize arguments to handle complex objects
            const serializedArgs = args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    } catch (e) {
                        return String(arg);
                    }
                }
                return arg;
            });
            
            window.parent.postMessage({
                type: 'consoleLog',
                level: level,
                args: serializedArgs,
                timestamp: Date.now()
            }, parentOrigin);
        } catch (e) {
            originalConsole.error('Error sending console log to parent:', e);
        }
    }

    // ===== Network Request Recording V2 (Buffering & Merging) =====
    let networkRequests = []; // Final list of completed requests
    const pendingNetworkRequests = new Map(); // Buffer for merging data from different sources
    const REQUEST_TIMEOUT = 15000; // 15 seconds timeout for pending requests

    let originalXHROpen = null;
    let originalXHRSend = null;
    let originalXHRSetRequestHeader = null;
    let originalFetch = null;
    let networkObserver = null;

    // --- Helper: Send complete request data --- 
    function sendNetworkRequestToParent(requestData) {
        if (!requestData || !requestData.id) return; // Need an ID
        
        // Ensure essential fields have defaults if missing after merge
        requestData.url = requestData.url || '';
        requestData.method = requestData.method || 'GET';
        requestData.status = requestData.status !== undefined ? requestData.status : 0;
        requestData.type = requestData.type || detectContentType(requestData.url, requestData.responseHeaders, requestData.initiatorType) || 'unknown';
        requestData.duration = requestData.duration !== undefined ? Math.round(requestData.duration * 100) / 100 : 0;
        requestData.size = requestData.size !== undefined ? requestData.size : 0;
        requestData.timestamp = requestData.timestamp || new Date().toISOString();
        requestData.initiatorType = requestData.initiatorType || 'other';

        networkRequests.push(requestData);
        
        if (isRecording) {
            window.parent.postMessage({
                type: 'networkRequest',
                request: requestData
            }, parentOrigin);
        }
    }

    // --- Helper: Try to finalize and send a request --- 
    function trySendCompleteRequest(requestId) {
        if (!pendingNetworkRequests.has(requestId)) return;
        
        const request = pendingNetworkRequests.get(requestId);
        
        // Check if we have the essential data from the primary source (XHR/Fetch) AND PerformanceObserver
        if ((request.xhrDataComplete || request.fetchDataComplete) && request.perfDataComplete) {
             if (request.timeoutId) clearTimeout(request.timeoutId); // Clear timeout if exists
            sendNetworkRequestToParent(request);
            pendingNetworkRequests.delete(requestId);
        }
        // Add condition for timeout case (handled separately by setTimeout callback)
    }

    // --- Helper: Handle request timeout --- 
    function handleRequestTimeout(requestId) {
        if (!pendingNetworkRequests.has(requestId)) return;
        
        console.warn(`Network request ${requestId} timed out waiting for all data sources.`);
        const request = pendingNetworkRequests.get(requestId);
        sendNetworkRequestToParent(request); // Send whatever we have
        pendingNetworkRequests.delete(requestId);
    }

    function detectContentType(url, headers, initiatorType) {
        if (initiatorType) {
            switch (initiatorType) {
                case 'img':         return 'image';
                case 'css':         return 'stylesheet';
                case 'script':      return 'script';
                case 'fetch':       return 'fetch';
                case 'xmlhttprequest': return 'xhr';
                case 'beacon':      return 'beacon';
                case 'audio':       return 'audio';
                case 'video':       return 'video';
                case 'navigation':  return 'document';
                case 'iframe':      return 'document';
                case 'frame':       return 'document';
                case 'link':        
                    if (url && url.endsWith('.css')) return 'stylesheet';
                    return 'link';
            }
        }
        
        if (headers) {
            const contentTypeHeader = headers['content-type'] || headers['Content-Type'];
            if (contentTypeHeader) {
                 const mimeType = contentTypeHeader.split(';')[0].trim();
                if (mimeType.startsWith('image/')) return 'image';
                if (mimeType.startsWith('text/css')) return 'stylesheet';
                if (mimeType.startsWith('text/html')) return 'document';
                if (mimeType.includes('javascript')) return 'script';
                if (mimeType === 'application/json') return 'json';
                if (mimeType.startsWith('font/') || mimeType.includes('font')) return 'font';
                if (mimeType.startsWith('audio/')) return 'audio';
                if (mimeType.startsWith('video/')) return 'video';
                return mimeType;
            }
        }
        
        // Fallback based on URL extension
        try {
            if (url) {
                const lowerUrl = url.toLowerCase();
                if (/\.(jpg|jpeg|png|gif|webp|svg|ico)($|\?)/.test(lowerUrl)) return 'image';
                if (/\.js($|\?)/.test(lowerUrl)) return 'script';
                if (/\.css($|\?)/.test(lowerUrl)) return 'stylesheet';
                if (/\.html?($|\?)/.test(lowerUrl)) return 'document';
                if (/\.json($|\?)/.test(lowerUrl)) return 'json';
                if (/\.(woff2?|ttf|otf|eot)($|\?)/.test(lowerUrl)) return 'font';
                if (/\.(mp3|wav|ogg|flac)($|\?)/.test(lowerUrl)) return 'audio';
                if (/\.(mp4|webm|ogv)($|\?)/.test(lowerUrl)) return 'video';
                // Heuristic for API calls
                if (lowerUrl.includes('/api/') || lowerUrl.includes('jsonplaceholder')) return 'json'; 
            }
            return 'other';
        } catch (e) {
            return 'unknown';
        }
    }

    // --- PerformanceObserver Logic --- 
    function observeNetworkRequests() {
        if (typeof PerformanceObserver === 'undefined') {
            console.warn('PerformanceObserver not supported');
            return null;
        }
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                    if (entry.entryType === 'resource') {
                        let matchedRequest = null;
                        let matchedRequestId = null;
                        
                        // Try to find a matching pending request (imperfect matching by URL)
                        for (const [id, request] of pendingNetworkRequests.entries()) {
                            if (request.url === entry.name && !request.perfDataComplete) {
                                matchedRequest = request;
                                matchedRequestId = id;
                                break; // Assume first match is correct for simplicity
                            }
                        }

                        if (matchedRequest && matchedRequestId) {
                            // Enrich the existing pending request
                            matchedRequest.perfData = {
                                duration: entry.duration,
                            startTime: entry.startTime,
                            responseEnd: entry.responseEnd,
                                size: entry.transferSize || entry.decodedBodySize || 0,
                                initiatorType: entry.initiatorType
                            };
                            matchedRequest.duration = entry.duration; // Update main duration
                            matchedRequest.size = entry.transferSize || entry.decodedBodySize || matchedRequest.size || 0; // Update main size if available
                            matchedRequest.initiatorType = entry.initiatorType; // Update initiator type
                            matchedRequest.perfDataComplete = true;
                            trySendCompleteRequest(matchedRequestId);
                        } else if (entry.initiatorType !== 'fetch' && entry.initiatorType !== 'xmlhttprequest') {
                             // Send immediately if it's not XHR/Fetch (likely img, script, etc.)
                            const resourceRequest = {
                                id: `perf-${entry.startTime}-${Math.random().toString(36).substr(2, 5)}`, // Generate an ID
                                url: entry.name,
                                path: entry.name, // Basic path
                                method: 'GET', // Assume GET for resources
                                initiatorType: entry.initiatorType,
                                startTime: entry.startTime,
                                endTime: entry.responseEnd,
                                duration: entry.duration,
                                status: 200, // Assume success if observer fired
                                size: entry.transferSize || entry.decodedBodySize || 0,
                                timestamp: new Date(performance.timeOrigin + entry.startTime).toISOString(),
                                type: detectContentType(entry.name, null, entry.initiatorType),
                                perfDataComplete: true, // Mark as complete from perf perspective
                                fetchDataComplete: false, // No fetch data expected
                                xhrDataComplete: false   // No XHR data expected
                             };
                            sendNetworkRequestToParent(resourceRequest);
                        }
                    }
                }
            });
            
            observer.observe({ entryTypes: ['resource'] });
            console.log("PerformanceObserver started for network resources.");
            return observer;
        } catch (e) {
            console.error('Error setting up PerformanceObserver:', e);
            return null;
        }
    }

    // --- XHR & Fetch Interception Logic --- 
    function interceptNetworkRequests() {
        if (originalXHROpen !== null) return; // Already intercepted
        
        // XHR interception
        originalXHROpen = XMLHttpRequest.prototype.open;
        originalXHRSend = XMLHttpRequest.prototype.send;
        originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
        
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            this._requestMethod = method;
            this._requestUrl = url;
            this._requestHeaders = {};
            this._requestStartTime = performance.now();
            this._requestId = `xhr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Create pending entry
            const initialData = {
                id: this._requestId,
                url: url,
                method: method,
                startTime: this._requestStartTime,
                initiatorType: 'xmlhttprequest',
                requestHeaders: {},
                xhrDataComplete: false,
                perfDataComplete: false,
                timeoutId: setTimeout(() => handleRequestTimeout(this._requestId), REQUEST_TIMEOUT)
            };
            pendingNetworkRequests.set(this._requestId, initialData);
            
            originalXHROpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
            if (this._requestId && pendingNetworkRequests.has(this._requestId)) {
                 const request = pendingNetworkRequests.get(this._requestId);
                 if (!request.requestHeaders) request.requestHeaders = {};
                 request.requestHeaders[name.toLowerCase()] = value;
            }
            originalXHRSetRequestHeader.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function(body) {
            if (this._requestId && pendingNetworkRequests.has(this._requestId)) {
                const request = pendingNetworkRequests.get(this._requestId);
            if (body) {
                    // Optionally store body, but be mindful of size/PII
                    // request.requestBody = body;
                 }
            }
            
            const xhr = this;
            const requestId = this._requestId;
            
            function captureResponse() {
                if (!pendingNetworkRequests.has(requestId)) return; // Already handled (e.g., timeout)
                
                const request = pendingNetworkRequests.get(requestId);
                request.endTime = performance.now();
                // Use PerformanceObserver duration if available, otherwise calculate
                request.duration = request.perfData?.duration ?? (request.endTime - request.startTime);
                request.status = xhr.status;
                request.statusText = xhr.statusText;
                request.responseHeaders = {};
                try {
                    const headersText = xhr.getAllResponseHeaders();
                    const headerLines = headersText.trim().split(/[\r\n]+/);
                    headerLines.forEach(line => {
                        const parts = line.split(': ');
                        if (parts.length > 0 && parts[0]) {
                            request.responseHeaders[parts[0].toLowerCase()] = parts.slice(1).join(': ');
                        }
                    });
                } catch (e) { /* ignore */ }
                
                request.type = detectContentType(request.url, request.responseHeaders, 'xmlhttprequest');

                // Calculate size if not provided by PerformanceObserver
                if (request.size === undefined) {
                try {
                    if (xhr.responseType === '' || xhr.responseType === 'text') {
                            request.size = xhr.responseText ? xhr.responseText.length : 0;
                    } else if (xhr.response) {
                            const cl = request.responseHeaders['content-length'];
                            if (cl) request.size = parseInt(cl, 10) || 0;
                            else if (typeof xhr.response === 'string') request.size = xhr.response.length;
                            else if (xhr.response instanceof ArrayBuffer) request.size = xhr.response.byteLength;
                            else if (xhr.response instanceof Blob) request.size = xhr.response.size;
                            else request.size = 0;
                        }
                    } catch (e) { request.size = 0; }
                }
                request.timestamp = new Date().toISOString(); // Timestamp of completion
                request.xhrDataComplete = true; // Mark this part as done
                trySendCompleteRequest(requestId);
            }
            
            xhr.addEventListener('load', captureResponse);
            xhr.addEventListener('error', captureResponse); // Capture errors too
            xhr.addEventListener('abort', captureResponse); // Capture aborts
            
            originalXHRSend.apply(this, arguments);
        };
        
        // Fetch API interception
        originalFetch = window.fetch;
        
        window.fetch = function(resource, init) {
            const requestStartTime = performance.now();
            const requestId = `fetch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            let url = '';
            let method = 'GET';
            let requestHeaders = {};
            
            if (typeof resource === 'string') {
                url = resource;
            } else if (resource instanceof Request) {
                url = resource.url;
                method = resource.method || 'GET';
                try { resource.headers.forEach((v, k) => { requestHeaders[k.toLowerCase()] = v; }); } catch (e) {}
            } else {
                 url = String(resource); // Fallback
            }
            
            if (init) {
                if (init.method) method = init.method;
                if (init.headers) {
                    try {
                        if (init.headers instanceof Headers) init.headers.forEach((v, k) => { requestHeaders[k.toLowerCase()] = v; });
                        else if (typeof init.headers === 'object') Object.entries(init.headers).forEach(([k, v]) => { requestHeaders[k.toLowerCase()] = v; });
                    } catch (e) {} 
                }
                // Optionally capture body from init.body
                // initialData.requestBody = init.body;
            }

             // Create pending entry
             const initialData = {
                        id: requestId,
                        url: url,
                        method: method,
                startTime: requestStartTime,
                        initiatorType: 'fetch',
                requestHeaders: requestHeaders,
                fetchDataComplete: false,
                perfDataComplete: false,
                timeoutId: setTimeout(() => handleRequestTimeout(requestId), REQUEST_TIMEOUT)
            };
            pendingNetworkRequests.set(requestId, initialData);
            
            return originalFetch.apply(this, arguments).then(response => {
                if (!pendingNetworkRequests.has(requestId)) return response; // Already handled (e.g., timeout)
                
                const request = pendingNetworkRequests.get(requestId);
                request.endTime = performance.now();
                // Use PerformanceObserver duration if available, otherwise calculate
                request.duration = request.perfData?.duration ?? (request.endTime - request.startTime);
                request.status = response.status;
                request.statusText = response.statusText;
                request.responseHeaders = {};
                try { response.headers.forEach((v, k) => { request.responseHeaders[k.toLowerCase()] = v; }); } catch (e) {}
                request.timestamp = new Date().toISOString();
                request.type = detectContentType(request.url, request.responseHeaders, 'fetch');
                    
                const clonedResponse = response.clone();

                // Attempt to get size, fallback to Content-Length or 0
                const cl = request.responseHeaders['content-length'];
                 if (request.size === undefined) { // Only set if not set by PerfObserver
                    if (cl) {
                        request.size = parseInt(cl, 10) || 0;
                        request.fetchDataComplete = true;
                        trySendCompleteRequest(requestId);
                    } else {
                        // If no content-length, read body to determine size (can be slow)
                        clonedResponse.text().then(text => {
                            if (pendingNetworkRequests.has(requestId)) { // Check again, might have timed out
                                request.size = text ? text.length : 0;
                                request.fetchDataComplete = true;
                                trySendCompleteRequest(requestId);
                            }
                        }).catch(err => {
                             if (pendingNetworkRequests.has(requestId)) {
                                console.warn(`Fetch size estimation failed for ${request.url}`, err);
                                request.size = 0; // Default on error
                                request.fetchDataComplete = true;
                                trySendCompleteRequest(requestId);
                            }
                        });
                    }
                 } else { // Size already known from PerfObserver
                     request.fetchDataComplete = true;
                     trySendCompleteRequest(requestId);
                            }
                            
                return response; // Return original response

            }).catch(error => {
                if (pendingNetworkRequests.has(requestId)) {
                    const request = pendingNetworkRequests.get(requestId);
                    request.endTime = performance.now();
                    request.duration = request.perfData?.duration ?? (request.endTime - request.startTime);
                    request.status = 0; // Indicate network error
                    request.statusText = 'Fetch Error';
                    request.error = error.message;
                    request.timestamp = new Date().toISOString();
                    request.fetchDataComplete = true; // Mark as complete (with error)
                    trySendCompleteRequest(requestId);
                }
                throw error; // Re-throw error
                });
        };
        
        console.log("XHR and Fetch APIs intercepted for network logging.");
        return true;
    }

    // --- Restore Interception --- 
    function restoreNetworkInterception() {
        if (originalXHROpen === null) return; // Not intercepted
        
        XMLHttpRequest.prototype.open = originalXHROpen;
        XMLHttpRequest.prototype.send = originalXHRSend;
        XMLHttpRequest.prototype.setRequestHeader = originalXHRSetRequestHeader;
        window.fetch = originalFetch;
        
        originalXHROpen = null;
        originalXHRSend = null;
        originalXHRSetRequestHeader = null;
        originalFetch = null;
        console.log("XHR and Fetch interception restored.");
    }

    // ===== rrweb Recording Logic =====
    let iframeStopFn = undefined;

    function startRecording() {
        console.log('startRecording called (rrweb_loader).');
        isRecording = true;
        overrideConsole();
        networkRequests = []; // Clear previous completed requests
        pendingNetworkRequests.clear(); // Clear pending requests
        interceptNetworkRequests();
        if (!networkObserver) {
            networkObserver = observeNetworkRequests(); // Start observer if not already running
        } else {
             // If observer exists, ensure it's observing - might be needed if stopped previously
            try { networkObserver.disconnect(); } catch(e){} 
            try { networkObserver.observe({ entryTypes: ['resource'] }); } catch(e){ console.error("Failed to re-observe network", e); }
        }
        
        if (typeof window.rrweb === 'undefined' || typeof window.rrweb.record !== 'function') {
            console.error('rrweb.record is not available!');
            window.parent.postMessage({ type: 'statusUpdate', text: 'Error: rrweb lib missing in iframe' }, parentOrigin);
            return;
        }
        if (typeof iframeStopFn === 'function') { try { iframeStopFn(); } catch(e) {} }
        try {
            iframeStopFn = window.rrweb.record({
                emit(event, isCheckout) {
                    window.parent.postMessage({ type: 'rrwebEvent', event: event, isCheckout: isCheckout }, parentOrigin);
                },
                maskAllInputs: false, // Example option
                maskTextClass: 'rrweb-mask',
                recordCanvas: true,
                 // Exclude console logs plugin here as we do it manually
                 plugins: [], 
            });
            console.log('rrweb recording started.');
            if (!iframeStopFn) { throw new Error('rrweb.record did not return stop function'); }
        } catch (err) {
            console.error('Error starting rrweb recording:', err);
            const errorPrefix = 'Error starting recording in iframe: ';
            const errorMessage = err instanceof Error ? err.message : String(err);
            window.parent.postMessage({ type: 'statusUpdate', text: errorPrefix + errorMessage }, parentOrigin); 
        }
    }
    function stopRecording() {
        console.log('stopRecording called (rrweb_loader).');
        isRecording = false;
        restoreConsole();
        restoreNetworkInterception();
        if (networkObserver) { 
             // Stop observing but don't nullify, might restart recording
            try { networkObserver.disconnect(); } catch(e){} 
            console.log("PerformanceObserver disconnected.");
        }
        
        // Clear any remaining pending requests immediately upon stopping
        pendingNetworkRequests.forEach((request, requestId) => {
             if (request.timeoutId) clearTimeout(request.timeoutId);
             console.warn(`Force sending incomplete network request ${requestId} on stop.`);
             sendNetworkRequestToParent(request);
        });
        pendingNetworkRequests.clear();

        // Send final completed list (might be redundant now, but can keep for final sync)
        // window.parent.postMessage({
        //     type: 'allNetworkRequests',
        //     requests: networkRequests
        // }, parentOrigin);
        
        if (typeof iframeStopFn === 'function') {
            try { iframeStopFn(); console.log('rrweb recording stopped.'); iframeStopFn = undefined; } catch (err) { console.error('Error calling iframeStopFn:', err); }
        } else { console.warn('iframeStopFn not found or not a function when trying to stop.'); }
    }

    // ===== Error Prevention =====
    window.addEventListener('error', (event) => {
        if (event.message && (
            event.message.includes('SecurityError') || 
            event.message.includes('cross-origin') || 
            event.message.includes('stylesheet')
        )) {
            event.stopImmediatePropagation(); event.preventDefault(); console.warn('Prevented error:', event.message); return true;
        }
        return false;
    }, true);

    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && ((typeof event.reason.message === 'string' && (event.reason.message.includes('SecurityError') || event.reason.message.includes('cross-origin') || event.reason.message.includes('stylesheet'))) || (event.reason.name === 'SecurityError'))) {
            event.stopImmediatePropagation(); event.preventDefault(); console.warn('Prevented rejection:', event.reason); return true;
        }
        return false;
    }, true);

    // ===== External API Exposure =====
    // Both new API and legacy functions for backward compatibility
    window.rrwebRecording = { start: startRecording, stop: stopRecording };
    
    window.startRecordingInIframe = startRecording;
    window.stopRecordingInIframe = stopRecording;

    // ===== Initialization =====
    function notifyParentWhenReady() {
        let checkCount = 0; const maxChecks = 50; 
        const intervalId = setInterval(() => {
            checkCount++;
            if (typeof window.rrweb !== 'undefined' && typeof window.rrweb.record === 'function') {
                clearInterval(intervalId); console.log('rrweb ready. Notifying parent.');
                window.parent.postMessage({ type: 'iframeReady' }, parentOrigin);
            } else if (checkCount >= maxChecks) {
                clearInterval(intervalId); console.error('rrweb timeout.');
                window.parent.postMessage({ type: 'statusUpdate', text: 'Error: rrweb timeout in iframe' }, parentOrigin);
            }
        }, 100); 
    }

    // Initialize when loaded
    notifyParentWhenReady();
})();