import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

import '/src/styles/CONSTANTS.css'
import '/src/styles/component_styles.css'

import { RailgunWeb } from './router.jsx'
import { LoginLayout } from '/src/layouts/login/login.jsx'


async function setup() {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <BrowserRouter>
                <Routes>
                    {/* TODO this technically prevents a schema with the code "login" */}
                    <Route path="/login" element={<LoginLayout />} />
                    <Route path="*" element={<RailgunWeb />} />
                </Routes>
            </BrowserRouter>
        </React.StrictMode>,
    )
}
setup()
