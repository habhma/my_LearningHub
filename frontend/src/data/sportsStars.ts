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

// Helper function to get random congratulatory messages
export const getCongratulatoryMessage = (starName: string, milestone: number): string => {
  const messages: string[] = [
    `${starName} says: "Amazing! You're on fire! 🔥"`,
    `${starName} cheers: "Keep up the excellent work! 🌟"`,
    `${starName} applauds: "You're unstoppable! 💪"`,
    `${starName} celebrates: "Brilliant performance! 🎉"`,
    `${starName} motivates: "You're crushing it! 🚀"`,
  ];

  if (milestone === 100) {
    return `${starName} celebrates: "PERFECT SCORE! You're a CHAMPION! 🏆🎉"`;
  }

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex] ?? messages[0] ?? `${starName} says: "Great job!"`;
};
