import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import TicketBoard from './TicketBoard.jsx'
import TicketDetail from './TicketDetail.jsx'

export default function OperatorApp() {
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selectedId, setSelectedId] = useState(null)

  function openTicket(id) {
    setSelectedId(id)
    setView('detail')
  }
  function backToList() {
    setView('list')
    setSelectedId(null)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar onNavigate={backToList} />
      <main className="flex-1 min-w-0">
        {view === 'list' && <TicketBoard onOpenTicket={openTicket} />}
        {view === 'detail' && <TicketDetail ticketId={selectedId} onBack={backToList} />}
      </main>
    </div>
  )
}
