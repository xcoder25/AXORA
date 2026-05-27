import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference query" }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ error: "Paystack gateway not configured" }, { status: 500 });
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    const data = await verifyResponse.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message || "Verification failed" }, { status: 400 });
    }

    const transactionData = data.data;

    return NextResponse.json({
      success: transactionData.status === "success",
      status: transactionData.status,
      amount: transactionData.amount / 100, // convert back to standard currency amount
      metadata: transactionData.metadata,
      gatewayResponse: transactionData.gateway_response,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
