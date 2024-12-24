import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import AnimeList from './pages/AnimeList'
import AnimePage from './pages/AnimePage'
import SearchResults from './pages/SearchResults'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/list/:type",
        element: <AnimeList />,
      },
      {
        path: "/anime/:id",
        element: <AnimePage />,
      },
      {
        path: "/search",
        element: <SearchResults />,
      },
      {
        path: "*",
        element: <Home />,
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
