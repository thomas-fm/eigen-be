import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const books = [
    {
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    },
    {
      code: 'SHR-1',
      title: 'A Study in Scarlet',
      author: 'Arthur Conan Doyle',
      stock: 1,
    },
    {
      code: 'TW-11',
      title: 'Twilight',
      author: 'Stephenie Meyer',
      stock: 1,
    },
    {
      code: 'HOB-83',
      title: 'The Hobbit, or There and Back Again',
      author: 'J.R.R. Tolkien',
      stock: 1,
    },
    {
      code: 'NRN-7',
      title: 'The Lion, the Witch and the Wardrobe',
      author: 'C.S. Lewis',
      stock: 1,
    },
    {
      code: 'MOCK-1',
      title: 'Book Title: Awesome Book',
      author: 'Author 1',
      stock: 10,
    },
    {
      code: 'MOCK-2',
      title: 'Book Title: Cool Book',
      author: 'Author 2',
      stock: 6,
    },
  ];

  await Promise.all(
    books.map(async (book) => {
      await prisma.book.upsert({
        where: { code: book.code },
        update: {},
        create: {
          code: book.code,
          title: book.title,
          author: book.author,
          stock: book.stock,
        },
      });
    }),
  );

  const members = [
    {
      code: 'M001',
      name: 'Angga',
    },
    {
      code: 'M002',
      name: 'Ferry',
    },
    {
      code: 'M003',
      name: 'Putri',
    },
  ];

  await Promise.all(
    members.map(async (member) => {
      await prisma.member.upsert({
        where: { code: member.code },
        update: {},
        create: {
          code: member.code,
          name: member.name,
        },
      });
    }),
  );
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
