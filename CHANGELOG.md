# Changelog

## 4.0.0

### Breaking changes
- HTTP caching is disabled by default. Responses no longer carry `ETag` / `Last-Modified`, every response gets
  `Cache-Control: no-store`, and conditional requests (`If-None-Match`, `If-Modified-Since`) are always answered `200`
  with the full body instead of `304 Not Modified`. Applies to both `body` and `file` responses.
  Clients that saw `304` before (e.g. Cypress intercepts, which observe the raw response) now always get `200`.

### Added
- `serverConfig.httpCache` (default `false`). Set to `true` to restore the previous Express behaviour (weak ETags,
  `304` for matching conditional requests).

### Notes
- A source that sets its own `ETag` via `headers` still gets standard conditional-request handling.

## 3.5.1

### Fixed
- Reverted the 3.5.0 query-string matcher change that broke enum-style multi-value rules
  (e.g. `{ name: 'type', values: ['SDPO', 'COLL'] }` matching `?type=SDPO`).

### Changed
- The published npm package contains only the compiled output (`dist`).

## 3.5.0

### Fixed
- Query-string matcher false match and recorder crash on object bodies.

### Changed
- Replaced `nconf` with a minimal env-config expander.
