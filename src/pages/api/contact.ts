import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

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
        INSERT INTO responses (
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