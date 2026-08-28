import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const BACKEND_BASE_URL = "https://history-verifier-ai-984307638587.asia-southeast1.run.app";
const BACKEND_API_URL = `${BACKEND_BASE_URL}/api/v1/evidence-map`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/evidence-map", async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || typeof content !== "string" || !content.trim()) {
        res.status(400).json({ error: "Nội dung văn bản lịch sử không được để trống." });
        return;
      }

      const trimmedContent = content.trim();

      if (trimmedContent.length < 5) {
        res.status(400).json({ error: "Vui lòng nhập đoạn văn có ít nhất 5 ký tự để phân tích." });
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 75000);

      try {
        const response = await fetch(BACKEND_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ content: trimmedContent }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          console.error(`Upstream API error (${response.status}):`, errorText);

          if (response.status === 422) {
            res.status(422).json({ error: "Dữ liệu gửi lên không hợp lệ hoặc không đúng định dạng." });
            return;
          }

          if (response.status >= 500) {
            res.status(502).json({
              error: "Dịch vụ phân tích lịch sử hiện đang quá tải hoặc gặp sự cố máy chủ. Vui lòng thử lại sau.",
            });
            return;
          }

          res.status(response.status).json({
            error: `Máy chủ trả về lỗi mã ${response.status}. Vui lòng thử lại.`,
          });
        } else {
          res.json(await response.json());
        }
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);

        if (fetchErr.name === "AbortError") {
          res.status(504).json({
            error: "Quá trình phân tích mất nhiều thời gian hơn dự kiến. Vui lòng thử lại hoặc giảm độ dài đoạn văn.",
          });
          return;
        }

        throw fetchErr;
      }
    } catch (err) {
      console.error("Proxy error in /api/evidence-map:", err);
      res.status(500).json({
        error: "Không thể kết nối tới dịch vụ tìm nguồn sử liệu. Vui lòng kiểm tra kết nối mạng và thử lại.",
      });
    }
  });

  app.get(["/api/source-pdf", "/api/sources/:source_id/pdf"], async (req, res) => {
    try {
      const sourceId = (req.params.source_id || req.query.source_id) as string;

      if (!sourceId || typeof sourceId !== "string" || !sourceId.trim()) {
        res.status(400).json({ error: "Thiếu mã nguồn sử liệu (source_id)." });
        return;
      }

      const upstreamUrl = `${BACKEND_BASE_URL}/api/v1/sources/${encodeURIComponent(sourceId.trim())}/pdf`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(upstreamUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          console.error(`Upstream PDF API error (${response.status}):`, errorText);

          res.status(response.status).json({
            error: `Không thể tải tệp PDF cho nguồn '${sourceId}'. Mã lỗi: ${response.status}`,
          });
          return;
        }

        res.json(await response.json());
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);

        if (fetchErr.name === "AbortError") {
          res.status(504).json({ error: "Quá thời gian kết nối tới máy chủ PDF." });
          return;
        }

        throw fetchErr;
      }
    } catch (err) {
      console.error("Proxy error in /api/source-pdf:", err);
      res.status(500).json({ error: "Không thể kết nối tới dịch vụ thư tịch PDF." });
    }
  });

  app.post("/api/source-evidence-view", async (req, res) => {
    try {
      const { source_id, pages, text } = req.body;

      if (
        !source_id ||
        typeof source_id !== "string" ||
        !Array.isArray(pages) ||
        pages.length === 0 ||
        typeof text !== "string" ||
        !text.trim()
      ) {
        res.status(400).json({ error: "Thiếu dữ liệu nguồn sử liệu." });
        return;
      }

      const upstreamUrl = `${BACKEND_BASE_URL}/sources/${encodeURIComponent(source_id.trim())}/evidence-view`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(upstreamUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            pages,
            text: text.trim(),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          console.error(`Upstream evidence-view error (${response.status}):`, errorText);

          res.status(response.status).json({
            error: `Không thể tải dữ liệu trang sử liệu. Mã lỗi: ${response.status}`,
          });
          return;
        }

        res.json(await response.json());
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);

        if (fetchErr.name === "AbortError") {
          res.status(504).json({ error: "Quá thời gian tải dữ liệu trang sử liệu." });
          return;
        }

        throw fetchErr;
      }
    } catch (err) {
      console.error("Proxy error in /api/source-evidence-view:", err);
      res.status(500).json({ error: "Không thể kết nối tới dịch vụ hiển thị sử liệu." });
    }
  });

  app.get("/api/source-page-image", async (req, res) => {
    try {
      const sourceId = req.query.source_id as string;
      const page = Number(req.query.page);

      if (!sourceId || typeof sourceId !== "string" || !Number.isInteger(page) || page < 1) {
        res.status(400).json({ error: "source_id hoặc page không hợp lệ." });
        return;
      }

      const upstreamUrl = `${BACKEND_BASE_URL}/sources/${encodeURIComponent(sourceId.trim())}/pages/${page}/image`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(upstreamUrl, {
          method: "GET",
          headers: { Accept: "image/png" },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          console.error(`Upstream page-image error (${response.status}):`, errorText);

          res.status(response.status).json({
            error: `Không thể tải ảnh trang sử liệu. Mã lỗi: ${response.status}`,
          });
          return;
        }

        const imageBuffer = Buffer.from(await response.arrayBuffer());

        res.setHeader("Content-Type", response.headers.get("content-type") || "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(imageBuffer);
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);

        if (fetchErr.name === "AbortError") {
          res.status(504).json({ error: "Quá thời gian tải ảnh trang sử liệu." });
          return;
        }

        throw fetchErr;
      }
    } catch (err) {
      console.error("Proxy error in /api/source-page-image:", err);
      res.status(500).json({ error: "Không thể tải ảnh trang sử liệu." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();