const WebSocket = require("ws")

const wss = new WebSocket.Server({ port: process.env.PORT })

const players = {}

console.log("🚀 Server starting...")

wss.on("connection", (ws) => {
  console.log("🟢 CLIENT CONNECTED")

  let playerId = null

  ws.on("message", (msg) => {
    console.log("📩 RAW MESSAGE:", msg.toString())

    let data
    try {
      data = JSON.parse(msg.toString())
      console.log("✅ PARSED:", data)
    } catch (e) {
      console.log("❌ INVALID JSON RECEIVED")
      return
    }

    // Player joins
    if (data.type === "join") {
      playerId = data.name
      console.log("👤 JOIN:", playerId)

      players[playerId] = {
        name: data.name,
        x: 0,
        y: 0,
        world: "default",
        inventory: []
      }

      console.log("📦 PLAYER CREATED:", players[playerId])
    }

    // Player updates
    if (data.type === "update" && playerId) {
      console.log("🔄 UPDATE FROM:", playerId, data)

      players[playerId] = {
        name: data.name,
        x: data.x,
        y: data.y,
        world: data.world,
        inventory: data.inventory
      }
    }

    // Broadcast full state
    const packet = JSON.stringify({
      type: "state",
      players
    })

    console.log("📡 BROADCASTING STATE:", packet)

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(packet)
      }
    })
  })

  ws.on("close", () => {
    console.log("🔴 CLIENT DISCONNECTED")

    if (playerId) {
      console.log("🗑 REMOVING PLAYER:", playerId)
      delete players[playerId]
    }
  })
})

console.log("✅ Server running")
