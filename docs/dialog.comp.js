/**
 * CODE FORM PESANKU.ID ELEMENT OF SITE
 * https://pesankuid.vercel.app
 */
function DialogAlert(title, texthtml, button=[{ title: "Ok" }]) {
  let boxDialog = document.getElementById("app.dialog")
  if(!boxDialog) {
    console.log("Create Box Dialog...")
    boxDialog = document.createElement("div")
    boxDialog.id = "app.dialog"
    document.body.appendChild(boxDialog)
  }
  const _cover = document.createElement("div")
  _cover.className = "app--alert-box"
  const _basic = document.createElement("div")
  _basic.className = "app--alert-lookui"
  const _baseBTN = document.createElement("div")
  _baseBTN.className = "app--alert-btn"
  for(let tx of button) {
    const _btns = document.createElement("button")
    _btns.innerText = tx.title
    _btns.addEventListener("click", (e) => {
      if(tx.btn) {
        tx.btn()
      }
      _cover.setAttribute("removecontent", "!")
      setTimeout(() => {
        _cover.remove()
      }, 300)
      return ;
    })
    _baseBTN.appendChild(_btns)
  }
  _basic.innerHTML = `<b class="app--alert-texttitle">${title}</b><div class="app--alert-textbox">${texthtml}</div>`
  _basic.appendChild(_baseBTN)
  _cover.appendChild(_basic)
  boxDialog.appendChild(_cover)
}