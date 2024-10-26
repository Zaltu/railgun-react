import {useState} from 'react'
import { createRGEntity } from '../STELLAR'
import './createEntityBox.css'


function _formattedEntityCode(value, setCode) {
    setCode(value.toLowerCase().replace(/[\W_]+/g, "_").replace(/_+$/, ""))
}


async function createEntity(e, schema, hideSelf) {
    e.preventDefault()
    let formdata = e.target
    let CREATE_REQUEST = {
        "part": "entity",
        "request_type": "create",
        "schema": schema,
        "data": {
            "code": formdata.entitycode.value,
            "soloname": formdata.entitysoloname.value,
            "multiname": formdata.entitymultiname.value
        }
    }
    console.log(CREATE_REQUEST)
    let success = await createRGEntity(CREATE_REQUEST)
    if (success) {
        hideSelf(formdata)
    }
}


function hideSelf(form, setEntityCode, displayState) {
    form.reset()
    // Field code value doesn't get reset on it's own pepehands
    setEntityCode("")
    displayState(false)
}


function NewEntityWindow(props) {
    const [fieldcode, setPredictedEntityCode] = useState("")

    return (
        <div className='RG_NEW_ENTITY_WINDOW'>
            <form autoComplete='off' onSubmit={(event) => createEntity(event, props.schema, (form)=>{hideSelf(form, setPredictedEntityCode, props.displaySelf)})}>
                <div name="identifyChunk" className='RG_NEWENTITY_CHUNK'>
                    <div className='RG_NEWENTITY_FORMCHUNK'>
                        <div style={{display: "flex", height: 'fit-content', justifyContent: 'right'}} className='RG_NEWENTITY_IDENTIFY_CHUNK'>
                            <span>Entity Name</span>
                            <input required name="entitysoloname" type='string' onChange={(e) => _formattedEntityCode(e.target.value, setPredictedEntityCode)} />
                        </div>
                        <div style={{display: "flex", height: 'fit-content', justifyContent: 'right'}} className='RG_NEWENTITY_IDENTIFY_CHUNK'>
                            <span>Entity Code</span>
                            <input required name="entitycode" type='string' value={fieldcode} onChange={(e) => {setPredictedEntityCode(e.target.value)}}/>
                        </div>
                        <div style={{display: "flex", height: 'fit-content', justifyContent: 'right'}} className='RG_NEWENTITY_IDENTIFY_CHUNK'>
                            <span>Entity Name (Plural)</span>
                            <input required name="entitymultiname" type='string'/>
                        </div>
                    </div>
                </div>
                <div style={{display:"flex", justifyContent: "center"}}>
                    <div name="newentitywarning" className='RG_NEWENTITY_WARNING'>
                        This will create a new entity! Double-check yourself before you wreck yourself!
                    </div>
                </div>
                <div name="applyChunk" className='RG_NEWENTITY_APPLY_CHUNK RG_NEWENTITY_CHUNK'>
                    <button 
                        className='RG_SUBTLE_BUTTON'
                        type="button"
                        onClick={(event) => hideSelf(event.target.parentNode.parentNode, setPredictedEntityCode, props.displaySelf)}
                    >
                        Cancel
                    </button>
                    <button className="RG_HIGHLIGHT_BUTTON">
                        Create Entity
                    </button>
                </div>
            </form>
        </div>
    )
}

export {NewEntityWindow};
