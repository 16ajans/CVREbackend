/* eslint-disable no-undef */
const playerList = document.getElementById('playerList')

let playerCache = []
function renderList () {
  axios({
    method: 'get',
    url: '/api/players'
  }).then(function (res) {
    playerCache = res.data
    if (res.data.length === 0) {
      uhtml.render(
        playerList,
        uhtml.html`<card><div class='autoCursor'><p>You have no players.</p></div></card>`
      )
      return
    }
    let dispCaptain = false
    if (res.data.some((player) => player.captain._id !== userCache._id)) {
      dispCaptain = true
    }
    uhtml.render(
      playerList,
      uhtml.html`${Object.values(res.data).map(
        (player) => uhtml.html`<card>
                <div onclick=${() => toggleDrawer(player._id)}>
                  <p>${player.username}</p>
                  <i class='gg-chevron-right'></i>
                </div>
                <div id=${player._id}>
                    <ul>
                        ${
                          dispCaptain
                            ? uhtml.html`<li><span>Captain:</span>&nbsp;&nbsp;&nbsp;&nbsp;${player.captain.username}</li>`
                            : ''
                        }
                        <li><span>Name:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          player.name
                        }</li>
                        <li><span>School:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          player.school
                        }</li>
                        <li><span>Verified:</span>&nbsp;&nbsp;&nbsp;&nbsp;${() => {
                          if (player.verified === 2) {
                            return 'Verified'
                          } else if (player.verified === 1) {
                            return 'Pending Review'
                          } else if (player.verified === 0) {
                            return 'Awaiting Proof of Enrollment'
                          } else if (player.verified === -1) {
                            return 'Proof of Enrollment Denied, Submit Alternative'
                          }
                        }}</li>
                    </ul>
                  <button onclick=${() => editPlayer(player._id)}>Edit</button>
                  <button onclick=${() =>
                    deletePlayer(player._id)}>Delete</button>
                </div>
            </card>`
      )}`
    )
  })
}

const discordSel = document.getElementById('discordSel')
const playerDrawer = document.getElementById('playerDrawer')
const form = document.getElementById('playerForm')
function formCleanup () {
  playerDrawer.style.maxHeight = '0px'
  form.reset()
  uhtml.render(
    discordSel,
    uhtml.html`<option value="">Search for CVRE member...</option>`
  )
}

let edit = ''

const playerVerif = document.getElementById('playerVerif')

form.addEventListener('submit', function (e) {
  e.preventDefault()
  const data = new FormData(form)
  const user = discordCache
    .find((member) => member.includes(data.get('_id')))
    .flat()
  data.set('username', user[1])
  data.set('discriminator', user[2])
  if (playerVerif.files.item(0)?.size > 9000000) {
    alert(
      'Enrollment Verification file too big. Please submit a file 8MB or smaller.'
    )
    return
  }
  axios({
    method: edit ? 'put' : 'post',
    url: `/api/players/${edit || ''}`,
    data,
    headers: {
      'Content-Type': ' multipart/form-data'
    }
  }).then((res) => {
    formCleanup()
    renderList()
  })
})
form.addEventListener('reset', function (e) {
  formCleanup()
})

const newPlayerButton = document.getElementById('newPlayer')

newPlayerButton.addEventListener('click', (e) => {
  formCleanup()
  edit = ''
  playerDiscord.disabled = false
  playerDrawer.style.maxHeight = '80%'
  playerDiscord.focus()
})

function editPlayer (_id) {
  formCleanup()
  edit = _id

  const player = playerCache.find((player) => {
    return player._id === _id
  })

  playerName.value = player.name
  playerSchool.value = player.school
  playerDiscord.disabled = true
  uhtml.render(
    discordSel,
    uhtml.html`<option value='${player._id}'>${player.username}</option>`
  )
  discordCache = [[player._id, player.username, player.discriminator]]

  playerDrawer.style.maxHeight = '80%'
  playerName.focus()
}

function deletePlayer (_id) {
  const player = playerCache.find((player) => {
    return player._id === _id
  })

  if (confirm(`Press OK to delete the player "${player.username}"`)) {
    axios({
      method: 'delete',
      url: `/api/players/${encodeURIComponent(_id)}`
    }).then((res) => {
      renderList()
      formCleanup()
    })
  }
}

renderList()
