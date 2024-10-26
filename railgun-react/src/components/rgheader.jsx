
import AsyncSelect from 'react-select/async'
import { STELLAR, fetchRGData } from '/src/STELLAR.jsx';
import './rgheader.css'



function RGAsyncDropDown(props) {
    return (
        <AsyncSelect
            unstyled
            isSearchable={false}
            defaultValue={{label: props.defaultDisplay, value: "base"}}
            value={{label: props.defaultDisplay, value: "base"}}
            defaultOptions
            loadOptions={() => {
                return getSchemaOptions(props.setcontext)
            }}
            noOptionsMessage={() => `Loading...`}
            className='RG_LIST_BUTTON'
            classNames={{
                menuList: () => "RG_DROPDOWN_LIST",
                option: () => "RG_DROPDOWN_LIST_ITEM",
                group: () => "RG_DROPDOWN_GROUP",
                noOptionsMessage: () => "RG_MULTIENTITY_LIST_ITEM",
            }}
            styles={{
                control: (base) => ({
                    ...base,
                    minHeight: "fit-content",
                    padding: "0.3rem 0.2rem"
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "var(--RG_HIGHLIGHT_GREY)": ""  // Needs to be here to enable keyboard navigation
                })
            }}
            onChange={(option) => option.callback()}
        />
    )
}


async function getSchemaOptions(setcontext){
    let schemas = await fetchRGData("Schema", ["code", "name", "entities"], null, 1, "railgun_internal", false)
    return schemas.map(schema => {
        return {
            value: schema.code,
            label: schema.name,
            callback: () => {
                if (setcontext && schema.entities) {
                    history.pushState({}, "rAIlgun", `/${schema.code}/${schema.entities[0].soloname}`)
                    setcontext({
                        schema:schema.code,
                        entity_type:schema.entities ? schema.entities[0].soloname : null
                    })
                } else {
                    location.href = `/${schema.code}/${schema.entities?schema.entities[0].soloname:""}`
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
                    if (props.setcontext){
                        // Future-proofing
                        // We're in a Set Context environment, just swap contexts to swap data
                        // history.pushState({}, "rAIlgun", `/${context.schema}/${entname}`)
                        // setcontext({
                        //     schema:context.schema,
                        //     entity_type:entname
                        // })
                        location.href = `/${props.context.schema}`
                    } else {
                        // We're outside of a Set Context environment. Redirect to new page and force reload.
                        location.href = `/${props.context.schema}`
                    }
                })}
            >
                Overview
            </button>
    )
}


function getEntityButtons(context, setcontext){
    return Object.keys(STELLAR.entities).map((entname) => {
        return (
            <button
                className='RG_HEADER_ENTBUTTON'
                style={{color: entname==context.entity_type && "orange"}}
                onClick={entname==context.entity_type ? () => void(0) : (() => {
                    if (setcontext){
                        // We're in a Set Context environment, just swap contexts to swap data
                        history.pushState({}, "rAIlgun", `/${context.schema}/${entname}`)
                        setcontext({
                            schema:context.schema,
                            entity_type:entname
                        })
                    } else {
                        // We're outside of a Set Context environment. Redirect to new page and force reload.
                        location.href = `/${context.schema}/${entname}`
                    }
                })}
            >
                {entname}
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
                    <RGAsyncDropDown defaultDisplay='Schema' setcontext={props.setcontext} />
                </div>
                <div>
                    {/* TODO INSERT USER ICON HERE */}
                </div>
            </div>
            {props.context ? 
            <div className="RG_HEADER_BOTTOM">
                <div className='RG_PAGENAME'>{STELLAR.name}</div>
            
                <div className='RG_HEADER_BOTTOM_ENTLIST'>
                    <OverviewELOption  context={props.context} setcontext={props.setcontext}/>
                    {...getEntityButtons(props.context, props.setcontext)}
                </div>
            </div>
            : (
                // TODO meh
                <div style={{display:"flex", backgroundColor:"black", minHeight:"50%"}} />
            )
            }
        </div>
    )
}

export {RGHeader};
