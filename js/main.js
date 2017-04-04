import theory from "teoria"
import $ from "zepto"
import * as mdl from "material-design-lite"
import UI from "./ui"

let scale = theory.note("c#4").scale("major").simple();
console.log(scale.join(" "));

UI.setupHandlers();

