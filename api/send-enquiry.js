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

 // ✅ AUTO REPLY TO CUSTOMER (SAFE VERSION)
if (email && email.includes("@")) {

  const userRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Mahavir Industries <onboarding@resend.dev>",
      to: ["mahavirindustries44@gmail.com"],  // TEMP: send to yourself first
      reply_to: email,  // 👈 IMPORTANT
      subject: `Auto Reply Preview for ${email}`,
      text: `
This is how the customer confirmation email looks:

To: ${email}

Hi ${name},

Thank you for contacting Mahavir Industries.

We have received your enquiry and will contact you within 2–4 hours.

📞 +91 83293 57485

Regards,  
Mahavir Industries
      `
    })
  });

  const userData = await userRes.json();
  console.log("Auto-reply preview:", userData);
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
