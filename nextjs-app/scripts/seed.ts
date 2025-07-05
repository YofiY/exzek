import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create test employer
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const employer = await prisma.user.upsert({
    where: { email: 'employer@test.com' },
    update: {},
    create: {
      email: 'employer@test.com',
      password: hashedPassword,
      type: 'employer',
      name: 'Test Employer'
    }
  })

  const employee = await prisma.user.upsert({
    where: { email: 'employee@test.com' },
    update: {},
    create: {
      email: 'employee@test.com',
      password: hashedPassword,
      type: 'employee',
      name: 'Test Employee'
    }
  })

  console.log('✅ Test users created:')
  console.log('👔 Employer:', employer.email)
  console.log('👤 Employee:', employee.email)
  console.log('🔑 Password for both: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
