import MyRoutes from './Routes'
import AppProviders from './providers/AppProviders'

function App() {
  return (
    <AppProviders>
      <MyRoutes />
    </AppProviders>
  )
}

export default App
