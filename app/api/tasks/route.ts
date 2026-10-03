import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.farmTask.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Could not fetch tasks." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const task = await prisma.farmTask.create({
      data: {
        title: String(body.title ?? "Farm task"),
        detail: String(body.detail ?? ""),
        priority: String(body.priority ?? "Medium"),
        status: String(body.status ?? "Open"),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Could not create task." },
      { status: 500 }
    );
  }
}
