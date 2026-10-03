import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.farmTask.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.healthCheck.deleteMany();
  await prisma.sheep.deleteMany();

  const sheep = await prisma.sheep.createMany({
    data: [
      {
        tagNumber: "S-104",
        name: "Mabel",
        breed: "Merino",
        sex: "EWE",
        ageMonths: 36,
        weightKg: 63,
        status: "HEALTHY",
        location: "North Paddock",
        lastHealthCheck: new Date("2026-08-12T00:00:00.000Z"),
      },
      {
        tagNumber: "S-218",
        name: "Bramble",
        breed: "Dorper",
        sex: "RAM",
        ageMonths: 48,
        weightKg: 81,
        status: "MONITORING",
        location: "Breeding Yard",
        lastHealthCheck: new Date("2026-08-10T00:00:00.000Z"),
      },
      {
        tagNumber: "S-334",
        name: "Poppy",
        breed: "Suffolk",
        sex: "LAMB",
        ageMonths: 12,
        weightKg: 29,
        status: "HEALTHY",
        location: "Lambing Pen",
        lastHealthCheck: new Date("2026-08-08T00:00:00.000Z"),
      },
    ],
  });

  await prisma.farmTask.createMany({
    data: [
      {
        title: "Vaccination round",
        detail: "12 sheep due this week",
        priority: "High",
        status: "Open",
      },
      {
        title: "Pasture rotation",
        detail: "North paddock ready for grazing",
        priority: "Medium",
        status: "Open",
      },
      {
        title: "Weaning check",
        detail: "Review 7 lambs after feed change",
        priority: "Medium",
        status: "Open",
      },
    ],
  });

  console.log(`Seeded ${sheep.count} sheep records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
