import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Phetmongkhon Rungrat",
    studentId: "660610781",
  });
};
