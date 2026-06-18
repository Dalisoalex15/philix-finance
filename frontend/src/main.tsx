import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh", background: "#020617",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: "16px", padding: "32px",
          fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{ color: "#f59e0b", fontSize: "40px" }}>⚠</div>
          <div style={{ color: "#e2e8f0", fontSize: "18px", fontWeight: 600 }}>
            Something went wrong
          </div>
          <div style={{ color: "#64748b", fontSize: "13px", maxWidth: "400px", textAlign: "center" }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#4f46e5", color: "white", border: "none",
              padding: "10px 24px", borderRadius: "10px", cursor: "pointer",
              fontSize: "14px", fontWeight: 600,
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
