import $ from "zepto"
import theory from "teoria"
import * as mdl from "material-design-lite"
import UI from "./ui"
import chords from "./chords"

UI.setup();

UI.addListener("tuneSearch", name => {
    chords.getChords(name).then(UI.setChords)
});

// global exports
window.chords = chords;
window.theory = theory;
