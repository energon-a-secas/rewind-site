.DEFAULT_GOAL := help

PORT = 8862

# ── Help ──────────────────────────────────────────────────────────────────────
.PHONY: help
help:
	@echo ""
	@echo "  make serve     Start dev server → http://localhost:$(PORT)"
	@echo "  make kill      Kill this project's HTTP server"
	@echo ""
	@echo "  make capture   Live-capture the fleet, skipping unchanged pages"
	@echo "  make backfill  Fill in git history for every live site (capped)"
	@echo "  make shots     Screenshot every snapshot that has none"
	@echo "  make test      Run the capture.py checks"
	@echo ""

# ── Dev server ────────────────────────────────────────────────────────────────
.PHONY: serve
serve:
	@echo "Serving → http://localhost:$(PORT)"
	@if [ -f ../../scripts/serve.py ]; then python3 ../../scripts/serve.py $(PORT); else python3 -m http.server $(PORT); fi

# ── Kill ──────────────────────────────────────────────────────────────────────
.PHONY: kill
kill:
	@lsof -ti :$(PORT) | xargs kill 2>/dev/null && echo "Stopped server on port $(PORT)" || echo "No server running on port $(PORT)"

# ── Archive ─────────────────────────────────────────────────────────────
# The cadence. `capture` is the one to put on a schedule: --if-changed means a
# site that has not moved records nothing, so re-running it stays cheap and does
# not fill the filmstrip with identical cards.
.PHONY: capture backfill shots test
capture:
	python3 tools/capture.py fleet --if-changed --shots

backfill:
	python3 tools/capture.py fleet-git --limit 6 --every week

shots:
	python3 tools/capture.py shot --missing

test:
	python3 tools/test_capture.py
