import { useState } from 'react'
import DemoSwitcher from './components/DemoSwitcher.jsx'
import OperatorApp from './components/operator/OperatorApp.jsx'
import UserApp from './components/user/UserApp.jsx'
import { TicketsProvider } from './context/TicketsContext.jsx'

export default function App() {
  const [mode, setMode] = useState('operator') // 'operator' | 'user'

  return (
    <TicketsProvider>
      <DemoSwitcher mode={mode} setMode={setMode} />
      <div style={{ display: mode === 'operator' ? 'block' : 'none' }}>
        <OperatorApp />
      </div>
      <div style={{ display: mode === 'user' ? 'block' : 'none' }}>
        <UserApp />
      </div>
    </TicketsProvider>
  )
}
