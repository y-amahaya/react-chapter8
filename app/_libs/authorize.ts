import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_libs/supabase";

export const authorize = async (request: NextRequest) => {
  const token = request.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);

  if (error) {
    return NextResponse.json({ status: error.message }, { status: 400 });
  }

  return null;
};