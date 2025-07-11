import TicketsProvider from './TicketsProvider'
import ThemeProvider from './ThemeProvider' // ✅ Ensure this is correct
import CommentProvider from './CommentProvider'
import ActivityProviders from './ActivityProviders'
import SocketProvider from './SocketProvider'

function AppProviders({ children }) {
  return (
    <SocketProvider>
      <TicketsProvider>
        <ThemeProvider>
          {' '}
          <ActivityProviders>
            <CommentProvider>{children}</CommentProvider>
          </ActivityProviders>
        </ThemeProvider>
      </TicketsProvider>
    </SocketProvider>
  )
}

export default AppProviders
