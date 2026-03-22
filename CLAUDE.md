# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PAUMEN-UI is a highly constrained design system / blueprint for building web apps with LLM-assisted development. The core idea: instead of maximizing flexibility (like traditional CSS frameworks), maximize constraint so that ~124 of 134 UI properties are deterministic — leaving only ~10 actual decisions per element (where, how big, what content).

Target apps: single or few-page tools, mostly client-side. Productivity tools, dashboards, forms, games, converters.

## Current State

**Core architecture complete.** The spec (element set, skins, color system, layout model, CSS architecture) is locked. A canonical stylesheet (`pre-prototype/paumen.css`) and working reference app (Daily Planner) exist. Signal states (`data-state="error|loading|success"`) are defined but not yet implemented in CSS. Alpine.js is the only permitted JS framework (see §9 of the spec).

**Next priority:** Signal state implementation, LLM validation with diverse reference apps, and production CLAUDE.md. See `Research/next_steps.md` for the full roadmap.

**No tooling scaffolding yet.** Skills, hooks, linters, permissions, workflows — all far future. The blueprint itself must be strong enough to work without soft enforcement. If it needs guardrails to function, that's a design smell.

## Key Documents

- `Research/blueprint_spec.md` — Canonical specification (authoritative source of truth)
- `Research/blueprint_rationale.md` — Design reasoning and trade-off analysis
- `Research/blueprint_lab_notebook.md` — Session-by-session research chronology (Sessions 1–5)
- `Research/blueprint_theoretical_research.md` — Cross-domain modularity theory
- `Research/next_steps.md` — Phased roadmap for project progression
- `Research/Experiments/blueprint_experiment_*.html` / `.jsx` — Visual prototypes testing the system
- `pre-prototype/paumen.css` — Canonical stylesheet (implements the spec)
- `pre-prototype/index.html` — Daily Planner reference app
