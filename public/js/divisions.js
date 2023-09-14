/* eslint-disable no-undef */
let divCache = []
function renderList () {
  axios({
    method: 'get',
    url: '/api/divisions'
  }).then(function (res) {
    divCache = res.data
    if (res.data.length === 0) {
      uhtml.render(
        document.getElementById('divList'),
        uhtml.html`<card><div class='autoCursor'><p>There are no divisions.</p></div></card>`
      )
      return
    }
    uhtml.render(
      document.getElementById('divList'),
      uhtml.html`${Object.values(res.data).map(
        (div) => uhtml.html`<card>
                <div onclick=${() => toggleDrawer(div._id)}>
                  <p>${div.name}</p>
                  <i class='gg-chevron-right'></i>
                </div>
                <div id=${div._id}>
                    <ul>
                        <li><span>Game:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          div.game
                        }</li>
                        <li><span>Description:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          div.desc
                        }</li>
                        <li><span>Open for Registration:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          div.open ? 'Yes' : 'No'
                        }</li>
                        <li><span>Admin Contact:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          div.admin[3] ? div.admin[3] : div.admin[1]
                        }</li>
                        <li><span>Minimum Players per Team:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          div.minPlayers
                        }</li>
                        <li><span>Maximum Players per Team:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          div.maxPlayers
                        }</li>
                        <li><span>Player Role:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          div.playerRole[1]
                        }</li>
                        <!-- <li><span>Captain Role:</span>&nbsp;&nbsp;&nbsp;&nbsp;
                        </li> -->
                    </ul>
                  <button onclick=${() => editDiv(div._id)}>Edit</button>
                  <button onclick=${() => deleteDiv(div._id)}>Delete</button>
                </div>
            </card>`
      )}`
    )
  })
}

const divDrawer = document.getElementById('divDrawer')
const form = document.getElementById('divForm')
function formCleanup () {
  divDrawer.style.maxHeight = '0px'
  playerRole.disabled = false
  playerRoleSel.disabled = false
  form.reset()
  uhtml.render(
    document.getElementById('adminDiscordSel'),
    uhtml.html`<option value=''>Search for CVRE member . . .</option>`
  )
  uhtml.render(
    playerRoleSel,
    uhtml.html`<option value=''>Search for CVRE server role . . .</option>`
  )
  // uhtml.render(
  //   document.getElementById('captainRoleSel'),
  //   uhtml.html`<option value=''>Search for CVRE server role . . .</option>`
  // )
}

let edit = ''

form.addEventListener('submit', function (e) {
  e.preventDefault()
  const data = new FormData(form)
  data.set('open', !!data.has('open'))
  const user = adminCache
    .find((member) => member.includes(data.get('admin')))
    .flat()
  data.set('admin', user)
  // data.set(
  //   'captainRole',
  //   roleCache
  //     .find(
  //       (role) => role[0] === document.getElementById('captainRoleSel').value
  //     )
  //     .flat()
  // )
  data.set(
    'playerRole',
    roleCache.find((role) => role[0] === playerRoleSel.value).flat()
  )
  if (edit) data.set('_id', edit)

  axios({
    method: edit ? 'put' : 'post',
    url: `/api/divisions/${edit || ''}`,
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => {
    renderList()
    formCleanup()
  })
})
form.addEventListener('reset', function (e) {
  formCleanup()
})

const divName = document.getElementById('divName')
const divGame = document.getElementById('divGame')
const divDesc = document.getElementById('divDesc')
const newDivButton = document.getElementById('newDiv')

newDivButton.addEventListener('click', (e) => {
  formCleanup()
  edit = ''
  divGame.disabled = false
  divDrawer.style.maxHeight = '80%'
  divGame.focus()
})

const playerRoleSel = document.getElementById('playerRoleSel')

function editDiv (_id) {
  formCleanup()
  edit = _id
  divGame.disabled = true

  const div = divCache.find((div) => {
    return div._id === _id
  })

  divName.value = div.name
  divGame.value = div.game
  divDesc.value = div.desc
  document.getElementById('divOpen').checked = div.open
  uhtml.render(
    document.getElementById('adminDiscordSel'),
    uhtml.html`<option value=${div.admin[0]}>${
      div.admin[3] ? div.admin[3] : div.admin[1]
    }</option>`
  )
  document.getElementById('divMinPlayers').value = div.minPlayers
  document.getElementById('divMaxPlayers').value = div.maxPlayers
  uhtml.render(
    playerRoleSel,
    uhtml.html`<option value=${div.playerRole[0]}>${div.playerRole[1]}</option>`
  )
  // uhtml.render(
  //   document.getElementById('captainRoleSel'),
  //   uhtml.html`<option value=${div.captainRole[0]}>${div.captainRole[1]}</option>`
  // )

  playerRole.disabled = true
  playerRoleSel.disabled = true

  divDrawer.style.maxHeight = '80%'
  divName.focus()

  queryMember(document.getElementById('adminDiscordSel').value).then((res) => {
    adminCache = [res.data]
  })
}

function deleteDiv (_id) {
  const div = divCache.find((div) => {
    return div._id === _id
  })
  if (confirm(`Press OK to delete the division "${div.name}"`)) {
    axios({
      method: 'delete',
      url: `/api/divisions/${encodeURIComponent(_id)}`
    }).then((res) => {
      renderList()
      formCleanup()
    })
  }
}

renderList()

let adminCache = []
let typingTimer
const adminDiscord = document.getElementById('adminDiscord')
const adminDiscordSel = document.getElementById('adminDiscordSel')
const re = /^[^#]*/

adminDiscord.addEventListener('keyup', () => {
  clearTimeout(typingTimer)
  if (adminDiscord.value) {
    typingTimer = setTimeout(doneTyping, doneTypingInterval)
  }
})

function queryMember (query) {
  return axios({
    method: 'get',
    url: `/api/players/search?query=${encodeURIComponent(query)}`
  })
}

function doneTyping () {
  queryMember(adminDiscord.value.match(re)[0]).then((res) => {
    if (Object.keys(res.data).length === 0) {
      uhtml.render(
        adminDiscordSel,
        uhtml.html`<option value=''>Found no users with this name!</option>`
      )
    } else {
      adminCache = res.data
      uhtml.render(
        adminDiscordSel,
        uhtml.html`${res.data.map(
          (result) =>
            uhtml.html`<option value='${result[0]}'>${
              result[3] ? result[3] : result[1]
            }</option>`
        )}`
      )
    }
  })
}
