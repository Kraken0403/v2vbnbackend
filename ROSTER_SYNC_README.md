# Shrinathji roster update from latest PPT

Source PPT: `Final PPT_V2VBN.pptx`

Parsed roster count: **66 active PPT members**

Notes:
- One blank slide was skipped.
- This patch updates member records and chapter membership only.
- Coordinator / leadership / chapter role links are protected by default.
- Do not use `--strict-ppt` unless you intentionally want to deactivate non-PPT members even if they hold chapter roles.

## Files included

- `scripts/shrinathji-roster.data.ts`
- `scripts/sync-shrinathji-roster.ts`
- `scripts/import-shrinathji-members.ts`
- `scripts/list-shrinathji-member-ids.ts`
- `shrinathji.xlsx`

## Package scripts needed

Add these to `package.json` if they are missing:

```json
{
  "roster:sync:shrinathji": "tsx scripts/sync-shrinathji-roster.ts",
  "roster:sync:shrinathji:dry": "tsx scripts/sync-shrinathji-roster.ts --dry-run",
  "roster:sync:shrinathji:strict": "tsx scripts/sync-shrinathji-roster.ts --strict-ppt",
  "roster:list:shrinathji": "tsx scripts/list-shrinathji-member-ids.ts",
  "import:shrinathji": "tsx scripts/import-shrinathji-members.ts"
}
```

## Run on local or hosting

```bash
cd /home/v2vbn/backend
cp .env.prod .env   # hosting only
npm install
npx prisma generate
npm run roster:sync:shrinathji:dry
npm run roster:sync:shrinathji
pm2 restart v2vbn-backend
```

## Verify active roster count

```bash
mysql -u root -p -e "
USE v2vbn;
SELECT COUNT(*) AS active_shrinathji_members
FROM member_chapter mc
JOIN chapter c ON c.id = mc.chapter_id
WHERE mc.is_active = 1
AND (c.slug = 'shrinathji' OR c.name LIKE '%Shrinathji%');
"
```

Expected count: **66**, unless existing non-PPT coordinator/role holders were protected and still active.
