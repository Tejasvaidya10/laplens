# LapLens v2 - New Design Installation Guide

## Overview

This update brings a completely redesigned UI based on the new mockup, featuring:

1. **Landing Page** - Marketing hero with "See the lap, not just the result"
2. **Empty State** - 3-step welcome guide + Quick Start tiles + Glossary
3. **Loading State** - Step-by-step progress indicator
4. **App View** - Cleaner sidebar + chart with insights panel
5. **Story Timeline** - Race events in chronological order
6. **Mobile Support** - Drawer sidebar for responsive design

## Files to Add/Replace

### New Files

```bash
# Create directories if needed
mkdir -p apps/web/src/components/ui
```

| Source File | Destination |
|-------------|-------------|
| `lib/design-tokens.ts` | `apps/web/src/lib/design-tokens.ts` |
| `lib/insights.ts` | `apps/web/src/lib/insights.ts` |
| `lib/api.ts` | `apps/web/src/lib/api.ts` |
| `hooks/use-session-store.ts` | `apps/web/src/hooks/use-session-store.ts` |
| `components/ui/Badge.tsx` | `apps/web/src/components/ui/Badge.tsx` |
| `components/ui/TireChip.tsx` | `apps/web/src/components/ui/TireChip.tsx` |
| `components/ui/MetricCard.tsx` | `apps/web/src/components/ui/MetricCard.tsx` |
| `components/LandingPage.tsx` | `apps/web/src/components/LandingPage.tsx` |
| `components/EmptyState.tsx` | `apps/web/src/components/EmptyState.tsx` |
| `components/LoadingState.tsx` | `apps/web/src/components/LoadingState.tsx` |
| `components/Sidebar.tsx` | `apps/web/src/components/Sidebar.tsx` |
| `components/InsightsPanel.tsx` | `apps/web/src/components/InsightsPanel.tsx` |
| `components/StintTable.tsx` | `apps/web/src/components/StintTable.tsx` |
| `components/RaceStoryTimeline.tsx` | `apps/web/src/components/RaceStoryTimeline.tsx` |
| `components/MobileDrawer.tsx` | `apps/web/src/components/MobileDrawer.tsx` |
| `pages/Dashboard.tsx` | `apps/web/src/pages/Dashboard.tsx` |

### Keep Existing

Keep your existing chart components - they are imported by the new Dashboard:
- `SpeedChart.tsx`
- `ThrottleBrakeChart.tsx`
- `GearChart.tsx`
- `DeltaChart.tsx`
- `RacePaceChart.tsx`

## Quick Installation

```bash
# Extract the zip
cd ~/Downloads
unzip laplens-v2.zip

# Copy all files preserving structure
cp -r laplens-v2/* /Users/tejas/Documents/laplens/apps/web/src/

# Install lucide-react if not already installed
cd /Users/tejas/Documents/laplens/apps/web
npm install lucide-react

# Test locally
npm run dev
```

## What Changed

### Design Updates

| Before | After |
|--------|-------|
| Blue gradient cards | Clean zinc-900 cards |
| Progress steps at top | Simplified sidebar |
| Separate landing components | Integrated EmptyState |
| Basic loading spinner | Step-by-step progress |
| Charts only | Charts + Insights Panel |

### New Features

1. **Landing Page** (`/` route shows marketing page first)
2. **View States** - landing → app (empty) → loading → app (with data)
3. **Insights Panel** - "Key Takeaways" next to every chart
4. **Metric Cards** - Quick stats (Top Speed, Lap Delta, etc.)
5. **Story Timeline** - Chronological race events with lap markers
6. **Stint Table** - Detailed tire strategy breakdown

### Sidebar Improvements

- Cleaner dropdown styling
- Swap drivers button between driver selects
- "Quick Start" and "Glossary" links
- Loading indicator when fetching drivers
- Cache hint text at bottom

## Verification Checklist

After installation, test:

- [ ] Landing page shows with hero and features
- [ ] "Open App" navigates to empty state
- [ ] Quick Start tiles load preset sessions
- [ ] Dropdowns work for Season → Event → Session → Drivers
- [ ] Swap button exchanges Driver A and Driver B
- [ ] "Run Analysis" shows loading progress
- [ ] Charts render with data
- [ ] Insights panel shows "Key Takeaways"
- [ ] Race Pace tab shows stint table
- [ ] Story tab shows timeline events
- [ ] Mobile drawer works on small screens

## Push to Deploy

```bash
cd /Users/tejas/Documents/laplens
git add -A
git commit -m "Redesign: New landing page, loading states, insights panel"
git push
```

## Architecture Notes

The new design uses a single `viewState` to control what's shown:

```
'landing' → LandingPage component
'app' (no data) → Sidebar + EmptyState
'loading' → Sidebar + LoadingState
'app' (with data) → Sidebar + Charts + InsightsPanel
```

This simplifies the logic and makes state transitions clearer.
