/* eslint-disable no-undef */
const teamList = document.getElementById('teamList')

let teamCache = []
function renderList () {
  axios({
    method: 'get',
    url: '/api/teams'
  }).then(function (res) {
    teamCache = res.data
    if (res.data.length === 0) {
      uhtml.render(
        teamList,
        uhtml.html`<card><div class='autoCursor'><p>You have no teams.</p></div></card>`
      )
      return
    }
    let dispCaptain = false
    if (res.data.some((team) => team.captain._id !== userCache._id)) {
      dispCaptain = true
    }
    uhtml.render(
      teamList,
      uhtml.html`${Object.values(res.data).map(
        (team) => uhtml.html`<card>
                <div onclick=${() => toggleDrawer(team._id)}>
                  <p>${team.name}</p>
                  <i class='gg-chevron-right'></i>
                </div>
                <div id=${team._id}>
                ${
                  team.logo
                    ? uhtml.html`<img class='logo' src=${
                        '/api/teams/' + team.logo?.path
                      } alt=${team.name + ' Team Logo'}>`
                    : uhtml.html``
                }
                    <ul>
                    ${
                      dispCaptain
                        ? uhtml.html`<li><span>Captain:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                            team.captain.username +
                            '#' +
                            ('0000' + team.captain.discriminator).slice(-4)
                          }</li>`
                        : ''
                    }
                        <li><span>Division:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          team.division.name
                        }</li>
                        <li><span>School/Region:</span>&nbsp;&nbsp;&nbsp;&nbsp;${
                          team.locale
                        }</li>
                    </ul>
                    <button onclick=${() => editTeam(team._id)}>Edit</button>
                  <button onclick=${() =>
                    assignPlayer(team._id)}>Assign Player</button>
                  <button onclick=${() => deleteTeam(team._id)}>Delete</button>
                  ${genPlayerTable(team)}
                </div>
            </card>`
      )}`
    )
  })
}

function genPlayerTable (team) {
  if (team.players.length > 0) {
    return uhtml.html`<div class="tableWrapper"><table>
    <tr>
      <th>Discord</th>
      <th>Gamertag</th>
      <th>Scoresaber</th>
    </tr>
    ${team.players.map(
      (player) => uhtml.html`<tr>
      <td>${
        player.player.username +
        '#' +
        ('0000' + player.player.discriminator).slice(-4)
      }</td>
      <td>${player.gamertag}</td>
      <td>${player.scoresaber}</td>
      <td><button onclick=${() =>
        removeAssign(team._id, player._id)}>Remove</button></td>
    </tr>`
    )}
  </table></div>`
  }
}

const teamDrawer = document.getElementById('teamDrawer')
const assignDrawer = document.getElementById('assignDrawer')
const teamForm = document.getElementById('teamForm')
const assignForm = document.getElementById('assignForm')
function formCleanup () {
  teamDrawer.style.maxHeight = '0px'
  assignDrawer.style.maxHeight = '0px'
  divSel.disabled = false
  teamForm.reset()
  assignForm.reset()
}

let edit = ''

const teamLogo = document.getElementById('teamLogo')

teamForm.addEventListener('submit', function (e) {
  e.preventDefault()
  const data = new FormData(teamForm)
  if (teamLogo.files.item(0)?.size > 9000000) {
    alert('Team logo file too big. Please submit a file 8MB or smaller.')
    return
  }
  axios({
    method: edit ? 'put' : 'post',
    url: `/api/teams/${edit || ''}`,
    data,
    headers: {
      'Content-Type': ' multipart/form-data'
    }
  }).then((res) => {
    renderList()
    formCleanup()
  })
})
teamForm.addEventListener('reset', function (e) {
  formCleanup()
})

assignForm.addEventListener('submit', function (e) {
  e.preventDefault()
  const teamID = teamSel.value
  const data = new FormData(assignForm)
  axios({
    method: 'post',
    url: `/api/teams/${teamID}/assignments`,
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => {
    renderList()
    formCleanup()
  })
})
assignForm.addEventListener('reset', function (e) {
  formCleanup()
})

const divSel = document.getElementById('divSel')
function populateDivSel (divisionID) {
  axios.get('/api/divisions').then((res) => {
    divCache = res.data
    if (divCache.length > 0) {
      const open = res.data.filter((div) => div.open)
      const closed = res.data.filter((div) => !div.open)
      uhtml.render(
        divSel,
        uhtml.html`<optgroup label='Open for Registration'>
        ${open.map(
          (result) =>
            uhtml.html`<option value='${result._id}'>${result.name}</option>`
        )}</optgroup>
        <optgroup label='Closed' disabled>
        ${closed.map(
          (result) =>
            uhtml.html`<option value='${result._id}'>${result.name}</option>`
        )}</optgroup>`
      )
      if (divisionID) divSel.value = divisionID
    }
  })
}

const teamName = document.getElementById('teamName')
const teamLocale = document.getElementById('teamLocale')
const newTeamButton = document.getElementById('newTeam')

newTeamButton.addEventListener('click', (e) => {
  formCleanup()
  edit = ''
  populateDivSel()
  teamDrawer.style.maxHeight = '80%'
  teamName.focus()
})

function editTeam (_id) {
  formCleanup()
  edit = _id

  const team = teamCache.find((team) => {
    return team._id === _id
  })
  populateDivSel(team.division._id)

  teamName.value = team.name
  teamLocale.value = team.locale

  divSel.disabled = true

  teamDrawer.style.maxHeight = '80%'
  teamName.focus()
}

function deleteTeam (_id) {
  const team = teamCache.find((team) => {
    return team._id === _id
  })

  if (confirm(`Press OK to delete the team "${team.name}"`)) {
    axios({
      method: 'delete',
      url: `/api/teams/${encodeURIComponent(_id)}`
    }).then((res) => {
      renderList()
      formCleanup()
    })
  }
}

renderList()

const playerSel = document.getElementById('playerSel')
const teamSel = document.getElementById('teamSel')
function populateAssignForm (teamID) {
  axios({
    method: 'get',
    url: '/api/players'
  }).then((res) => {
    uhtml.render(
      playerSel,
      uhtml.html`${Object.values(res.data).map(
        (player) =>
          uhtml.html`<option value=${player._id}>${
            player.username + '#' + ('0000' + player.discriminator).slice(-4)
          }</option>`
      )}`
    )
  })
  const team = teamCache.find((team) => {
    return team._id === teamID
  })
  uhtml.render(
    teamSel,
    uhtml.html`<option value=${team._id}>${team.name}</option>`
  )
}

function assignPlayer (teamID) {
  formCleanup()
  populateAssignForm(teamID)
  assignDrawer.style.maxHeight = '80%'
}

function removeAssign (teamID, assignID) {
  const team = teamCache.find((team) => {
    return team._id === teamID
  })
  const player = team.players.find((assign) => {
    return assign._id === assignID
  }).player

  if (
    confirm(
      `Press OK to remove "${
        player.username + '#' + ('0000' + player.discriminator).slice(-4)
      }" from "${team.name}"`
    )
  ) {
    axios({
      method: 'delete',
      url: `/api/teams/${teamID}/assignments/${assignID}`
    }).then((res) => {
      renderList()
      formCleanup()
    })
  }
}
