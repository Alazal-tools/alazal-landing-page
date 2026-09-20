# Alazal location guide

The guide is a locally rendered SVG relief of the actual Kadhimiya street network. No Google map, tile service, or third-party navigation script is embedded. Brand navy, teal, and DIN are used throughout.

## Geographic sources — checked 20 September 2026

- Street geometry, park boundaries, river shoreline and mapped building footprints: [OpenStreetMap API area export](https://www.openstreetmap.org/api/0.6/map?bbox=44.333,33.362,44.360,33.379), © OpenStreetMap contributors, [ODbL 1.0](https://www.openstreetmap.org/copyright). The rendered map carries attribution. `data/district.json` retains the derived geometry and provenance.
- Institute: owner's [place link](https://share.google/vCCQMyr9oHgdqi3X0), place `/g/11c529g61j`, **33.3724375, 44.3398125**.
- Girls: owner's [place link](https://share.google/sUbgioB9ouu1H6CuR), place `/g/11mvxq2xxv`, **33.3656493, 44.3426101**. These coordinates match the position and institute-to-school route in the owner's reference screenshot.
- Boys: owner's [reference link](https://share.google/vzZoMBddZnDVH4DE3) resolves to **Harir Clinics**, place `/g/11svygwylf`, **33.376117, 44.3484757**. The map pin uses this adjacent reference, not a separately surveyed school entrance. The owner confirmed the school entrance is on the **left when facing the clinic**. This is shown in the desktop entrance illustration and written address; the illustration is omitted on phones.
- [Al-Dhirgham Private Hospital](https://www.google.com/maps/search/?api=1&query=33.3671084,44.3441647): **33.3671084, 44.3441647**, place `/g/11rr_9fzf`. The branch connecting the institute's street to the girls' school is labelled beside this position.
- [Al-Mashat Street](https://www.google.com/maps/search/?api=1&query=33.366001,44.3389538): **33.366001, 44.3389538**, place `/g/11b6gf28zm`, also named on OSM way `1206532501`.
- Named OSM features include Akkad Street (`4290715`, `1206531485`), Al-Nuwwab Street (`4483606`), Al-A'imma Bridge (`4295613`), Abdul Muhsin Al-Kadhimi Square (`4290703`), and 14 July Park (`82985684`). The Zahra square reference is Al-Shousha junction (`4483700`), beside the institute, not the distant guardhouse with a similar label.

## Representation and routes

Coordinates share one metre-proportional local projection, then one consistent oblique projection. Streets are not rearranged for the composition. Raised neighbourhood blocks are polygonized from actual intersecting roads; their shallow heights are an illustrative relief, not measured building heights. The three entrance illustrations are explanatory diagrams, not architectural surveys.

Walking paths follow a connected graph of mapped public streets and footways, excluding explicitly prohibited/private access. One-way vehicle restrictions do not imply one-way walking. Small dashed connectors distinguish an address pin from its snapped street-access point. Routes are a wayfinding aid, not live traffic/access guarantees; no invented travel times are displayed.

Origins: Abdul Muhsin square, Zahra square, **the public street in front of 14 July Park** (33.3755296, 44.350494), Al-A'imma Bridge at its Kadhimiya approach, Akkad Street, Al-Mashat Street, Al-Dhirgham Hospital, and the institute. The park origin does not enter or start within the park. The user can choose an origin and destination independently; the source is preserved across destination changes where valid.

All six entities' phone, WhatsApp, Instagram, Telegram channel/direct contact, and available Facebook details use the project owner's `.info/readme.md`. Unprovided accounts and conflicting older directory phone numbers were not added.

## Maintenance

`npm run build` regenerates the SVG/contact HTML and `data/routes.js` from the committed local data, then bundles the original 3D brand point. It needs no map-service network access.

To refresh geographic data deliberately, download the OSM area above to `.preview/kadhimiya-full.osm`, run `python scripts/prepare-district.py`, then `python scripts/prepare-blocks.py`. The latter uses Shapely only for offline preparation (the temporary dependency path is `.preview/geo-deps`). Review route/label changes before rebuilding. `npm test` verifies every route segment remains on the street geometry, source/destination coordinates, outside-park origin, required labels, and contact completeness.
