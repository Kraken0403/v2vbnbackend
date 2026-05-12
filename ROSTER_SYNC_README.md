# Shrinathji roster sync from latest PPT

This update changes the Shrinathji roster source to the latest `Final PPT_V2VBN-1.pptx` member list.

## What changed

- PPT roster count: **62 members**.
- Old `shrinathji.xlsx` count: **56 members**.
- `shrinathji.xlsx` has been regenerated from the PPT roster.
- New source-of-truth roster file added: `scripts/shrinathji-roster.data.ts`.
- Safe sync script added: `scripts/sync-shrinathji-roster.ts`.
- Existing `scripts/import-shrinathji-members.ts` now runs the safe sync.
- Public roster API now ignores inactive member/chapter links and returns members in a stable alphabetical order.

## Coordinator safety

The sync script does **not delete chapter roles**.

By default it also protects chapter links that already have any leadership/coordinator role. So if a role-holder is missing from the PPT, the script logs it and leaves that role link active instead of silently changing coordinator visibility.

Use strict mode only if you deliberately want the visible roster to exactly match the PPT, including deactivating role-holder links that are missing from the PPT:

```bash
npm run roster:sync:shrinathji:strict
```

## Recommended run

```bash
cd backend
npm install
npx prisma generate
npm run roster:sync:shrinathji:dry
npm run roster:sync:shrinathji
npm run build
```

## Useful commands

Dry run only:

```bash
npm run roster:sync:shrinathji:dry
```

Normal safe sync:

```bash
npm run roster:sync:shrinathji
```

Strict PPT sync:

```bash
npm run roster:sync:shrinathji:strict
```

Legacy-compatible import command:

```bash
npm run import:shrinathji
```

## Likely new members from PPT

- Snehal Mandaliya
- Bhavik Ruparel
- Vishal Dave
- Hitesh Dani
- Dhruvin Dabhi
- Ankit Solanki
- Bhavesh Barot

## Missing from PPT / treated as left

- Nilesh K. Shah

If that member has a coordinator/leadership role, normal sync will protect the link and log it instead of deactivating it. Strict sync will deactivate it from the chapter roster.
