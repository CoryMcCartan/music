import createEventInterface from "./util"
import theory from "teoria"

let mode = "Flat";

let chordInput;
let tuneInput;
let events = createEventInterface();

let last = "";


function changeMode() {
    mode = (mode === "Flat") ? "Sharp" : "Flat";

    this.innerHTML = (mode === "Flat") ? "♭" : "♯";

    if (mode === "Flat") {
        $("#note-Cs").html("D♭"); 
        $("#note-Ds").html("E♭"); 
        $("#note-Fs").html("G♭"); 
        $("#note-Gs").html("A♭"); 
        $("#note-As").html("B♭"); 
    } else {                    
        $("#note-Cs").html("C♯"); 
        $("#note-Ds").html("D♯"); 
        $("#note-Fs").html("F♯"); 
        $("#note-Gs").html("G♯"); 
        $("#note-As").html("A♯"); 
    }
}

function addNote() {
    chordInput.val(chordInput.val() + " " + this.innerHTML);
    chordInput.parent().addClass("is-dirty");
}

function deleteNote() {
    let text = chordInput.val();
    text = text.split(" ").slice(0, -1).join(" ");
    chordInput.val(text);
    
    if (text === "")
        chordInput.parent().removeClass("is-dirty");
}

function addChord() {
    let text = chordInput.val().trim();
    chordInput.val("");
    chordInput.parent().removeClass("is-dirty");

    if (text.trim() === "") text = last;
    else last = text;

    let adjtext = text.replace(/♭/g, "b")
                      .replace(/♯/g, "#");

    let chord = theory.chord(adjtext);

    addChordObject(chord);
}

function addChordObject(chord) {
    let HTML = `<span class="chord">${chord.name}</span>`;

    $(".tune").append(HTML);

    events.dispatch("addChord", chord);   
}

function setChords(chords) {
    if (chords.length === 0) {
        $(".tune").html("Song not found.");
    } else {
        $(".tune").html(null);
        chords.forEach(addChordObject);
    }
}

function setup() {
    chordInput = $("#chord-input");
    tuneInput = $("#tune-name");

    $("#mode").on("click", changeMode);

    $(".keyboard button.type").on("click", addNote);
    $("#del").on("click", deleteNote);
    $("#next").on("click", addChord);
    chordInput.on("keypress", e => e.keyCode === 13 ? addChord() : true);
    
    tuneInput.on("keypress", e => {
        if (e.keyCode === 13) {
            events.dispatch("tuneSearch", tuneInput.val()) 
            // clear
            $(".tune").html(null);
            tuneInput.val(null);
            tuneInput.parent().removeClass("is-dirty");
        } else {
            return true;
        }
    });
}

export default {
    setup,
    setChords,
    addListener: events.addEventListener,
};
