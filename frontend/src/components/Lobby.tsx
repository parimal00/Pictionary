// src/components/Lobby.tsx
import React, { useState } from 'react';
import { type User } from '../types/user';
import { useCreateRoom, useJoinRoom } from '../hooks/useRoom.ts';

interface LobbyProps {
  user: User;
  onEnterRoom: (roomCode: string) => void;
  onLogout: () => void;
}

export function Lobby({ user, onEnterRoom, onLogout }: LobbyProps) {
  const [roomCode, setRoomCode] = useState('');

  const createRoomMutation = useCreateRoom(onEnterRoom);
  const joinRoomMutation = useJoinRoom(onEnterRoom);

  const handleCreateRoom = () => {
    createRoomMutation.mutate(user);
  };

  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    joinRoomMutation.mutate({ user, roomCode: roomCode.trim().toUpperCase() });
  };

  const isPending = createRoomMutation.isPending || joinRoomMutation.isPending;
  const error = createRoomMutation.error || joinRoomMutation.error;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Top User Bar */}
        <div style={styles.topBar}>
          <div style={styles.userBadge}>
            <span style={styles.avatar}>👤</span>
            <span style={styles.username}>{user.username}</span>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Game Lobby</h1>
          <p style={styles.subtitle}>Host a private game or join your friends</p>
        </div>

        {/* Error Banner */}
        {error && <div style={styles.errorBanner}>{error.message}</div>}

        {/* Action Buttons */}
        <div style={styles.actionContainer}>
          <button
            onClick={handleCreateRoom}
            disabled={isPending}
            style={{
              ...styles.primaryBtn,
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {createRoomMutation.isPending ? 'Creating Room...' : '✨ Create Private Room'}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerText}>OR JOIN WITH CODE</span>
          </div>

          <form onSubmit={handleJoinRoom} style={styles.form}>
            <input
              type="text"
              placeholder="ENTER 6-CHAR CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              disabled={isPending}
              style={styles.codeInput}
            />
            <button
              type="submit"
              disabled={!roomCode.trim() || isPending}
              style={{
                ...styles.secondaryBtn,
                opacity: roomCode.trim() && !isPending ? 1 : 0.6,
                cursor: roomCode.trim() && !isPending ? 'pointer' : 'not-allowed',
              }}
            >
              {joinRoomMutation.isPending ? 'Joining...' : 'Join Game 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#1e293b',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#0f172a',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid #334155',
  },
  avatar: { fontSize: '0.9rem' },
  username: { color: '#f8fafc', fontWeight: '600', fontSize: '0.9rem' },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { color: '#ffffff', fontSize: '1.8rem', fontWeight: '800', margin: 0 },
  subtitle: { color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem' },
  errorBanner: {
    backgroundColor: '#451a1a',
    border: '1px solid #7f1d1d',
    color: '#fca5a5',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '1.25rem',
    textAlign: 'center',
  },
  actionContainer: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  primaryBtn: {
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '700',
    transition: 'all 0.2s',
  },
  divider: {
    textAlign: 'center',
    position: 'relative',
    margin: '0.5rem 0',
  },
  dividerText: {
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  codeInput: {
    padding: '0.9rem',
    borderRadius: '10px',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: '3px',
    outline: 'none',
  },
  secondaryBtn: {
    padding: '0.9rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '700',
    transition: 'all 0.2s',
  },
};