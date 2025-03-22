import TicketsProvider from './TicketsProvider'
import ThemeProvider from './ThemeProvider' // ✅ Ensure this is correct
import CommentProvider from './CommentProvider'

function AppProviders({ children }) {
  return (
    <TicketsProvider>
      <ThemeProvider>
        <CommentProvider>{children}</CommentProvider>
      </ThemeProvider>
    </TicketsProvider>
  )
}

export default AppProviders
