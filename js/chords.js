import theory from "teoria"
import createEventInterface from "./util"

let headers = new Headers({
    "Guitarparty-Api-Key": "a7b0f238002170fbc4a2705be74eada15a712ca2",
});

let fetch_init = {
    method: "GET",
    headers,
};

async function getChords(title) {
    let url = `http://api.guitarparty.com/v2/songs/?query=${title}`;
    let response = await fetch(url, fetch_init);
    let data = await response.json();
    if (data.objects.length === 0) return [];

    // try to find exact title match
    let song;
    let index = data.objects.map(o => o.title).indexOf(title);

    if (index >= 0)
        song = data.objects[index];
    else
        song = data.objects[0]; // default to first

    let chords = song.body.match(/\[[\w\/]+\]/g) // get chords in brackets
                    .map(ch => ch.slice(1, -1)) // remove brackets
                    .map(theory.chord);

    // check transpositions
    let capo = /Capo (\d)/i.exec(song.body);
    if (!!capo) {
        let interval = theory.interval(theory.note.fromKey(0),
                theory.note.fromKey(+capo[1]));

        chords.map(ch => ch.transpose(interval));
    }

    return chords;
}

export default {
    getChords,
};
