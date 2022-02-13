function onLoad(e) {
    let tunePath = location.hash.slice(1);
    window.query = new URLSearchParams(location.search);

    window.globalOpts = "opts" in localStorage ? JSON.parse(localStorage.opts) : {};
    let key = tunePath.split("/")[1].split("?")[0];
    if (!(key in globalOpts))
        globalOpts[key] = {
            transpose: 0,
        };
    window.opts = globalOpts[key];

    opts.transpose = +query.get("transpose") || opts.transpose || 0;
    $("#tr-amt").html(fmtTranspose(opts.transpose));

    if (tunePath.length === 0) {
        location.pathname = "/music/"
    }

    loadTune(tunePath);

    history.replaceState(null, "", location.pathname + location.hash);

    $("#play").on("click", playTune);
    setTimeout(makeQR, 500);
}

function makeQR(sel="#qr") {
    let el = $(sel).get(0);
    el.innerHTML = "";

    let qrobj = {
        text: location.href, 
        width: 256,
        height: 256,
        colorDark : "#442222",
        colorLight : "#ffffff00",
        correctLevel : QRCode.CorrectLevel.M
    };

    if (opts.transpose != 0) {
        qrobj.text = `${location.origin}${location.pathname}?transpose=${opts.transpose}` +
            `&direction=${opts.direction || 0}${location.hash}`;
    }

    new QRCode(el, qrobj);
}

async function loadTune(path) {
    let category = path.split("/")[0];
    let parts = path.split("/")[1].split(".")
    let type = parts.pop();
    path = `../tunes/${path}`;

    let request = await fetch(path);
    let text = await request.text();

    if (type == "abc") {
        displayABCTune(text, category);
    } else {
        displayTextTune(text, parts.join("."));
    }
}

function displayTextTune(text, path) {
    let container = document.createElement("div");
    $("#music").prepend(container);

    renderTextTune(container, text, path);

    $("#tr_down").on("click", function() {
        opts.transpose--;
        renderTextTune(container, text, path, -1);
        makeQR();
    });
    $("#tr_up").on("click", function() {
        opts.transpose++;
        renderTextTune(container, text, path, 1);
        makeQR();
    });
}

function renderTextTune(container, text, title, direction=0) {
    container.innerHTML = null;
    
    direction = direction || +query.get("direction") || opts.direction;
    $("#tr-amt").html(fmtTranspose(opts.transpose));
    opts.direction = direction;
    localStorage.opts = JSON.stringify(globalOpts);

    title = title.replace(/_/g, " ");
    document.title = title;
    let title_el = document.createElement("p");
    title_el.className = "title";
    title_el.innerHTML = title;
    smarten(title_el);
    container.append(title_el);

    text.split("\n")
    .map(l => {
        l = l.replace(/'/g, "&rsquo;")
        .replace(/" /g, "&rdquo; ")
        .replace(/"$/g, "&rdquo;")
        .replace(/_(\w)/g, "<span style='text-decoration: underline;'>$1</span>")
        .replace(/"/g, "&ldquo;");
        let p = document.createElement("p");

        if (l[0] == "#") {
            l = transposeChords(l.slice(1), direction)
                .replace(/( +)?-( +)?/g, " - ")
                .replace(/,/g, "<span style='text-shadow: 0 1px 0 black;'>&darr;</span>")
                .replace(/\^/g, "<span style='text-shadow: 0 1px 0 black;'>&uarr;</span>")
                .replace(/\/\//g, `<span style='letter-spacing: -6px; top: 2px;
                         font-weight: bold; font-size: 1.2em;'>//</span>`)
                .replace(/ \/( |$)/g, `<span style='font-weight: bold; top: 2px;
                                  font-size: 1.2em; padding: 0 0.3em;'>/</span>`)
                .replace(/ \)/g, ")")
                .replace(/\( /g, "(")
                .replace(/~/g, "/")
                .replace(/maj/g, "∆")
                .replace(/dim/g, "°")
                .replace(/\(([0-9])[xX]\)/g, "<span class='small'>($1X)</span>")
                //.replace(/([A-Gm1-9♭♯∆°])(?=[A-G])/g, "$1<span class='spacer'></span>")
                //.replace(/([A-Gm1-9♭♯∆°])(?=[A-Gm1-9♭♯∆°])/g, "$1<span class='spacer'></span>")
                .replace(/b5/g, "♭5")
                .replace(/b9/g, "♭9")
                .replace(/b13/g, "♭13")
                .replace(/#5/g, "♯5")
                .replace(/#9/g, "♯9")
                .replace(/#11/g, "♯11")
                .replace(/&rdquo;/g, '"')
                .trim();
            p.className = "chords";
        } else if (l[0] == "!") {
            l = l.slice(1).trim();
            p.className = "chorus";
        } else if (l[0] == "^") {
            l = l.slice(1).trim();
            p.className = "bridge";
        }

        p.innerHTML = l; 
        container.append(p);
    });
}

function transposeChords(chords, direction=0) {
    const flat_notes = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
    const sharp_notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
    const lookup = {"C": 0, "C♯": 1, "D♭": -1, "D": -2, "D♯": 3, "E♭": -3, 
        "E": -4, "F": 5, "F♯": 6, "G♭": -6, "G": -7, "G♯": 8, "A♭": -8, 
        "A": -9, "A♯": 10, "B♭": -10, "B": -11};
    let replacer = function(chord, base, extra, offset, string) {
        if (opts.transpose == 0) return chord;
        let matched = lookup[base];
        let idx = Math.abs(matched) + opts.transpose;
        if (idx < 0) idx += 12;
        if (idx > 11) idx -= 12;
        if (direction != 0)
            return newchord = (direction > 0 ? sharp_notes : flat_notes)[idx] 
                + (extra || "");
        else 
            return newchord = (matched > 0 ? sharp_notes : flat_notes)[idx] 
                + (extra || "");
    };
    return chords.replace(/([A-G])b/g, "$1♭")
                 .replace(/([A-G])#/g, "$1♯")
                 .replace(/([A-G][♯♭]?)([maj1-9∆°][maj1-9♯♭∆°]*)?/g, replacer);
}

function displayABCTune(abc, category) {
    // add extra line for proper spacing
    let lines = abc.trim().split("\n");
    let music_lines = lines.reduce((p, l) => p + l.includes("|"), 0);
    let continuation_lines = lines.reduce((p, l) => p + l.endsWith("|\\"), 0);
    music_lines -= continuation_lines;

    let split = lines.map(l => l.includes("|")).indexOf(true);
    let header = lines.slice(0, split).join("\n") + "\n%%MIDI program 40";

    let music = lines.slice(split).join("\n")
    music = music
        .replace(/maj/g, "∆")
        .replace(/dim/g, "°")
        .replace(/([A-G][#b]?)m/g, "$1-")
        .replace(/b5/g, "♭5")
        .replace(/b9/g, "♭9")
        .replace(/b13/g, "♭13")
        .replace(/#5/g, "♯5")
        .replace(/#9/g, "♯9")
        .replace(/#11/g, "♯11");

    abc = header + "\n" + music + "\n|";
    window.abc = abc;

    let output = document.createElement("div");
    output.className = "sheet-music";
    $("#music").prepend(output);

    renderABC(output, abc, category, music_lines);

    // interface
    $("#wrap").show();
    $("#wrap input").get()[0].checked = 'wrap' in localStorage ? 
        !!(+localStorage.wrap) : true;
    $("#wrap input").on("click", function() {
        if ('wrap' in localStorage)
            localStorage.wrap = 1 - localStorage.wrap;
        else
            localStorage.wrap = 0;
        renderABC(output, abc, category, music_lines);
    });
    $("#tr_down").on("click", function() {
        opts.transpose--;
        renderABC(output, abc, category, music_lines);
        makeQR();
    });
    $("#tr_up").on("click", function() {
        opts.transpose++;
        renderABC(output, abc, category, music_lines);
        makeQR();
    });
}

function renderABC(el, abc, category, music_lines) {
    let width = Math.min(800, document.body.getBoundingClientRect().width);
    let small = innerWidth <= 600;
    let wrap = 'wrap' in localStorage ? !!(+localStorage.wrap) : true;

    $("#tr-amt").html(fmtTranspose(opts.transpose));
    localStorage.opts = JSON.stringify(globalOpts);

    ABCJS.renderAbc(el, abc, {}, {
        scale: small ? 1.25 : 1.0,
        staffwidth: wrap ? (small ? 1.4 : 1.0) * width : null,
        wrap: wrap,
        paddingtop: 15,
        paddingbottom: 0,
        paddingleft: 0,
        paddingright: 0,
        visualTranspose: opts.transpose,
        add_classes: true,
        jazzchords: category === "jazz",
        responsive: "resize",
    });
    smarten(el);
    
    // cleanup
    $(".sheet-music tspan").attr("dy", 0);
    $(".sheet-music tspan:nth-child(2)").attr("dy", 15);
    $("title").html($(".sheet-music .abcjs-title").text());
    $(".abcjs-l" + music_lines).css("display", "none");
    if (category === "jazz" | category === "christmas") {
        $(".abcjs-chord").addClass("jazz");
        $(".abcjs-annotation").addClass("jazz");
    }

    return el;
}

async function playTune() {
    let ctx = new AudioContext();
    await ctx.resume();
    window.synth = new ABCJS.synth.CreateSynth();
    await synth.init({ 
        audioContext: ctx, 
        visualObj: rendered[0], 
        millisecondsPerMeasure: 1000,
        instrument: "harpsichord",
        sountFontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
    });
    await synth.prime();

    synth.start();
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

function fmtTranspose(semi) {
    if (semi == 0) return "original";
    let str = semi < 0 ? "down " : "up ";
    if (Math.abs(semi) == 1) return str + "½ step";
    if (Math.abs(semi) == 2) return str + "1 step";
    str += Math.floor(Math.abs(semi/2));
    if (semi % 2 != 0) str += "½";
    return str + " steps";
}


window.SynthSequence = (function() {
	let self = {};
	self.tracks = [];
	self.totalDuration = 0;

	self.addTrack = function() {
		self.tracks.push([]);
		return self.tracks.length - 1;
	};

	self.setInstrument = function(trackNumber, instrumentNumber) {
		self.tracks[trackNumber].push({
			channel: 0,
			cmd: "program",
			instrument: instrumentNumber
		});
	};

	self.appendNote = function(trackNumber, pitch, durationInMeasures, volume) {
		self.tracks[trackNumber].push({
			cmd: "start",
			pitch: pitch - 60,
			volume: volume
		});
		self.tracks[trackNumber].push({
			cmd: "move",
			duration: durationInMeasures
		});
		self.tracks[trackNumber].push({
			cmd: "stop",
			pitch: pitch - 60
		});
		var duration = 0;
		self.tracks[trackNumber].forEach(function(event) {
			if (event.duration)
				duration += event.duration;
		});
		self.totalDuration = Math.max(self.totalDuration, duration);
	};
    
    return self;
})();


// Listeners
document.addEventListener("DOMContentLoaded", onLoad);
window.addEventListener("hashchange", onLoad);
