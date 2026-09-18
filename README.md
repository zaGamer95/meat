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

## Diagram artwork

The animal silhouettes and primal outlines are adapted from public-domain works on
Wikimedia Commons, restyled and re-mapped to this site's cut data:

- Beef — [US Beef cuts.svg](https://commons.wikimedia.org/wiki/File:US_Beef_cuts.svg) by Ysangkok (public domain)
- Pork — [American Pork Cuts.svg](https://commons.wikimedia.org/wiki/File:American_Pork_Cuts.svg) by GameKeeper (public domain)
- Chicken — [Chicken clipart 01.svg](https://commons.wikimedia.org/wiki/File:Chicken_clipart_01.svg) by LadyofHats (public domain); the part divisions are drawn for this site and clipped to its outline
