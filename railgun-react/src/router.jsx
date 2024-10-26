import {Routes, Route} from 'react-router-dom'

import { GridLayout } from '/src/layouts/grid/gridlayout.jsx'
import { SchemaBase } from './layouts/schema/schemalayout.jsx'
import { RailgunRoot } from './layouts/root/root.jsx'


function RailgunWeb() {
    return (
        <Routes>
            <Route path="/" >
                {/* Home page here */}
                <Route index element={<RailgunRoot />} />
                {/* Base route for each active schema */}
                <Route path=":schema" element={<SchemaBase />} />
                {/* Assume the rest routes towards a grid page */}
                <Route path="*" element={<GridLayout />}/>
            </Route>
        </Routes>
    )
}



export {RailgunWeb}