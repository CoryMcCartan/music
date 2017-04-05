import $ from "zepto"
import theory from "teoria"
import * as mdl from "material-design-lite"
import UI from "./ui"

let scale = theory.note("c#4").scale("major").simple();
console.log(scale.join(" "));

UI.setup();

UI.addListener("addChord", e => console.log(e));
window.theory = theory;
