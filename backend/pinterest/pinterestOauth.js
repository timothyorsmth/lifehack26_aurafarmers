app.get("/auth/pinterest/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || state !== req.session.pinterestState) {
    return res.status(400).send("Invalid OAuth request");
  }

  const credentials = Buffer
    .from(
      `${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`
    )
    .toString("base64");

  const tokenResponse = await fetch(
    "https://api.pinterest.com/v5/oauth/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.PINTEREST_REDIRECT_URI
      })
    }
  );

  const tokens = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return res.status(400).json(tokens);
  }

  // Store this server-side, associated with your logged-in user.
  req.session.pinterestAccessToken = tokens.access_token;
  req.session.pinterestRefreshToken = tokens.refresh_token;

  res.redirect("/recommendations");
});