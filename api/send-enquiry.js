export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, phone, message, source } = req.body;

  // Basic validation
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: "Name and phone are required" });
  }

  try {

    // ✅ EMAIL TO YOU (ADMIN)
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Mahavir Industries <onboarding@resend.dev>",
        to: ["mahavirindustries44@gmail.com"],
        subject: `🔥 New Enquiry (${source})`,
        text: `
New Enquiry Received

Source: ${source}

Name: ${name}
Email: ${email || "Not provided"}
Phone: ${phone}

Message:
${message || "No message"}
        `
      })
    });

    const adminData = await adminRes.json();

    // ❌ If admin mail fails → stop
    if (!adminRes.ok) {
      console.error("Admin mail error:", adminData);
      return res.status(500).json({ success: false, error: adminData });
    }

    // ✅ AUTO REPLY TO CUSTOMER
    if (email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Mahavir Industries <onboarding@resend.dev>",
          to: [email],
          subject: "✅ We received your enquiry – Mahavir Industries",
          text: `
Hi ${name},

Thank you for contacting Mahavir Industries.

We have received your enquiry and our team will contact you within 2–4 business hours.

📞 For urgent requirements:
+91 83293 57485

📍 Address:
XL-42, MIDC Ambad, Nashik – 422010

We look forward to working with you.

Regards,  
Mahavir Industries
          `
        })
      });
    }

    // ✅ SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "Emails sent successfully"
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
}
