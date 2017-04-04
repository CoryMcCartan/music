let mode = "Flat";
let chordInput;

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

function setupHandlers() {
    chordInput = $("#chord-input");

    $("#mode").on("click", changeMode);

    $(".keyboard button.type").on("click", addNote);
    $("#del").on("click", deleteNote);
}

export default {
    setupHandlers,
};
