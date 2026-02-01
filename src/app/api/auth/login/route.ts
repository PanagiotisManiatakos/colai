import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

const COOKIE_NAME = "amsa_token";
const USER_COOKIE = "amsa_user";

function base64urlEncode(obj: unknown) {
    return Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
}


export async function POST(req: Request) {
    const body = (await req.json()) as { username?: string; password?: string };

    const username = (body.username ?? "").trim();
    const password = body.password ?? "";

    if (username.length < 2 || password.length < 2) {
        return NextResponse.json({ ok: false, message: "Invalid credentials payload." }, { status: 400 });
    }

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) {
        return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL." }, { status: 500 });
    }

    const res = await axios.post(
        `${baseUrl}/api/login`,
        { username, password },
        { validateStatus: () => true, }
    );

    const data = res.data;

    const backendStatusCode = Number(data?.statusCode);
    const token = data.accessToken;
    const expiresIn = data.expiresIn;

    if (Number.isFinite(backendStatusCode) && backendStatusCode !== 200) {
        return NextResponse.json(
            { ok: false, message: data?.message ?? "Login failed." },
            { status: 401 }
        );
    }

    if (!token) {
        return NextResponse.json(
            { ok: false, message: data?.message ?? "Login failed." },
            { status: 401 }
        );
    }

    // Cookie options
    const jar = cookies();
    (await jar).set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // important for local dev
        sameSite: "lax",
        path: "/",
        maxAge: expiresIn,
    });

    (await jar).set(USER_COOKIE, base64urlEncode(data.userInfos), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: expiresIn,
    });

    return NextResponse.json({ ok: true, ...data });
}
