import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    // Check if data already exists
    const existingUsers = await db.user.count();
    if (existingUsers > 0) {
      return NextResponse.json(
        { message: 'Database already seeded' },
        { status: 200 }
      );
    }

    // Create demo users
    const demoPassword = await hashPassword('demo123');

    const adminUser = await db.user.create({
      data: {
        email: 'admin@rknec.edu',
        password: demoPassword,
        name: 'Admin User',
        phone: '9876543210',
        isAdmin: true,
        credits: 1000,
      },
    });

    const user1 = await db.user.create({
      data: {
        email: 'rahul@rknec.edu',
        password: demoPassword,
        name: 'Rahul Sharma',
        phone: '9876543211',
        isAdmin: false,
        credits: 100,
      },
    });

    const user2 = await db.user.create({
      data: {
        email: 'priya@rknec.edu',
        password: demoPassword,
        name: 'Priya Singh',
        phone: '9876543212',
        isAdmin: false,
        credits: 150,
      },
    });

    const user3 = await db.user.create({
      data: {
        email: 'amit@rknec.edu',
        password: demoPassword,
        name: 'Amit Kumar',
        phone: '9876543213',
        isAdmin: false,
        credits: 80,
      },
    });

    // Create categories
    const categories = await Promise.all([
      db.category.create({
        data: { name: 'Books', description: 'Textbooks, novels, and reference books' },
      }),
      db.category.create({
        data: { name: 'Electronics', description: 'Phones, laptops, and gadgets' },
      }),
      db.category.create({
        data: { name: 'Furniture', description: 'Tables, chairs, and room decor' },
      }),
      db.category.create({
        data: { name: 'Sports', description: 'Sports equipment and gear' },
      }),
      db.category.create({
        data: { name: 'Miscellaneous', description: 'Other items' },
      }),
    ]);

    // Create sample items
    await db.item.createMany({
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
          price: 50,
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
          sellerId: user3.id,
          image: null,
          isFeatured: false,
        },
        {
          title: 'Cricket Bat Complete Set',
          description: 'SS cricket bat with pads, gloves, and helmet. Used for one season.',
          price: 30,
          condition: 'Good',
          categoryId: categories[3].id,
          sellerId: user1.id,
          image: null,
          isFeatured: false,
        },
        {
          title: 'Digital Camera',
          description: 'Canon DSLR camera with 18-55mm lens. Great for photography enthusiasts.',
          price: 80,
          condition: 'Excellent',
          categoryId: categories[1].id,
          sellerId: user2.id,
          image: null,
          isFeatured: true,
        },
        {
          title: 'Physics Reference Books Bundle',
          description: 'Complete set of physics reference books for engineering. Halliday Resnick and more.',
          price: 0,
          condition: 'Fair',
          categoryId: categories[0].id,
          sellerId: user3.id,
          image: null,
          isFeatured: false,
        },
      ],
    });

    return NextResponse.json({
      message: 'Database seeded successfully',
      users: ['admin@rknec.edu', 'rahul@rknec.edu', 'priya@rknec.edu', 'amit@rknec.edu'],
      password: 'demo123',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
