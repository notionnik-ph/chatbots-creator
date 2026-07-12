import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/features/auth/server/require-user";
import { getBillingSummary } from "@/features/billing/server/billing.service";

console.log("[API] /api/v1/me/billing route loaded");

function resolveUserId(user: unknown) {
  const value = user as {
    id?: string;
    userId?: string;
  };

  return value.userId ?? value.id;
}

function getErrorStatus(error: unknown) {
  const value = error as {
    status?: number;
    statusCode?: number;
  };

  return value.status ?? value.statusCode ?? 500;
}

export async function GET(request: NextRequest) {
  console.log("[API] GET /api/v1/me/billing called");

  try {
    const user = await requireUser(request);
    const userId = resolveUserId(user);

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const summary = await getBillingSummary(userId);

    return NextResponse.json({
      data: summary,
    });
  } catch (error) {
    console.error("[API] GET /api/v1/me/billing failed:", error);

    const status = getErrorStatus(error);

    return NextResponse.json(
      {
        error: status === 401 ? "Unauthorized" : "Failed to load billing summary",
      },
      {
        status,
      },
    );
  }
}