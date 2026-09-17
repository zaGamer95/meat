# meat

Things to check when buying meat in different countries — and what to do with it
once it is home. Beef, pork and chicken.

Published at <https://wonbo.site/meat/>.

## Structure

```
index.html          hub — safe temperatures, storage, thawing
beef/index.html     grades, doneness, cuts
pork/index.html     the 145 °F change, lean vs fatty cuts
chicken/index.html  air- vs water-chilled, temperature
style.css           all styling (white ground, black text, red rules)
```

Plain HTML and CSS. No build step, no dependencies. Edit a file, commit, push —
GitHub Pages redeploys from `main`.

## Local preview

Relative asset paths need a server; opening the files directly will not load the CSS.

```
python3 -m http.server 8765
```

Then visit <http://127.0.0.1:8765/>.

## Fonts

[Alfa Slab One](https://fonts.google.com/specimen/Alfa+Slab+One) for display and
[Archivo](https://fonts.google.com/specimen/Archivo) for body text, both served from
Google Fonts under the SIL Open Font License.
