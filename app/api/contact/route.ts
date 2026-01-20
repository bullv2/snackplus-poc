import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!resend) {
      console.error("RESEND_API_KEY is not configured")
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, email, phone, message } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Send email using Resend
    // Note: Domain must be fully verified in Resend dashboard with DNS records
    const { data, error } = await resend.emails.send({
      from: "no-reply@westartup.io", // Must match verified domain exactly (without display name for testing)
      to: ["info@neologism.cc"],
      subject: `New Consultation Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1ba845;">New Consultation Request</h2>
          <p>You have received a new consultation request from the SNACK+ website.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
            ${message ? `<p><strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>` : ""}
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from the SNACK+ contact form.
          </p>
        </div>
      `,
      text: `
New Consultation Request

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}
${message ? `Message:\n${message}` : ""}
      `.trim(),
    })

    if (error) {
      console.error("Resend error details:", JSON.stringify(error, null, 2))
      return NextResponse.json(
        { 
          error: error.message || "Failed to send email",
          details: error,
          troubleshooting: "Ensure westartup.io is verified in Resend dashboard with all DNS records (SPF, DKIM, DMARC) added and propagated."
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

