import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCaseStore } from '../stores/caseStore';
import { useSyncStore } from '../stores/syncStore';
import { BottomTabBar } from '../components/layout/BottomTabBar';

export const SettingsScreen: React.FC = () => {
  const { currentUser, logout, addAnalyst } = useAuthStore();
  const { wipeDatabase, auditLogs, loadAuditLogs, verifyAuditLog } = useCaseStore();
  
  const { 
    isScanning, 
    isHardwareReady, 
    isSyncing,
    discoveredPeers, 
    initializeMesh, 
    startDiscovery, 
    stopDiscovery,
    initiateHandshake
  } = useSyncStore();

  const [newBadge, setNewBadge] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [adminMsg, setAdminMsg] = useState('');
  const [auditFilter, setAuditFilter] = useState('');
  const [integrityMessage, setIntegrityMessage] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadAuditLogs();
    }
  }, [currentUser, loadAuditLogs]);

  const handleWipe = async () => {
    const confirmation = window.prompt('This permanently deletes all local case data. Type WIPE to continue.');
    if (confirmation !== 'WIPE') return;
    await wipeDatabase();
    logout();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 12) return setAdminMsg('Password must contain at least 12 characters.');
    try {
      await addAnalyst(newBadge, newName, newPin);
      setAdminMsg(`Officer ${newBadge} successfully provisioned.`);
      setNewBadge(''); setNewName(''); setNewPin('');
    } catch (err) {
      setAdminMsg('Failed to add user. Badge may already exist.');
    }
  };

  const handleVerifyAuditChain = async () => {
    try {
      const result = await verifyAuditLog();
      setIntegrityMessage(result.valid
        ? `Verified ${result.checked} local audit entries.`
        : `Integrity check failed at ${result.failed_entry_id ?? 'an unknown entry'}.`);
    } catch {
      setIntegrityMessage('Unable to verify the local audit chain.');
    }
  };

  const filteredLogs = auditLogs.filter(log => log.user_id.toLowerCase().includes(auditFilter.toLowerCase()));

  return (
    <div className="h-screen w-full bg-[#0c0e14] text-[#dde1ec] flex flex-col pt-safe relative pb-16">
      <div className="p-4 bg-[#14171f] border-b border-[#252a3a] shrink-0">
        <h1 className="text-xl font-bold tracking-widest text-white uppercase">System Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* User Profile */}
        <section className="bg-[#1c2030] border border-[#252a3a] rounded-lg p-4">
          <h2 className="text-xs font-bold text-[#7880a0] uppercase tracking-widest mb-4 border-b border-[#252a3a] pb-2">Active Operator</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold uppercase">{currentUser?.name}</span>
            <span className="text-[10px] bg-[#3a7bd5] text-white px-2 py-1 rounded font-mono">{currentUser?.badge}</span>
          </div>
          <p className="text-[10px] text-[#7880a0] uppercase tracking-widest mb-4">Clearance: {currentUser?.role}</p>
          <button onClick={logout} className="w-full py-3 border border-[#454d66] text-[#dde1ec] rounded text-xs font-bold uppercase hover:bg-[#252a3a]">Terminate Session</button>
        </section>

        {/* TACTICAL MESH NETWORK (DARK SYNC) - AVAILABLE TO ALL OPERATORS */}
        <section className="bg-[#1c2030] border border-[#2ecc71] rounded-lg p-4">
          <div className="flex justify-between items-end border-b border-[#2ecc71]/30 pb-2 mb-4">
            <h2 className="text-xs font-bold text-[#2ecc71] uppercase tracking-widest">Tactical Mesh (P2P)</h2>
            <span className={`text-[9px] px-2 py-1 rounded ${isHardwareReady ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'bg-[#7880a0]/20 text-[#7880a0]'}`}>
              {isHardwareReady ? 'HARDWARE ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {!isHardwareReady ? (
            <button onClick={initializeMesh} className="w-full py-3 bg-[#2ecc71]/10 border border-[#2ecc71] text-[#2ecc71] rounded text-xs font-bold uppercase hover:bg-[#2ecc71]/20 transition-colors">
              Initialize Radio Hardware
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex space-x-2">
                {!isScanning ? (
                  <button onClick={startDiscovery} className="flex-1 py-3 bg-[#2ecc71] text-[#0c0e14] rounded text-xs font-bold uppercase hover:bg-[#27ae60] transition-colors">
                    Start Tactical Scan
                  </button>
                ) : (
                  <button onClick={stopDiscovery} className="flex-1 py-3 bg-[#e74c3c] text-white rounded text-xs font-bold uppercase hover:bg-[#c0392b] transition-colors">
                    Stop Scanning
                  </button>
                )}
              </div>

              {discoveredPeers.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] text-[#7880a0] uppercase tracking-widest">Nearby Operators</p>
                  {discoveredPeers.map(peer => (
                    <div key={peer.deviceId} className="flex justify-between items-center bg-[#0c0e14] p-2 rounded border border-[#252a3a]">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#dde1ec]">{peer.name}</span>
                        <span className="text-[9px] text-[#7880a0] font-mono">{peer.deviceId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] text-[#2ecc71]">RSSI: {peer.rssi}</span>
                        <button 
                          onClick={() => initiateHandshake(peer.deviceId)}
                          disabled={isSyncing === peer.deviceId}
                          className={`px-3 py-1 rounded text-[9px] font-bold uppercase transition-colors ${
                            isSyncing === peer.deviceId 
                              ? 'bg-[#f39c12] text-[#0c0e14]' 
                              : 'bg-[#3a7bd5] text-white hover:bg-[#295ba3]'
                          }`}
                        >
                          {isSyncing === peer.deviceId ? 'SYNCING...' : 'HANDSHAKE'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isScanning && discoveredPeers.length === 0 && (
                <p className="text-[10px] text-[#2ecc71] italic text-center animate-pulse mt-2">Scanning frequencies for active nodes...</p>
              )}
            </div>
          )}
        </section>

        {/* Master Admin Controls */}
        {currentUser?.role === 'admin' && (
          <>
            <section className="bg-[#1c2030] border border-[#f39c12] rounded-lg p-4">
              <h2 className="text-xs font-bold text-[#f39c12] uppercase tracking-widest mb-4 border-b border-[#f39c12]/30 pb-2">Admin Command Deck</h2>
              <p className="text-[10px] text-[#7880a0] mb-4">Provision new operator access to local hardware.</p>
              <form onSubmit={handleAddUser} className="space-y-3">
                <input type="text" value={newBadge} onChange={e => setNewBadge(e.target.value)} required placeholder="BADGE (e.g. WYP-112)" className="w-full bg-[#0c0e14] border border-[#252a3a] rounded p-3 text-xs text-white focus:border-[#f39c12] focus:outline-none uppercase" />
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="OFFICER NAME" className="w-full bg-[#0c0e14] border border-[#252a3a] rounded p-3 text-xs text-white focus:border-[#f39c12] focus:outline-none" />
                <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} required placeholder="PASSWORD (12+ CHARACTERS)" minLength={12} maxLength={128} className="w-full bg-[#0c0e14] border border-[#252a3a] rounded p-3 text-xs tracking-widest text-white focus:border-[#f39c12] focus:outline-none font-mono" />
                <button type="submit" className="w-full py-3 bg-[#f39c12] text-white rounded text-xs font-bold uppercase hover:bg-[#e67e22]">Provision Officer</button>
              </form>
              {adminMsg && <p className="text-[10px] text-[#f39c12] mt-3 font-bold uppercase">{adminMsg}</p>}
            </section>

            {/* THE IMMUTABLE AUDIT LEDGER */}
            <section className="bg-[#1c2030] border border-[#3a7bd5] rounded-lg p-4">
              <div className="flex justify-between items-end border-b border-[#3a7bd5]/30 pb-2 mb-4">
                <h2 className="text-xs font-bold text-[#3a7bd5] uppercase tracking-widest">Integrity-Linked Audit Ledger</h2>
                <span className="text-[9px] bg-[#3a7bd5]/20 text-[#3a7bd5] px-2 py-1 rounded">LOCAL INTEGRITY CHAIN</span>
              </div>

              <div className="flex gap-2 mb-4">
                <input type="text" value={auditFilter} onChange={e => setAuditFilter(e.target.value)} placeholder="Filter by Badge ID..." className="flex-1 bg-[#0c0e14] border border-[#252a3a] rounded p-2 text-xs text-white focus:border-[#3a7bd5] focus:outline-none uppercase" />
                <button onClick={handleVerifyAuditChain} className="px-3 py-2 rounded border border-[#3a7bd5] text-[9px] font-bold uppercase text-[#3a7bd5] hover:bg-[#3a7bd5]/10">Verify</button>
              </div>
              {integrityMessage && <p className={`text-[10px] mb-3 ${integrityMessage.startsWith('Verified') ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>{integrityMessage}</p>}

              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {filteredLogs.length === 0 ? (
                  <p className="text-[10px] text-[#7880a0] italic text-center">No logs found.</p>
                ) : (
                  filteredLogs.map(log => (
                    <div key={log.id} className="bg-[#0c0e14] p-2 rounded border border-[#252a3a]">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] text-[#e74c3c] font-bold">{log.action}</span>
                        <span className="text-[8px] text-[#7880a0] font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-[#dde1ec] mb-1">{log.details}</p>
                      <div className="flex justify-between items-center mt-2 border-t border-[#252a3a] pt-1">
                        <span className="text-[8px] text-[#7880a0]">User: <strong className="text-[#3a7bd5]">{log.user_id}</strong></span>
                        <span className="text-[8px] text-[#7880a0] truncate w-24 text-right" title={log.target_id ?? 'SYSTEM'}>{log.target_id ?? 'SYSTEM'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        <section className="bg-[#1c2030] border border-[#c0392b] rounded-lg p-4 mt-8">
          <h2 className="text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-4 border-b border-[#c0392b]/30 pb-2">Emergency Protocols</h2>
          <p className="text-xs text-[#7880a0] mb-4">Engaging this protocol permanently deletes local case data. Export and independently retain material required by your organisation’s retention policy before continuing.</p>
          <button onClick={handleWipe} className="w-full py-4 bg-[#c0392b] text-white rounded text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(192,57,43,0.4)] hover:bg-[#a93226]">WIPE ALL DATA</button>
        </section>
      </div>

      <BottomTabBar />
    </div>
  );
};
