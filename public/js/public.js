/* eslint-disable no-undef */

function genPlayers (players) {
  return Object.values(players).map((player) => {
    let innerbit
    if (player.scoresaber && userCache.sc) {
      innerbit = uhtml.html`<a target='_blank' href=${player.scoresaber}>${player.gamertag}</a>`
    } else {
      innerbit = uhtml.html`${player.gamertag}`
    }
    if (player.player.verified === 2) {
      return uhtml.html`<li class="wrapper">${innerbit}</li>`
    } else {
      return uhtml.html`<li class="wrapper underlined">${innerbit}<div class="tooltip"><i class="gg-danger"></i><span class="tooltiptext">Player isn't verified!</span></div></li>`
    }
  })
}

function teamSize (div, team) {
  if (team.players.length < div.minPlayers && div.minPlayers) {
    return uhtml.html`<h4 class=${
      'warn' + (team.logo ? ' warnLogo' : '')
    }>Team doesn't have enough players!<div class="tooltip"><i class="gg-danger"></i><span class="tooltiptext">Team doesn't have enough players!</span></div></h4>`
  }
  if (team.players.length > div.maxPlayers && div.maxPlayers) {
    return uhtml.html`<h4 class=${
      'warn' + (team.logo ? ' warnLogo' : '')
    }>Team has too many players!<div class="tooltip"><i class="gg-danger"></i><span class="tooltiptext">Team has too many players!</span></div></i></h4>`
  }
}

function renderList () {
  axios({ method: 'get', url: '/api/public' }).then((res) => {
    if (res.data.length === 0) {
      uhtml.render(
        document.getElementById('bigList'),
        uhtml.html`<card><div class='autoCursor'><p>Nobody has registered yet!</p></div></card>`
      )
      return
    }
    uhtml.render(
      document.getElementById('bigList'),
      uhtml.html`${Object.values(res.data).map(
        (div) => uhtml.html`<div class="spaaace">
        <div>
           <div class="wrapper top">
              <h2>${div.name}</h2>
           </div>
            <h4>${div.desc}</h4>
            <h3 class="right shimmy scootch">Admin Contact:<br>${
              div.admin[3] ? div.admin[3] : div.admin[1]
            }#${div.admin[2]}
            </h3>
        </div>
        <div>
           ${Object.values(div.teams).map(
             (team) => uhtml.html`
          <div class="wrapper">
             ${
               team.logo
                 ? uhtml.html`<img class='logo' src=${
                     '/api/teams/' + team.logo?.path
                   } alt=${team.name + ' Team Logo'}>`
                 : uhtml.html``
             }
           <card>
             <div class="wrapper smalltop autoCursor">
              <h3>${team.name}</h3>
              <h4 class="right">${team.locale}</h4>
            </div>
              <ul>
                 ${genPlayers(team.players)}
              </ul>
              <h4 class="right scootch">Captain Contact: ${
                team.captain.username
              }#${('0000' + team.captain.discriminator).slice(-4)}
               </h4>
           </card>
           </div>
           ${teamSize(div, team)}
           `
           )}
        </div>
     </div>`
      )}`
    )
  })
}

renderList()
