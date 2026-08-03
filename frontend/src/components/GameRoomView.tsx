import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { User } from "../types/user";
import { DrawingCanvas } from "./DrawingCanvas";
import { socket } from "../socket.ts"; 

interface Player {
  id: string;
  username: string;
  score: number;
  hasGuessed?: boolean;
}

export function GameRoomView({ user }: { user: User }) {
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();

  const [gameState, setGameState] = useState<"LOBBY" | "PLAYING">("LOBBY");
  const [copied, setCopied] = useState(false);
  const [guessInput, setGuessInput] = useState("");
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: string; text: string; isSystem?: boolean }>
  >([
    { sender: "System", text: `Welcome to room ${roomCode}!`, isSystem: true },
  ]);

  const isHost = hostId === user.id;
  console.log("Current user:", user);
  console.log("host_id:", hostId);

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: user.username, text: guessInput },
    ]);
    setGuessInput("");
  };

  const startGame = () => {
    socket.emit("start_game",  roomCode );
  }



useEffect(() => {
  if (!roomCode) return;

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("join_room", { roomCode, user });
}, [roomCode, user]);


useEffect(() => {
  const handleRoomUpdated = ({ players, hostId }: { players: Player[]; hostId: string }) => {
    setPlayers(players);
    setHostId(hostId);
  };

  const handleGameStarted = () => {
    setGameState("PLAYING");
  };

  socket.on("room_updated", handleRoomUpdated);
  socket.on("game_started", handleGameStarted);

  return () => {
    socket.off("room_updated", handleRoomUpdated);
    socket.off("game_started", handleGameStarted);
  };
}, []); 

  return (
    <div style={styles.container}>
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <button onClick={() => navigate("/lobby")} style={styles.leaveBtn}>
            <span style={{ marginRight: "6px" }}>←</span> Exit
          </button>
          
          <div style={styles.roomBadgeContainer}>
            <span style={styles.roomLabel}>ROOM</span>
            <span style={styles.roomCodeText}>{roomCode}</span>
            <button onClick={handleCopyCode} style={styles.copyBtn}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {gameState === "PLAYING" && (
          <div style={styles.gameInfoPills}>
            <div style={styles.pill}>
              <span style={{ color: "#94a3b8" }}>ROUND</span>
              <strong style={{ color: "#f8fafc" }}>1/3</strong>
            </div>
            <div style={{ ...styles.pill, borderColor: "#f59e0b" }}>
              <span style={{ color: "#f59e0b" }}>⏱️ 45s</span>
            </div>
          </div>
        )}
      </header>

      <div style={styles.mainContent}>
        <main style={styles.centerStage}>
          {gameState === "LOBBY" ? (
            <div style={styles.lobbyCard}>
              <div style={styles.iconCircle}>🎮</div>
              <h2 style={{color:"white", margin: "0 0 8px 0", fontSize: "1.5rem", fontWeight: 700 }}>
                Waiting for Players
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: "0 0 24px 0" }}>
                Share the code <strong style={{ color: "#38bdf8" }}>{roomCode}</strong> with your friends to join the game.
              </p>

              {isHost ? (
                <button
                  onClick={startGame}
                  style={styles.startBtn}
                >
                  Start Game Now
                </button>
              ) : (
                <div style={styles.waitingBadge}>
                  <span style={styles.pulseDot} />
                  Waiting for host to start...
                </div>
              )}
            </div>
          ) : (
            <div style={styles.canvasContainer}>
              <div style={styles.canvasHeader}>
                <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
                  CANVAS WORKSPACE
                </span>
              </div>
              <div style={styles.canvasArea}>
                <DrawingCanvas roomCode={roomCode} isDrawingAllowed={true} />
              </div>
            </div>
          )}
        </main>

        <aside style={styles.sidebar}>
          <section style={styles.playerSection}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>PLAYERS</span>
              <span style={styles.badgeCount}>{players.length}</span>
            </div>

            <div style={styles.playerList}>
              {players.map((p) => (
                <div key={p.id} style={styles.playerCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={styles.avatar}>
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={styles.playerName}>
                        {p.username}
                        {p.id === user.id && <span style={styles.youBadge}>you</span>}
                      </div>
                      {p.id === hostId && <span style={styles.hostRole}>Host 👑</span>}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={styles.playerScore}>{p.score} pts</div>
                    {p.hasGuessed && <div style={styles.guessedText}>✓ Guessed</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.chatSection}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>LIVE GUESSES</span>
            </div>

            <div style={styles.chatLog}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={msg.isSystem ? styles.systemMsg : styles.userMsg}
                >
                  {!msg.isSystem && (
                    <span style={styles.msgSender}>{msg.sender}: </span>
                  )}
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendGuess} style={styles.chatForm}>
              <input
                type="text"
                placeholder={gameState === "PLAYING" ? "Type your guess..." : "Chat here..."}
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                style={styles.chatInput}
              />
              <button type="submit" style={styles.sendBtn}>
                Send
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#0b0f19",
    color: "#f8fafc",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#111827",
    borderBottom: "1px solid #1e293b",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  leaveBtn: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#cbd5e1",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  roomBadgeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#1e293b",
    padding: "4px 8px 4px 12px",
    borderRadius: "8px",
    border: "1px solid #334155",
  },
  roomLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.5px",
  },
  roomCodeText: {
    fontFamily: "monospace",
    fontSize: "1rem",
    fontWeight: 700,
    color: "#38bdf8",
    letterSpacing: "1px",
  },
  copyBtn: {
    padding: "4px 8px",
    fontSize: "0.75rem",
    borderRadius: "4px",
    border: "none",
    background: "#0284c7",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  gameInfoPills: {
    display: "flex",
    gap: "8px",
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
  },
  mainContent: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  centerStage: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    backgroundColor: "#0b0f19",
  },
  lobbyCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#111827",
    padding: "2.5rem",
    borderRadius: "16px",
    border: "1px solid #1e293b",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
  },
  iconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.75rem",
    marginBottom: "1rem",
  },
  startBtn: {
    width: "100%",
    padding: "0.8rem",
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
  },
  waitingBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "20px",
    backgroundColor: "#1e293b",
    color: "#cbd5e1",
    fontSize: "0.85rem",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
  },
  canvasContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#111827",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  canvasHeader: {
    padding: "8px 16px",
    backgroundColor: "#1e293b",
    borderBottom: "1px solid #334155",
  },
  canvasArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebar: {
    width: "320px",
    backgroundColor: "#111827",
    borderLeft: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
  },
  playerSection: {
    flex: "0 0 45%",
    display: "flex",
    flexDirection: "column",
    borderBottom: "1px solid #1e293b",
    padding: "1rem",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
  },
  sectionTitle: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.5px",
  },
  badgeCount: {
    fontSize: "0.75rem",
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: 600,
  },
  playerList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  playerCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    border: "1px solid #334155",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#0284c7",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.85rem",
  },
  playerName: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  youBadge: {
    fontSize: "0.65rem",
    color: "#94a3b8",
    backgroundColor: "#0f172a",
    padding: "1px 5px",
    borderRadius: "4px",
  },
  hostRole: {
    fontSize: "0.7rem",
    color: "#f59e0b",
  },
  playerScore: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#38bdf8",
  },
  guessedText: {
    fontSize: "0.7rem",
    color: "#10b981",
    fontWeight: 600,
  },
  chatSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
  },
  chatLog: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "0.75rem",
  },
  userMsg: {
    fontSize: "0.85rem",
    color: "#cbd5e1",
    lineHeight: "1.3",
  },
  systemMsg: {
    fontSize: "0.8rem",
    color: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: "4px 8px",
    borderRadius: "4px",
    fontStyle: "italic",
  },
  msgSender: {
    fontWeight: 600,
    color: "#f8fafc",
  },
  chatForm: {
    display: "flex",
    gap: "6px",
  },
  chatInput: {
    flex: 1,
    padding: "0.55rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    fontSize: "0.85rem",
    outline: "none",
  },
  sendBtn: {
    padding: "0.55rem 1rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#0284c7",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
  },
};