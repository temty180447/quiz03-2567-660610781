import { DB, readDB, writeDB, Payload } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  readDB();

  const roomId = request.nextUrl.searchParams.get("roomId");
  const foundRoom = DB.rooms.find((rom) => rom.roomId === roomId);

  if (!foundRoom) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const messages = DB.messages.filter((mass) => mass.roomId === roomId);

  return NextResponse.json(
    {
      ok: true,
      messages
    }
  )
};

export const POST = async (request: NextRequest) => {
  readDB();
  const body = await request.json()
  const { roomId, messageText } = body

  const foundRoom = DB.rooms.find((rom) => rom.roomId === roomId);

  if (!foundRoom) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const messageId = nanoid();

  DB.messages.push({
    roomId,
    messageId,
    messageText
  })
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request: NextRequest) => {
  let role = null;

  try {
    const payload = checkToken();

    role = (<Payload>payload).role

  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  if (role !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  readDB();

  const body = await request.json();
  const { messageId } = body;
  const messageIndex = DB.messages.findIndex((mass) => mass.messageId === messageId);

  if (messageIndex === -1) {
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }

  DB.messages.splice(messageIndex, 1);

  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};