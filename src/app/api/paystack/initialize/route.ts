import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, amount, studentId, schoolId, callbackUrl } = body;

    if (!email || !amount || !schoolId) {
      return NextResponse.json({ error: "Missing required billing parameters" }, { status: 400 });
    }

    // Resolve the Paystack secret key from system environment
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ error: "Paystack gateway not configured on system" }, { status: 500 });
    }

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // convert to absolute subunits (kobo)
        callback_url: callbackUrl || `${req.headers.get("origin")}/dashboard/finance`,
        metadata: {
          studentId,
          schoolId,
          custom_fields: [
            {
              display_name: "Student ID",
              variable_name: "student_id",
              value: studentId,
            },
            {
              display_name: "School ID",
              variable_name: "school_id",
              value: schoolId,
            }
          ]
        }
      }),
    });

    const data = await paystackResponse.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message || "Initialization failed" }, { status: 400 });
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
