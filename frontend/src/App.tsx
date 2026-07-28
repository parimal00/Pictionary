// src/App.tsx
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { type User } from "./types/user";
import { GuestLogin } from "./components/GuestLogin";
import { Lobby } from "./components/Lobby.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

function GameRoomView({ user }: { user: User }) {
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", color: "#fff", backgroundColor: "#0f172a", minHeight: "100vh" }}>
      <button 
        onClick={() => navigate("/lobby")} 
        style={{ padding: "0.5rem 1rem", cursor: "pointer", borderRadius: "6px", border: "1px solid #475569", background: "#1e293b", color: "#fff" }}
      >
        ← Back to Lobby
      </button>
      <h2>Room: {roomCode}</h2>
      <p>Player: <strong>{user.username}</strong></p>
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("pictionary_user");
    return saved ? JSON.parse(saved) : null;
  });


  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("pictionary_user", JSON.stringify(newUser));
    navigate("/lobby");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("pictionary_user");
    navigate("/");
  };

  const handleEnterRoom = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/lobby" replace /> : <GuestLogin onLogin={handleLogin} />
        }
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute user={user} />}>
        <Route
          path="/lobby"
          element={
            <Lobby
              user={user!}
              onEnterRoom={handleEnterRoom}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/room/:roomCode"
          element={<GameRoomView user={user!} />}
        />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}