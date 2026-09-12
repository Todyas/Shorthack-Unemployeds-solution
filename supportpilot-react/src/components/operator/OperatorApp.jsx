import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import TicketBoard from './TicketBoard.jsx'
import TicketDetail from './TicketDetail.jsx'
import ApiPanel from './ApiPanel.jsx'

export default function OperatorApp() {
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [section, setSection] = useState('inbox')
  const [selectedId, setSelectedId] = useState(null)

  function openTicket(id) {
    setSelectedId(id)
    setView('detail')
  }
  function backToList() {
    setView('list')
    setSelectedId(null)
  }
  function selectSection(key) {
    setSection(key)
    backToList()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar section={section} onSelectSection={selectSection} />
      <main className="flex-1 min-w-0">
        {view === 'detail' && <TicketDetail ticketId={selectedId} onBack={backToList} onOpenTicket={openTicket} />}
        {view === 'list' && section === 'api' && <ApiPanel />}
        {view === 'list' && section !== 'api' && <TicketBoard onOpenTicket={openTicket} />}
      </main>
    </div>
  )
}
