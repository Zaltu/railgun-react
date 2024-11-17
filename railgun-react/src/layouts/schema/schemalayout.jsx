import { useState } from 'react'

import { deleteRGEntity } from '/src/STELLAR'

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
                history.pushState({}, "rAIlgun", encodeURI(`/${props.schema}/${props.entity_name}`))
                props.setcontext({schema: props.schema, entity_type: props.entity_name})
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
    const [entities, setEntities] = useState(Object.values(props.context.STELLAR.entities).filter((entity) => {return !entity.archived}))
    const [entityCreateVisible, showEntityCreate] = useState(false)

    const [showPopup, setShowPopup] = useState(null)
    const [cardContextMenu, setCardContextMenu] = useState(null)

    return (
        <div>
            <div style={{...props.style}} className="RG_ENTITYCARD_BG">
                <CreateEntityCard showEntityCreate={showEntityCreate} />
                {entities.map(entity => {
                    return (
                    <EntityCard
                        key={entity.code}
                        schema={props.context.schema}
                        entity_name={entity.soloname}
                        setcontext={props.setcontext}
                        onContextMenu={(event) => setEntityCardContextMenuOpenPosition(event, setCardContextMenu, props.context.schema, entity.soloname)}
                    />
                )})}
            </div>
            {cardContextMenu ? <EntityCardContextMenu displayCardContextMenu={setCardContextMenu} contextMenu={cardContextMenu} setShowPopup={setShowPopup}/> : null}
            {entityCreateVisible ? <NewEntityWindow schema={props.context.schema} displaySelf={showEntityCreate}/> : null}
            {showPopup ? <Popup {...showPopup} /> : null}
        </div>
    )
}


export {SchemaBase}
