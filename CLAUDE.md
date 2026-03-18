# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PAUMEN-UI is a highly constrained design system / blueprint for building web apps with LLM-assisted development. The core idea: instead of maximizing flexibility (like traditional CSS frameworks), maximize constraint so that ~124 of 134 UI properties are deterministic — leaving only ~10 actual decisions per element (where, how big, what content).

Target apps: single or few-page tools, mostly client-side. Productivity tools, dashboards, forms, games, converters.

## Current State

**Pre-spec / research phase.** Everything under `Research/` is draft material — experiments, prototypes, working notes. The goal is to arrive at the first real specification through further experimentation and iteration. There is no build system, package manager, or test suite yet.

**Priority:** Core architecture first (layout model, element set, skin system, color system). Details like signal states/hues come later.

**No tooling scaffolding yet.** Skills, hooks, linters, permissions, workflows — all far future. The blueprint itself must be strong enough to work without soft enforcement. If it needs guardrails to function, that's a design smell.

## Key Research Documents

- `Research/Blueprint_Draft_v0.5.md` — Full specification draft (elements, skins, color system, layout, CSS architecture)
- `Research/Research_Sessions_Summaries.md` — Session-by-session decisions and rationale
- `Research/Research_Report_Modularity_Notes.md` — Strategic notes on Section/Card framework and LLM optimization
- `Research/blueprint_experiment_*.html` / `.jsx` — Visual prototypes testing the system. They each test different aspacts and may not fully comply to blueprint, or may be conducted before latest blue print update.
