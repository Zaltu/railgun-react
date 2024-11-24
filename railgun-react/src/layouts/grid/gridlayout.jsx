import {useEffect, useRef, useState } from "react"

import Select from 'react-select'
import AsyncSelect from 'react-select/async'

import {RGHeader} from '/src/components/rgheader.jsx'
import Gridtop from '/src/layouts/grid/gridtop.jsx'
import Grid from '/src/layouts/grid/grid.jsx'
import {GridBottom} from "/src/layouts/grid/gridbottom.jsx"

import { NewFieldWindow } from "/src/components/createFieldBox.jsx"
import { EditFieldWindow } from "/src/components/editFieldBox.jsx"
import { NewRecordWindow } from "/src/components/createRecordBox.jsx"

import { RG_DISCHARGE, telescope, fetchRGData, updateRGData, uploadRGData, fetchAutocompleteOptions } from '/src/STELLAR.jsx';
import { SchemaBase } from "../schema/schemalayout"
import { PageBase } from "../pages/pagebaselayout"


const TYPE_DISPLAY_ELEMENTS = {
    "BOOL": RG_CHECKBOX,
    "TEXT": RG_DEFAULTCELL,
    "PASSWORD": RG_PASSWORDCELL,
    "INT": RG_DEFAULTCELL,
    "FLOAT": RG_DEFAULTCELL,
    "JSON": RG_JSON_DISPLAY,
    "DATE": RG_DEFAULTCELL,  // TODO datepicker
    "MEDIA": RG_MEDIACELL,
    "LIST": RG_GRID_LIST,
    "MULTIENTITY": RG_MULTIENTITY,  // TODO
    "ENTITY": RG_ENTITY  // TODO
}


// Not Railgun-enforced
const MEDIA_TYPE_DISPLAY_ELEMENTS = {
    "IMAGE": RG_MEDIACELL_IMAGE
}


function RG_CHECKBOX (cell, context) {
    return (
        <input
            type="checkbox"
            className="RG_CHECKBOX"
            checked={cell.getValue()||false}
            onChange={(event) => {
                updateRG(event, cell, event.target.checked, context)
            }}
        />
    )
}

function RG_DEFAULTCELL (cell, context) {
    const [editable, setEditable] = useState(false)

    return editable ?
        <input
            className="RG_GRID_EDITCELL"
            onFocus={(event) => event.target.select()}
            onBlur={() => setEditable(false)}
            style={{width: "100%", outline: "none"}}
            type='text'
            defaultValue={cell.getValue()}
            autoFocus
            onKeyDown={(event) => {
                if (event.key == "Escape"){
                    setEditable(false)
                } else if (event.key == "Enter") {
                    // Submit data update request
                    updateRG(event, cell, event.target.value, context)
                    setEditable(false)
                }
            }}
        />

        :
        //<div> TODO Set edit icon</div>
        <div
            className="RG_GRID_DISPLAYCELL"
            onDoubleClick={() => setEditable(true)}
        >
            {cell.getValue()}
        </div>
}

function RG_PASSWORDCELL (cell, context) {
    const [editable, setEditable] = useState(false)

    return editable ?
        <input
            className="RG_GRID_EDITCELL"
            onFocus={(event) => event.target.select()}
            onBlur={() => setEditable(false)}
            style={{width: "100%", outline: "none"}}
            type='text'
            defaultValue={cell.getValue()}
            autoFocus
            onKeyDown={(event) => {
                if (event.key == "Escape"){
                    setEditable(false)
                } else if (event.key == "Enter") {
                    // Submit data update request
                    updateRG(event, cell, event.target.value, context)
                    setEditable(false)
                }
            }}
        />

        :
        //<div> TODO Set edit icon</div>
        <div
            className="RG_GRID_DISPLAYCELL"
            onDoubleClick={() => setEditable(true)}
        >
            ********
        </div>
}

function RG_JSON_DISPLAY (cell, context) {  // TODO proper formatting/textarea  TODO unescaped characters on edit rerender fsr
    const [editable, setEditable] = useState(false)

    return editable ?
        <input
            className="RG_GRID_EDITCELL"
            onFocus={(event) => event.target.select()}
            onBlur={() => setEditable(false)}
            style={{width: "100%", outline: "none"}}
            type='text'
            defaultValue={JSON.stringify(cell.getValue())}
            autoFocus
            onKeyDown={(event) => {
                if (event.key == "Escape"){
                    setEditable(false)
                } else if (event.key == "Enter") {
                    // Submit data update request
                    updateRG(event, cell, event.target.value, context)
                    setEditable(false)
                }
            }}
        />

        :
        //<div> TODO Set edit icon</div>
        <div
            className="RG_GRID_DISPLAYCELL"
            onDoubleClick={() => setEditable(true)}
        >
            {JSON.stringify(cell.getValue())}
        </div>
}

function RG_GRID_LIST (cell, context) {
    const [editable, setEditable] = useState(false)

    return editable ?
        <Select
            name={"SELECT_GRIDLIST_STELLAR_HACK"}  // HACK
            autoFocus={true}
            openMenuOnFocus={true}
            onBlur={() => {
                setEditable(false)
            }}
            onMenuClose={() => setEditable(false)}
            unstyled
            options={context.STELLAR.entities[context.entity_type].fields[cell.column.id].params.constraints.map(((option) => {
                return {label: option, value: option}
            }))}
            className='RG_GRID_LISTFIELD'
            classNames={{
                menuList: () => "RG_GRID_LISTDROP",
                option: () => "RG_GRID_LISTITEM"
            }}
            styles={{
                control: base => ({
                    ...base,
                    height: 18,
                    minHeight: 18
                }),
                input: base => ({
                    ...base,
                    color: 'transparent'
                })
            }}
            defaultValue={{value: cell.getValue(), label: cell.getValue()}}
            onKeyDown={(event) => {
                if (event.key == "Escape"){
                    setEditable(false)
                }
            }}
            onChange={(newval) => {
                let fakeEvent = {
                    target: {
                        parentNode: document.getElementsByName("SELECT_GRIDLIST_STELLAR_HACK")[0].parentNode.parentNode
                    }
                }
                updateRG(fakeEvent, cell, newval.value, context)
                setEditable(false)
            }}
        />

        :
        //<div> TODO Set edit icon</div>
        <div
            className="RG_GRID_DISPLAYCELL"
            onDoubleClick={() => {
                setEditable(true)
            }}
        >
            {cell.getValue()}
        </div>
}

function RG_MULTIENTITY (cell, context) {
    const [editable, setEditable] = useState(false)
    const ment = useRef()

    return editable ? (
        <AsyncSelect
            unstyled
            isMulti
            ref={ment}
            name={"SELECT_GRIDMULTIENT_STELLAR_HACK"}  // HACK
            autoFocus={true}
            openMenuOnFocus={true}
            onBlur={() => {
                setEditable(false)
            }}
            cacheOptions
            defaultValue={(cell.getValue()||[]).map(ent => {
                return {label: ent[context.STELLAR.entities[ent["type"]].display_name_col], value: JSON.stringify(ent)}
            })}
            loadOptions={(inputValue) => {
                return fetchAutocompleteOptions(context.STELLAR.entities[context.entity_type].fields[cell.column.id].params.constraints, inputValue, context.STELLAR)
            }}
            noOptionsMessage={() => `Find a ${Object.keys(context.STELLAR.entities[context.entity_type].fields[cell.column.id].params.constraints).join(". ")} by typing its name.`}
            placeholder={null}
            className='RG_MULTIENTITY_LISTFIELD'
            classNames={{
                menuList: () => "RG_MULTIENTITY_LISTDROP",
                option: () => "RG_MULTIENTITY_LIST_ITEM",
                noOptionsMessage: () => "RG_MULTIENTITY_LIST_ITEM",
                multiValue: () => "RG_MULTIENTITY_SELECTION",
                multiValueLabel: () => "RG_MULTIENTITY_SELECTION_LABEL",
                multiValueRemove: () => "RG_MULTIENTITY_SELECTION_LABEL_CLOSE"
            }}
            styles={{
                control: base => ({
                    ...base,
                    height: 'fit-content',
                    minHeight: 18
                }),
                dropdownIndicator: () => ({
                    visibility: "hidden",
                    width: 0
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "var(--RG_HIGHLIGHT_GREY)": ""  // Needs to be here to enable keyboard navigation
                })
            }}
            onKeyDown={(event) => {
                if (event.key == "Escape"){
                    setEditable(false)
                }
                else if (event.key == "Enter" && ment.current.getFocusableOptions().length==0){  // TODO Sus
                    let fakeEvent = {
                        target: {
                            parentNode: document.getElementsByName("SELECT_GRIDMULTIENT_STELLAR_HACK")[0].parentNode.parentNode.parentNode
                        }
                    }
                    let newvalue = ment.current.getValue().map(ent => JSON.parse(ent.value))
                    updateRG(fakeEvent, cell, newvalue.length ? newvalue : null, context)
                    setEditable(false)
                }
            }}
        />
    )
    :
    (<div
        className="RG_GRID_DISPLAYCELL"
        onDoubleClick={() => {
            setEditable(true)
        }}
    >
        {( (Array.isArray(cell.getValue()) && cell.getValue()) || []).map(entity => {
            // Gets a little weird when changing headers & data during "potentially" different frames.
            return entity.type in context.STELLAR["entities"] ? entity[context.STELLAR["entities"][entity.type].display_name_col]: ""
        }).join(', ')}
    </div>)
}

function RG_ENTITY (cell, context) {
    const [editable, setEditable] = useState(false)
    const ment = useRef()

    return editable ? (
        <AsyncSelect
            unstyled
            ref={ment}
            isClearable={true}
            name={"SELECT_GRIDMULTIENT_STELLAR_HACK"}  // HACK
            autoFocus={true}
            openMenuOnFocus={true}
            onBlur={() => {
                setEditable(false)
            }}
            cacheOptions
            defaultValue={
                {label: cell.getValue() ? cell.getValue()[context.STELLAR["entities"][cell.getValue().type].display_name_col]:"", value: JSON.stringify(cell.getValue()||"")}
            }
            loadOptions={(inputValue) => {
                return fetchAutocompleteOptions(context.STELLAR.entities[context.entity_type].fields[cell.column.id].params.constraints, inputValue, context.STELLAR)
            }}
            noOptionsMessage={() => `Find a ${Object.keys(context.STELLAR.entities[context.entity_type].fields[cell.column.id].params.constraints).join(". ")} by typing its name.`}
            placeholder={null}
            className='RG_MULTIENTITY_LISTFIELD'
            classNames={{
                menuList: () => "RG_MULTIENTITY_LISTDROP",
                option: () => "RG_MULTIENTITY_LIST_ITEM",
                noOptionsMessage: () => "RG_MULTIENTITY_LIST_ITEM",
            }}
            styles={{
                control: base => ({
                    ...base,
                    height: 'fit-content',
                    minHeight: 18
                }),
                dropdownIndicator: () => ({
                    visibility: "hidden",
                    width: 0
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "var(--RG_HIGHLIGHT_GREY)": ""  // Needs to be here to enable keyboard navigation
                })
            }}
            onKeyDown={(event) => {
                if (event.key == "Escape"){
                    setEditable(false)
                }
                else if (event.key == "Enter" && ment.current.getFocusableOptions().length==0){  // TODO Sus
                    let fakeEvent = {
                        target: {
                            parentNode: document.getElementsByName("SELECT_GRIDMULTIENT_STELLAR_HACK")[0].parentNode.parentNode.parentNode
                        }
                    }
                    let newvalue = ment.current.getValue()
                    updateRG(fakeEvent, cell, newvalue.length ? JSON.parse(newvalue[0].value) : null, context)
                    setEditable(false)
                }
            }}
        />
    )
    :
    (<div
        className="RG_GRID_DISPLAYCELL"
        onDoubleClick={() => {
            setEditable(true)
        }}
    >
        {/* Gets a little weird when changing headers & data during "potentially" different frames. */}
        {cell.getValue()&&cell.getValue().type in context.STELLAR["entities"] ? cell.getValue()[context.STELLAR["entities"][cell.getValue().type].display_name_col]: ""}
    </div>)
}

function RG_GRID_CELL_HIDDEN ({...rest}) {
    return (
        <div className="RG_GRID_CELL_HIDDEN" />
    )
}


function RG_MEDIACELL (cell, context) {
    // There are a bunch of possible types of media cells in theory.
    // Implement a few here, but fallback on text, which will a str display of the path.
    return cell.getValue() ?
        MEDIA_TYPE_DISPLAY_ELEMENTS[context.STELLAR.entities[context.entity_type].fields[cell.column.id].params.media_type] ?
            MEDIA_TYPE_DISPLAY_ELEMENTS[context.STELLAR.entities[context.entity_type].fields[cell.column.id].params.media_type](cell, cell.getValue())
            :
            _RG_MEDIA_FALLBACK(cell, context)  // No display for this existing media
        :
        RG_MEDIA_EMPTY(cell, context)  // No Cell value (no media uploaded)
}

function RG_MEDIACELL_IMAGE(cell, remotePathToMed) {
    return (
        <div style={{height: "100%", width: cell.column.columnDef.enableResizing ? "100%": "150px", maxWidth: "400px"}}>
            <img style={{height: "100%", width: "100%"}} src={RG_DISCHARGE+remotePathToMed} />
        </div>
    )
}

function RG_MEDIA_EMPTY (cell, context) {
    return (
        <div
            className="RG_GRID_DISPLAYCELL"
            style={{textAlign: "center"}}
        >
            <label
                style={{textDecoration: "underline", fontStyle: "italic", cursor: "pointer"}}
                htmlFor={"up_"+cell.id}
            >
                Upload File
            </label>
            <input
                className="RG_FILE_HIDE"
                id={"up_"+cell.id}
                type="file"
                onChange={(event) => uploadRG(event, cell, context.schema, cell.getContext().table.options.meta.updateData)}
            />
        </div>
    )
}

function _RG_MEDIA_FALLBACK (cell, context) {
    return RG_DEFAULTCELL(cell, context)
}


async function uploadRG(event, cell, schema, updateCellData) {
    let entity = cell.row.original
    entity["schema"] = schema
    entity["field"] = cell.column.id
    let newimg = await uploadRGData(event.target.files[0], JSON.stringify(entity))
    // Triggers re-render, assigning the correct Media type display as necessary
    updateCellData(
        cell.row.index,
        cell.column.id,
        newimg.path
    )
}


async function updateRG(event, cell, newvalue, context){
    if ((cell.getValue() === newvalue)||(cell.getValue() != 0 && !cell.getValue() && !newvalue)) {
        // No actual data changed
        return
    }
    newvalue = newvalue ? newvalue : null  // Prevent number values from being set to '' instead of empty
    cell.getContext().table.options.meta.updateData(
        cell.row.index,
        cell.column.id,
        newvalue
    )
    let UPDATE_REQUEST = {
        schema: context.schema,
        entity: context.entity_type,
        entity_id: cell.row.original.uid,
        data: {
            [cell.column.id]: newvalue
        }
    }
    let tdNode = event.target.parentNode
    console.log(UPDATE_REQUEST)
    let updated = await updateRGData(UPDATE_REQUEST)
    if (updated) {
        // Flash green
        tdNode.classList.add('flashgood');
        setTimeout(() => {
            tdNode.classList.remove('flashgood');
            }, 1000);
    } else {
        // TODO Flash red
    }
}



const SELECT_HEADER = {
    size: 'fit-content',
    //size: 0,  // fit-content would be the correct style, but react-tables doesn't like it
    //minSize: 0,
    id: 'select-col',
    header: ({ table }) => (
      <input type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input type="checkbox"
        className="RG_CHECKBOX"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableResizing: false,
}

const ADD_HEADER = {
    size: 'fit-content',
    //size: 0,  // fit-content would be the correct style, but react-tables doesn't like it
    //minSize: 0,
    id: 'add-col',
    header: "+",
    enableResizing: false,
    cell: ({cell}) => (RG_GRID_CELL_HIDDEN(cell))  // TODO doesn't work, hides cell content not cell (td element)
}

function formatHeaders(stellar_fields, context) {
    const headers = []
    headers.push(SELECT_HEADER)
    headers.push(...Object.values(stellar_fields||{}).map(stellar_field => ({
        header: stellar_field.name,
        accessorKey: stellar_field.code,
        cell: ({cell}) => {
            return TYPE_DISPLAY_ELEMENTS[stellar_field.type] ? TYPE_DISPLAY_ELEMENTS[stellar_field.type](cell, context) : 'MISING DISPLAY ELEMENT'
        },
        enableResizing: stellar_field.width ? true: false,
        size: stellar_field.width ?? null
    })))
    headers.push(ADD_HEADER)
    return headers
}



function toggleFieldDisplay(field_to_toggle, fields, setFields){
    if (!field_to_toggle){
        // Someone's probably trying to hide the "default" fields (select/add)
        // TODO Header Context Menu shouldn't event appear on these... No reason to.
        return
    }
    let localFields = {}
    Object.keys(fields).map((key)=>{
        localFields[key] = fields[key]
    })
    if (fields[field_to_toggle.code]) {
        delete localFields[field_to_toggle.code]
    } else {
        localFields[field_to_toggle.code] = field_to_toggle
    }
    setFields(localFields)
}


async function updateGridData(context, fields, filters, page, setData, setCount) {
    let rg_data = await fetchRGData(context.schema, context.entity_type, Object.keys(fields), filters, page.page)
    if (!rg_data){
        // STELLAR is probably not set up...
        return
    }
    setCount(rg_data.pop(-1)["total_count"])  // Count is always fetched in the webui.
    setData(rg_data)
}


async function attemptPageLayout(setcontext, pageid) {
    let page = (await fetchRGData(
        "railgun_internal",
        "Page",
        ["name", "page_settings"],
        {
            "filter_operator": "AND",
            "filters": [["uid", "is", pageid]]
        },
        1, false))[0]
    let pagesettings = []
    await Promise.all(page.page_settings.map(async (pagesetting) => {
        let fetchData = await fetchRGData(
            "railgun_internal",
            "Page Setting",
            ["name", "entity", "sort", "filters", "fields", "entity.Entity.schema.Schema.code"],
            {
                "filter_operator": "AND",
                "filters": [["uid", "is", pagesetting.uid]]
            },
            1, false)
        pagesettings = pagesettings.concat(fetchData)
    }))
    setcontext({
        page: {
            base: page,
            page_settings: pagesettings,
            active: null
        }
    })
}

function attemptGridLayout(setcontext) {
    let pathchunks = decodeURI(new URL(window.location).pathname).split("/").filter(e => e)
    console.log(pathchunks)
    if (pathchunks[0] == "pages"){
        // Try to load a page context
        if (!pathchunks[1]){
            // No page given...
            location.href = "/"  // Return to home, 404 TODO
            return
        } else {
            attemptPageLayout(setcontext, pathchunks[1])
        }
    } else {
        // Enter default context
        // TODO default pages general system
        setcontext({
            schema: pathchunks[0],
            entity_type: pathchunks[1]
        })
    }
}


async function setContext(real_setter, newcontext) {
    // Wrapper function to ensure STELLAR is populated and is part of the
    // context before triggering the endless waterfall of hook updates.
    if (newcontext.schema) {
        newcontext["STELLAR"] = await telescope(newcontext.schema)
    }
    real_setter(newcontext)
}


function GridLayout(props) {
    const [fieldCreateVisible, showFieldCreation] = useState(false)
    const [fieldEditVisible, showFieldEdit] = useState(false)
    const [selectedFieldData, setSelectedField] = useState({})
    const [recordCreateVisible, showRecordCreation] = useState(false)

    const [context, _setContext] = useState({})
    const [fields, setFields] = useState()
    const [data, setData] = useState({})
    const [filters, setFilters] = useState(null)
    const [headers, setHeaders] = useState(formatHeaders(fields, context))  // TODO Show/Hide
    const [searchValue, setSearchValue] = useState(null)
    const [count, setCount] = useState(71) // 71 ???
    // HACK to get the state to be updated even if the values don't change
    const [gridPage, setGridPage] = useState({"page": 1, "trigger":false})

    const tableref = useRef()

    // When context changes, update fields
    useEffect(()=>{
        // TODO this entire effect can be trashed since we have a higher-level setcontext wrapper poggers
        if (context.entity_type){
            // We're going to another grid view
            // Start by resetting the page so we don't end up showing something weird
            setGridPage({"page": 1, "trigger": false})
            // If we have an active page, that has actual fields defined, display those fields.
            // If we have an active page defined with no fields, display all fields like on a default page.
            if (context.page && context.page.active && context.page.active.fields) {
                let pagefields = {}
                context.page.active.fields.forEach((pagefield) => {
                    pagefields[pagefield.field] = context.STELLAR.entities[context.entity_type].fields[pagefield.field]
                    pagefields[pagefield.field].width = pagefield.width
                })
                setFields(pagefields)
            } else {
                setFields(context.STELLAR.entities[context.entity_type].fields)
            }
        }
        // Else we're going to the overview view
        tableref.current ? tableref.current.resetRowSelection() : null
    }, [context])

    // When fields change, update headers and data
    // TODO is data needed?
    useEffect(()=>{
        setHeaders(formatHeaders(fields, context))
        if (!context.STELLAR){return}
        updateGridData(context, fields, filters, gridPage, setData, setCount)
        // We update the data in case there's a default field value or something,
        // but the selection doesn't need to be changed purely because a field was added.
        // tableref.current.resetRowSelection()
    }, [fields])

    // When filters change, update data
    useEffect(() => {
        if (!context.STELLAR){return}
        updateGridData(context, fields, filters, gridPage, setData, setCount)
        tableref.current ? tableref.current.resetRowSelection() : null  // Clear selection as it's independent of table indexing
    }, [filters])

    // When page changes, update data
    useEffect(() => {
        if (!context.STELLAR||!gridPage.trigger){return}
        // HACK doing like this means that the count gets updated even if all that changes is the page
        // ...but it's convenient
        updateGridData(context, fields, filters, gridPage, setData, setCount)
        tableref.current ? tableref.current.resetRowSelection() : null  // Clear selection as it's independent of table indexing
    }, [gridPage])

    // When defaultSearch changes, change filters
    useEffect(() =>  {
        if (!searchValue) {
            setFilters(null)
            return
        }
        setFilters({
            filter_operator: "AND",
            filters: [
                [context.STELLAR.entities[context.entity_type].display_name_col, "contains", searchValue]
            ]
        })
    }, [searchValue])


    useEffect(() => {
        attemptGridLayout((newcontext) => setContext(_setContext, newcontext))
    }, [])

    return (context.page || context.STELLAR ?  // Valid contexts are all set at once. If we have STELLAR, we have a valid context.
        <div>
            <RGHeader
                style={{minHeight: "8vh", height: "8vh"}}
                context={context}
                setcontext={(newcontext) => setContext(_setContext, newcontext)}
                table={tableref}
                pageLayoutLoad={attemptPageLayout}
            />
            { context.entity_type ?
            <div>
                <Gridtop
                    style={{minHeight: "4.5vh", height: "4.5vh"}}
                    context={context}
                    allFields={context.STELLAR.entities[context.entity_type].fields}
                    toggleFieldDisplay={(field_to_toggle) => toggleFieldDisplay(field_to_toggle, fields, setFields)}
                    setSearchValue={setSearchValue}
                    showFieldCreationWindow={showFieldCreation}
                    showRecordCreationWindow={showRecordCreation}
                />
                <Grid
                    style={{minHeight: "85vh", height: "85vh"}}
                    context={context}
                    data={data}
                    setData={setData}
                    toggleFieldDisplay={() => toggleFieldDisplay(selectedFieldData, fields, setFields)}
                    headers={headers}
                    showFieldEditWindow={showFieldEdit}
                    selectedField={selectedFieldData}
                    setSelectedField={setSelectedField}
                    tableref={tableref}
                    updateData={() => {updateGridData(context, fields, filters, gridPage, setData, setCount);tableref.current.resetRowSelection()}}
                />
                <GridBottom style={{minHeight: "2.5vh", height: "2.5vh"}} context={context} count={count} page={gridPage.page} setPage={(newpage)=>setGridPage({"page": newpage, "trigger": true})} />
            </div>
            :
            context.STELLAR ?
                <SchemaBase style={{minHeight: "92vh", height: "92vh"}} context={context} setcontext={(newcontext) => setContext(_setContext, newcontext)} />
            :
                <PageBase style={{minHeight: "92vh", height: "92vh"}} context={context} setcontext={(newcontext) => setContext(_setContext, newcontext)}/>
            }
            {fieldCreateVisible ? <NewFieldWindow context={context} addDisplayField={()=> setContext(_setContext, {schema:context.schema, entity_type:context.entity_type})} displaySelf={showFieldCreation} /> : null }
            {fieldEditVisible ? <EditFieldWindow context={context} displaySelf={showFieldEdit} field={selectedFieldData} /> : null }
            {recordCreateVisible ? <NewRecordWindow context={context} updateData={() => {updateGridData(context, fields, filters, gridPage, setData, setCount);tableref.current.resetRowSelection()}} displaySelf={showRecordCreation} /> : null }
        </div>
        :
        null
    )
}

export {GridLayout}
