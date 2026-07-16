import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { Resend } from "resend";

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  property_address?: string;
  message?: string;
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as ContactRequest;

    const {
      name,
      email,
      phone,
      property_address,
      message,
    } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({
          error: "Name and email are required.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    await env.DB
      .prepare(
        `
        INSERT INTO leads (
          name,
          email,
          phone,
          property_address,
          message
        )
        VALUES (?, ?, ?, ?, ?)
        `
      )
      .bind(
        name,
        email,
        phone ?? "",
        property_address ?? "",
        message ?? ""
      )
      .run();
      // const resend = new Resend(env.RESEND_API_KEY);

      // await resend.emails.send({
      //   from: "Urban Property Group <onboarding@resend.dev>",
      //   to: ["YOUR_EMAIL_HERE"],
      //   subject: "New Property Management Inquiry",
      //   html: `
      //     <h2>New Website Inquiry</h2>

      //     <p><strong>Name:</strong> ${name}</p>
      //     <p><strong>Email:</strong> ${email}</p>
      //     <p><strong>Phone:</strong> ${phone ?? "Not provided"}</p>
      //     <p><strong>Property:</strong> ${property_address ?? "Not provided"}</p>

      //     <h3>Message</h3>
      //     <p>${message ?? "No message provided"}</p>
      //   `,
      // });
    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};