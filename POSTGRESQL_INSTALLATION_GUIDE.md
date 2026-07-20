# PostgreSQL Installation Guide for Windows

**Date:** 2026-07-19  
**Version:** PostgreSQL 14 or higher  
**Estimated Time:** 10-15 minutes

---

## 📥 Step 1: Download PostgreSQL

1. **Open your browser** and go to:
   ```
   https://www.postgresql.org/download/windows/
   ```

2. **Click on "Download the installer"** link
   - This will take you to the EnterpriseDB (EDB) installer page

3. **Select the version:**
   - Choose **PostgreSQL 14.x, 15.x, or 16.x** (any of these will work)
   - Select **Windows x86-64** (for 64-bit Windows)
   - Click the **Download** button

4. **Save the file:**
   - File name will be something like: `postgresql-14.x-windows-x64.exe`
   - Save it to your Downloads folder

---

## 🔧 Step 2: Run the Installer

1. **Locate the downloaded file** in your Downloads folder

2. **Right-click** the installer → **Run as administrator**

3. **Follow the installation wizard:**

### Installation Wizard Steps:

#### Screen 1: Setup - PostgreSQL
- Click **Next**

#### Screen 2: Installation Directory
- **Default location is fine:** `C:\Program Files\PostgreSQL\14`
- Click **Next**

#### Screen 3: Select Components
- **Keep all components selected (recommended):**
  - ✅ PostgreSQL Server
  - ✅ pgAdmin 4 (GUI management tool)
  - ✅ Stack Builder (optional tools)
  - ✅ Command Line Tools
- Click **Next**

#### Screen 4: Data Directory
- **Default location is fine:** `C:\Program Files\PostgreSQL\14\data`
- Click **Next**

#### Screen 5: Password ⚠️ **IMPORTANT**
- **Enter a password** for the PostgreSQL superuser (postgres)
- **Example:** `postgres` (simple for development)
- **Re-enter the password** to confirm
- **⚠️ REMEMBER THIS PASSWORD!** You'll need it soon
- Click **Next**

#### Screen 6: Port
- **Default port:** `5432` (keep this)
- Click **Next**

#### Screen 7: Advanced Options
- **Locale:** Default Locale (keep this)
- Click **Next**

#### Screen 8: Pre Installation Summary
- Review the settings
- Click **Next**

#### Screen 9: Installation
- Wait for installation to complete (2-5 minutes)
- You'll see progress bars for various components

#### Screen 10: Completing the PostgreSQL Setup Wizard
- **Uncheck** "Launch Stack Builder at exit" (not needed now)
- Click **Finish**

---

## ✅ Step 3: Verify Installation

### Method 1: Check Windows Services
1. Press **Win + R**
2. Type `services.msc` and press Enter
3. Look for **"postgresql-x64-14"** in the list
4. Status should be **"Running"**

### Method 2: Check using Command Prompt
1. Open **Command Prompt** (cmd)
2. Run:
   ```cmd
   "C:\Program Files\PostgreSQL\14\bin\psql" --version
   ```
3. You should see output like:
   ```
   psql (PostgreSQL) 14.x
   ```

---

## 🗄️ Step 4: Create the Database

Now let's create the database for our Student Assessment Platform.

### Option A: Using pgAdmin (GUI - Easier for Beginners)

1. **Open pgAdmin 4**
   - Find it in Start Menu → PostgreSQL 14 → pgAdmin 4
   - Or search for "pgAdmin" in Windows search

2. **First time setup:**
   - pgAdmin may ask you to set a master password (optional, you can skip)
   - Click **"Skip"** if you don't want to set one

3. **Connect to PostgreSQL:**
   - In the left sidebar, expand **Servers**
   - Click on **PostgreSQL 14**
   - Enter the password you set during installation
   - Check **"Save password"** (optional)
   - Click **OK**

4. **Create the database:**
   - Right-click on **"Databases"**
   - Select **Create → Database...**
   - In the "General" tab:
     - **Database name:** `student_assessment_db`
     - **Owner:** postgres (should be default)
   - Click **Save**

5. **Verify:**
   - You should now see `student_assessment_db` in the Databases list

### Option B: Using Command Line (psql)

1. **Open Command Prompt**

2. **Navigate to PostgreSQL bin directory:**
   ```cmd
   cd "C:\Program Files\PostgreSQL\14\bin"
   ```

3. **Connect to PostgreSQL:**
   ```cmd
   psql -U postgres
   ```
   - Enter the password you set during installation

4. **Create the database:**
   ```sql
   CREATE DATABASE student_assessment_db;
   ```

5. **Verify it was created:**
   ```sql
   \l
   ```
   - You should see `student_assessment_db` in the list

6. **Exit psql:**
   ```sql
   \q
   ```

---

## 🔗 Step 5: Update Environment Variables (Optional but Recommended)

To use `psql` command from any directory:

1. **Open System Environment Variables:**
   - Press **Win + R**
   - Type `sysdm.cpl` and press Enter
   - Click **"Advanced"** tab
   - Click **"Environment Variables"** button

2. **Edit Path variable:**
   - Under **"System variables"**, find **Path**
   - Click **Edit**
   - Click **New**
   - Add: `C:\Program Files\PostgreSQL\14\bin`
   - Click **OK** on all dialogs

3. **Verify:**
   - Open **NEW** Command Prompt (close old ones)
   - Type: `psql --version`
   - Should work from any directory now

---

## 🔑 Step 6: Update Backend .env File

Now let's connect your backend to PostgreSQL.

**The `.env` file is already configured with:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_assessment_db"
```

**If you used a different password, update it:**

1. Open `C:\Tech\my_LearningHuB\backend\.env` in a text editor

2. Find this line:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_assessment_db"
   ```

3. Change the second `postgres` to your password:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/student_assessment_db"
   ```

4. Save the file

---

## ✅ Step 7: Test Connection

Let's verify the backend can connect to PostgreSQL:

1. **Open Command Prompt** or Git Bash

2. **Navigate to backend directory:**
   ```bash
   cd C:\Tech\my_LearningHuB\backend
   ```

3. **Test connection using Node.js:**
   ```bash
   node -e "const { Client } = require('pg'); const client = new Client({connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/student_assessment_db'}); client.connect().then(() => { console.log('✅ Connected to PostgreSQL!'); client.end(); }).catch(err => console.error('❌ Connection failed:', err.message));"
   ```

   **Expected output:**
   ```
   ✅ Connected to PostgreSQL!
   ```

---

## 🎉 Installation Complete!

**Checklist:**
- ✅ PostgreSQL 14+ installed
- ✅ PostgreSQL service running
- ✅ Database `student_assessment_db` created
- ✅ Backend .env file updated (if needed)
- ✅ Connection tested

---

## 📝 Important Information to Remember

**PostgreSQL Details:**
- **Username:** `postgres`
- **Password:** `[the password you set]`
- **Port:** `5432`
- **Database:** `student_assessment_db`
- **Host:** `localhost`

**Connection String:**
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/student_assessment_db
```

---

## 🚀 Next Steps

Now that PostgreSQL is installed and the database is created, you can proceed with:

1. **Generate Prisma Client:**
   ```bash
   cd C:\Tech\my_LearningHuB\backend
   npm run db:generate
   ```

2. **Run Database Migrations** (creates all 28 tables):
   ```bash
   npm run db:migrate
   ```

3. **Seed Sample Data** (optional):
   ```bash
   npm run db:seed
   ```

4. **Start Backend Server:**
   ```bash
   npm run dev
   ```

5. **Start Frontend** (in new terminal):
   ```bash
   cd C:\Tech\my_LearningHuB\frontend
   npm run dev
   ```

---

## 🐛 Troubleshooting

### Issue: "psql: command not found" after installation
**Solution:** 
- Make sure you added PostgreSQL to PATH (Step 5)
- Close and reopen Command Prompt
- Or use full path: `"C:\Program Files\PostgreSQL\14\bin\psql"`

### Issue: "password authentication failed"
**Solution:**
- Double-check the password in backend/.env
- Make sure it matches the password you set during installation

### Issue: "could not connect to server"
**Solution:**
- Check if PostgreSQL service is running (Step 3, Method 1)
- In services.msc, right-click "postgresql-x64-14" → Start

### Issue: "port 5432 already in use"
**Solution:**
- Another PostgreSQL instance might be running
- Or another service is using port 5432
- Check services.msc for multiple PostgreSQL services

### Issue: Can't find pgAdmin
**Solution:**
- Check: `C:\Program Files\PostgreSQL\14\pgAdmin 4\bin\pgAdmin4.exe`
- Or search "pgAdmin" in Windows Start Menu

---

## 📚 Useful pgAdmin Features

Once you have pgAdmin open:

1. **View Tables:**
   - Expand: Servers → PostgreSQL 14 → Databases → student_assessment_db → Schemas → public → Tables

2. **Run SQL Queries:**
   - Right-click database → Query Tool
   - Write and execute SQL

3. **View Data:**
   - Right-click a table → View/Edit Data → All Rows

4. **Backup Database:**
   - Right-click database → Backup...

5. **Restore Database:**
   - Right-click database → Restore...

---

## 🎓 PostgreSQL Basics

**Common Commands:**

```sql
-- List all databases
\l

-- Connect to database
\c student_assessment_db

-- List all tables
\dt

-- Describe table structure
\d table_name

-- Exit psql
\q
```

**Useful SQL:**

```sql
-- Count rows in a table
SELECT COUNT(*) FROM users;

-- View first 10 rows
SELECT * FROM users LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('student_assessment_db'));
```

---

## 🔒 Security Notes

**For Development:**
- Using simple passwords like `postgres` is fine
- PostgreSQL only accepts local connections by default

**For Production:**
- Use strong, unique passwords
- Configure proper authentication (pg_hba.conf)
- Use SSL connections
- Regular backups
- Limit user privileges

---

## 📞 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Verify PostgreSQL service is running
3. Check backend/.env file
4. Review error messages carefully
5. Check PostgreSQL logs at: `C:\Program Files\PostgreSQL\14\data\log`

---

**Installation Guide Complete!**

Once you've completed all steps, come back and let me know. I'll help you run the database migrations and start the servers!

---

**Last Updated:** 2026-07-19  
**PostgreSQL Version:** 14+  
**Platform:** Windows 10/11

