type User = {
  email: string;
  password: string;
};

async function writeToFirebase(path: string, data: any): Promise<Response> {
  const url = \`\${FIREBASE_URL}/\${path}.json?auth=\${FIREBASE_SECRET}\`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res;
}

async function readFromFirebase(path: string): Promise<any> {
  const url = \`\${FIREBASE_URL}/\${path}.json?auth=\${FIREBASE_SECRET}\`;
  const res = await fetch(url);
  return res.json();
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/signup") {
      const body = await req.json() as User;

      const user = await readFromFirebase(\`users/\${encodeURIComponent(body.email)}\`);
      if (user) {
        return new Response("User already exists", { status: 400 });
      }

      await writeToFirebase(\`users/\${encodeURIComponent(body.email)}\`, {
        email: body.email,
        password: body.password
      });

      return new Response("User created successfully ✅", { status: 201 });
    }

    if (req.method === "POST" && url.pathname === "/login") {
      const body = await req.json() as User;

      const user = await readFromFirebase(\`users/\${encodeURIComponent(body.email)}\`);

      if (!user || user.password !== body.password) {
        return new Response("Invalid credentials", { status: 401 });
      }

      return new Response("Login successful 🎉", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }
};
