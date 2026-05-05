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

    // ✅ EMAIL TO ADMIN
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Mahavir Industries <onboarding@resend.dev>",
        to: ["mahavirindustries44@gmail.com"],  // ✅ FIXED
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

    if (!adminRes.ok) {
      console.error("Admin mail error:", adminData);
      return res.status(500).json({ success: false, error: adminData });
    }

    // ✅ AUTO REPLY TO CUSTOMER
    if (email && email.includes("@")) {

      const userRes = await fetch("https://api.resend.com/emails", {
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

📞 +91 83293 57485

Regards,  
Mahavir Industries
          `
        })
      });

      const userData = await userRes.json();
      console.log("User mail response:", userData);

      if (!userRes.ok) {
        console.error("User mail failed:", userData);
      }
    }

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
