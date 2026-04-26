import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import MobileDrawer from './components/MobileDrawer';
import ChallengeView from './components/ChallengeView';
import CurriculumView from './components/CurriculumView';
import LearnView from './components/LearnView';
import ChatView from './components/ChatView';
import WrongNoteView from './components/WrongNoteView';
import StatsView from './components/StatsView';
import SettingsPanel from './components/SettingsPanel';
import { useStore } from './store';

export default function App() {
  const { mode } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      <Sidebar onOpenSettings={() => setShowSettings(true)} />

      <main className="flex-1 overflow-hidden pb-14 md:pb-0">
        {mode === 'challenge'  && <ChallengeView />}
        {mode === 'curriculum' && <CurriculumView />}
        {mode === 'learn'      && <LearnView />}
        {mode === 'quiz'       && <ChatView />}
        {mode === 'notes'      && <WrongNoteView />}
        {mode === 'stats'      && <StatsView />}
      </main>

      <MobileNav
        onOpenSettings={() => setShowSettings(true)}
        onOpenDrawer={() => setShowDrawer(true)}
      />

      {showDrawer && (
        <MobileDrawer
          onClose={() => setShowDrawer(false)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
