const express = require("express")
const cors = require("cors")
const { WebSocketServer } = require("ws")
const RandomID = (id, lg = "hex") => require("crypto").randomBytes(id).toString(lg)
const port = process.env.PORT || 3000

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const app = express()
app.use(cors())
// app.on("upgrade", function upgrade(req, sock, head) {
//   console.log("Connect...")
//   wss.handleUpgrade(req, sock, head, function done(ws) {
//     wss.emit("connection", ws, req)
//   })
// })
app.get("*", (req, res) => {
  res.json({ message: "What are you looking for here?" })
})

const server = app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})

const wss = new WebSocketServer({ server })
let sockets = {}
wss.on("connection", (ws, req) => {
  if(req.headers["user-agent"].length < 10) return;
  let roomAdd = {
    code: RandomID(5).slice(0, 9).toUpperCase(),
    user: req.headers["user-agent"],
    bucket: ws,
    transfer: null,
    dwn: null
  }
  sockets[roomAdd.code] = roomAdd
  ws.send(JSON.stringify({ code: roomAdd.code, user: roomAdd.user, type: "msg.codepairing" }))
  ws.on("close", () => {
    delete sockets[roomAdd.code]
  })
  ws.on("message", (dts) => {
    try {
      const data = JSON.parse(dts.toString())
      if(data.enter) {
        if(data.enter === roomAdd.code) {
          return ws.send(JSON.stringify({ type: "msgalert", title: "Error Connect", desc: "Can't fill same code in tab browser, only input another code" }))
        }
        if(!sockets[data.enter]) {
          return ws.send(JSON.stringify({ type: "msgalert", title: "Error Connect", desc: "There is no code or device connected to this code" }))
        }
        if(sockets[data.enter].transfer) {
          return ws.send(JSON.stringify({ type: "msgalert", title: "Error Connect", desc: "Someone has joined this code, you cannot send files to this code" }))
        }
        sockets[data.enter].bucket.send(JSON.stringify({ type: "msg.codesign", title: "Request to join", desc: `Someone with code ${roomAdd.code} requests to send files to you with device code ${roomAdd.user}`, code: roomAdd.code, user: roomAdd.user }))
      }
      if(data.approve_code) {
        if(sockets[data.approve_code].transfer) {
          return ws.send(JSON.stringify({ type: "msgalert", title: "Error Connect", desc: "Failed to receive the device" })) 
        }
        roomAdd.transfer = sockets[data.approve_code].bucket
        sockets[roomAdd.code] = sockets[data.approve_code].bucket
        sockets[data.approve_code].dwn = roomAdd.bucket
        roomAdd.transfer.send(JSON.stringify({ type: "msg.switchfile" }))
        roomAdd.bucket.send(JSON.stringify({ type: "msg.switchfile", buckets: true }))
      }
      if(data.sendfile) {
        roomAdd.bucket.send(JSON.stringify({ type: "msg.statusupdate", value: 100 }))
        roomAdd.dwn.send(JSON.stringify({ type: "file.download", url: data.sendfile, filename: data.filename, size: formatBytes(data.size) }))
      }
      console.log(data)
    } catch(err) {
      return ;
    }
  })
})