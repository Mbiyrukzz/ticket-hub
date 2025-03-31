import TicketsProvider from './TicketsProvider'
import ThemeProvider from './ThemeProvider' // ✅ Ensure this is correct
import CommentProvider from './CommentProvider'
import ActivityProviders from './ActivityProviders'

function AppProviders({ children }) {
  return (
    <TicketsProvider>
      <ThemeProvider>
        {' '}
        <ActivityProviders>
          <CommentProvider>{children}</CommentProvider>
        </ActivityProviders>
      </ThemeProvider>
    </TicketsProvider>
  )
}

export default AppProviders
