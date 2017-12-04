function onLoad(e) {
    $("title").html($("h1").html().trim());

    let list = new List("tune-list", {
        valueNames: ["name", "category"],
    });
    list.sort("name");

    $(".search").on("keypress", function(e) {
        if (e.keyCode !== 13) return;
        $("#tune-list a").get(0).click()
    }).focus();
}

document.addEventListener("DOMContentLoaded", onLoad);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/music/sw.js", {
        scope: "/music/"
    }).then(() => console.log("Service worker registered."))
    .catch(e => console.log("Registration failed: " + e));;
}
