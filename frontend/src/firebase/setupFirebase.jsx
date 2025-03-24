import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAlTqRrHhY74OVO1Eo6FEIlkBH2BxROoq8',
  authDomain: 'ashmif-ticket-hub.firebaseapp.com',
  projectId: 'ashmif-ticket-hub',
  storageBucket: 'ashmif-ticket-hub.firebasestorage.app',
  messagingSenderId: '564901457172',
  appId: '1:564901457172:web:e228e0e995f75434002601',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function setupFirebase() {
  console.log('Firebase initialized') // Debugging
}

export { auth }
