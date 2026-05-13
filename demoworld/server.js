const WebSocket = require("ws")

const wss = new WebSocket.Server({ port: process.env.PORT })

const players = {}

wss.on("connection", (ws) => {
  let playerId = null

  ws.on("message", (msg) => {
    let data
    try {
      data = JSON.parse(msg.toString())
    } catch (e) {
      return
    }

    // Player joins
    if (data.type === "join") {
      playerId = data.name

      players[playerId] = {
        name: data.name,
        x: 0,
        y: 0,
        world: "default",
        inventory: []
      }
    }

    // Player updates
    if (data.type === "update" && playerId) {
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

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(packet)
      }
    })
  })

  ws.on("close", () => {
    if (playerId) delete players[playerId]
  })
})

console.log("Server running")
