import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const e = String(email ?? "")
      .toLowerCase()
      .trim();
    const p = String(password ?? "");

    if (!e || !p || p.length < 8) {
      return NextResponse.json(
        { error: "Use a valid email and password (8+ chars)." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: e },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(p, 10);

    await prisma.user.create({
      data: {
        email: e,
        passwordHash: passwordHash,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Prisma Error during registration:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
