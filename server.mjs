import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const distDir = process.env.NEXT_DIST_DIR || (dev ? ".next-custom-server" : ".next");
process.env.NEXT_DIST_DIR = distDir;

const app = next({
  dev,
  hostname,
  port,
  // Turbopack is the Next.js 16 default, but this custom server setup is
  // hitting Windows file-lock EPERM errors in .next during local dev.
  webpack: dev,
});
const handle = app.getRequestHandler();

const userSessions = new Map();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      handle(req, res);
    });

    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("user:join", (userId) => {
        if (!userId) return;

        userSessions.set(socket.id, userId);
        socket.join(`user:${userId}`);
      });

      socket.on("message:send", (data) => {
        if (!data?.receiverId) return;

        io.to(`user:${data.receiverId}`).emit("message:receive", data);
        socket.emit("message:receive", data);
      });

      socket.on("message:read", (data) => {
        if (!data?.userId) return;
        io.to(`user:${data.userId}`).emit("message:read", data);
      });

      socket.on("typing:start", (data) => {
        if (!data?.receiverId || !data?.senderId) return;
        io.to(`user:${data.receiverId}`).emit("typing:start", {
          senderId: data.senderId,
        });
      });

      socket.on("typing:stop", (data) => {
        if (!data?.receiverId || !data?.senderId) return;
        io.to(`user:${data.receiverId}`).emit("typing:stop", {
          senderId: data.senderId,
        });
      });

      socket.on("disconnect", () => {
        userSessions.delete(socket.id);
      });
    });

    server.listen(port, hostname, () => {
      console.log("> Ready");
      console.log(`> Local:   http://localhost:${port}`);
      console.log(`> Network: http://${hostname}:${port}`);
    });

    const shutdown = () => {
      io.close();
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
