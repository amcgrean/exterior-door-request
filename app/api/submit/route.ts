import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { flattenSlabPayload, SlabOnlyPayload } from "@/lib/slabOnly";

const TO_EMAIL = process.env.TO_EMAIL ?? "doors@beisser.cloud";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@beisser.cloud";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  return new Resend(apiKey);
}

function formatRows(entries: Array<[string, string]>) {
  return entries
    .map(
      ([question, answer]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #2a2a2a;color:#9ca3af;font-size:13px;vertical-align:top;width:45%">
            ${question}
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #2a2a2a;color:#f5f5f5;font-size:13px;font-weight:600;vertical-align:top">
            ${answer || "—"}
          </td>
        </tr>`
    )
    .join("");
}

function buildEmailShell({
  title,
  subtitle,
  customerName,
  phone,
  address,
  rows,
}: {
  title: string;
  subtitle: string;
  customerName: string;
  phone: string;
  address: string;
  rows: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:760px;margin:0 auto;padding:32px 16px;">
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:24px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div style="width:40px;height:40px;background:#c8860a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:18px;">B</div>
        <div>
          <p style="margin:0;color:#fff;font-weight:700;font-size:18px;">Beisser Lumber</p>
          <p style="margin:0;color:#6b7280;font-size:13px;">${subtitle}</p>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">Customer</td>
          <td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:13px;">Phone</td>
          <td style="padding:6px 0;color:#fff;font-size:14px;">${phone}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:13px;">Address</td>
          <td style="padding:6px 0;color:#fff;font-size:14px;">${address || "—"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:13px;">Date</td>
          <td style="padding:6px 0;color:#fff;font-size:14px;">${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</td>
        </tr>
      </table>
    </div>

    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;margin-bottom:24px;">
      <div style="padding:16px 20px;border-bottom:1px solid #2a2a2a;">
        <p style="margin:0;color:#fff;font-weight:700;font-size:16px;">${title}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>
    </div>

    <p style="color:#4b5563;font-size:12px;text-align:center;margin:0;">
      Submitted via Beisser Lumber Door Quote Form
    </p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resend = getResendClient();

    if (body.submissionType === "slab_only") {
      const payload = body.payload as SlabOnlyPayload;
      const flatMap = flattenSlabPayload(payload);
      const rows = formatRows([
        ["Submission ID", payload.submission_id],
        ["Template ID", payload.template_id],
        ["Submitted At", payload.submitted_at],
        ...Object.entries(flatMap),
      ]);
      const html = buildEmailShell({
        title: "Slab-Only Custom Door Spec Sheet",
        subtitle: "Slab-only specification submission",
        customerName: payload.customer.full_name || "Unknown",
        phone: payload.customer.phone_number || "",
        address: payload.order.sales_order_number ? `Sales Order # ${payload.order.sales_order_number}` : "",
        rows,
      });
      const text = [
        "Slab-Only Custom Door Spec Sheet",
        `Submission ID: ${payload.submission_id}`,
        `Template ID: ${payload.template_id}`,
        `Submitted At: ${payload.submitted_at}`,
        "",
        ...Object.entries(flatMap).map(([key, value]) => `${key}\n  → ${value || "—"}`),
      ].join("\n\n");

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: `Slab-Only Door Spec — ${payload.customer.full_name || "Unknown"} — ${new Date().toLocaleDateString()}`,
        html,
        text,
      });

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, flatMap });
    }

    const { answers, raw } = body as {
      answers: Record<string, string>;
      raw: Record<string, string | string[]>;
    };

    const customerName = (raw["customerName"] as string) ?? "Unknown";
    const phone = (raw["phone"] as string) ?? "";
    const address = (raw["address"] as string) ?? "";
    const cityStateZip = (raw["cityStateZip"] as string) ?? "";

    const rows = formatRows(Object.entries(answers));
    const html = buildEmailShell({
      title: "Door Specifications",
      subtitle: "New Door Quote Request",
      customerName,
      phone,
      address: `${address}, ${cityStateZip}`,
      rows,
    });

    const text =
      `New Door Quote Request\n\nCustomer: ${customerName}\nPhone: ${phone}\nAddress: ${address}, ${cityStateZip}\nDate: ${new Date().toLocaleDateString()}\n\n---\n\n` +
      Object.entries(answers)
        .map(([q, a]) => `${q}\n  → ${a || "—"}`)
        .join("\n\n");

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: undefined,
      subject: `Door Quote — ${customerName} — ${new Date().toLocaleDateString()}`,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
