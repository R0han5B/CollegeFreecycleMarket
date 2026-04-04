import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Starting database seed...');

  // Check if data already exists
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('Database already seeded');
    return;
  }

  // Create demo password
  const demoPassword = await hashPassword('demo123');

  // Create demo users - only Priya and Rahul
  const user1 = await prisma.user.create({
    data: {
      email: 'rahul@rknec.edu',
      password: demoPassword,
      name: 'Rahul Sharma',
      phone: '9876543211',
      isAdmin: false,
      credits: 100,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'priya@rknec.edu',
      password: demoPassword,
      name: 'Priya Singh',
      phone: '9876543212',
      isAdmin: false,
      credits: 150,
    },
  });

  console.log('Created users');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Books', description: 'Textbooks, novels, and reference books' },
    }),
    prisma.category.create({
      data: { name: 'Electronics', description: 'Phones, laptops, and gadgets' },
    }),
    prisma.category.create({
      data: { name: 'Furniture', description: 'Tables, chairs, and room decor' },
    }),
    prisma.category.create({
      data: { name: 'Sports', description: 'Sports equipment and gear' },
    }),
    prisma.category.create({
      data: { name: 'Miscellaneous', description: 'Other items' },
    }),
  ]);

  console.log('Created categories');

  // Create sample items
  await prisma.item.createMany({
    data: [
      {
        title: 'Engineering Mathematics Textbook',
        description: 'Complete Engineering Mathematics textbook for 1st year. Good condition with minimal highlighting.',
        price: 0,
        condition: 'Good',
        categoryId: categories[0].id,
        sellerId: user1.id,
        image: null,
        isFeatured: true,
      },
      {
        title: 'Wireless Bluetooth Headphones',
        description: 'Sony wireless headphones with noise cancellation. Used for 6 months, excellent condition.',
        price: 2500,
        condition: 'Excellent',
        categoryId: categories[1].id,
        sellerId: user2.id,
        image: null,
        isFeatured: true,
      },
      {
        title: 'Study Table with Chair',
        description: 'Wooden study table with comfortable chair. Perfect for hostel rooms.',
        price: 0,
        condition: 'Good',
        categoryId: categories[2].id,
        sellerId: user1.id,
        image: null,
        isFeatured: false,
      },
      {
        title: 'Cricket Bat Complete Set',
        description: 'SS cricket bat with pads, gloves, and helmet. Used for one season.',
        price: 1500,
        condition: 'Good',
        categoryId: categories[3].id,
        sellerId: user2.id,
        image: null,
        isFeatured: false,
      },
      {
        title: 'Digital Camera',
        description: 'Canon DSLR camera with 18-55mm lens. Great for photography enthusiasts.',
        price: 15000,
        condition: 'Excellent',
        categoryId: categories[1].id,
        sellerId: user1.id,
        image: null,
        isFeatured: true,
      },
      {
        title: 'Physics Reference Books Bundle',
        description: 'Complete set of physics reference books for engineering. Halliday Resnick and more.',
        price: 0,
        condition: 'Fair',
        categoryId: categories[0].id,
        sellerId: user2.id,
        image: null,
        isFeatured: false,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('\nDemo Accounts:');
  console.log('================');
  console.log('rahul@rknec.edu / demo123');
  console.log('priya@rknec.edu / demo123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
