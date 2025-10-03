import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from './pages/Auth';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" replace />} />
          <Route path="/" element={user ? <div>Dashboard</div> : <Navigate to="/auth" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
