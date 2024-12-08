import AsyncSelect from 'react-select/async'
import { fetchRGData, updateRGData } from '/src/STELLAR.jsx';
import './rgheader.css'
import { useRef } from 'react';



function RGAsyncDropDown(props) {
    const dropref = useRef()

    // Anatomy of a HACK
    // Display is duplicated to bypass react-select shenanigans (can't only loadOptions when you click the button).
    // The overlap is set to absolute positioning, so it needs an absolute width to survive
    // This formula is equivalent to the number of characters * 10.15px, plus 20px to represent the width of the selector (arrow)
    // props.defaultDisplay.length*10.15+20
    return (
        <div style={{position: "relative"}} >
            <AsyncSelect
                unstyled
                isDisabled={true}
                isSearchable={false}
                defaultValue={{label: props.defaultDisplay, value: "base"}}
                value={{label: props.defaultDisplay, value: "base"}}
                placeholder={props.defaultDisplay}
                className='RG_LIST_BUTTON'
                styles={{
                    container: (base) => ({
                        ...base,
                        position: "absolute",
                        minWidth: String(props.defaultDisplay.length*10.15+20)+"px",  // HACK
                        top: 0,
                        left: 0,
                    }),
                    control: (base) => ({
                        ...base,
                        minHeight: "fit-content",
                        padding: "0.3rem 0.2rem"
                    })
                }}
            />
            <AsyncSelect
                unstyled
                ref={dropref}
                isSearchable={false}
                onFocus={()=>{
                    // No idea what this does, but it works
                    // Trial and error ftw
                    dropref.current.onInputChange("hack")  // HACK
                }}
                defaultValue={{label: props.defaultDisplay, value: "base"}}
                value={{label: props.defaultDisplay, value: "base"}}
                cacheOptions
                loadOptions={() => {
                    return props.populateWith()
                }}
                noOptionsMessage={() => `Loading...`}
                placeholder={props.defaultDisplay}
                className='RG_LIST_BUTTON'
                classNames={{
                    menuList: () => "RG_DROPDOWN_LIST",
                    option: () => "RG_DROPDOWN_LIST_ITEM",
                    group: () => "RG_DROPDOWN_GROUP",
                    noOptionsMessage: () => "RG_MULTIENTITY_LIST_ITEM",
                }}
                styles={{
                    container: (base) => ({
                        ...base,
                        minWidth: String(props.defaultDisplay.length*10.15+20)+"px",  // HACK
                    }),
                    singleValue: (base) => ({
                        ...base,
                        color: "transparent"
                    }),
                    indicatorsContainer: (base) => ({
                        ...base,
                        color: "transparent"
                    }),
                    control: (base) => ({
                        ...base,
                        minHeight: "fit-content",
                        padding: "0.3rem 0.2rem",
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? "var(--RG_HIGHLIGHT_GREY)": ""  // Needs to be here to enable keyboard navigation
                    })
                }}
                onInputChange={()=>{}}
                onChange={(option) => {
                    option ? option.callback():null
                }}
            />
        </div>
    )
}


async function getSchemaOptions(setcontext){
    let schemas = await fetchRGData("railgun_internal", "Schema", ["code", "name", "entities"], null, 1, false)
    return schemas.map(schema => {
        return {
            value: schema.code,
            label: schema.name,
            callback: () => {
                // If we're on the overall RG landing page, there is no context
                if (setcontext){
                    history.pushState({}, "rAIlgun", encodeURI(`/${schema.code}/${schema.entities ? schema.entities[0].soloname: ""}`))
                    setcontext({
                        schema:schema.code,
                        entity_type:schema.entities ? schema.entities[0].soloname : null
                    })
                } else {
                    location.href = encodeURI(`/${schema.code}/${schema.entities ? schema.entities[0].soloname: ""}`)
                }
            }
        }
    })
}

async function getPageOptions(setcontext, pageLayoutLoad){
    let pages = await fetchRGData("railgun_internal", "Page", ["name", "uid"], null, 1, false)
    return pages.map(page => {
        return {
            value: page.name,
            label: page.name,
            callback: () => {
                // If we're on the overall RG landing page, there is no context (and no pageLayoutLoad function)
                if (setcontext){
                    history.pushState({}, "rAIlgun", encodeURI(`/pages/${page.uid}`))
                    pageLayoutLoad(setcontext, page.uid)
                } else {
                    location.href = encodeURI(`/pages/${page.uid}`)
                }
            }
        }
    })
}


function OverviewELOption(props){
    return (
        <button
            className='RG_HEADER_ENTBUTTON'
            style={{color: undefined==props.context.entity_type && "orange"}}
            onClick={undefined==props.context.entity_type ? () => void(0) : (() => {
                // We're in a Set Context environment, just swap contexts to swap data
                history.pushState({}, "rAIlgun", encodeURI(`/${props.target}`))
                props.setcontext(props.newcontext)
            })}
        >
            Overview
        </button>
    )
}

function SavePageButton(props){
    return (
        <button
            className='RG_SUBTLE_BUTTON'
            onClick={(event) => {
                let updatedFields = []
                props.table.current.getHeaderGroups()[0].headers.forEach(header => {
                    // Should be the first and last
                    if (header.id != "select-col" && header.id != "add-col"){
                        updatedFields.push({
                            "field": header.id,
                            "width": header.getSize()
                        })
                    }
                })
                console.log(updatedFields)
                let UPDATE_REQUEST = {
                    schema: "railgun_internal",
                    entity: "Page Setting",
                    entity_id: props.activePage.uid,
                    data: {
                        "fields": JSON.stringify(updatedFields)
                    }
                }
                updateRGData(UPDATE_REQUEST).then((res)=>{
                    if (res) {
                        event.target.classList.add('flashgood');
                        setTimeout(() => {
                            event.target.classList.remove('flashgood');
                            }, 1000);
                    } else {
                        console.log("ERROR")
                    }
                })
            }}
        >
            Save
        </button>
    )
}


function getEntityButtons(context, setcontext){
    return Object.keys(context.STELLAR.entities).map((entname) => {
        return (
            <button
                className='RG_HEADER_ENTBUTTON'
                style={{color: entname==context.entity_type && "orange"}}
                onClick={entname==context.entity_type ? () => void(0) : (() => {
                    // We're in a Set Context environment, just swap contexts to swap data
                    history.pushState({}, "rAIlgun", encodeURI(`/${context.schema}/${entname}`))
                    setcontext({
                        schema:context.schema,
                        entity_type:entname
                    })
                })}
            >
                {entname}
            </button>
        )
    })
}

function getPageTabs(context, setcontext){
    let activepageuid = context.page.active ? context.page.active.uid : null
    return context.page.page_settings.map((tab) => {
        return (
            <button
                className='RG_HEADER_ENTBUTTON'
                style={{color: tab.uid==activepageuid && "orange"}}
                onClick={tab.uid==activepageuid ? () => void(0) : (() => {
                    setcontext({
                        schema:tab.entity.schema.code,
                        entity_type:tab.entity.soloname,
                        page: {
                            base: context.page.base,
                            page_settings: context.page.page_settings,
                            active: tab
                        }
                    })
                })}
            >
                {tab.name}
            </button>
        )
    })
}


function RGHeader(props) {
    return (
        <div style={{...props.style}} className="RG_HEADER">
            <div className="RG_HEADER_TOP">
                <div className='RG_HEADER_TOPLEFT'>
                    <img style={{maxHeight: '20px', cursor: "pointer"}} src='/logo/railguntemplogo.png' onClick={()=>location.href="/"} />
                    <RGAsyncDropDown defaultDisplay='Schema' populateWith={()=>getSchemaOptions(props.setcontext)}/>
                    <RGAsyncDropDown defaultDisplay='Pages' populateWith={()=>getPageOptions(props.setcontext, props.pageLayoutLoad)}/>
                </div>
                <div>
                    {/* TODO INSERT USER ICON HERE */}
                </div>
            </div>
            {
            props.context.page ?
            <div className="RG_HEADER_BOTTOM">
                <div className='RG_PAGENAME'>
                    {props.context.page.base.name}
                    {props.context.page.active ? <SavePageButton activePage={props.context.page.active} table={props.table}/> : null}
                </div>

                <div className='RG_HEADER_BOTTOM_ENTLIST'>
                    <OverviewELOption 
                        context={props.context}
                        setcontext={props.setcontext}
                        target={`pages/${props.context.page.base.uid}`}
                        newcontext={{
                            page: {
                                base: props.context.page.base,
                                page_settings: props.context.page.page_settings,
                                active: null
                            }
                        }}
                    />
                    {...getPageTabs(props.context, props.setcontext)}
                </div>
            </div>
            :
            props.context.STELLAR ?
            <div className="RG_HEADER_BOTTOM">
                <div className='RG_PAGENAME'>{props.context.entity_type || props.context.STELLAR.name}</div>

                <div className='RG_HEADER_BOTTOM_ENTLIST'>
                    <OverviewELOption 
                        context={props.context}
                        setcontext={props.setcontext}
                        target={`${props.context.schema}`}
                        newcontext={{schema:props.context.schema}}
                    />
                    {...getEntityButtons(props.context, props.setcontext)}
                </div>
            </div>
            :
            (
                // TODO meh
                <div style={{display:"flex", backgroundColor:"black", minHeight:"50%"}} />
            )
            }
        </div>
    )
}

export {RGHeader};
