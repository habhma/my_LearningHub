// Sports Star Data for Gamification
// 10 popular international sports stars across different sports

export interface SportsStar {
  id: string;
  name: string;
  sport: string;
  country: string;
  imageUrl: string;
  quote: string;
  color: string; // Theme color for the star
}

export const SPORTS_STARS: SportsStar[] = [
  {
    id: 'messi',
    name: 'Lionel Messi',
    sport: 'Football',
    country: 'Argentina',
    imageUrl: '/images/sports-stars/Messi.jpg',
    quote: 'You have to fight to reach your dream. You have to sacrifice and work hard for it.',
    color: '#1E90FF'
  },
  {
    id: 'ronaldo',
    name: 'Cristiano Ronaldo',
    sport: 'Football',
    country: 'Portugal',
    imageUrl: '/images/sports-stars/Ronaldo.jpg',
    quote: 'Talent without working hard is nothing.',
    color: '#FF4500'
  },
  {
    id: 'mbappe',
    name: 'Kylian Mbappé',
    sport: 'Football',
    country: 'France',
    imageUrl: '/images/sports-stars/mbappe.jpg',
    quote: 'I want to be the best. That\'s what drives me every day.',
    color: '#0055A4'
  },
  {
    id: 'neymar',
    name: 'Neymar Jr',
    sport: 'Football',
    country: 'Brazil',
    imageUrl: '/images/sports-stars/neymar.jpg',
    quote: 'There is no pressure when you are making a dream come true.',
    color: '#00CED1'
  },
  {
    id: 'haaland',
    name: 'Erling Haaland',
    sport: 'Football',
    country: 'Norway',
    imageUrl: '/images/sports-stars/Haaland.jpg',
    quote: 'I always want to score goals and win trophies.',
    color: '#002868'
  },
  {
    id: 'kohli',
    name: 'Virat Kohli',
    sport: 'Cricket',
    country: 'India',
    imageUrl: '/images/sports-stars/kohli.jpg',
    quote: 'Self-belief and hard work will always earn you success.',
    color: '#138808'
  },
  {
    id: 'rohit',
    name: 'Rohit Sharma',
    sport: 'Cricket',
    country: 'India',
    imageUrl: '/images/sports-stars/Rohit.jpg',
    quote: 'The harder you work, the luckier you get.',
    color: '#FF9933'
  },
  {
    id: 'sachin',
    name: 'Sachin Tendulkar',
    sport: 'Cricket',
    country: 'India',
    imageUrl: '/images/sports-stars/Sachin.jpg',
    quote: 'Enjoy the game and chase your dreams. Dreams do come true!',
    color: '#000080'
  },
  {
    id: 'stokes',
    name: 'Ben Stokes',
    sport: 'Cricket',
    country: 'England',
    imageUrl: '/images/sports-stars/BenStokes.jpg',
    quote: 'Never give up. Great things take time.',
    color: '#012169'
  },
  {
    id: 'vaibhav',
    name: 'Vaibhav Suryavanshi',
    sport: 'Cricket',
    country: 'India',
    imageUrl: '/images/sports-stars/vaibhavsuryavamshi.jpg',
    quote: 'Dream big and work hard to achieve it.',
    color: '#8B4513'
  }
];

// Comprehensive congratulatory messages pool (50+ messages)
const CONGRATULATORY_MESSAGES = [
  "Amazing! You're on fire! 🔥",
  "Keep up the excellent work! 🌟",
  "You're unstoppable! 💪",
  "Brilliant performance! 🎉",
  "You're crushing it! 🚀",
  "Outstanding effort! Keep going! ⭐",
  "You're doing fantastic! 🎯",
  "Incredible progress! 💫",
  "You're a natural! Keep it up! 🏅",
  "Superb work! Stay focused! 👏",
  "You're making this look easy! 😎",
  "Phenomenal job! 🌈",
  "You're in the zone! 🎪",
  "Spectacular performance! 🎭",
  "You're absolutely nailing it! 🔨",
  "Magnificent work! 🎨",
  "You're showing true excellence! 💎",
  "Brilliant execution! 🎬",
  "You're proving your talent! 🎸",
  "Impressive dedication! 📚",
  "You're breaking barriers! 🚧",
  "Exceptional skills on display! 🎓",
  "You're setting the pace! 🏃",
  "Remarkable consistency! ⚡",
  "You're exceeding expectations! 📈",
  "Wonderful progress! 🌺",
  "You're showing champion spirit! 🏆",
  "Fantastic momentum! 🌊",
  "You're in top form! 💯",
  "Stellar performance! ✨",
  "You're demonstrating mastery! 🎯",
  "Awesome concentration! 🧠",
  "You're performing brilliantly! 🌟",
  "Great determination! 💪",
  "You're showing real grit! 🔥",
  "Marvelous execution! 🎪",
  "You're on the right track! 🛤️",
  "Excellent work ethic! 📖",
  "You're proving your worth! 💰",
  "Tremendous effort! 🏋️",
  "You're conquering this! ⚔️",
  "Impressive precision! 🎯",
  "You're showcasing talent! 🎭",
  "Powerful performance! ⚡",
  "You're making every answer count! 📊",
  "Dynamic effort! 💥",
  "You're in championship form! 🥇",
  "Inspiring performance! 🌅",
  "You're climbing to the top! 🧗",
  "Extraordinary focus! 👁️",
  "You're writing your success story! 📝",
  "Brilliant strategic thinking! 🧩",
  "You're unstoppable today! 🌪️",
  "Remarkable perseverance! 🌳",
];

const MILESTONE_100_MESSAGES = [
  "PERFECT SCORE! You're a CHAMPION! 🏆🎉",
  "FLAWLESS VICTORY! Absolutely LEGENDARY! 👑✨",
  "100%! You're INCREDIBLE! A TRUE MASTER! 🌟💯",
  "PERFECTION! You've achieved GREATNESS! 🎆🏅",
  "OUTSTANDING! You're a SUPERSTAR! 🌠🎊",
];

// Helper function to get 3 random congratulatory messages
export const getCongratulatoryMessage = (starName: string, milestone: number): string[] => {
  if (milestone === 100) {
    // For 100%, pick 3 random messages from the perfect score pool
    const shuffled = [...MILESTONE_100_MESSAGES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(msg => `${starName} celebrates: "${msg}"`);
  }

  // For other milestones, pick 3 random messages from the general pool
  const shuffled = [...CONGRATULATORY_MESSAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(msg => `${starName} says: "${msg}"`);
};
