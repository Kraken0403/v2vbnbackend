/**
 * FILE: scripts/import-shrinathji-members.ts
 *
 * Safe Shrinathji roster import/sync.
 * Source of truth is scripts/shrinathji-roster.data.ts, generated from the latest PPT roster.
 *
 * This script does NOT delete members, users, or chapter roles.
 * It upserts PPT roster members, activates their Shrinathji chapter link,
 * and deactivates chapter links missing from the PPT while protecting role links by default.
 */

import {
  disconnectShrinathjiRosterSync,
  runShrinathjiRosterSync,
} from './sync-shrinathji-roster'

runShrinathjiRosterSync()
  .catch((error) => {
    console.error('❌ Import failed:', error)
    process.exitCode = 1
  })
  .finally(disconnectShrinathjiRosterSync)
