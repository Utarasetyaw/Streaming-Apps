import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Godblesme1', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'fineshyt' },
    update: {},
    create: {
      username: 'fineshyt',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    },
  })

  const memberPassword = await bcrypt.hash('member123', 10)
  const member = await prisma.user.upsert({
    where: { username: 'member' },
    update: {},
    create: {
      username: 'member',
      password: memberPassword,
      role: 'USER',
      status: 'ACTIVE'
    },
  })

  console.log('✅ Database seeded successfully (No Plan)!')
  console.log({ admin, member })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })