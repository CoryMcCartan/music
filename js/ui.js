import createEventInterface from "./util"
import theory from "teoria"

let mode = "Flat";

let chordInput;
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
    let sliceIndex = chord.name.indexOf(chord.symbol);
    let root = text.slice(0, sliceIndex).trim();
    let symbols = text.slice(sliceIndex).trim().split(" ");
    let symbolText = symbols.map(s => ["maj", "min", "sus"].includes(s) ? s : `<sup>${s}</sup>`);
    let HTML = `<span class="chord">${root} ${symbolText.join("")}</span>`;

    $(".tune").append(HTML);

    events.dispatch("addChord", chord);   
}

function setup() {
    chordInput = $("#chord-input");

    $("#mode").on("click", changeMode);

    $(".keyboard button.type").on("click", addNote);
    $("#del").on("click", deleteNote);
    $("#next").on("click", addChord);
    chordInput.on("keypress", e => e.keyCode === 13 ? addChord() : true);
}

export default {
    setup,
    addListener: events.addEventListener,
};
