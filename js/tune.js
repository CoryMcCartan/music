function onLoad(e) {
    let tunePath = location.hash.slice(1);

    if (tunePath.length === 0) {
        location.pathname = "/music/"
    }

    loadTune(tunePath);

    $("#play").on("click", playTune);
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

    let output = document.createElement("svg");
    output.className = "sheet-music";

    let width = Math.min(800, document.body.getBoundingClientRect().width);
    window.rendered = ABCJS.renderAbc(output, abc, {}, {
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
    $(".sheet-music tspan:nth-child(2)").attr("dy", 15);
    $("title").html($(".sheet-music .abcjs-title").text());
    $(".abcjs-l" + music_lines).css("display", "none");
    if (category === "jazz" | category === "christmas") 
        $(".abcjs-chord").addClass("jazz");
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
