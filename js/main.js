function onLoad(e) {
    $("title").html($("h1").html().trim());

    let list = new List("tune-list", {
        valueNames: ["name", "category"],
    });
    list.sort("name");
    window.list = list;
    let query = new URLSearchParams(location.search);

    $(".search").on("keypress", function(e) {
        if (e.keyCode !== 13) return;
        $("#tune-list a").get(0).click()
    });

    $("button.category").on("click", function() {
        let category = this.className.replace("category", "").trim();
        query.set("category", category);
        let newurl = location.pathname + '?' + query.toString();
        history.pushState(null, "", newurl);

        if (category == "all") {
            history.replaceState(null, "", location.pathname);
            list.filter();
        } else {
            list.filter(s => s.values().category == category.toUpperCase());
        }
    });

    if (!!query.get("category")) {
        let category = query.get("category");

        if (category == "all") 
            list.filter();
        else
            list.filter(s => s.values().category == category.toUpperCase());
    }
}

document.addEventListener("DOMContentLoaded", onLoad);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/music/sw.js", {
        scope: "/music/"
    }).then(() => console.log("Service worker registered."))
    .catch(e => console.log("Registration failed: " + e));;
}

