function onLoad(e) {
    let tunePath = location.hash.slice(1);

    if (tunePath.length === 0) {
        location.pathname = "/music/"
    }

    loadTune(tunePath);
}

async function loadTune(path) {
    category = path.split("/")[0];
    path = `../tunes/${path}.abc`;

    let request = await fetch(path);
    let abc = await request.text();

    displayTune(abc, category);
}

function displayTune(abc, category) {
    // add extra line for proper spacing
    let lines = abc.trim().split("\n");
    let music_lines = lines.reduce((p, l) => p + l.includes("|"), 0);

    let split = lines.length - music_lines
    let header = lines.slice(0, split).join("\n")

    let music = lines.slice(split).join("\n")
    music = music
        .replace(/maj/g, "∆")
        .replace(/([A-G][#b]?)m/g, "$1-")
        .replace(/b5/g, "♭5")
        .replace(/b9/g, "♭9")
        .replace(/b13/g, "♭13")
        .replace(/#5/g, "♯5")
        .replace(/#9/g, "♯9")
        .replace(/#11/g, "♯11");

    abc = header + "\n" + music + "\n|";

    let output = document.createElement("svg");
    output.className = "sheet-music";

    let width = Math.min(800, document.body.getBoundingClientRect().width);
    ABCJS.renderAbc(output, abc, {}, {
        scale: innerWidth <= 600 ? 1.25 : 1.0,
        paddingtop: 15,
        paddingbottom: 0,
        paddingleft: 0,
        paddingright: 0,
        add_classes: true,
        responsive: "resize",
    });
    smarten(output);

    $("#music").html(output);
    // cleanup
    $(".sheet-music tspan").attr("dy", 0);
    $("title").html($(".sheet-music .title").text());
    $(".sheet-music tspan").attr("dy", 0);
    $(".l" + music_lines).css("display", "none");
    if (category === "jazz" | category === "christmas") 
        $(".chord").addClass("jazz");
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


// Listeners
document.addEventListener("DOMContentLoaded", onLoad);
window.addEventListener("hashchange", onLoad);
