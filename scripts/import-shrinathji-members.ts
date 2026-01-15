/**
 * FILE: scripts/import-shrinathji-members.ts
 *
 * Fresh import script for Shrinathji chapter
 * Imports Users + Members + Category + Company
 */

 import * as XLSX from 'xlsx'
 import * as bcrypt from 'bcrypt'
 import { PrismaClient } from '@prisma/client'
 
 const prisma = new PrismaClient()
 
 /* ============================
    CONFIG
 ============================ */
 const EXCEL_PATH = './shrinathji.xlsx'
 const CHAPTER_NAME = 'Shrinathji'
 const DEFAULT_PASSWORD = 'V2VBN@123'
 const PASSWORD_ROUNDS = 10
 const PHONE_BASE = 9000000000 // dummy phones
 
 /* ============================
    HELPERS
 ============================ */
 function makeSlug(name: string, suffix: number) {
   return (
     name
       .toLowerCase()
       .replace(/[^a-z0-9]+/g, '-')
       .replace(/(^-|-$)/g, '') +
     '-' +
     suffix
   )
 }
 
 /* ============================
    MAIN
 ============================ */
 async function run() {
   console.log('🚀 Starting Shrinathji member import')
 
   /* 1️⃣ Load Excel */
   const workbook = XLSX.readFile(EXCEL_PATH)
   const sheet = workbook.Sheets[workbook.SheetNames[0]]
   const rows = XLSX.utils.sheet_to_json<any>(sheet)
 
   if (!rows.length) {
     throw new Error('❌ Excel sheet is empty')
   }
 
   /* 2️⃣ Fetch chapter */
   const chapter = await prisma.chapter.findFirst({
     where: { name: CHAPTER_NAME },
   })
 
   if (!chapter) {
     throw new Error(`❌ Chapter "${CHAPTER_NAME}" not found`)
   }
 
   console.log(`📍 Chapter found: ${chapter.name} (ID ${chapter.id})`)
 
   /* 3️⃣ Hash password once */
   const hashedPassword = await bcrypt.hash(
     DEFAULT_PASSWORD,
     PASSWORD_ROUNDS,
   )
 
   /* 4️⃣ Import members */
   let phoneCounter = 1
 
   for (const row of rows) {
     const fullName = row['Name']?.trim()
     const email = row['Email']?.toLowerCase()?.trim()
     const category = row['Category']?.trim() || null
     const companyName = row['Company']?.trim() || null
 
     if (!fullName || !email) {
       console.warn('⚠️ Skipping invalid row:', row)
       continue
     }
 
     const phone = String(PHONE_BASE + phoneCounter)
     phoneCounter++
 
     console.log(`➕ Creating user: ${fullName}`)
 
     /* Create User */
     const user = await prisma.user.create({
       data: {
         name: fullName,
         email,
         phone,
         password: hashedPassword,
         role: 'MEMBER',
         is_active: true,
       },
     })
 
     /* Create Member */
     const member = await prisma.member.create({
       data: {
         user_id: user.id,
         full_name: fullName,
         email,
         slug: makeSlug(fullName, user.id),
         company_name: companyName,
         category: category,
         is_active: true,
       },
     })
 
     /* Attach to Chapter */
     await prisma.member_chapter.create({
       data: {
         member_id: member.id,
         chapter_id: chapter.id,
         is_active: true,
       },
     })
   }
 
   console.log('✅ Import completed successfully')
 }
 
 /* ============================
    EXECUTION
 ============================ */
 run()
   .catch((err) => {
     console.error('❌ Import failed:', err)
   })
   .finally(async () => {
     await prisma.$disconnect()
   })
 