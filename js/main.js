document.addEventListener("DOMContentLoaded", function(e) {
    let tuneName = location.hash.slice(1);
    if (tuneName.length > 0) loadTune(tuneName);

    $("#tune-list a").on("click", function() {
        loadTune(this.dataset.name);
    });
});

async function loadTune(name) {
    name = decodeURI(name).replace(/ /g, "_");
    let filename = `${location.pathname}tunes/${name}.abc`;
    let request = await fetch(filename);
    let abc = await request.text();

    displayTune(abc);
}

function displayTune(abc) {
    $("#tune-list").remove();

    let output = document.createElement("svg");
    output.className = "sheet-music";

    let width = Math.min(800, document.body.getBoundingClientRect().width);
    ABCJS.renderAbc(output, abc, {}, {
        scale: 1.1,
        paddingtop: 5,
        paddingbottom: 0,
        paddingleft: 0,
        paddingright: 0,
        add_classes: true,
        responsive: "resize",
    });
    smarten(output);

    document.body.append(output);
}


/*
 * Utilities
 */

function smarten(el) {
    let rep = text => text
        .replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018")
        .replace(/'/g, "\u2019")
        .replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c")
        .replace(/"/g, "\u201d")
        .replace(/--/g, "\u2014");

    let children = el.children;

    if (children.length) {
        for (let i = 0, l = children.length; i < l; i++) {
            smarten(children[i]);
        }
    } else {
        el.innerHTML = rep(el.innerHTML);
    }
};
