import { useState } from "react";
import { ChatSidebar } from "~/components/ChatSidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import ChatPages from "./pages/ChatPages";
import { Route, Routes } from "react-router";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen bg-background w-full">
        <ChatSidebar />
        <Routes >
          <Route path="/thread/:threadId" element={<ChatPages />} />
        </Routes>
      </div>
    </SidebarProvider>
  );
}
