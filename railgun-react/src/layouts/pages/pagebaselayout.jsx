import { useState } from "react"


function TabCard(props) {
    return (
        <button
            className='RG_ENTITY_CARD'
            onClick={(event) => {
                props.setcontext({
                    schema:props.tab.entity.schema.code,
                    entity_type:props.tab.entity.soloname,
                    page: {
                        base: props.context.page.base,
                        page_settings: props.context.page.page_settings,
                        active: props.tab
                    }
                })
            }}
        >
            {props.tab.name}
        </button>
    )
}

function PageBase(props) {
    const [tabs, setTabs] = useState(props.context.page.page_settings)

    return (
        <div>
            <div style={{...props.style}} className="RG_ENTITYCARD_BG">
                {tabs.map(tab => {
                    return (
                    <TabCard
                        key={tab.uid}
                        tab={tab}
                        schema={"pages"}
                        context={props.context}
                        setcontext={props.setcontext}
                    />
                )})}
            </div>
        </div>
    )
}


export {PageBase};
