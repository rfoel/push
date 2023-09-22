const notificationButton = document.getElementById('enableNotifications')
let swRegistration = null
const TokenElem = document.querySelector('[name=registrationToken]')
const ErrElem = document.getElementById('error')

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
const config = {
  apiKey: 'AIzaSyCkoaPLV-HvySbUAP6C3DXkr4AWoUg5NoU',
  authDomain: 'elated-bison-353222.firebaseapp.com',
  projectId: 'elated-bison-353222',
  storageBucket: 'elated-bison-353222.appspot.com',
  messagingSenderId: '964352172917',
  appId: '1:964352172917:web:567b9167fa2eb24785293c',
}
firebase.initializeApp(config)
const messaging = firebase.messaging()
initializeApp()

function initializeApp() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported')
    initializeUi()
    initializeFCM()

    //Register the service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((swReg) => {
        console.log('Service Worker is registered', swReg)
        swRegistration = swReg
      })
      .catch((error) => {
        console.error('Service Worker Error', error)
      })
    navigator.serviceWorker.ready.then(function (registration) {
      console.log('A service worker is active:', registration.active)

      // At this point, you can call methods that require an active
      // service worker, like registration.pushManager.subscribe()
    })
  } else {
    console.warn('Push messaging is not supported')
    notificationButton.textContent = 'Push Not Supported'
  }
}

function initializeUi() {
  notificationButton.addEventListener('click', () => {
    displayNotification()
  })
}

function initializeFCM() {
  console.log(messaging)
  messaging
    .requestPermission()
    .then(() => {
      console.log('Notification permission granted.')

      // get the token in the form of promise
      return messaging.getToken()
    })
    .then((token) => {
      TokenElem.value = token
    })
    .catch((err) => {
      ErrElem.innerHTML = ErrElem.innerHTML + '; ' + err
      console.log('Unable to get permission to notify.', err)
    })
}

function displayNotification() {
  if (window.Notification && Notification.permission === 'granted') {
    notification()
  }
  // If the user hasn't told if he wants to be notified or not
  // Note: because of Chrome, we are not sure the permission property
  // is set, therefore it's unsafe to check for the "default" value.
  else if (window.Notification && Notification.permission !== 'denied') {
    Notification.requestPermission((status) => {
      if (status === 'granted') {
        notification()
      } else {
        alert('You denied or dismissed permissions to notifications.')
      }
    })
  } else {
    // If the user refuses to get notified
    alert(
      'You denied permissions to notifications. Please go to your browser or phone setting to allow notifications.',
    )
  }
}

function notification() {
  const options = {
    body: 'Testing Our Notification',
  }
  swRegistration.showNotification('PWA Notification!', options)
}

function submit(event) {
  event.preventDefault()

  const formData = new FormData(event.target)

  fetch('https://push.rafaelfranco.com/api/push', {
    body: JSON.stringify(Object.fromEntries(formData)),
    method: 'POST',
  })
}

document.getElementById('form').addEventListener('submit', submit)
