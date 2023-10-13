const urlWs = "wss://sharemedia-ws-backend.ernestoyoofi.repl.co/"

const ws = new WebSocket(urlWs)
ws.onmessage = (e) => {
  try {
    const data = JSON.parse(e.data)
    if(data.type === "file.download") {
      const btn = document.createElement('btn')
      btn.innerHTML = `<div class="filebox-icon"><span class="material-symbols-outlined">note_stack</span></div><div class="filebox-name"><p>${data.filename}</p><small>${data.size} / 100%</small></div>`
      btn.className = "filebox"
      btn.setAttribute("onclick", `CreateDownloadFile('${data.url}', '${data.filename}')`)
      document.querySelector('[hasbucket="1"]').appendChild(btn)
    }
    if(data.type === "msgalert") {
      DialogAlert(data.title, data.desc)
    }
    if(data.type === "msg.switchfile") {
      document.body.setAttribute("hasjoin", "1")
      document.body.setAttribute("buckets", data.buckets? "1":"0")
    }
    if(data.type === "msg.statusupdate") {
      document.getElementById('sendfile-status').innerText = `Status: ${data.value}`
    }
    if(data.type === "msg.codesign") {
      DialogAlert(data.title, data.desc, [
        { title: "Reject" },
        { title: "Approve", btn: () => {
          ws.send(JSON.stringify({
            approve_code: data.code
          }))
        }}
      ])
    }
    if(data.type === "msg.codepairing") {
      document.getElementById("codepairing").innerText = data.code
      document.getElementById("usercode").innerText = data.user
    }
  } catch(err) {
    console.log(err.stack)
  }
}

function StartTabContent() {
  const spanTab = document.querySelector('.btn-content')
  const btnClick = document.querySelectorAll('.tab-btn-switch button[btn-function]')
  const tabInflure = document.querySelectorAll('.main-content-code .main-slide')
  btnClick.forEach((z, i) => {
    if(!z.getAttribute("selectbtn")) return;
    spanTab.style.left = `${z.getBoundingClientRect().left}px`
    spanTab.style.width = `${z.clientWidth}px`
  })
  window.addEventListener("resize", (e) => {
    spanTab.style.transition = ".0s"
    btnClick.forEach((z, i) => {
      if(!z.getAttribute("selectbtn")) return;
      spanTab.style.left = `${z.getBoundingClientRect().left}px`
      spanTab.style.width = `${z.clientWidth}px`
      spanTab.style.transition = ".3s"
      const widthDocs = window.innerWidth > 420? 420 : window.innerWidth
      tabInflure[0].style.marginLeft = `-${widthDocs}px`
      tabInflure[1].style.marginLeft = `-${widthDocs-widthDocs}px`
      if(i === 0) {
        tabInflure[0].style.marginLeft = ``
        tabInflure[1].style.marginLeft = `${widthDocs}px`
      }
    })
  })
  btnClick.forEach((z, i) => {
    spanTab.style.transition = ".3s"
    z.addEventListener("click", (e) => {
      if(z.getAttribute("selectbtn")) return;
      btnClick.forEach(z => {
        z.removeAttribute("selectbtn")
      })
      const widthDocs = window.innerWidth > 420? 420 : window.innerWidth
      tabInflure[0].style.marginLeft = `-${widthDocs}px`
      tabInflure[1].style.marginLeft = `-${widthDocs-widthDocs}px`
      if(i === 0) {
        tabInflure[0].style.marginLeft = ``
        tabInflure[1].style.marginLeft = `${widthDocs}px`
      }
      spanTab.style.left = `${z.getBoundingClientRect().left}px`
      spanTab.style.width = `${z.clientWidth}px`
      z.setAttribute("selectbtn", "1")
    })
  })
}
document.getElementById("sendfile").addEventListener("change", (e) => {
  const files = e.target.files[0]

  console.log(files)

  var reader = new FileReader()
  reader.readAsDataURL(files)
  reader.onload = function () {
    ws.send(JSON.stringify({
      sendfile: reader.result,
      size: files.size,
      filename: files.name
    }))
  }
  reader.onerror = function (err) {
    DialogAlert("Error", err.stack)  
  }
})
document.getElementById("input-code-pairing").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]+/g, "").toUpperCase()
  if(e.target.value.length >= 9) {
    e.target.blur()
    ws.send(JSON.stringify({
      enter: e.target.value
    }))
    return DialogAlert(
      "Wait For Connection....",
      `<center><div class="loading-spinner"><svg><circle cx="25" cy="25" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div></center>` 
    )
  }
})
StartTabContent()
window.addEventListener("offline", () => {
  DialogAlert("Internet offline", "Please restart the websocket connection by reload this site",[
    { title: "Reload", btn: () => { location.reload() } }
  ])
})
function CreateDownloadFile(url, name) {
  const linked = document.createElement("a")
  linked.href = url
  linked.download = name
  document.body.appendChild(linked)
  linked.click()
  document.body.removeChild(linked)
}