import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { STELLAR, telescope, deleteRGEntity } from '/src/STELLAR'

import {RGHeader} from '/src/components/rgheader.jsx'
import {NewEntityWindow} from '/src/components/createEntityBox.jsx'
import { Popup } from '/src/components/popup'

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { ClickAwayListener } from "@mui/base/ClickAwayListener";

import '/src/layouts/schema/styles/schemalayout.css'


function EntityCard(props) {
    return (
        <button
            className='RG_ENTITY_CARD'
            onContextMenu={props.onContextMenu}
            onClick={(event) => {
                if (props.setcontext) {
                    // Future-proofing, if we're in a Set Context environment
                    history.pushState({}, "rAIlgun", `/${props.schema}/${props.entity_name}`)
                    props.setcontext({schema: props.schema, entity_type: props.entity_name})
                } else {
                    // We're not in a Set Context environment
                    location.href = `/${props.schema}/${props.entity_name}`
                }
            }}
        >
            {props.entity_name}
        </button>
    )
}


function CreateEntityCard(props) {
    return (
        <button
            className='RG_ENTITY_CARD'
            onClick={(event) => {
                props.showEntityCreate(true)
            }}
        >
            + New Entity
        </button>
    )
}


function EntityCardContextMenu(props) {
    return (
        <ClickAwayListener
            mouseEvent="onMouseDown"
            onClickAway={()=>props.displayCardContextMenu(null)}
        >
            <MenuList
                id="headerContextMenu"
                sx={{
                    position: "absolute",
                    top: props.contextMenu.mouseY,
                    left: props.contextMenu.mouseX,
                    zIndex: "1300",
                    color: "var(--RG_TEXT_GREY)",
                    backgroundColor: "var(--RG_ITEM_GREY)",
                    padding: 0,
                    boxShadow: "0px 0px 4px 0px black",
                    "& .MuiMenuItem-root:hover": {
                        backgroundColor: "var(--RG_HIGHLIGHT_GREY)"
                    }
                }}
            >
                <MenuItem
                    onClick={() => {
                        props.displayCardContextMenu(null)
                        props.setShowPopup({
                            message:`Are you sure you want to completely remove the ${props.contextMenu.entity} entity?`,
                            displaySelf:props.setShowPopup,
                            callback:() => {
                                console.log(`Popup OK'd, deleting ${props.contextMenu.entity} from ${props.contextMenu.schema}...`)
                                deleteEntity(props.contextMenu.schema, props.contextMenu.entity)
                                props.setShowPopup(null)
                            }
                        })
                    }}
                >
                    Delete Entity
                </MenuItem>
            </MenuList>
        </ClickAwayListener>
    )
}


async function deleteEntity(schema, entity){
    let DELETE_REQUEST = {
        "part": "entity",
        "request_type": "delete",
        "schema": schema,
        "data": {
            "type": entity
        }
    }
    let response = await deleteRGEntity(DELETE_REQUEST)
    // TODO what do with confirmation/failure? UX
}


function setEntityCardContextMenuOpenPosition(event, setEntityCardContextMenu, schema, entity) {
    event.preventDefault()
    setEntityCardContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            schema: schema,
            entity: entity
    })
}


function SchemaBase(props) {
    const [schema, setSchema] = useState(useParams().schema)
    const [entities, setEntities] = useState()
    const [entityCreateVisible, showEntityCreate] = useState(false)

    const [showPopup, setShowPopup] = useState(null)
    const [cardContextMenu, setCardContextMenu] = useState(null)

    // Set STELLAR... Not great timing but hey.
    useEffect(() => {
        // This forces a re-render which allows RGHeader to show the correct info.
        // RGHeader is probably the one that should be fixed though... TODO
        let binos = async () => {
            await telescope(schema, null, true)
            setEntities(Object.values(STELLAR.entities).filter((entity) => {return !entity.archived}))
        }
        binos()
    }, [schema])

    return (
        (STELLAR && STELLAR.code == schema && entities) ?
        <div>
            <RGHeader style={{minHeight: "8vh", height: "8vh"}} context={{schema:schema}} setcontext={null} />
            <div style={{minHeight: "92vh", height: "92vh"}} className="RG_ENTITYCARD_BG">
                <CreateEntityCard showEntityCreate={showEntityCreate} />
                {entities.map(entity => {
                    return (
                    <EntityCard
                        key={entity.code}
                        schema={schema}
                        entity_name={entity.soloname}
                        onContextMenu={(event) => setEntityCardContextMenuOpenPosition(event, setCardContextMenu, schema, entity.soloname)}
                    />
                )})}
            </div>
            {cardContextMenu ? <EntityCardContextMenu displayCardContextMenu={setCardContextMenu} contextMenu={cardContextMenu} setShowPopup={setShowPopup}/> : null}
            {entityCreateVisible ? <NewEntityWindow schema={schema} displaySelf={showEntityCreate}/> : null}
            {showPopup ? <Popup {...showPopup} /> : null}
        </div>
        : null
    )
}


export {SchemaBase}
