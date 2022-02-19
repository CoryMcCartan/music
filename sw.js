const VERSION = "v2";
const BASEURL = "https://corymccartan.github.io/music/";

let STATIC_CACHE = [
    BASEURL + "icon.png",
    BASEURL + "js/abc.js",
    BASEURL + "js/list.js",
    BASEURL + "js/qrcode.min.js",
    "https://code.jquery.com/jquery-3.2.1.slim.min.js",
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap",
    "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap",
    "https://fonts.googleapis.com/css?family=Caveat+Brush",
];

this.addEventListener("install", function(e) {
    e.waitUntil(
        caches.open(VERSION).then(function(cache) {
            cache.addAll(STATIC_CACHE);           
        })
    );
    
});

this.addEventListener("fetch", e => {
    if (STATIC_CACHE.includes(e.request.url)) {
        e.respondWith(
            caches.match(e.request).then(resp => {
                if (resp) return response;

                return fetch(e.request).then(resp => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    var responseToCache = response.clone();

                    caches.open(VERSON).then(function(cache) {
                        cache.put(e.request, responseToCache);
                    });

                    return response;
                });
            })
        );
    } else {
        e.respondWith(
            fetch(e.request).then(resp => {
                if (resp) {
                    return caches.open(VERSION).then(cache => {
                        cache.put(e.request, resp.clone());
                        return resp;
                    });
                } else {
                    return caches.match(e.request)
                }
            }).catch(err => {
                console.log(err);
                return err;
            })
        );
    }
});

this.addEventListener("activate", function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== VERSION) {
                    return caches.delete(key);
                }
            }));
        })
    );
});
