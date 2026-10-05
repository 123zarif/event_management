---
trigger: always_on
description: "ClubSphere professional UI/UX and anti-AI-generated visual design rules."
---

# ClubSphere UI/UX Rules

Build ClubSphere as a production-quality product, not as an AI-generated dashboard template.

## Design Goal

The interface should feel:

- Professional
- Human-designed
- Modern
- Technical
- Restrained
- Consistent
- Highly usable

Prioritize hierarchy, usability, information density, consistency, and visual restraint over decorative effects.

## Avoid AI-Generated Visual Patterns

Do NOT use:

- Purple/blue gradients as backgrounds
- Gradient text everywhere
- Excessive glassmorphism
- Excessive backdrop blur
- Neon glow effects
- Huge hero headings
- Giant rounded cards
- Every section wrapped in a card
- Excessive pill-shaped controls
- Excessive badges
- Repeating icon + title + paragraph grids
- Decorative blobs
- Random floating shapes
- Excessive shadows
- Excessive animation
- Generic SaaS dashboard layouts
- Fake "AI" visual motifs
- Unnecessary whitespace
- Decorative charts with no useful information

Every visual element must have a functional or information-architecture reason.

## Visual Language

Use:

- Neutral zinc/slate/near-black foundations
- Electric violet as a restrained accent
- Subtle borders
- Moderate corner radii
- Strong typography hierarchy
- Consistent spacing
- Clear alignment
- High information density where appropriate

Do not make the whole application purple.

Large surfaces should remain neutral.

Prefer borders and spacing over heavy shadows.

## UI Library

Use shadcn/ui as the primary component foundation.

Use existing shadcn primitives whenever possible.

Do not install another UI library for functionality already provided by shadcn/ui.

Do not modify every shadcn component into a glassmorphic or heavily rounded component.

Use Lucide icons consistently and functionally.

Do not add icons merely for decoration.

## Typography

Use a modern readable sans-serif.

Use typography, weight, spacing, and scale to establish hierarchy.

Avoid unnecessarily huge headings.

Keep application page titles compact and purposeful.

Avoid excessive bold text.

## Layout

Use:

- Consistent content widths
- Predictable gutters
- Strong vertical rhythm
- Clear columns
- Intentional whitespace
- Responsive grids

Do not center everything.

Prefer left-aligned application content.

Do not make desktop layouts simply shrink on mobile.

## Cards

Cards are optional grouping tools, not the default structure.

Use a card when a visual boundary improves comprehension.

Do not place cards inside cards without a strong reason.

Do not wrap entire pages in cards.

## Buttons

Maintain clear hierarchy:

- Primary
- Secondary
- Outline
- Ghost
- Destructive

Do not make every button visually dominant.

Use clear action-oriented labels.

Use one primary action per section when practical.

## Forms

Forms must feel calm and structured.

Group related fields logically.

Every field should have:

- Clear label
- Validation
- Useful error state
- Accessible feedback

Do not create giant unstructured forms.

## Event UI

Event cards should prioritize:

1. Event name
2. Category
3. Date/time
4. Venue
5. Registration state
6. Capacity
7. Primary action

Clearly communicate:

- Available
- Filling Fast
- Full
- Waitlist
- Registration Closed

## Admin UI

Organizer interfaces should optimize for scanning and operational efficiency.

Use dense but readable tables.

Support:

- Search
- Filtering
- Sorting
- Pagination
- Bulk actions
- Clear status indicators

Do not turn every table cell into a giant badge or button.

## Competition UI

Judge interfaces must prioritize the submission itself.

Show:

- Submission
- Project links
- Criteria
- Score
- Maximum score
- Remarks
- Submission state

Avoid decorative dashboard clutter.

## Leaderboards

Prioritize:

- Rank
- Team/participant
- Score
- Status

Use restrained visual emphasis for top positions.

Scoreboard Freeze must have an obvious state.

## Tournament Brackets

Optimize for readability.

Users must immediately understand:

- Match
- Participants
- Winner
- Next round

Avoid unnecessary animation.

## QR Check-in

Treat the scanner as an operational tool.

Prioritize:

- Camera
- Scan target
- Validation state
- Participant
- Event
- Check-in result

Success and failure states must be unmistakable.

## Certificates

Certificate previews should look genuinely printable.

Avoid making certificates look like normal web cards.

## Motion

Use Framer Motion only where it improves:

- State transitions
- Navigation
- Loading
- Confirmation
- Dialogs

Avoid animation for decoration.

The product should still look good with animations disabled.

## Responsive Design

Design mobile intentionally.

Never simply compress desktop layouts.

Ensure:

- No horizontal overflow
- Touch-friendly controls
- Readable typography
- Appropriate stacking
- Mobile-friendly tables
- Filters in sheets/drawers where appropriate
- Important actions remain accessible

## States

Every major component must consider:

- Loading
- Skeleton
- Empty
- Error
- Disabled
- Success
- Permission denied
- Full
- Closed
- Waitlisted
- Already registered

## Accessibility

Use:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- Sufficient contrast
- Accessible dialogs
- Accessible error messages

## Consistency

Before creating a new component, check whether an existing component can be reused.

Pages must feel like part of the same product.

Do not independently invent a new visual style for each page.

## Quality Gate

Before considering a UI task complete, review it critically:

1. Is the primary action obvious?
2. Is the hierarchy clear?
3. Is there unnecessary visual noise?
4. Are there too many cards?
5. Are there too many pills or badges?
6. Are decorative effects actually useful?
7. Does the page look generic or AI-generated?
8. Is the spacing consistent?
9. Does mobile feel intentionally designed?
10. Are all important non-happy states handled?

Prefer a simpler, more deliberate solution over a more decorative one.