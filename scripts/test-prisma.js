const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});
prisma.gage.findMany().then(console.log).catch(console.error);
