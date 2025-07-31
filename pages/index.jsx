import Layout from "./Layout.jsx";

import Tasks from "./Tasks";

import Workbench from "./Workbench";

import Dashboard from "./Dashboard";

import ResellerManagement from "./ResellerManagement";

import Training from "./Training";

import TelegramIntegration from "./TelegramIntegration";

import JsonUpload from "./JsonUpload";

import Settings from "./Settings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Tasks: Tasks,
    
    Workbench: Workbench,
    
    Dashboard: Dashboard,
    
    ResellerManagement: ResellerManagement,
    
    Training: Training,
    
    TelegramIntegration: TelegramIntegration,
    
    JsonUpload: JsonUpload,
    
    Settings: Settings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Tasks />} />
                
                
                <Route path="/Tasks" element={<Tasks />} />
                
                <Route path="/Workbench" element={<Workbench />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/ResellerManagement" element={<ResellerManagement />} />
                
                <Route path="/Training" element={<Training />} />
                
                <Route path="/TelegramIntegration" element={<TelegramIntegration />} />
                
                <Route path="/JsonUpload" element={<JsonUpload />} />
                
                <Route path="/Settings" element={<Settings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}