import React from 'react'
import ReactDOM from 'react-dom/client'
import { 
  BrowserRouter,
  UNSAFE_DataRouterContext,
  UNSAFE_DataRouterStateContext
} from 'react-router-dom'
import App from './App'

// Включаем флаги будущих функций React Router v7
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UNSAFE_DataRouterContext.Provider value={router}>
      <UNSAFE_DataRouterStateContext.Provider value={router}>
        <BrowserRouter future={router.future}>
          <App />
        </BrowserRouter>
      </UNSAFE_DataRouterStateContext.Provider>
    </UNSAFE_DataRouterContext.Provider>
  </React.StrictMode>,
)
