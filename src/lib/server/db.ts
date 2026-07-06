import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

// Reuse a single PrismaClient across HMR reloads in dev so we don't
// exhaust the Postgres connection pool by creating a new client per reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: dev ? ['warn', 'error'] : ['error']
	});

if (dev) globalForPrisma.prisma = prisma;
