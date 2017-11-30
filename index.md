---
title: Music
---

<ul id="tune-list">
    {% for file in site.static_files %}
        {% assign pageurl = page.url | replace: 'index.html', '' %}
        {% if file.path contains pageurl and file.extname == ".abc" %}
            {% assign name = file.basename | replace: '_', ' ' %}
            <li>
                <a href="#{{ name }}" data-name="{{ name }}">
                    {{ name | smartify }}
                </a>
            </li>
        {% endif %}
    {% endfor %}

<b>
    <a href="http://www.ralphpatt.com/Song.html" target="_blank">
        Jazz Fakebook
    </a>
</b>

<b>
    <a href="https://thesession.org/tunes" target="_blank">
        Other Fiddle Tunes
    </a>
</b>

<i>
    <a href="http://prose.io/#CoryMcCartan/music/tree/master/tunes" target="_blank">
        Edit Tunes
    </a>
</i>


</ul>

<section id="music">
</section>

<div>
</div>
