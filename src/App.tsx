import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/styles/globals.css";
import DashboardPage from "./pages/dashboard/Dashboard";
import WebPage from "@/pages/web/Web";
import Profile from "@/pages/web/Profile";
import InboxPage from "@/pages/dashboard/Inbox";
import TasksPage from "@/pages/dashboard/Tasks";
import RoutinesPage from "@/pages/dashboard/Routines";
import Layout from "@/pages/dashboard/Layout";
import Calendar from "@/pages/dashboard/Calendar";
import Products from "@/pages/dashboard/Products";
import Settings from "@/pages/dashboard/Settings";
import CommandPaletteProvider from "@/components/providers/CommandPaletteProvider";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";

function App() {
    return (
        <BrowserRouter>
            <CommandPaletteProvider>
                <StagewiseToolbar
                    config={{
                        plugins: [ReactPlugin],
                    }}
                />
                <Routes>
                    <Route path="/dashboard" element={<Layout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="inbox" element={<InboxPage />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="routines" element={<RoutinesPage />} />
                        <Route path="calendar" element={<Calendar />} />
                        <Route path="products" element={<Products />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="/*" element={<Profile />} />
                </Routes>
            </CommandPaletteProvider>
        </BrowserRouter>
    );
}

export default App;
