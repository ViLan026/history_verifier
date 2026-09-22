import "dotenv/config";

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const BACKEND_BASE_URL = (
  process.env.BACKEND_BASE_URL || "http://127.0.0.1:8080"
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
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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

  app.get("/api/sources/:source_id/pdf", async (req, res) => {
    try {
      const sourceId = req.params.source_id?.trim();

      if (!sourceId) {
        res.status(400).json({
          error: "Thiếu mã nguồn sử liệu.",
        });
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/v1/sources/${encodeURIComponent(sourceId)}/pdf`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");

          console.error(
            `PDF source API error (${response.status}):`,
            errorText
          );

          res.status(response.status).json({
            error: `Không thể lấy PDF cho nguồn '${sourceId}'.`,
          });

          return;
        }

        res.json(await response.json());
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err?.name === "AbortError") {
          res.status(504).json({
            error: "Quá thời gian tải thông tin PDF.",
          });
          return;
        }

        throw err;
      }
    } catch (err) {
      console.error("Proxy error in PDF source:", err);

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