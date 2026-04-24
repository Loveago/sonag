import { PrismaClient, Role, CourseStatus, Difficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@learnify.dev';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  const hashed = await bcrypt.hash(adminPass, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashed,
      role: Role.ADMIN,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'alex@learnify.dev' },
    update: {},
    create: {
      email: 'alex@learnify.dev',
      name: 'Alex Johnson',
      password: await bcrypt.hash('password123', 10),
      role: Role.USER,
    },
  });

  const courses = [
    {
      title: 'Intro to HTML & CSS (Free)',
      summary: 'Start your coding journey with the building blocks of the web — for free.',
      description: 'Everything you need to build your first website. Semantic HTML, modern CSS layout (Flexbox & Grid), and accessibility fundamentals.',
      category: 'Web Development',
      difficulty: Difficulty.BEGINNER,
      price: 0,
      thumbnail: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=1200&q=80',
      rating: 4.6, ratingCount: 2400, studentCount: 9800,
      sections: [
        { title: '1. Welcome', lessons: ['How the Web Works', 'Tooling & Editors', 'Your First Page'] },
        { title: '2. HTML Essentials', lessons: ['Semantic Tags', 'Forms', 'Accessibility'] },
        { title: '3. CSS Essentials', lessons: ['Selectors', 'Flexbox', 'Grid', 'Responsive Design'] },
      ],
    },
    {
      title: 'Complete Web Development Bootcamp',
      summary: 'HTML, CSS, JavaScript, React, Node.js and more — go from zero to hired.',
      description: 'A full-stack bootcamp covering modern web development end-to-end. Includes capstone projects and career coaching.',
      category: 'Web Development',
      difficulty: Difficulty.BEGINNER,
      price: 49,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
      rating: 4.8, ratingCount: 1300, studentCount: 2543,
      sections: [
        { title: '1. Introduction', lessons: ['Course Overview', 'Setting up the Environment', 'How the Web Works'] },
        { title: '2. HTML Basics', lessons: ['HTML Elements', 'Attributes and Properties', 'Forms and Inputs'] },
        { title: '3. CSS Fundamentals', lessons: ['Introduction to CSS', 'Selectors and Specificity', 'Box Model'] },
        { title: '4. JavaScript Essentials', lessons: ['Variables and Types', 'Functions', 'DOM Manipulation'] },
      ],
    },
    {
      title: 'UI/UX Design Masterclass',
      summary: 'Figma, design principles, prototyping, and patterns from real products.',
      description: 'Learn to design beautiful interfaces that users love. Includes a real-world capstone and design system.',
      category: 'Design',
      difficulty: Difficulty.INTERMEDIATE,
      price: 39,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1200&q=80',
      rating: 4.7, ratingCount: 980, studentCount: 1870,
      sections: [
        { title: '1. Design Foundations', lessons: ['Typography', 'Color Theory', 'Spacing & Layout'] },
        { title: '2. Figma Deep Dive', lessons: ['Components', 'Auto Layout', 'Variants & Tokens'] },
      ],
    },
    {
      title: 'JavaScript Advanced Concepts',
      summary: 'Deep dive into closures, ES6+, patterns, and performance.',
      description: 'Master the language that powers the web. This is the course that takes you from intermediate to senior.',
      category: 'Programming',
      difficulty: Difficulty.ADVANCED,
      price: 29,
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1200&q=80',
      rating: 4.9, ratingCount: 1100, studentCount: 1256,
      sections: [
        { title: '1. Core', lessons: ['Execution Context', 'Closures', 'this & bind'] },
        { title: '2. Async', lessons: ['Promises', 'async/await', 'Event Loop'] },
        { title: '3. Patterns', lessons: ['Modules', 'Functional Patterns', 'Performance'] },
      ],
    },
    {
      title: 'Python for Data Science',
      summary: 'NumPy, Pandas, Matplotlib, Machine Learning basics.',
      description: 'Become a data-driven developer with Python. Hands-on notebooks, datasets, and end-to-end projects.',
      category: 'Data Science',
      difficulty: Difficulty.INTERMEDIATE,
      price: 45,
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&q=80',
      rating: 4.8, ratingCount: 820, studentCount: 1100,
      sections: [
        { title: '1. Python Essentials', lessons: ['Syntax', 'Data Structures', 'Control Flow'] },
        { title: '2. Data Tooling', lessons: ['NumPy', 'Pandas', 'Matplotlib'] },
      ],
    },
    {
      title: 'React.js Complete Guide',
      summary: 'Hooks, Context, Router, Redux and advanced patterns.',
      description: 'The only React course you will ever need. Build 5 real apps including a full social media clone.',
      category: 'Web Development',
      difficulty: Difficulty.INTERMEDIATE,
      price: 59,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80',
      rating: 4.8, ratingCount: 1540, studentCount: 980,
      sections: [
        { title: '1. Fundamentals', lessons: ['JSX', 'Components', 'Props & State'] },
        { title: '2. Hooks', lessons: ['useState', 'useEffect', 'Custom Hooks'] },
        { title: '3. State Management', lessons: ['Context API', 'Redux Toolkit', 'Zustand'] },
      ],
    },
    {
      title: 'Mobile App Design with Figma',
      summary: 'Design mobile apps that users love. iOS / Android patterns.',
      description: 'Mobile-first design from wireframe to polished prototype with animations and micro-interactions.',
      category: 'Design',
      difficulty: Difficulty.BEGINNER,
      price: 19,
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80',
      rating: 4.7, ratingCount: 430, studentCount: 720,
      sections: [
        { title: '1. Mobile Fundamentals', lessons: ['Platforms', 'Gestures', 'Navigation'] },
        { title: '2. Prototyping', lessons: ['Interactions', 'Smart Animate', 'Handoff'] },
      ],
    },
    {
      title: 'DevOps with Docker & Kubernetes',
      summary: 'Containers, orchestration, CI/CD, and production monitoring.',
      description: 'Ship modern applications reliably. Covers Docker, Kubernetes, GitHub Actions, and observability.',
      category: 'DevOps',
      difficulty: Difficulty.ADVANCED,
      price: 79,
      thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=80',
      rating: 4.7, ratingCount: 610, studentCount: 520,
      sections: [
        { title: '1. Containers', lessons: ['Docker Basics', 'Dockerfiles', 'Compose'] },
        { title: '2. Kubernetes', lessons: ['Pods & Deployments', 'Services', 'Ingress & Helm'] },
        { title: '3. CI/CD', lessons: ['GitHub Actions', 'Blue/Green & Canary', 'Monitoring with Prometheus'] },
      ],
    },
    {
      title: 'Machine Learning A-Z',
      summary: 'Regression, classification, neural networks. Hands-on with Python & PyTorch.',
      description: 'From linear regression to deep learning with PyTorch. Projects include image classification and NLP sentiment analysis.',
      category: 'Data Science',
      difficulty: Difficulty.ADVANCED,
      price: 129,
      thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80',
      rating: 4.9, ratingCount: 2100, studentCount: 4100,
      sections: [
        { title: '1. Foundations', lessons: ['Linear Algebra Refresher', 'Probability', 'Optimization'] },
        { title: '2. Classical ML', lessons: ['Regression', 'Classification', 'Tree Models'] },
        { title: '3. Deep Learning', lessons: ['Neural Nets', 'CNNs', 'Transformers intro'] },
      ],
    },
    {
      title: 'iOS Development with Swift & SwiftUI',
      summary: 'Build beautiful native iOS apps with SwiftUI, Combine, and the App Store flow.',
      description: 'From Swift basics to submitting a polished app to the App Store. Real apps, real Swift.',
      category: 'Mobile',
      difficulty: Difficulty.INTERMEDIATE,
      price: 69,
      thumbnail: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=1200&q=80',
      rating: 4.6, ratingCount: 340, studentCount: 520,
      sections: [
        { title: '1. Swift', lessons: ['Syntax', 'Optionals', 'Protocols'] },
        { title: '2. SwiftUI', lessons: ['Views', 'State & Binding', 'Navigation'] },
      ],
    },
    {
      title: 'Startup Marketing Fundamentals',
      summary: 'Positioning, growth loops, paid ads, and content for early-stage startups.',
      description: 'The playbook used by successful founders to go from zero to first 1,000 customers.',
      category: 'Business',
      difficulty: Difficulty.BEGINNER,
      price: 24,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
      rating: 4.5, ratingCount: 220, studentCount: 480,
      sections: [
        { title: '1. Positioning', lessons: ['ICP', 'Value Prop', 'Messaging'] },
        { title: '2. Acquisition', lessons: ['Content', 'Paid Ads', 'SEO basics'] },
      ],
    },
    {
      title: 'AWS Solutions Architect Prep',
      summary: 'Everything you need to pass the AWS SAA-C03 exam with confidence.',
      description: 'Covers compute, networking, storage, databases, security, and exam-style practice questions.',
      category: 'Cloud',
      difficulty: Difficulty.ADVANCED,
      price: 199,
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
      rating: 4.8, ratingCount: 3100, studentCount: 7200,
      sections: [
        { title: '1. Core Services', lessons: ['EC2 & Lambda', 'S3 & EBS', 'VPC & Networking'] },
        { title: '2. Architecture', lessons: ['High Availability', 'Cost Optimization', 'Security'] },
        { title: '3. Exam Prep', lessons: ['Practice Exam 1', 'Practice Exam 2', 'Tips & Gotchas'] },
      ],
    },
  ];

  for (const c of courses) {
    const course = await prisma.course.upsert({
      where: { slug: slugify(c.title) },
      update: {},
      create: {
        title: c.title,
        slug: slugify(c.title),
        summary: c.summary,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        price: c.price,
        isFree: c.price === 0,
        thumbnail: c.thumbnail,
        status: CourseStatus.PUBLISHED,
        rating: c.rating,
        ratingCount: c.ratingCount,
        studentCount: c.studentCount,
      },
    });

    let secOrder = 0;
    for (const s of c.sections) {
      const section = await prisma.section.create({
        data: { title: s.title, order: secOrder++, courseId: course.id },
      });
      let lesOrder = 0;
      for (const title of s.lessons) {
        await prisma.lesson.create({
          data: {
            title,
            order: lesOrder++,
            duration: 600 + Math.floor(Math.random() * 900),
            videoUrl:
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            sectionId: section.id,
            content:
              'In this lesson you will learn the key concepts with hands-on examples and exercises.',
          },
        });
      }
    }
  }

  // Enroll demo user in the first 2 courses
  const pubCourses = await prisma.course.findMany({ take: 2 });
  for (const c of pubCourses) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: demoUser.id, courseId: c.id } },
      update: {},
      create: {
        userId: demoUser.id,
        courseId: c.id,
        progress: Math.floor(Math.random() * 80),
      },
    });
  }

  console.log('Seed complete.');
  console.log('Admin:', adminEmail, '/', adminPass);
  console.log('Demo user: alex@learnify.dev / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
