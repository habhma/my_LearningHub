# 🎯 QUICK START - Interactive Bulk Load

## One Simple Command!

```bash
cd backend
npm run bulk-load-interactive -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
```

## What Happens Next?

The script will ask you 8 simple questions:

1. **Select Subject** → Pick Mathematics
2. **Select Topic** → Pick "Parts and Wholes" (or skip)
3. **Enter Class Level** → Type 4 (or press Enter - it's auto-suggested!)
4. **Select Exam Category** → Pick CBSE Board
5. **Select Question Type** → Pick Multiple Choice
6. **Select Difficulty** → Pick Medium
7. **Enter Marks** → Type 1 (or press Enter for default)
8. **Enter Negative Marks** → Type 0 (or press Enter)

Then press Enter to confirm and watch 50 questions load! ✨

## Before Running (First Time Only)

Make sure database is seeded:
```bash
npm run db:seed
```

Install dependencies:
```bash
npm install pdf-parse jsdom @types/pdf-parse
```

## That's It!

No need to:
- ❌ Run SQL queries
- ❌ Remember database IDs  
- ❌ Type long commands with many parameters

Just run the script and follow the prompts! 🚀

---

**See full documentation:** `README-INTERACTIVE.md`
