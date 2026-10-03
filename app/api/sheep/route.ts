import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sheep = await prisma.sheep.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sheep);
  } catch (error) {
    console.error("Error fetching sheep:", error);
    return NextResponse.json(
      { error: "Could not fetch sheep records." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const sheep = await prisma.sheep.create({
      data: {
        tagNumber: String(body.tagNumber ?? ""),
        name: String(body.name ?? ""),
        breed: String(body.breed ?? "Merino"),
        sex: body.sex ?? "EWE",
        ageMonths: Number(body.ageMonths ?? 12),
        weightKg: Number(body.weightKg ?? 0),
        status: body.status ?? "HEALTHY",
        location: String(body.location ?? "North Paddock"),
        lastHealthCheck: body.lastHealthCheck ? new Date(body.lastHealthCheck) : null,
      },
    });

    return NextResponse.json(sheep, { status: 201 });
  } catch (error) {
    console.error("Error creating sheep:", error);
    return NextResponse.json(
      { error: "Could not create sheep record." },
      { status: 500 }
    );
  }
}
