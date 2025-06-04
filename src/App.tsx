import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/styles/globals.css";
import DashboardPage from "./pages/dashboard/Dashboard";
import WebPage from "@/pages/web/Web";
import InboxPage from "@/pages/dashboard/Inbox";
import TasksPage from "@/pages/dashboard/Tasks";
import RoutinesPage from "@/pages/dashboard/Routines";
import Layout from "@/pages/dashboard/Layout";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<WebPage />} />
                <Route path="/dashboard" element={<Layout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="inbox" element={<InboxPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="routines" element={<RoutinesPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
