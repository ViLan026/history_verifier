import "dotenv/config";

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const BACKEND_BASE_URL = (
  process.env.BACKEND_BASE_URL
).replace(/\/+$/, "");

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "5mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      backend: BACKEND_BASE_URL,
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/evidence-map", async (req, res) => {
    try {
      const content = req.body?.content;

      if (!content || typeof content !== "string" || content.trim().length < 5) {
        res.status(400).json({
          error: "Vui lòng nhập đoạn văn có ít nhất 5 ký tự.",
        });
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      try {
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/v1/evidence-map`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              content: content.trim(),
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");

          console.error(
            `Evidence API error (${response.status}):`,
            errorText
          );

          res.status(response.status >= 500 ? 502 : response.status).json({
            error:
              response.status >= 500
                ? "Dịch vụ tìm nguồn sử liệu đang gặp sự cố."
                : "Yêu cầu tìm nguồn sử liệu không hợp lệ.",
          });

          return;
        }

        res.json(await response.json());
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err?.name === "AbortError") {
          res.status(504).json({
            error: "Quá thời gian phân tích nội dung.",
          });
          return;
        }

        throw err;
      }
    } catch (err) {
      console.error("Proxy error in /api/evidence-map:", err);

      res.status(500).json({
        error: "Không thể kết nối tới dịch vụ tìm nguồn sử liệu.",
      });
    }
  });

  app.post("/api/source-excerpt", async (req, res) => {
    try {
      const { source_id, pdf_pages, text } = req.body;

      if (
        !source_id ||
        !Array.isArray(pdf_pages) ||
        pdf_pages.length === 0 ||
        typeof text !== "string" ||
        !text.trim()
      ) {
        res.status(400).json({ error: "Dữ liệu nguồn sử liệu không hợp lệ." });
        return;
      }

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/v1/sources/${encodeURIComponent(source_id)}/excerpt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pdf_pages,
            text,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error(`Excerpt API error (${response.status}):`, errorText);

        res.status(response.status).json({
          error: "Không thể tạo trích đoạn PDF.",
        });

        return;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Cache-Control", "no-store");

      for (const header of [
        "x-excerpt-start-page",
        "x-excerpt-end-page",
        "x-target-excerpt-page",
        "x-highlight-mode",
      ]) {
        const value = response.headers.get(header);

        if (value) {
          res.setHeader(header, value);
        }
      }

      res.send(buffer);
    } catch (err) {
      console.error("Proxy error in /api/source-excerpt:", err);

      res.status(500).json({
        error: "Không thể kết nối tới dịch vụ PDF.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend server: http://127.0.0.1:${PORT}`);
    console.log(`Backend API: ${BACKEND_BASE_URL}`);
  });
}

startServer();