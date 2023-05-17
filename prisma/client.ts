// Import `prisma` from this file
// Ref: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/instantiate-prisma-client#use-a-single-shared-instance-of-prismaclient

import { PrismaClient } from '@prisma/client'

let prisma = new PrismaClient()

prisma.$on('beforeExit', async () => {
  console.log('Prisma Client is disconnecting...')
})

export default prisma
