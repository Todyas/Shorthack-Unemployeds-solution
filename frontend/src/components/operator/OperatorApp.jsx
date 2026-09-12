import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import TicketBoard from './TicketBoard.jsx'
import TicketDetail from './TicketDetail.jsx'
import ApiPanel from './ApiPanel.jsx'
import AnalyticsPanel from './AnalyticsPanel.jsx'
import KnowledgeBasePanel from './KnowledgeBasePanel.jsx'

const BOARD_SECTIONS = new Set(['inbox', 'mine', 'all'])

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
        {view === 'list' && BOARD_SECTIONS.has(section) && <TicketBoard section={section} onOpenTicket={openTicket} />}
        {view === 'list' && section === 'analytics' && <AnalyticsPanel />}
        {view === 'list' && section === 'kb' && <KnowledgeBasePanel />}
        {view === 'list' && section === 'api' && <ApiPanel />}
      </main>
    </div>
  )
}
