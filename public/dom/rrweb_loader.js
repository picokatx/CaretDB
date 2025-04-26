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

    // ===== Network Request Recording =====
    let networkRequests = [];
    let manuallyTrackedRequests = {};
    let originalXHROpen = null;
    let originalXHRSend = null;
    let originalXHRSetRequestHeader = null;
    let originalFetch = null;
    let networkObserver = null;

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
                    if (url.endsWith('.css')) return 'stylesheet';
                    return 'link';
            }
        }
        
        if (headers) {
            const contentType = headers['content-type'] || headers['Content-Type'];
            if (contentType) {
                const mimeType = contentType.split(';')[0].trim();
                
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
        
        try {
            if (/\.(jpg|jpeg|png|gif|webp|svg|ico)($|\?)/.test(url.toLowerCase())) {
                return 'image';
            }
            
            if (/\.js($|\?)/.test(url.toLowerCase())) return 'script';
            if (/\.css($|\?)/.test(url.toLowerCase())) return 'stylesheet';
            if (/\.html?($|\?)/.test(url.toLowerCase())) return 'document';
            if (/\.json($|\?)/.test(url.toLowerCase()) || url.includes('jsonplaceholder')) {
                return 'json';
            }
            if (/\.(woff2?|ttf|otf|eot)($|\?)/.test(url.toLowerCase())) {
                return 'font';
            }
            if (/\.(mp3|wav|ogg|flac)($|\?)/.test(url.toLowerCase())) return 'audio';
            if (/\.(mp4|webm|ogv)($|\?)/.test(url.toLowerCase())) return 'video';
            if (url.includes('/api/')) return 'json';
            
            return 'other';
        } catch (e) {
            return 'unknown';
        }
    }

    function observeNetworkRequests() {
        if (typeof PerformanceObserver === 'undefined') {
            console.warn('PerformanceObserver not supported in this browser');
            return;
        }
        
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'resource') {
                        const request = {
                            url: entry.name,
                            path: entry.name,
                            initiatorType: entry.initiatorType,
                            duration: Math.round(entry.duration * 100) / 100,
                            size: entry.transferSize || entry.decodedBodySize || 0,
                            timestamp: new Date().toISOString(),
                            startTime: entry.startTime,
                            responseEnd: entry.responseEnd,
                            type: detectContentType(entry.name, null, entry.initiatorType)
                        };
                        
                        if (manuallyTrackedRequests[entry.name]) {
                            request.size = manuallyTrackedRequests[entry.name].size;
                            request.method = manuallyTrackedRequests[entry.name].method;
                            delete manuallyTrackedRequests[entry.name];
                        }
                        
                        networkRequests.push(request);
                        
                        if (isRecording) {
                            window.parent.postMessage({
                                type: 'networkRequest',
                                request: request
                            }, parentOrigin);
                        }
                    }
                }
            });
            
            observer.observe({ entryTypes: ['resource'] });
            return observer;
        } catch (e) {
            console.error('Error setting up PerformanceObserver:', e);
            return null;
        }
    }

    function interceptNetworkRequests() {
        if (originalXHROpen !== null) return;
        
        // XHR interception
        originalXHROpen = XMLHttpRequest.prototype.open;
        originalXHRSend = XMLHttpRequest.prototype.send;
        originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
        
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            this._requestMethod = method;
            this._requestUrl = url;
            this._requestHeaders = {};
            this._requestStartTime = performance.now();
            this._requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            originalXHROpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
            if (!this._requestHeaders) {
                this._requestHeaders = {};
            }
            this._requestHeaders[name] = value;
            originalXHRSetRequestHeader.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function(body) {
            const xhr = this;
            
            if (body) {
                xhr._requestBody = body;
            }
            
            function captureResponse() {
                const endTime = performance.now();
                const duration = endTime - xhr._requestStartTime;
                
                let path = '';
                try {
                    const urlObj = new URL(xhr._requestUrl);
                    path = urlObj.pathname + urlObj.search + urlObj.hash;
                } catch (e) {
                    path = xhr._requestUrl;
                }
                
                const headers = {};
                try {
                    const headersText = xhr.getAllResponseHeaders();
                    const headerLines = headersText.trim().split(/[\r\n]+/);
                    
                    headerLines.forEach(line => {
                        const parts = line.split(': ');
                        const name = parts.shift();
                        const value = parts.join(': ');
                        headers[name] = value;
                    });
                } catch (e) {
                    console.warn('Error parsing response headers:', e);
                }
                
                let size = 0;
                try {
                    if (xhr.responseType === '' || xhr.responseType === 'text') {
                        size = xhr.responseText ? xhr.responseText.length : 0;
                    } else if (xhr.response) {
                        const contentLength = headers['content-length'] || headers['Content-Length'];
                        if (contentLength) {
                            size = parseInt(contentLength, 10) || 0;
                        } else if (typeof xhr.response === 'string') {
                            size = xhr.response.length;
                        } else if (xhr.response instanceof ArrayBuffer) {
                            size = xhr.response.byteLength;
                        } else if (xhr.response instanceof Blob) {
                            size = xhr.response.size;
                        }
                    }
                } catch (e) {
                    console.warn('Error calculating response size:', e);
                }
                
                const request = {
                    id: xhr._requestId,
                    url: xhr._requestUrl,
                    path: path,
                    method: xhr._requestMethod,
                    initiatorType: 'xhr',
                    startTime: xhr._requestStartTime,
                    endTime: endTime,
                    duration: Math.round(duration * 100) / 100,
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: headers,
                    size: size,
                    timestamp: new Date().toISOString(),
                    type: detectContentType(xhr._requestUrl, headers, 'xmlhttprequest')
                };
                
                networkRequests.push(request);
                
                if (isRecording) {
                    window.parent.postMessage({
                        type: 'networkRequest',
                        request: request
                    }, parentOrigin);
                }
            }
            
            xhr.addEventListener('load', captureResponse);
            xhr.addEventListener('error', captureResponse);
            xhr.addEventListener('abort', captureResponse);
            
            originalXHRSend.apply(this, arguments);
        };
        
        // Fetch API interception
        originalFetch = window.fetch;
        
        window.fetch = function(resource, init) {
            const requestStartTime = performance.now();
            const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            let url = '';
            let method = 'GET';
            let headers = {};
            
            if (typeof resource === 'string') {
                url = resource;
            } else if (resource instanceof Request) {
                url = resource.url;
                method = resource.method || 'GET';
                
                try {
                    resource.headers.forEach((value, name) => {
                        headers[name] = value;
                    });
                } catch (e) {
                    console.warn('Error extracting headers from Request:', e);
                }
            }
            
            if (init) {
                if (init.method) {
                    method = init.method;
                }
                
                if (init.headers) {
                    if (init.headers instanceof Headers) {
                        try {
                            init.headers.forEach((value, name) => {
                                headers[name] = value;
                            });
                        } catch (e) {
                            console.warn('Error extracting headers from init.headers:', e);
                        }
                    } else if (typeof init.headers === 'object') {
                        Object.entries(init.headers).forEach(([name, value]) => {
                            headers[name] = value;
                        });
                    }
                }
            }
            
            return originalFetch.apply(this, arguments)
                .then(response => {
                    const endTime = performance.now();
                    const duration = endTime - requestStartTime;
                    
                    const clonedResponse = response.clone();
                    
                    let path = '';
                    try {
                        const urlObj = new URL(url);
                        path = urlObj.pathname + urlObj.search + urlObj.hash;
                    } catch (e) {
                        path = url;
                    }
                    
                    const responseHeaders = {};
                    try {
                        clonedResponse.headers.forEach((value, name) => {
                            responseHeaders[name] = value;
                        });
                    } catch (e) {
                        console.warn('Error extracting response headers:', e);
                    }
                    
                    const requestInfo = {
                        id: requestId,
                        url: url,
                        path: path,
                        method: method,
                        initiatorType: 'fetch',
                        startTime: requestStartTime,
                        endTime: endTime,
                        duration: Math.round(duration * 100) / 100,
                        status: clonedResponse.status,
                        statusText: clonedResponse.statusText,
                        requestHeaders: headers,
                        responseHeaders: responseHeaders,
                        timestamp: new Date().toISOString(),
                        type: detectContentType(url, responseHeaders, 'fetch')
                    };
                    
                    const contentLength = responseHeaders['content-length'] || responseHeaders['Content-Length'];
                    
                    if (contentLength) {
                        requestInfo.size = parseInt(contentLength, 10) || 0;
                        
                        networkRequests.push(requestInfo);
                        
                        if (isRecording) {
                            window.parent.postMessage({
                                type: 'networkRequest',
                                request: requestInfo
                            }, parentOrigin);
                        }
                        
                        return response;
                    }
                    
                    return clonedResponse.text()
                        .then(text => {
                            requestInfo.size = text ? text.length : 0;
                            
                            networkRequests.push(requestInfo);
                            
                            if (isRecording) {
                                window.parent.postMessage({
                                    type: 'networkRequest',
                                    request: requestInfo
                                }, parentOrigin);
                            }
                            
                            return response;
                        })
                        .catch(error => {
                            console.warn('Error getting response text:', error);
                            requestInfo.size = 0;
                            
                            networkRequests.push(requestInfo);
                            
                            if (isRecording) {
                                window.parent.postMessage({
                                    type: 'networkRequest',
                                    request: requestInfo
                                }, parentOrigin);
                            }
                            
                            return response;
                        });
                })
                .catch(error => {
                    const endTime = performance.now();
                    const duration = endTime - requestStartTime;
                    
                    const errorRequestInfo = {
                        id: requestId,
                        url: url,
                        method: method,
                        initiatorType: 'fetch',
                        startTime: requestStartTime,
                        endTime: endTime,
                        duration: Math.round(duration * 100) / 100,
                        status: 0,
                        statusText: 'Error',
                        error: error.message,
                        timestamp: new Date().toISOString(),
                        type: detectContentType(url, null, 'fetch')
                    };
                    
                    networkRequests.push(errorRequestInfo);
                    
                    if (isRecording) {
                        window.parent.postMessage({
                            type: 'networkRequest',
                            request: errorRequestInfo
                        }, parentOrigin);
                    }
                    
                    throw error;
                });
        };
        
        return true;
    }

    function restoreNetworkInterception() {
        if (originalXHROpen === null) return;
        
        XMLHttpRequest.prototype.open = originalXHROpen;
        XMLHttpRequest.prototype.send = originalXHRSend;
        XMLHttpRequest.prototype.setRequestHeader = originalXHRSetRequestHeader;
        
        window.fetch = originalFetch;
        
        originalXHROpen = null;
        originalXHRSend = null;
        originalXHRSetRequestHeader = null;
        originalFetch = null;
    }

    // ===== rrweb Recording Logic =====
    let iframeStopFn = undefined;

    function startRecording() {
        console.log('startRecording called.');
        
        isRecording = true;
        overrideConsole();
        
        networkRequests = [];
        interceptNetworkRequests();
        
        if (!networkObserver) {
            networkObserver = observeNetworkRequests();
        }
        
        if (typeof window.rrweb === 'undefined' || typeof window.rrweb.record !== 'function') {
            console.error('rrweb.record is not available!');
            window.parent.postMessage({ type: 'statusUpdate', text: 'Error: rrweb lib missing in iframe' }, parentOrigin);
            return;
        }
        
        if (typeof iframeStopFn === 'function') {
            try { iframeStopFn(); } catch(e) { console.warn('Error stopping previous recording:', e); }
        }

        try {
            iframeStopFn = window.rrweb.record({
                emit(event, isCheckout) {
                    window.parent.postMessage({ type: 'rrwebEvent', event: event, isCheckout: isCheckout }, parentOrigin);
                },
                maskAllInputs: false,
                checkoutEveryNth: 100,
                ignoreCSSAttributes: true,
                blockClass: 'rrweb-block',
                ignoreClass: 'rrweb-ignore',
                inlineStylesheet: true,
                recordCanvas: true,
                recordLog: true,
                logOptions: {
                    level: ['info', 'log', 'warn', 'error'],
                    lengthThreshold: 1000,
                },
                hooks: {
                    afterSnapshot: (snapshot) => {
                        if (snapshot && snapshot.storage && snapshot.storage.styleSheetRules) {
                            for (const key in snapshot.storage.styleSheetRules) {
                                if (key.includes('cross-origin') || key.includes('SecurityError')) {
                                    delete snapshot.storage.styleSheetRules[key];
                                }
                            }
                        }
                        return snapshot;
                    }
                }
            });
            console.log('rrweb recording started.');
            if (!iframeStopFn) {
                console.error('rrweb.record did not return a stop function!');
                window.parent.postMessage({ type: 'statusUpdate', text: 'Error: rrweb.record failed in iframe' }, parentOrigin);
            }
        } catch (err) {
            console.error('Error starting rrweb recording:', err);
            const errorPrefix = 'Error starting recording in iframe: ';
            const errorMessage = err instanceof Error ? err.message : String(err);
            window.parent.postMessage({ type: 'statusUpdate', text: errorPrefix + errorMessage }, parentOrigin); 
        }
    }

    function stopRecording() {
        console.log('stopRecording called.');
        
        isRecording = false;
        restoreConsole();
        
        restoreNetworkInterception();
        
        window.parent.postMessage({
            type: 'allNetworkRequests',
            requests: networkRequests
        }, parentOrigin);
        
        if (typeof iframeStopFn === 'function') {
            try {
                iframeStopFn();
                console.log('rrweb recording stopped.');
                iframeStopFn = undefined;
            } catch (err) {
                console.error('Error calling iframeStopFn:', err);
            }
        } else {
            console.warn('iframeStopFn not found or not a function when trying to stop.');
        }
    }

    // ===== Error Prevention =====
    window.addEventListener('error', (event) => {
        if (event.message && (
            event.message.includes('SecurityError') || 
            event.message.includes('cross-origin') || 
            event.message.includes('stylesheet')
        )) {
            event.stopImmediatePropagation();
            event.preventDefault();
            console.warn('Prevented error from propagating:', event.message);
            return true;
        }
        return false;
    }, true);

    // ===== External API Exposure =====
    // Both new API and legacy functions for backward compatibility
    window.rrwebRecording = {
        start: startRecording,
        stop: stopRecording
    };
    
    window.startRecordingInIframe = startRecording;
    window.stopRecordingInIframe = stopRecording;

    // ===== Initialization =====
    function notifyParentWhenReady() {
        let checkCount = 0;
        const maxChecks = 50; // Try for 5 seconds (50 * 100ms)
        const intervalId = setInterval(() => {
            checkCount++;
            if (typeof window.rrweb !== 'undefined' && typeof window.rrweb.record === 'function') {
                clearInterval(intervalId);
                console.log('rrweb library confirmed ready. Notifying parent.');
                window.parent.postMessage({ type: 'iframeReady' }, parentOrigin);
                if (document.getElementById('message')) {
                    document.getElementById('message').textContent = 'Ready for recording commands.';
                }
            } else if (checkCount >= maxChecks) {
                clearInterval(intervalId);
                console.error('rrweb library failed to load after timeout.');
                window.parent.postMessage({ type: 'statusUpdate', text: 'Error: rrweb lib timeout in iframe' }, parentOrigin);
                if (document.getElementById('message')) {
                    document.getElementById('message').textContent = 'Error: Could not load recorder library.';
                }
            }
        }, 100); // Check every 100ms
    }

    // Initialize when loaded
    notifyParentWhenReady();
})();