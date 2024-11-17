import {RGDropDown} from '/src/components/dropdown.jsx'

import './styles/gridtop.css'

function NewRecordButton(props) {
    return (
        <button
            className="RG_HIGHLIGHT_BUTTON"
            onClick={() => props.show(true)}
        >
            Add {props.display}
        </button>
    )
}


function setupFieldMenuOptions(fields, showFieldCreationWindow, toggleFieldDisplay) {
    return [
        {
            label: "",
            options: [{value: "edit", label:"Create New Field", callback: () => showFieldCreationWindow(true)},]
        },
        {
            label: "",
            options: [
                ...Object.values(fields).map((field) => ({
                        value: field.code,
                        label: field.name,
                        callback: () => toggleFieldDisplay(field)
                }))
            ]
        }
    ]
}


function SimpleSearchBox(props) {
    // Page can load before STELLAR is populated...
    let placeholderText = props.context.STELLAR.entities[props.context.entity_type].multiname//props.context.STELLAR.entities[props.context.entity_type] ? props.context.STELLAR.entities[props.context.entity_type].multiname:""
    return (
        <input
            type='text'
            className='RG_SIMPLE_SEARCHBOX'
            placeholder={'Search ' + placeholderText}
            onKeyDown={(event) => {
                if (event.key == "Enter"){
                    props.setSearchValue(event.target.value)
                } else if (event.key == "Escape") {
                    event.target.value = ""
                    event.target.blur()
                    props.setSearchValue("")
                }
            }}
        >
            {/* TODO down_arrow */}
            {/* TODO search/x button */}
        </input>
    )
}



function Gridtop(props) {
    return (
        <div style={{...props.style}} className='RG_GRIDTOP_BG'>
            <div className='RG_GRIDTOP_CHUNK'>
                <NewRecordButton context={props.context} display={props.context.entity_type} show={props.showRecordCreationWindow}/>
                <RGDropDown
                    context={props.context}
                    button="Fields"
                    options={setupFieldMenuOptions(
                        props.allFields,
                        props.showFieldCreationWindow,
                        props.toggleFieldDisplay
                    )}
                />
            </div>
            <div className='RG_GRIDTOP_CHUNK'>
                <SimpleSearchBox context={props.context} setSearchValue={props.setSearchValue}/>
            </div>
        </div>
    )
}

export default Gridtop;