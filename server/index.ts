import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { load } from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // ================================
  // GET WEBSITE NAME
  // ================================
  app.get("/api/metadata", async (req, res) => {
    try {
      const rawUrl = String(req.query.url || "").trim();

      if (!rawUrl) {
        return res.status(400).json({
          error: "URL is required",
        });
      }

      const url = /^https?:\/\//i.test(rawUrl)
        ? rawUrl
        : `https://${rawUrl}`;

      new URL(url);

      console.log("Fetching:", url);

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
        },
      });

      if (!response.ok) {
        return res.status(400).json({
          error: "Could not fetch website",
        });
      }

      const html = await response.text();

      const $ = load(html);

      const title =
        $("meta[property='og:site_name']").attr("content")?.trim() ||
        $("title").text().trim() ||
        new URL(url).hostname.replace(/^www\./, "");

      console.log("Found name:", title);

      return res.json({
        name: title,
        url,
      });
    } catch (error) {
      console.error("Metadata error:", error);

      return res.status(400).json({
        error: "Could not fetch website information",
      });
    }
  });

  // ================================
  // SPA FALLBACK
  // MUST BE LAST
  // ================================
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`);
  });
}

startServer().catch(console.error);