import { useEffect, useState } from 'react'

import { fetchRGData } from '/src/STELLAR'

import {RGHeader} from '/src/components/rgheader.jsx'

import '/src/layouts/root/styles/root.css'


function SchemaCard(props) {
    return (
        <button
            style={{...props.style}}
            className='RG_SCHEMA_CARD'
            onContextMenu={props.onContextMenu}
            onClick={(event) => {
                if (props.setcontext) {
                    // Future-proofing, if we're in a Set Context environment
                    history.pushState({}, "rAIlgun", encodeURI(`/${props.schemacode}`))
                    props.setcontext({schema: props.schemacode, entity_type: null})
                } else {
                    // We're not in a Set Context environment
                    location.href = encodeURI(`/${props.schemacode}`)
                }
            }}
        >
            {props.schema}
        </button>
    )
}


function RailgunRoot() {
    const [schemas, setSchemas] = useState()

    useEffect(() => {
        let bypass = async () => {
            let schemas = await fetchRGData("railgun_internal", "Schema", ["name", "code"], null, 1, false)
            setSchemas(schemas)
        }
        bypass()
    }, [])

    return (
        <div style={{minHeight: "100vh", height: "100vh", overflow:"hidden",backgroundColor: "black"}}>
            <RGHeader style={{minHeight: "8vh", height: "8vh"}} context={{}}/>
            {schemas ?
                <div style={{minHeight: "96vh", height: "96vh", position: "relative", top: "-4vh"}} className="RG_SCHEMACARD_BG">
                    {schemas.map(schema => {
                        return (
                        <SchemaCard
                            key={schema.code}
                            schema={schema.name}
                            schemacode={schema.code}
                        />
                    )})}
                </div>
            : null}
        </div>
    )
}


export {RailgunRoot}
