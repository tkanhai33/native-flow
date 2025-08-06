import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  type: 'appointment' | 'contact';
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: EmailData = await req.json();

    let subject = "";
    let html = "";

    if (type === 'appointment') {
      subject = `New Appointment Request - ${data.service_type}`;
      html = `
        <h2>New Appointment Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Service:</strong> ${data.service_type}</p>
        <p><strong>Preferred Date:</strong> ${data.preferred_date}</p>
        <p><strong>Preferred Time:</strong> ${data.preferred_time}</p>
        ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}
      `;
    } else if (type === 'contact') {
      subject = `New Contact Message${data.subject ? ` - ${data.subject}` : ''}`;
      html = `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
        ${data.subject ? `<p><strong>Subject:</strong> ${data.subject}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Native Flow <alerts@resend.dev>",
      to: ["traviskanhai@gmail.com"],
      subject: subject,
      html: html,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);