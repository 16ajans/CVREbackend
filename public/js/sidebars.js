/* eslint-disable no-undef */
const menuButton = document.getElementById('menuButton')
const leftBar = document.getElementById('leftBar')
leftBar.style.width = '0px'

const profileButton = document.getElementById('profileButton')
const rightBar = document.getElementById('rightBar')
rightBar.style.maxHeight = '0px'
profileButton.addEventListener('click', (e) => {
  if (rightBar.style.maxHeight === '0px') {
    rightBar.style.maxHeight = '10em'
    leftBar.style.width = '0px'
  } else {
    rightBar.style.maxHeight = '0px'
  }
})

function navvable () {
  menuButton.addEventListener('click', (e) => {
    if (leftBar.style.width === '0px') {
      document.body.style.overflowY = 'hidden'
      leftBar.style.width = '100%'
      rightBar.style.maxHeight = '0px'
    } else {
      document.body.style.overflowY = ''
      leftBar.style.width = '0px'
    }
  })

  document
    .querySelectorAll('.gg-menu, .gg-menu::after, .gg-menu::before')
    .forEach((node) => {
      node.style.color = 'white'
    })
  menuButton.classList.remove('autoCursor')
}

// eslint-disable-next-line no-unused-vars
let userCache = {}

axios
  .get('/auth/me')
  .then((res) => {
    userCache = res.data
    uhtml.render(
      rightBar,
      uhtml.html`<a href="/auth/logout">Log Out</a><p>Logged in as ${
        res.data.username
      }#${('0000' + res.data.discriminator).slice(
        -4
      )}</p><p id="authStatus"></p>`
    )
    // <a href="/auth/refresh">Refresh Cached Roles</a>
    let payload = uhtml.html``
    let navload = uhtml.html``
    if (res.data.admin) {
      navvable()
      payload = uhtml.html`Authorization Level: Admin`
      navload = uhtml.html`<a href="/">Home</a><a  href="/players">Players</a><a href="/teams">Teams</a><a href="/divisions">Divisions</a><a href="/verify">Verify</a>`
    } else if (res.data.captain) {
      navvable()
      payload = uhtml.html`Authorization Level: Captain`
      navload = uhtml.html`<a href="/">Home</a><a href="/players">Players</a><a href="/teams">Teams</a>`
    } else {
      payload = uhtml.html`Authorization Level: User`
    }
    uhtml.render(document.getElementById('authStatus'), payload)
    uhtml.render(leftBar, navload)
    const url = `https://cdn.discordapp.com/avatars/${res.data._id}/${res.data.avatar}.png`
    uhtml.render(
      profileButton,
      uhtml.html`<img src='${url}' alt='User Profile Picture' class='rounded'>`
    )
  })
  .catch((res) => {
    if (window.location.pathname !== '/') {
      window.location.replace('/')
    }
    uhtml.render(rightBar, uhtml.html`<a href='/auth/login'>Log In</a>`)
    uhtml.render(profileButton, uhtml.html`<i class="gg-profile"></i>`)
  })
