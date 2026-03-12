
import ReactDOM from 'react-dom/client'
import './index.css'
import App from '../src/App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'


ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '769990204336-dv24lbjctoderjp0fp6ellejqou3q6qa.apps.googleusercontent.com'}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
)
