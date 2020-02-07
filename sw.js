const VERSION = "v1";
const BASEURL = "/music/";

let STATIC_CACHE = [
    BASEURL + "icon.png",
    BASEURL + "js/abc.js",
    BASEURL + "js/list.js",
    "https://code.jquery.com/jquery-3.2.1.slim.min.js",
    "https://fonts.googleapis.com/css?family=Playfair+Display:400,700",
    "https://fonts.googleapis.com/css?family=Caveat+Brush",
];

this.addEventListener("install", function(e) {
    e.waitUntil(
        caches.open(VERSION).then(function(cache) {
            cache.addAll(STATIC_CACHE);           
        })
    );
    
});

this.addEventListener("fetch", function(e) {
    e.respondWith(
        fetch(e.request).then(function(resp) {
            if (resp) {
                return caches.open(VERSION).then(function(cache) {
                    cache.put(e.request, resp.clone());
                    return resp;
                });
            } else {
                return caches.match(e.request)
            }
        })
    );
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
