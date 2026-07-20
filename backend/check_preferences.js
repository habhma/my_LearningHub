// Quick script to check user preferences
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPreferences() {
  try {
    const profiles = await prisma.userProfile.findMany({
      select: {
        userId: true,
        preferences: true,
        user: {
          select: {
            email: true,
          }
        }
      }
    });

    console.log('User Profiles and Preferences:');
    profiles.forEach(p => {
      console.log('User:', p.user.email);
      console.log('User ID:', p.userId.toString());
      console.log('Preferences:', p.preferences);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPreferences();
