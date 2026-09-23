## 2.0.0

### Feat

- change `getPopupContainer` to `getMountContainer`
- add `boundaryContainer` option: the popup direction flip detection and boundary clamping are constrained within a specified boundary node, default `window`

### Fixed

- position calculation now accounts for the mount container `border` (border-box to padding-box conversion)
- only set `position: relative` on the mount container when it is `static`, avoid overriding existing `absolute` / `fixed` / `sticky`

### Docs

- document `PickerOptions` (incl. `boundaryContainer`) in README
- add API usage & boundary demos to `public/index.html`; add boundary demo to `public/rotate.html`

### Test

- add unit tests for `boundaryContainer`
- add Playwright e2e integration & rotated-mount position tests

## v1.1.9 (2025-12-10)

### Feat

- add boundary detection

## v1.1.8 (2025-12-13)

### Chore

- nothing

## v1.1.7 (2025-12-08)

### Feat

- support trigger click close

### Fixed

- fix: css background-color -> background

## v1.1.6 (2025-12-08)

### Feat

- support trigger click close

## v1.1.5 (2025-11-12)

### Feat

- update

## v1.0.0(2025-10-24)

### Feat

- update container option
- update content option, support function

## v0.1.1(2025-08-03)

### Feat

- picker init
- support mobile
